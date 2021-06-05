## 【简答题】一、说说 `application/jason` 和 `application/x-www-form-urlencoded` 二者之间的区别

### Content-Type 字段

> 关于字符的编码，HTTP/1.0规定，头信息必须是 ASCII 码，后面的数据可以是任何格式。因此，服务器回应的时候，必须告诉客户端，数据是什么格式，这就是`Content-Type`字段的作用

`application/jason` 和 `application/x-www-form-urlencoded` 都是比较常见的 `POST` 提交数据的方式

现在越来越多的人把 `application/json` 作为请求头，用来告诉服务端消息主体是序列化后的 JSON 字符串。由于 JSON 规范的流行，除了低版本 IE 之外的各大浏览器都原生支持 `JSON.stringify`，服务端语言也都有处理 JSON 的函数，使用 JSON 不会遇上什么麻烦

浏览器的原生 `form` 表单，如果不设置 `enctype` 属性（规定在发送表单数据之前如何对其进行编码），那么最终就会以 `application/x-www-form-urlencoded` 方式提交数据

除此之外还有 `multipart/form-data`，我们在表单上传文件时，必须让 `form` 的 `enctype` 等于这个值

- `Content-Type: application/json` ： 请求体中的数据会以 JSON 字符串的形式发送到后端
  - 优势：前端不需要关心数据结构的复杂度，后端解析方便
  - 问题：少数浏览器不兼容

- `Content-Type: application/x-www-form-urlencoded`：请求体中的数据会以普通表单形式（键值对 `?key1=value1&key2=value2`）发送到后端
  - 优势：所有浏览器都兼容
  - 问题：在数据结构及其复杂时，服务端数据解析变得很难

- `Content-Type: multipart/form-data`： 它会将请求体的数据处理为一条消息，以标签为单元，用分隔符分开。既可以上传键值对，也可以上传文件。上传文件时将文件转成二进制数据进行传输，不涉及转码

### 二者之间的转换

axios 使用 `POST` 发送数据时，默认是直接把 `json` 放到请求体中提交到后端的。也就是说，我们的 `Content-Type` 变成了 `application/json`，这是 axios 默认的请求头 content-type 类型。但是实际我们后端要求的 `'Content-Type': 'application/x-www-form-urlencoded'`为多见，这就与我们不符合。所以很多人会在这里犯错误，导致请求数据获取不到

我们可以使用 `qs` 库对数据进行编码来转换：

```js
import qs from 'qs'
const data = { 'bar': 123 }
const options = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  data: qs.stringify(data),
  url,
}
axios(options)
```

对于我们通过 `qs.stringify()` 转换之后的 `data`，axios 会自动把 ContentType 设置为 `application/x-www-form-urlencoded`，我们不再需要手动添加

- 如果 data 是普通对象，则 ContentType 是 `application/json`
- 如果 data 是 `qs.stringify()` 转换之后的数据，则 ContentType 会被设置为 `application/x-www-form-urlencoded`
- 如果 data 是 FormData 对象，则 ContenType 是 `multipart/form-data`

## 【简答题】二、说一说在前端这块，角色管理你是如何设计的

项目体验 [https://eduboss.shiguanghai.top/#/role](https://eduboss.shiguanghai.top/#/role)

![image-20210531182115439](https://public.shiguanghai.top/blog_img/image-20210531182115439fbP69T.png)

封装成列表资源组件，外层使用一个`card`卡片，头部是一个`form`表单写的搜索框来搜索列表数据，主体是一个`tabel`表格来渲染拿到的数据。主体上方有添加角色的按钮，列表中每条数据除了信息的渲染都拥有 菜单/资源的分配 以及 编辑 和 删除 四种操作

![image-20210531182056173](https://public.shiguanghai.top/blog_img/image-20210531182056173EC1riJ.png)

角色的添加和编辑 通过封装一个`dialog`对话框来实现，利用父子组件通信来处理对话框的关闭和数据刷新以及编辑角色的id传递

![image-20210531182150289](https://public.shiguanghai.top/blog_img/image-202105311821502898O7A9l.png)

角色的分配菜单/资源功能 通过分别封装 `tree`树形控件来实现，需要注意的是通过开启`props`将路由路径参数映射到组件的`props`数据中来实现解耦

## 【简答题】三、`@vue/cli` 跟 `vue-cli` 相比，`@vue/cli` 的优势在哪里？

### @vue/cli 和 vue-cli 的区别

- `@vue/cli` 是指新版本的 Vue CLI 3.x 或 4.x，包的名称做了修改

- `vue-cli` 则是指老版本的 Vue CLI 1.x 或 2.x

由于 Vue CLI3 和 Vue CLI4 的区别不大，为了方便阅读，后边统一规范为 Vue CLI2 与 Vue CLI4 的区别

1.安装、卸载命令

```shell
# Vue CLI2:
　　安装: npm install -g vue-cli 或 cnpm install -g vue-cli
　　卸载: npm uninstall -g vue-cli 或 cnpm uninstall -g vue-cli
# Vue CLI4:
　　安装: npm install -g @vue/cli 或 cnpm install -g @vue/cli
　　卸载: npm uninstall -g @vue/cli 或 cnpm uninstall -g @vue/cli
```

2.项目创建命令

```shell
# Vue CLI2:
　　vue init webpack vue-cli2　　　　# vue-cli2 为项目名称，项目名称不能出现大写字母
# Vue CLI4:
　　vue create vue-cli4    　　　　  # vue-cli4 为项目名称，项目名称也不能出现大写字母
```

3.项目目录结构

```shell
# Vue CLI2 新建项目，目录结构：
.
├── build # webpack 相关配置文件（都已配置好，一般不需要进行配置）
├── config # vue 基本配置文件（我们可以配置监听端口、打包输出等）
├── node_modules # 第三⽅包存储⽬录
├── src
│ ├── assets # 公共资源⽬录，放图⽚等资源
│ ├── components # 公共组件⽬录
│ ├── router # 路由相关模块
│ ├── App.vue # 根组件，最终被替换渲染到 index.html ⻚⾯中 #app ⼊⼝节点
│ └── main.js # 整个项⽬的启动⼊⼝模块
├── static # vue 基本配置文件（我们可以配置监听端口、打包输出等）
├── .bablerc # babel 编译参数
├── .editorconfig # EditorConfig 帮助开发⼈员定义和维护跨编辑器（或IDE）的统⼀的代码⻛格
├── .gitignore # Git 的忽略配置⽂件，告诉Git项⽬中要忽略的⽂件或⽂件夹
├── .postcssrc.js # 转换 CSS 的工具
├── index.html # 主页
├── package-lock.json # 记录安装时的包的版本号，以保证⾃⼰或其他⼈在 npm i nstall 时⼤家的依赖能保证⼀致
├── package.json # 包说明⽂件，记录了项⽬中使⽤到的第三⽅包依赖信息等内容
└── README.md # 说明⽂档
```

```shell
# Vue CLI4 新建项目，目录结构：
.
├── node_modules # 第三⽅包存储⽬录
├── public # 静态资源⽬录，任何放置在 public ⽂件夹的静态资源都会被简单的复制，⽽不经过 webpack
│ ├── favicon.ico
│ └── index.html
├── src
│ ├── assets # 公共资源⽬录，放图⽚等资源
│ ├── components # 公共组件⽬录
│ ├── router # 路由相关模块
│ ├── store # 容器相关模块
│ ├── views # 路由⻚⾯组件存储⽬录
│ ├── App.vue # 根组件，最终被替换渲染到 index.html ⻚⾯中 #app ⼊⼝节点
│ └── main.js # 整个项⽬的启动⼊⼝模块
├── .gitignore # Git 的忽略配置⽂件，告诉Git项⽬中要忽略的⽂件或⽂件夹
├── babel.config.js # Babel 配置⽂件
├── package-lock.json # 记录安装时的包的版本号，以保证⾃⼰或其他⼈在 npm i nstall 时⼤家的依赖能保证⼀致
├── package.json # 包说明⽂件，记录了项⽬中使⽤到的第三⽅包依赖信息等内容
└── README.md # 说明⽂档
```

从两个新建的项目目录结构来看，差别很大：Vue CLI4 新建的项目，根目录结构内少了之前的 `build`、`config`、`static`文件夹，配置文件也少了几个，连 `index.html` 都没有了，但多了一个 `public` 文件夹

3.项目启动命令

```shell
# Vue CLI2:
  npm run dev
  "scripts": {
    "dev": "webpack-dev-server --inline ==progress --config build/webpack.dev.conf.js",
    "start": "npm run dev",
    "build": "node build/build.js"
  }
# Vue CLI4:
  npm run serve
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  }
```

### @vue/cli 的优势

**1. Vue CLI 的初衷：**

- `vue-cli`：开箱即用，但强制性强，需要按照它的规则进行

- `@vue/cli`：开箱即用，简单易用

**2. 为什么要对 vue-cli 进行修改：**

旧版本的 vue-cli 本质上只是从 GitHub 拉取模版，它就像一个模版拷贝器，这样的拉取模版的方式有几个问题

1. 单个模版之间相互依赖，耦合性太高，无法实现共享功能和互相迁移，使得模版本身变得及其复杂和难以维护

2. webpack 配置和构建包含在仓库内，如 webpack 被改动，则会影响其他关联的插件

**3. 解决 vue-cli 问题：**

- 依赖 `vue-service`

CLI3 将 Webpack 的配置和逻辑全部封装在依赖中，同时允许用户通过 `vue.config.js` 配置进行修改 Webpack。好处是 CLI3 更新后，并不会影响到其他插件，此时我们只需要专注与功能，底层的配置只需要交给 Vue 团队去进行维护即可

- 插件化

CLI3 通过插件的形式去支持多个不同的功能，一个插件对应一个功能，比如（router, TS, Test）, 这样避免了多个模版，使得 CLI 自身的可维护性得到提升，同时支持第三方插件

**4. 更多：**

- GUI 界面
  - 虽然大部分人都觉得作用不大，因为确实对开发效率并实际的提升效果。就是看着舒服直观，这就够了

- 快速原型开发
  - 使用 `vue serve` 和 `vue build` 命令对单个 `*.vue` 文件进行快速开发，而不必创建一个vue的项目

- 现代模式
  - 给先进的浏览器配合先进的代码(ES6之后)，同时兼容旧版本的浏览器，先进的代码不管从文件体积还是脚本解析效率都有较高的提升

参考 [Vue作者尤雨溪：Vue CLI 3.0重构的原因](https://cli.vuejs.org/zh/guide/#%E4%BB%8B%E7%BB%8D)

参考 [为什么使用vue-cli脚手架？vue-cli3.0的优势在哪里?](https://blog.csdn.net/sinat_36728518/article/details/102935424)

## 【简答题】四、详细讲一讲生产环境下前端项目的自动化部署的流程

参考 [Vue + TypeScript - EduBossFed项目 - 发布部署 - 部署上线](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/edu-boss-fed-%E5%8F%91%E5%B8%83%E9%83%A8%E7%BD%B2.html#%E9%83%A8%E7%BD%B2%E4%B8%8A%E7%BA%BF)

## 【简答题】五、你在开发过程中，遇到过哪些问题，又是怎么解决的？请讲出两点

### 封装 vuepress 插件的坑

前不久跟几个小伙伴做一个vuepress的插件，就是封装了别人的一个vue组件到vuepress，但是最终测试不管怎么样项目都没法打包上线，打包最后一步报`document is not defined`

我当时就纳闷了这个插件怎么跑出个`document`，这是浏览器环境下才有的啊，但上当我去追根寻缘的时候，发现可能是人家的组件调用的。后来我通过查询资料发现：

在vuepress组件中使用`window`和`document`在本地开发的时候不会报错，但是在`build`的时候会报错，这是因为vuepress所有的页面在生成静态HTML时都需要通过Node.js服务端渲染，Node环境中没有document和window对象，因此访问或者使用这两个对象中的方法或属性就会报错

知道问题就好办了，后来我在vuepress官网找到了相关的解决方案，[在 Markdown 中使用 Vue](https://vuepress.vuejs.org/zh/guide/using-vue.html#%E5%9C%A8-markdown-%E4%B8%AD-%E4%BD%BF%E7%94%A8-vue)。解决方法就是：确保在`beforeMount`或`mounted`钩子中访问浏览器 / DOM 的 API

如果需要使用这样的组件或库，你需要在合适的生命周期钩子中**动态导入**它们：

```vue
<script>
export default {
  mounted () {
    import('./lib-that-access-window-on-import').then(module => {
      // use code
    })
  }
}
</script>
```

### Vue2.6 源代码编译报错的坑

曾经有一次看 Vue2 源码，把代码 fork 了一份到仓库，但是 `npm run dev` 运行项目的时候因为 Win10 路径的种种问题`rollup`打包失败无法生成 `dist` 目录

![IMG_2058](https://public.shiguanghai.top/blog_img/IMG_2058tbZP7i.PNG)

后来我 google 到一个跟我类似的疑问 [vue.js 2.0 alpha error on start on windows 10 x64 #2771](https://github.com/vuejs/vue/issues/2771)

![image-20210531214101822](https://public.shiguanghai.top/blog_img/image-20210531214101822X68BVf.png)

但是问题就在于这个 issues 早在 2016 年就已经被修复了，我只好顺着这个思路往下找答案，我初步把问题锁定在了 `rollup-plugin-alias.js` 这个文件上面

![IMG_2062](https://public.shiguanghai.top/blog_img/IMG_2062Ruu9rR.PNG)

与此同时我也把问题抛给了一个老师，也许这是个小概率事件？他的环境下并没有出现这个问题而是成功打包了，但是他注意到报错中提到没有找到 `\vue\src\core\util\index` 这个文件

![IMG_2061](https://public.shiguanghai.top/blog_img/IMG_2061EZJhBU.PNG)

于是我跑到项目下，这个文件时存在的，但我发现路径少了`.js`后缀，我心想是不是 win10 兼容性导致的，我还想过是不是这个版本的bug？于是我去`clone`了一份vue代码，但是似乎并没有什么不同，前面提到我怀疑是`rollup-plugin-alias.js` 导致的错误，因此我把它单独重装了一遍，重装后

![IMG_2063](https://public.shiguanghai.top/blog_img/IMG_2063A5nD2B.PNG)

好吧，报了新的错误，这次又找不到`config`。因为之前网上搜不到太多相关的其他资料，所以我这次换了关键词重新找

这个新的错误有了突破口，经过漫长寻找，最后从 [https://blog.csdn.net/weixin_30433075/article/details/95545419](https://blog.csdn.net/weixin_30433075/article/details/95545419) 找到了可能，经过尝试采取了第三个方案：当时楼主提供了一个 rollup-plugin-alias 链接，只要进行覆盖原文件

但是这个文件现在需要付费下载，秉承开源的态度，我已经把它共享到自己服务器上了，有兴趣的小伙伴自行获取 [rollup-plugin-alias.zip](https://public.shiguanghai.top/public/rollup-plugin-alias.zip) （内含 `rollup-plugin-alias-new` (1.2.6) 和 `rollup-plugin-alias-old` (1.5.2) 两个包，均已build）

进入`rollup-plugin-alias`目录，先执行 `npm install` 再执行 `npm run build`，然后把自己项目的 `node_modules`文件替换即可

这个插件应该是来消除 `rollup` 路径兼容的，这也正和我前边猜测的大抵相同，应该是它本身打包后出了问题（猜测和ES6相关，具体原因可以拿到代码一起讨论一下）

## 【简答题】六、针对新技术，你是如何过渡到项目中？

在这之前应该思考，为什么引入这个技术，不能为了新技术而去使用新技术。就拿一个已经上线的项目前端部分如何过渡至组件化和工程化：

- 不影响线上项目运行
  - 不动老代码，在完成了新架构的设计后，现在新的模板和项目上进行操作
  - 在开始改动之前先上隔离，做好备份和回退机制。
- 代码重构
  - 重构的目的是让代码可以更好被理解和扩展，有些代码是不需要理解其逻辑就可以进行重构的
- 引入自动化工具，解决复杂容易出错的点
  - 不能为了自动化而自动化，首先这些工具要适合自己，要学会发现问题才对
  - 比如上线之前，为了确保团队代码规范，使用 git commit pre 的钩子工具做检查
  - 再比如压缩打包合并这些grunt、gulp解决方案已经烂大街了，该用就用
- 规范上线流程，前端开发流程
  - 上线不要过度自动，有时候该人工还是要人工
- 模块化前端代码，让以后的开发可以像搭积木一样

如果以上几点算是共识，那么一条一条解决就好了，造轮子嘛如果真的重构不来，没有资源，无法把老代码改善的很好。那么至少以后的新代码可以不再写得那么屎