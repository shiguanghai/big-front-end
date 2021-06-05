## 21.15 发布部署

### 项目打包 - serve 启动 Web 服务

```shell
npm run build
```

- 本地测试打包结果

参考 [Vue CLI - 部署 - 本地预览](https://cli.vuejs.org/zh/guide/deployment.html#%E6%9C%AC%E5%9C%B0%E9%A2%84%E8%A7%88)

> `dist` 目录需要启动一个 HTTP 服务器来访问 (除非你已经将 `publicPath` 配置为了一个相对的值)，所以以 `file://` 协议直接打开 `dist/index.html` 是不会工作的。在本地预览生产环境构建最简单的方式就是使用一个 Node.js 静态文件服务器，例如 [serve](https://github.com/zeit/serve)：

```shell
npm install -g serve
# -s 参数的意思是将其架设在 Single-Page Application 模式下
# 这个模式会处理即将提到的路由问题
serve -s dist
```

![image-20210529221756755](https://public.shiguanghai.top/blog_img/image-202105292217567550Bvhus.png)

我们在开发时使用 Webpack Dev Server 启动的开发服务，项目中的接口有跨域限制，我们在 `vueconfig.js` 配置了代理

```js
module.exports = {
  ...
  devServer: {
    proxy: {
      '/boss': {
        target: 'http://eduboss.lagou.com',
        // changeOrigin: true 以实际代理请求的主机名请求
        // 设置请求头中的 host 为 target，防⽌后端反向代理服务器⽆法识别
        changeOrigin: true
      },
      '/front': {
        target: 'http://edufront.lagou.com',
        changeOrigin: true
      }
    }
  }
}
```

但是你要知道此代理仅针对本地开发服务 `npm run serve`。但是我们刚刚使用了另一个工具 `serve`，它和 `devServer` 中的 `proxy` 是没有关系的

也就是说现在请求的接口根本没有代理，所以会走到 `http://localhost:5000/front/user/login` 这个 `server` 的本身，其本身是没有做任何代理配置的，所以它返回的是一个网页

![image-20210529222340362](https://public.shiguanghai.top/blog_img/image-20210529222340362KkMWd8.png)

![image-20210529222631171](https://public.shiguanghai.top/blog_img/image-20210529222631171kqOz3C.png)

### 本地预览服务 - express 跨域

刚刚我们使用第三方工具 `serve` 来测试打包的结果，它其实就是帮我们起到一个静态的 Web 服务运行起来，但是我们项目中的接口有跨域的限制

所以我们要有对接口的代理才能正常地测试服务。serve 工具是不支持配置代理的

我们可以使用一个基于 `NodeJS` 的 Web 服务框架 `Express` 快速地启动服务

```shell
# 纯前端项目安装工具包时尽量保存到开发依赖
npm install -D express
```

`test-serve/app.js`

```js
// NodeJS 中通过 require 加载代码
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('hello')
})

app.listen(3000, () => {
  console.log('running...')
})
```

```shell
cd test-serve
# nodemon 带有监视功能
npm install -g nodemon
nodemon app.js
```

![image-20210529224107197](https://public.shiguanghai.top/blog_img/image-202105292241071970sq1Lj.png)

托管 `dist` 到 Web 服务中 `test-serve/app.js`

```js
const express = require('express')
const app = express()
const path = require('path')

// 托管了 dist 目录。而且当访问 '/' 的时候，默认会返回托管目录中的 index.html 文件
app.use(express.static(path.join(__dirname, '../dist')))

app.listen(3000, () => {
  console.log('running...')
})
```

![image-20210529225009538](https://public.shiguanghai.top/blog_img/image-20210529225009538wvoyyN.png)

同样的道理，我们自己所写的 Web 服务也未对这个接口做过代理，接下来我们来配置代理

**http-proxy-middleware：**

- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)：一个可以集成到 express Web 服务的中间件

```shell
npm install -D http-proxy-middleware
```

`test-serve/app.js`

```js
// NodeJS 中通过 require 加载代码
const express = require('express')
const app = express()
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')

// 托管了 dist 目录。而且当访问 '/' 的时候，默认会返回托管目录中的 index.html 文件
app.use(express.static(path.join(__dirname, '../dist')))

app.use(
  '/boss',
  createProxyMiddleware({
    target: 'http://eduboss.lagou.com', // 代理到的目标地址
    // 假如后端服务配置了反向代理，可能要根据 Origin 来识别客户端请求
    changeOrigin: true // 以实际代理请求的主机名请求：设置请求头中的 host 为 target
  })
)

app.use(
  '/front',
  createProxyMiddleware({
    target: 'http://edufront.lagou.com', // 代理到的目标地址
    // 假如后端服务配置了反向代理，可能要根据 Origin 来识别客户端请求
    changeOrigin: true // 以实际代理请求的主机名请求：设置请求头中的 host 为 target
  })
)

app.listen(3000, () => {
  console.log('running...')
})
```

![image-20210529230804863](https://public.shiguanghai.top/blog_img/image-20210529230804863etW85e.png)

配置 `preview` 字段开启服务 `package.json`

```json
"scripts": {
  ...
  "preview": "node test-serve/app.js"
},
```

```shell
# 下次测试启动服务
npm run preview
```

### 发布的注意事项

在项目发布之前，还有一些问题需要来注意一下，这里有一个总结：关于发布的一些注意事项，参考 [Vue CLI 通用指南](https://cli.vuejs.org/zh/guide/deployment.html#%E9%80%9A%E7%94%A8%E6%8C%87%E5%8D%97)

**关于使用 `history` 模式的路由：**

> 如果你在 `history` 模式下使用 Vue Router，是无法搭配简单的静态文件服务器的。例如，如果你使用 Vue Router 为 `/todos/42/` 定义了一个路由，开发服务器已经配置了相应的 `localhost:3000/todos/42` 响应，但是一个为生产环境构建架设的简单的静态服务器会却会返回 404。
>
> 为了解决这个问题，你需要配置生产环境服务器，将任何没有匹配到静态文件的请求回退到 `index.html`。Vue Router 的文档提供了[常用服务器配置指引](https://router.vuejs.org/zh/guide/essentials/history-mode.html)。

nginx

```shell
location / {
  try_files $uri $uri/ /index.html;
}
```

**关于接口跨域问题：**

- 如果前端静态内容和后端 API 同源，则不需要做任何跨域处理
- 同理，如果前端静态内容是部署在与后端 API 不同的域名上
  - 方式一：配置服务端代理
    - Nginx
    - Apache
    - tomact
    - IIS
  - 方式二：让后台接口服务启用 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS) 支持
    - 在响应头写入相关的 CORS 信息，客户端就能够跨域请求非同源数据

**关于 HTTPS 协议：**

如果你的网站应用部署在 HTTPS 协议下，则你的接口服务也必须是 HTTPS 协议

**关于 PWA：**

如果你使用了 PWA 插件，那么应用必须架设在 HTTPS 上，这样 [Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API) 才能被正确注册

### 部署上线

参考 [Vue CLI - 部署 - 平台指南](https://cli.vuejs.org/zh/guide/deployment.html#%E5%B9%B3%E5%8F%B0%E6%8C%87%E5%8D%97)

参考 [GitHub Actions 自动部署](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/realworld-nuxtjs-%E6%96%87%E7%AB%A0%E5%8F%8A%E9%83%A8%E7%BD%B2.html#github-actions-%E8%87%AA%E5%8A%A8%E9%83%A8%E7%BD%B2)

1.在项目的 Secrets 中配置 GitHub Access Token ：[https://github.com/shiguanghai/edu-boss-fed/settings/secrets/actions](https://github.com/shiguanghai/edu-boss-fed/settings/secrets/actions)

![image-20210530155641161](https://public.shiguanghai.top/blog_img/image-20210530155641161nvFLaZ.png)

2.配置 GitHub Actions 执行脚本 `.github/workfows`

```shell
name: Publish And Deploy Demo
on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:

    # 下载源码
    - name: Checkout
      uses: actions/checkout@master

    # 打包构建
    - name: Build
      uses: actions/setup-node@master
    - run: npm install
    - run: npm run build
    - run: tar -zcvf release.tgz dist pm2.config.json test-serve package.json package-lock.json 

    # 发布 Release
    - name: Create Release
      id: create_release
      uses: actions/create-release@master
      env:
        GITHUB_TOKEN: ${{ secrets.TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        # 草稿
        draft: false
        # 预发布
        prerelease: false

    # 上传构建结果到 Release
    - name: Upload Release Asset
      id: upload-release-asset
      uses: actions/upload-release-asset@master
      env:
        GITHUB_TOKEN: ${{ secrets.TOKEN }}
      with:
        upload_url: ${{ steps.create_release.outputs.upload_url }}
        asset_path: ./release.tgz
        asset_name: release.tgz
        asset_content_type: application/x-tgz

    # 部署到服务器
    - name: Deploy
      uses: appleboy/ssh-action@master
      with:
        timeout: "30m"
        proxy_timeout: "30m"
        host: ${{ secrets.HOST }} # 远程仓库地址 xx.xx.xxx.xxx
        username: ${{ secrets.USERNAME }} # 仓库账户 root
        password: ${{ secrets.PASSWORD }} # 仓库密码 xxxxxx
        port: ${{ secrets.PORT }} # 22
        script: |
          cd /root/edu-boss-fed # 确保存在文件夹
          wget https://github.com/shiguanghai/edu-boss-fed/releases/latest/download/release.tgz -O release.tgz
          tar zxvf release.tgz
          npm install --production
          pm2 reload pm2.config.json
```

![image-20210530164725013](https://public.shiguanghai.top/blog_img/image-20210530164725013mk7MQh.png)

3.注意 `test-serve/app.js` 的端口号不要已存在，这里开放`3001`端口

```js
app.listen(3001, () => {
  console.log('running...')
})
```

4.服务器防火墙添加响应端口的规则

![image-20210530171957093](https://public.shiguanghai.top/blog_img/image-202105301719570935QjOpc.png)

5.配置 PM2 配置文件，确保服务器有 `pm2`: `pm2.config.json`

```json
{
  "apps": [
    {
      "name": "EduBossFed",
      "script": "node",
      "args": "test-serve/app.js"
    }
  ]
}
```

6.提交更新

```shell
git add .

git commit -m "发布部署-测试" --no-verify

git tag v0.1.0

git push origin v0.1.0
```

![image-20210530170032687](https://public.shiguanghai.top/blog_img/image-20210530170032687Fq8Ses.png)

![image-20210530172342927](https://public.shiguanghai.top/blog_img/image-20210530172342927W5s2hj.png)

![image-20210530192952195](https://public.shiguanghai.top/blog_img/image-20210530192952195Il8RQb.png)

7.设置域名解析

![image-20210530193136875](https://public.shiguanghai.top/blog_img/image-20210530193136875JqHpp6.png)

8.申请 SSL 证书并上传到服务器

![image-20210530193635397](https://public.shiguanghai.top/blog_img/image-20210530193635397kPab4H.png)

![image-20210530195538258](https://public.shiguanghai.top/blog_img/image-20210530195538258sJqMoZ.png)

![image-20210530195747768](https://public.shiguanghai.top/blog_img/image-20210530195747768AbDjOd.png)

9.配置 Nginx 服务器端口转发和反向代理，配置完成后重启 `nginx -s reload`并检查 `nginx -t` 是否有错误语法

```shell
server {
  # 监听端口号
  listen       80;
  server_name	eduboss.shiguanghai.top;  ## 副站域名
  index index.php index.html index.htm;
  rewrite ^(.*)$  https://$server_name$1 permanent;  # 将所有 HTTP 请求 rewrite 重定向到 HTTPS

  location / {
    proxy_pass http://127.0.0.1:3001/;  # ghost监听的ip和端口号
    proxy_set_header  Host $http_host; # 修改转发请求头，让3001端口的应用可以受到真实的请求
    proxy_set_header  X-Real-IP $remote_addr; # pass on real client's IP
    proxy_set_header  X-Xorwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header  X-Fprwarded-Proto $scheme;
    proxy_read_timeout  900;
  }
}

server {
  listen 443 ssl;
  server_name	eduboss.shiguanghai.top;
  ssl	on;
  ssl_certificate	/usr/share/nginx/cert/eduboss.shiguanghai.top.pem; # 将 domain name.pem 替换成您证书的文件名称
  ssl_certificate_key /usr/share/nginx/cert/eduboss.shiguanghai.top.key; # 将 demain name.key 替换为您证书的秘钥文件名称

  ssl_session_cache shared:SSL:1m;
  ssl_session_timeout  10m;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4; # 使用此加密文件
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # 使用该协议进行配置
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://127.0.0.1:3001/;  # ghost监听的ip和端口号
    proxy_set_header  Host $http_host; # required for docker client's sake
    proxy_set_header  X-Real-IP $remote_addr; # pass on real client's IP
    proxy_set_header  X-Xorwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header  X-Fprwarded-Proto $scheme;
    proxy_read_timeout  900;
  }
}
```

10.成功访问 [https://eduboss.shiguanghai.top](https://eduboss.shiguanghai.top/)

![image-20210530200446770](https://public.shiguanghai.top/blog_img/image-20210530200446770N5QrOe.png)

****

到此，EduBossFed项目就告一段落了，剩余内容可以自行补充，后续补充内容将以Tag版本形式在仓库更新：

项目仓库地址：[https://github.com/shiguanghai/edu-boss-fed](https://github.com/shiguanghai/edu-boss-fed)

项目展示地址：[https://eduboss.shiguanghai.top](https://eduboss.shiguanghai.top)