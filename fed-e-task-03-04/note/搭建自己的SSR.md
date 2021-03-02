
## 12.1 Vue SSR 介绍
### 是什么
- Vue SSR（Vue.js Server-Side Rendering） 是 Vue.js 官方提供的一个服务端渲染（同构应用）解决方案
- 使用它可以构建同构应用
- 还是基于原有的 Vue.js 技术栈

> 官方文档的解释：Vue.js 是构建客户端应用程序的框架。默认情况下，可以在浏览器中输出 Vue组件，进行生成 DOM 和操作 DOM。然而，也可以将同一个组件渲染为服务器端的 HTML 字符串，将它们直接发送到浏览器，最后将这些静态标记"激活"为客户端上完全可交互的应用程序。
服务器渲染的 Vue.js 应用程序也可以被认为是"同构"或"通用"，因为应用程序的大部分代码都可以在**服务器**和**客户端**上运行。

### 使用场景
- 技术层面：
	* 更快的首屏渲染速度
	* 更好的 SEO
- 业务层面：
	* 不适合管理系统
	* 适合门户资讯类网站，例如企业官网、知乎、简书等
	* 适合移动网站
### 如何实现 Vue SSR
1. **基于 Vue SSR 官方文档提供的解决方案**

官方方案具有更直接的控制应用程序的结构，更深入底层，更加灵活，同时在使用官方方案的过程中，也会对Vue SSR有更加深入的了解。

该方式需要你熟悉 Vue.js 本身，并且具有 Node.js 和 webpack 的相当不错的应用经验。

2. **Nuxt.js 开发框架**

NUXT提供了平滑的开箱即用的体验，它建立在同等的Vue技术栈之上，但抽象出很多模板，并提供了一些额外的功能，例如静态站点生成。通过 Nuxt.js 可以快速的使用 Vue SSR 构建同构应用。
## 12.2 Vue SSR 基本使用
### 渲染一个 Vue 实例
```shell
mkdir vue-ssr

cd vue-ssr

npm init -y

npm i vue vue-server-renderer
```

创建模块 server.js
```js
// 第 1 步：创建一个 Vue 实例
const Vue = require('vue')

const app = new Vue({
  template: `
    <div id="app">
      <h1>{{ message }}</h1>
    </div>
  `,
  data: {
    message: '时光海'
  }
})

// 第 2 步：创建一个 renderer
const renderer = require('vue-server-renderer').createRenderer()

// 第 3 步：将 Vue 实例渲染为 HTML
renderer.renderToString(app, (err, html) => {
  if (err) throw err
  console.log(html)
  // => <div id="app" data-server-rendered="true"><h1>时光海</h1></div>
})
```
### 与服务器集成
首先安装 [Express](https://expressjs.com/) 到项目中：
```shell
npm i express
```
然后使用 Express 创建一个基本的 Web 服务：
```js
const express = require('express')

const server = express()

server.get('/', (req, res) => {
  const app = new Vue({
    template: `
      <div id="app">
        <h1>{{ message }}</h1>
      </div>
    `,
    data: {
      message: '时光海'
    }
  })
  
  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error.')
    }
    res.end(html)
  })
})

server.listen(3000, () => {
  console.log('server runing at port 3000.')
})
```
启动 Web 服务：
```shell
nodemon index.js
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210219150000409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

解决编码问题（建议二者均设置）：
```js
res.setHeader('Content-Type', 'text/html; charset=utf-8')
res.end(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Hello</title>
      <meta charset="UTF-8">
    </head>
    <body>${html}</body>
  </html>
`)
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021021915045551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 使用一个页面模板
```js
const fs = require('fs')

const renderer = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync('./index.template.html',
  'utf-8')
})

...
res.end(html)
```
`index.template.html`
```html
<!DOCTYPE html>
<html lang="en">

<head>
  <title>Hello</title>
  <meta charset="UTF-8">
</head>

<body>
  <!--vue-ssr-outlet-->
</body>

</html>
```

### 在模板中使用外部数据
```js
renderer.renderToString(app， {
  title: '时光海',
  meta: `
    <meta name="description" content="时光海">
  `
}, (err, html) => {
  ...
})
```
```html
<head>
  <title>{{ title }}</title>
  <meta charset="UTF-8">
  {{{ meta }}}
</head>
```
```shell
nodemon index.js
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210219162610953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021021916373591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 12.3 构建同构渲染 - 构建流程
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210219163853256.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
如上图：左边为应用的源代码Source，中间为Webpack，右边为NodeServer服务端。

在我们的应用当中，目前只有Server entry服务端入口来处理服务端渲染，如果我们希望服务端渲染的内容拥有客户端动态交互的能力的话，还需要有一个客户端脚本的入口Client entry，它专门来处理客户端渲染，也就是去接管服务端渲染的内容把它激活为一个动态页面。

有了这两个入口之后需要Webpack对它们进行打包编译构建：对于Server entry最终要打包为一个ServerBundle来做服务端渲染，同样的对于客户端入口Client entry来说最终要打包为一个ClientBundle来接管服务端渲染好的静态页面对它进行激活。

这就是同构应用实现的一个基本流程。
## 12.4 构建同构渲染 - 源码结构
### App.vue
```js
<template>
  <div id="app">
    <h1>{{ message }}</h1>
    <h2>客户端动态交互</h2>
    <div>
      <input v-model="message">
    </div>
    <div>
      <button @click="onClick">点击测试</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      message: '时光海'
    }
  },
  methods: {
    onClick () {
      console.log('Hello World!')
    }
  }
}
</script>

<style>

</style>
```
### app.js
```js
/**
 * 通用启动入口
 */
import Vue from 'vue'
import App from './App.vue'

// 导出一个工厂函数，用于创建新的应用程序、router、store实例
export function createApp () {
  const app = new Vue({
    // 根实例简单的渲染应用程序
    render: h => h(App)
  })
  return { app }
}
```
### entry-client.js
```js
/**
 * 客户端入口
 */
import { createApp } from './app'

// 客户端特定引导逻辑……

const { app } = createApp()

// 这里假定 App.vue 模板中根元素具有 `id="app"`
app.$mount('#app')
```
### entry-server.js
```js
/**
 * 服务端启动入口
 */
import { createApp } from './app'

export default context => {
  const { app } = createApp()
  return app
}
```
## 12.5 构建同构渲染 - 构建配置
### 安装依赖
（1）安装生产依赖
```shell
npm i vue vue-server-renderer express cross-env
```
|包| 说明|
|-|-|
vue |Vue.js 核心库
vue-server-renderer| Vue 服务端渲染工具
express |基于 Node 的 Web 服务框架
cross-env |通过 npm scripts 设置跨平台环境变量
（2）安装开发依赖
```shell
npm i -D webpack webpack-cli webpack-merge webpack-node-externals @babel/core @babel/plugin-transform-runtime @babel/preset-env babel-loader css-loader url-loader file-loader rimraf vue-loader vue-template-compiler friendly-errors-webpack-plugin
```
包 |说明
 |- |- |
webpack  |webpack 核心包
webpack-cli  |webpack 的命令行工具
webpack-merge  |webpack 配置信息合并工具
webpack-node-externals  |排除 webpack 中的 Node 模块
rimraf  |基于 Node 封装的一个跨平台 rm -rf 工具
friendly-errors-webpack-plugin  |友好的 webpack 错误提示
@babel/core @babel/plugin-transform-runtime @babel/preset-env babel-loader | Babel 相关工具
vue-loader vue-template-compiler  |处理 .vue 资源
file-loader  |处理字体资源
css-loader  |处理 CSS 资源
url-loader  |处理图片资源
### 配置文件及打包命令
（1）初始化 webpack 打包配置文件 build

`webpack.base.config.js`
```js
/**
 * 公共配置
 */
const VueLoaderPlugin = require('vue-loader/lib/plugin') // 处理.vue资源
const path = require('path') // 处理路径
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin') //友好的日志输出
const resolve = file => path.resolve(__dirname, file) // 得到绝对安全的文件路径

const isProd = process.env.NODE_ENV === 'production' // 是否为生产模式

// 客户端打包和服务端打包的公共配置内容
module.exports = {
  mode: isProd ? 'production' : 'development', // 打包模式
  output: { // 打包结果
    path: resolve('../dist/'), // 打包输出目录
    publicPath: '/dist/', // 打包结果文件加载路径
    filename: '[name].[chunkhash].js' // 文件名
  },
  resolve: {
    alias: {
      // 路径别名，@ 指向 src
      '@': resolve('../src/')
    },
    // 可以省略的扩展名
    // 当省略扩展名的时候，按照从前往后的顺序依次解析
    extensions: ['.js', '.vue', '.json']
  },
  devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map', // 配置source-map
  module: {
    rules: [
      // 处理图片资源
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },

      // 处理字体资源
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },

      // 处理 .vue 资源
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },

      // 处理 CSS 资源
      // 它会应用到普通的 `.css` 文件
      // 以及 `.vue` 文件中的 `<style>` 块
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      
      // CSS 预处理器，参考：https://vue-loader.vuejs.org/zh/guide/pre-processors.html
      // 例如处理 Less 资源
      // {
      //   test: /\.less$/,
      //   use: [
      //     'vue-style-loader',
      //     'css-loader',
      //     'less-loader'
      //   ]
      // },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new FriendlyErrorsWebpackPlugin()
  ]
}
```

`webpack.client.config.js`
```js
/**
 * 客户端打包配置
 */
const { merge } = require('webpack-merge') // 合并webpack配置信息
const baseConfig = require('./webpack.base.config.js')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(baseConfig, {
  entry: {
    app: './src/entry-client.js'
  },

  module: {
    rules: [
      // ES6 转 ES5
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true,
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
    ]
  },

  // 重要信息：这将 webpack 运行时分离到一个引导 chunk 中，
  // 以便可以在之后正确注入异步 chunk。
  optimization: {
    splitChunks: {
      name: "manifest",
      minChunks: Infinity
    }
  },

  plugins: [
    // 此插件在输出目录中生成 `vue-ssr-client-manifest.json`
    // 描述客户端打包结果中的依赖及需要加载的模块信息
    new VueSSRClientPlugin()
  ]
})
```
`webpack.server.config.js`
```js
/**
 * 服务端打包配置
 */
const { merge } = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseConfig = require('./webpack.base.config.js')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = merge(baseConfig, {
  // 将 entry 指向应用程序的 server entry 文件
  entry: './src/entry-server.js',

  // 这允许 webpack 以 Node 适用方式处理模块加载
  // 并且还会在编译 Vue 组件时，
  // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)
  target: 'node',

  output: {
    filename: 'server-bundle.js',
    // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
    libraryTarget: 'commonjs2'
  },

  // 不打包 node_modules 第三方包，而是保留 require 方式直接加载
  externals: [nodeExternals({
    // 白名单中的资源依然正常打包
    allowlist: [/\.css$/]
  })],

  plugins: [
    // 这是将服务器的整个输出构建为单个 JSON 文件的插件。
    // 默认文件名为 `vue-ssr-server-bundle.json`
    new VueSSRServerPlugin()
  ]
})
```

（2）在 npm scripts 中配置打包命令

```js
"scripts": {
  "build:client": "cross-env NODE_ENV=production webpack --config build/webpack.client.config.js",
  "build:server": "cross-env NODE_ENV=production webpack --config build/webpack.server.config.js",
  "build": "rimraf dist && npm run build:client && npm run build:server"
}
```

运行测试：

```shell
npm run build:client

npm run build:server

npm run build
```
### 启动应用
`server.js`

```js
const Vue = require('vue')
const express = require('express')
const fs = require('fs')

const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const template = fs.readFileSync('./index.template.html', 'utf-8')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')
const renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
  template,
  clientManifest
})

const server = express()

server.use('/dist', express.static('./dist'))

server.get('/', (req, res) => {
  renderer.renderToString({
    title: '时光海',
    meta: `
      <meta name="description" content="时光海">
    `
  }, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error.')
    }
    res.setHeader('Content-Type',
    'text/html; charset=utf-8')
    res.end(html)
  })
})

server.listen(3000, () => {
  console.log('server runing at port 3000.')
})
```

```shell
nodemon server.js
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210225160816166.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 12.6 构建同构渲染 - 构建配置开发模式
### 基本思路
我们现在已经实现同构应用的基本功能了，但是这对于一个完整的应用来说还远远不够，例如如何处理同构应用中的路由、如何在服务端渲染中进行数据预取等功能。这些功能我们都会去对它进行实现，但是在实现它们之前我们要先来解决一个关于打包的问题：

- 每次写完代码，都要重新打包构建
- 重新启动 Web 服务
- 很麻烦...

所以下面我们来实现项目中的开发模式构建，也就是我们希望能够实现：

- 写完代码，自动构建
- 自动重启 Web 服务
- 自动刷新页面内容

**基本思路：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210225162701153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

`renderer`是通过打包的结果调用`createBundleRenderer`创建出来的。在生产模式下它是直接基于打包的结果创建的，但是在开发模式下`renderer`需要不断更新渲染。

`package.json`
```js
"scripts": {
  ...
  "start": "cross-env NODE_ENV=production node server.js",
  "dev": "node server.js"
}
```

`server.js`
```js
const Vue = require('vue')
const express = require('express')
const fs = require('fs')

const isProd = process.env.NODE_ENV === 'production'

let renderer
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = require('vue-server-renderer').createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
}

const server = express()

server.use('/dist', express.static('./dist'))

const render = (req, res) => {
  renderer.renderToString({
    title: '时光海',
    meta: `
      <meta name="description" content="时光海">
    `
  }, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error.')
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  })
}

server.get('/', isProd
  ? render
  : (req, res) => {
    // TODO: 等待有了 Renderer 渲染器以后，调用 render 进行渲染
    render()
  })

server.listen(3000, () => {
  console.log('server runing at port 3000.')
})

```
### 提取处理模块
`server.js`
```js
const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const isProd = process.env.NODE_ENV === 'production'
const server = express()

let renderer
let onReady
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 -> 监视打包构建 -> 重新生成 Renderer 渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}

server.use('/dist', express.static('./dist'))

const render = (req, res) => {
  renderer.renderToString({
    title: '时光海',
    meta: `
      <meta name="description" content="时光海">
    `
  }, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error.')
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  })
}

server.get('/', isProd
  ? render
  : async (req, res) => {
    // 等待有了 Renderer 渲染器以后，调用 render 进行渲染
    await onReady
    render(req, res)
  })

server.listen(3000, () => {
  console.log('server runing at port 3000.')
})
```

`build/setup-dev-server.js`
```js
module.exports = (server, callback) => {
  const onReady = new Promise()

  // 监视构建 -> 更新 Renderer

  return onReady
} 
```
### setupDevServer更新模块
`build/setup-dev-server.js`
```js
module.exports = (server, callback) => {
  let ready
  const onReady = new Promise(r => ready = r)

  // 监视构建 -> 更新 Renderer

  let template
  let serverBundle
  let clientManifest

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器

  return onReady
} 
```
### 监视构建 template
```shell
npm install chokidar
```

`build/setup-dev-server.js`
```js
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

module.exports = (server, callback) => {
  ...

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  const templatePath = path.resolve(__dirname, '../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  // 监视模板文件
  // fs.watch、fs.watchFile
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })

  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  
  return onReady
} 
```
### 监视构建 serverBundle
`build/setup-dev-server.js`
```js
...
const webpack = require('webpack')

const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  ...

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  ...
  
  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    if (stats.hasErrors()) return
    serverBundle = JSON.parse(
      fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
    )
    update()
  })

  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  
  return onReady
} 
```
### 将打包结果存储到内存中
webpack 默认会把构建结果存储到磁盘中，对于生产模式构建来说是没有问题的；但是我们在开发模式中会频繁的修改代码触发构建，也就意味着要频繁的操作磁盘数据，而磁盘数据操作相对于来说是比较慢的，所以我们有一种更好的方式，就是把数据存储到内存中，这样可以极大的提高构建的速度。

- 方案一：自己配置 memfs

[memfs](https://github.com/streamich/memfs) 是一个兼容 Node 中 fs 模块 API 的内存文件系统，通过它我们可以轻松的实现把 webpack 构建结果输出到内存中进行管理。

- 方案二：使用 webpack-dev-middleware

[webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) 作用是，以监听模式启动 webpack，将编译结果输出到内存中，然后将内存文件输出到 Express 服务中。

安装依赖：
```shell
npm i -D webpack-dev-middleware
```

配置到构建流程中`build/setup-dev-server.js`：
```js
...
const devMiddleware = require('webpack-dev-middleware')

...

module.exports = (server, callback) => {
  ...

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  ...

  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)

  // serverCompiler.watch({}, (err, stats) => {
  //   if (err) throw err
  //   if (stats.hasErrors()) return
  //   serverBundle = JSON.parse(
  //     fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
  //   )
  //   update()
  // })

  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })
  // 每当编译结束，触发钩子
  serverCompiler.hooks.done.tap('server', () => {
    serverBundle = JSON.parse(
      // fileSystem 获取内部操作文件系统的对象 类似 NodeJS 的 fs
      serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
    )
    update()
  })

  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  
  return onReady
} 
```
### 监视构建 clientManifest
`build/setup-dev-server.js`
```js
...
module.exports = (server, callback) => {
  ...
  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  const clientConfig = require('./webpack.client.config')
  const clientCompiler = webpack(clientConfig)

  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath, // 构建输出当中的请求前缀路径
    logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })
  // 每当编译结束，触发钩子
  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(
      // fileSystem 获取内部操作文件系统的对象 类似 NodeJS 的 fs
      clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')
    )
    update()
  })
  
  // 重要！！！将 clientDevMiddleware 挂载到 Express 服务中，提供对其内部内存中数据的访问
  // server.use(clientDevMiddleware)
  
  return onReady
} 
```

`server.js`
```js
// express.static 处理的是物理磁盘的资源文件
server.use('/dist', express.static('./dist'))
```

因此客户端：
```js
// 重要！！！将 clientDevMiddleware 挂载到 Express 服务中，提供对其内部内存中数据的访问
server.use(clientDevMiddleware)
```
### 热更新
热更新功能需要使用到 [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) 工具包

安装依赖：
```shell
npm install --save-dev webpack-hot-middleware
```

`build/setup-dev-server.js`
```js
...
const hotMiddleware = require('webpack-hot-middleware')

...

module.exports = (server, callback) => {
  ...

  // 监视构建 template -> 调用 update -> 更新 Renderer 渲染器
  ...

  // 监视构建 serverBundle -> 调用 update -> 更新 Renderer 渲染器
  ...

  // 监视构建 clientManifest -> 调用 update -> 更新 Renderer 渲染器
  const clientConfig = require('./webpack.client.config')
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新一个客户端脚本
    clientConfig.entry.app // 原本的入口
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的 hash
  const clientCompiler = webpack(clientConfig)

  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath, // 构建输出当中的请求前缀路径
    logLevel: 'silent' // 关闭日志输出，由 FriendlyErrorsWebpackPlugin 处理
  })
  // 每当编译结束，触发钩子
  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(
      // fileSystem 获取内部操作文件系统的对象 类似 NodeJS 的 fs
      clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8')
    )
    update()
  })
  server.use(hotMiddleware(clientCompiler, {
    log: false // 关闭热更新本身的日志输出
  }))

  // 重要！！！将 clientDevMiddleware 挂载到 Express 服务中，提供对其内部内存中数据的访问
  server.use(clientDevMiddleware)
  
  return onReady
} 
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210225201941834.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 12.7 编写通用代码
### 服务器上的数据相应
在纯客户端应用程序 (client-only app) 中，每个用户会在他们各自的浏览器中使用新的应用程序实例。对于服务器端渲染，我们也希望如此：每个请求应该都是全新的、独立的应用程序实例，以便不会有交叉请求造成的状态污染 (cross-request state pollution)。

`app.js`
```js
// 导出一个工厂函数，用于创建新的应用程序、router、store实例
export function createApp () {
  const app = new Vue({
    // 根实例简单的渲染应用程序
    render: h => h(App)
  })
  return { app }
}

// const app = new Vue({
//   // 根实例简单的渲染应用程序
//   render: h => h(App)
// })
```

因为实际的渲染过程需要确定性，所以我们也将在服务器上“预取”数据 ("pre-fetching" data) - 这意味着在我们开始渲染时，我们的应用程序就已经解析完成其状态。也就是说，将数据进行响应式的过程在服务器上是多余的，所以默认情况下禁用。禁用响应式数据，还可以避免将「数据」转换为「响应式对象」的性能开销。

### 组件生命周期钩子函数
由于没有动态更新，所有的生命周期钩子函数中，只有 **beforeCreate** 和 **created** 会在服务器端渲染 (SSR) 过程中被调用。这就是说任何其他生命周期钩子函数中的代码（例如 **beforeMount** 或 **mounted** ），只会在客户端执行。

此外还需要注意的是，你应该避免在 **beforeCreate** 和 **created** 生命周期时产生全局副作用的代码，例如在其中使用 **setInterval** 设置 timer。在纯客户端 (client-side only) 的代码中，我们可以设置一个 timer，然后在 **beforeDestroy** 或 **destroyed** 生命周期时将其销毁。但是，由于在 SSR 期间并不会调用销毁钩子函数，所以 timer 将永远保留下来。为了避免这种情况，请将副作用代码移动到 **beforeMount** 或 **mounted** 生命周期中。

### 访问特定平台(Platform-Specific) API
通用代码不可接受特定平台的 API，因此如果你的代码中，直接使用了像 **window** 或 **document** ，这种仅浏览器可用的全局变量，则会在 Node.js 中执行时抛出错误，反之也是如此。

对于共享于服务器和客户端，但用于不同平台 API 的任务(task)，建议将平台特定实现包含在通用 API 中，或者使用为你执行此操作的 library。例如，[axios](https://github.com/axios/axios) 是一个 HTTP 客户端，可以向服务器和客户端都暴露相同的 API。

对于仅浏览器可用的 API，通常方式是，在「纯客户端 (client-only)」的生命周期钩子函数中惰性访问 (lazily access) 它们。

请注意，考虑到如果第三方 library 不是以上面的通用用法编写，则将其集成到服务器渲染的应用程序中，可能会很棘手。你可能要通过模拟 (mock) 一些全局变量来使其正常运行，但这只是 hack 的做法，并且可能会干扰到其他 library 的环境检测代码。

### 区分运行环境
[参考](https://webpack.js.org/plugins/define-plugin/)

```js
new webpack.DefinePlugin({
  'process.client': true,
  'process.server': false
})
```
### 自定义指令
大多数自定义指令直接操作 DOM，因此会在服务器端渲染 (SSR) 过程中导致错误。有两种方法可以解决这个问题：

1. 推荐使用组件作为抽象机制，并运行在「虚拟 DOM 层级(Virtual-DOM level)」（例如，使用渲染函数(render function)）。
2. 如果你有一个自定义指令，但是不是很容易替换为组件，则可以在创建服务器 renderer 时，使用 [directives](https://ssr.vuejs.org/zh/api/#cache) 选项所提供"服务器端版本(server-side version)"。

## 12.8 路由和代码分割
### 配置VueRouter - router/index.js
```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/pages/Home'

Vue.use(VueRouter)

export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history', // 兼容前后端
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('@/pages/About')
      },
      {
        path: '*',
        name: 'error404',
        component: () => import('@/pages/404')
      }
    ]
  })

  return router
}
```
### 将路由注册到根实例 - app.js
```js
/**
 * 通用启动入口
 */
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'

// 导出一个工厂函数，用于创建新的应用程序、router、store实例
export function createApp () {
  const router = createRouter()
  const app = new Vue({
    router, // 把路由挂载到 Vue 根实例中
    // 根实例简单的渲染应用程序
    render: h => h(App)
  })
  return { app, router }
}
```
### 适配服务端入口 - entry-server.js
```js
// entry-server.js
import { createApp } from './app'

export default async context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
  const { app, router } = createApp()

  // 设置服务器端 router 的位置
  router.push(context.url)

  // 等到 router 将可能的异步组件和钩子函数解析完
  await new Promise(router.onReady.bind(router))

  return app
}
```
### 服务端适配 - server.js
```js
...

const render = async (req, res) => {
  try {
    const html = await renderer.renderToString({
      title: '时光海',
      meta: `
        <meta name="description" content="时光海">
      `,
      url: req.url
    })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch (err) {
    res.status(500).end('Internal Server Error.')
  }
}

// 服务端路由设置为 *，意味着所有的路由都会进入这里
server.get('*', isProd
  ? render
  : async (req, res) => {
    // 等待有了 Renderer 渲染器以后，调用 render 进行渲染
    await onReady
    render(req, res)
  }
)

...
```
### 适配客户端入口 - entry-client.js
```js
/**
 * 客户端入口
 */
import { createApp } from './app'

// 客户端特定引导逻辑……

const { app, router } = createApp()

router.onReady(() => {
  // 这里假定 App.vue 模板中根元素具有 `id="app"`
  app.$mount('#app')
})
```
### 根组件 - App.vue
```js
<template>
  <div id="app">
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="/about">About</router-link>
      </li>
    </ul>

    <!-- 路由出口 -->
    <router-view/>
  </div>
</template>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210225231357927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 12.9 管理页面 Head
无论是服务端渲染还是客户端渲染，它们都使用的同一个页面模板。

页面中的 body 是动态渲染出来的，但是页面的 head 是写死的，也就说我们希望不同的页面可以拥有自己的 head 内容，例如页面的 title、meta 等内容，所以下面我们来了解一下如何让不同的页面来定制自己的 head 头部内容。

我这里主要给大家介绍一个第三方解决方案：[vue-meta](https://github.com/nuxt/vue-meta)。

Vue Meta 是一个支持 SSR 的第三方 Vue.js 插件，可让你轻松的实现不同页面的 head 内容管理。

使用它的方式非常简单，而只需在页面组件中使用 `metaInfo` 属性配置页面的 head 内容即可。

安装：
```shell
npm i vue-meta
```
在通用入口`app.js`中通过插件的方式将 vue-meta 注册到 Vue 中
```js
...

import VueMeta from 'vue-meta'

Vue.use(VueMeta)

Vue.mixin({
  metaInfo: {
    titleTemplate: '%s - 时光海'
  }
})

...
```
然后在服务端渲染入口模块中适配 vue-meta：
```js
// entry-server.js
import { createApp } from './app'

export default async context => {
  ...

  const meta = app.$meta()

  // 设置服务器端 router 的位置
  router.push(context.url)

  context.meta = meta

  ...
}
```
最后在模板页面`index.template.html`中注入 meta 信息：
```js
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {{{ meta.inject().title.text() }}}
  {{{ meta.inject().meta.text() }}}
</head>

<body>
  <!--vue-ssr-outlet-->
</body>

</html>
```
下面就是直接在组件中使用即可：

`Home.vue`
```js
metaInfo: {
  title: '首页'
}
```

`About.vue`
```js
metaInfo: {
  title: '关于'
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210226151842506.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 12.10 数据预取和状态管理
### 思路分析
**服务端渲染中的数据预取和状态管理：**

我们的需求就是：

- 已知有一个数据接口，接口返回一个文章列表数据
- 我们想要通过服务端渲染的方式来把异步接口数据渲染到页面中

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210226152056191.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
也就是说我们要在服务端获取异步接口数据，交给 Vue 组件去渲染。

我们首先想到的肯定是在组件的生命周期钩子中请求获取数据渲染页面，那我们可以顺着这个思路来试一下。

在组件中添加生命周期钩子，beforeCreate 和 created，服务端渲染仅支持这两个钩子函数的调用。

然后下一个问题是如何在服务端发送请求？依然使用 axios，axios 既可以运行在客户端也可以运行在服务端，因为它对不同的环境做了适配处理，在客户端是基于浏览器的 XMLHttpRequest 请求对象，在服务端是基于 Node.js 中的 http 模块实现，无论是底层是什么，上层的使用方式都是一样的。

`Post.vue`
```js
<template>
  <div>
    <h1>Post List</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>
```
`router/index.vue`
```js
{
  path: '/posts',
  name: 'post-list',
  component: () => import('@/pages/Posts')
}
```
`App.vue`
```js
<li>
  <router-link to="/posts">Posts</router-link>
</li>
```
安装 `axios`
```shell
npm install axios
```
`Post.vue`
```js
<script>
import axios from 'axios'

export default {
  name: 'PostList',
  metaInfo: {
    title: 'Posts'
  },
  data () {
    return {
      posts: []
    }
  },
  // 服务端渲染
  //     只支持 beforeCreate 和 created
  //     不会等待 beforeCreate 和 created 中的异步操作
  //     不支持响应式数据
  // 所有这种做法在服务端渲染中是不会工作的！！！
  async created () {
    console.log('Posts Created Start')
    const { data } = await axios({
      method: 'GET',
      url: 'https://cnodejs.org/api/v1/topics'
    })
    this.posts = data.data
    console.log('Posts Created End')
  }
}
</script>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210226153455204.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

注意：这个内容并不是通过服务端渲染过来，而是通过服务端渲染而来的！

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210226153804376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

而且从命令行我们可以看出，created在服务端是调用过的，且执行了其中的代码，只是没有作用。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210226153859898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

接下来的问题就是：如果我们希望服务端渲染的时候就拿到数据，渲染后的结果就是完整的页面该怎么办呢？

它的核心思路就是把在服务端渲染期间获取的数据存储到 Vuex 容器中，然后把容器中的数据同步到客户端，这样就保持了前后端渲染的数据状态同步，避免了客户端重新渲染的问题。

### 数据预取
所以接下来要做的第一件事儿就是把 Vuex 容器创建出来。

（1）通过 Vuex 创建容器实例，并挂载到 Vue 根实例

安装 `Vuex`
```shell
npm install vuex
```

创建 Vuex 容器 `store/index.js`：
```js
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      posts: []
    }),

    mutations: {
      setPosts (state, data) {
        state.posts = data
      }
    },

    actions: {
      // 在服务端渲染期间务必让 action 返回一个 Promise
      async getPosts ({ commit }) {
        // return new Promise()
        const { data } = await axios.get('https://cnodejs.org/api/v1/topics')
        commit('setPosts', data.data)
      }
    }
  })
}
```
`app.js`
```js
/**
 * 通用启动入口
 */
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import VueMeta from 'vue-meta'
import { createStore } from './store'

Vue.use(VueMeta)

Vue.mixin({
  metaInfo: {
    titleTemplate: '%s - 时光海'
  }
})

// 导出一个工厂函数，用于创建新的应用程序、router、store实例
export function createApp () {
  const router = createRouter()
  const store = createStore()
  const app = new Vue({
    router, // 把路由挂载到 Vue 根实例中
    store, // 把容器挂载到 Vue 根实例中
    // 根实例简单的渲染应用程序
    render: h => h(App)
  })
  return { app, router, store }
}
```
（2）在组件中使用 serverPrefetch 触发容器中的 action

`Post.vue`
```js
<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'PostList',
  metaInfo: {
    title: 'Posts'
  },
  data () {
    return {
      // posts: []
    }
  },
  computed: {
    ...mapState(['posts'])
  },

  // Vue SSR 特殊为服务端渲染提供的一个生命周期钩子函数
  serverPrefetch () {
    // 发起 action，返回 Promise
    // return this.$store.dispatch('getPosts')
    return this.getPosts()
  },
  methods: {
    ...mapActions(['getPosts'])
  }
}
</script>
```

此时我们拿到的数据只是存储在了服务端的 `Vuex` 容器当中了，我们也应该把数据同步到客户端的 `Vuex` 容器当中。

否则就会出现两个端数据不同步的问题，就会导致合并失败从而使得客户端重新渲染。

### 将预取数据同步到客户端
（3）在服务端渲染应用入口中将容器状态序列化到页面中

接下来我们要做的就是把在服务端渲染期间所获取填充到容器中的数据同步到客户端容器中，从而避免两个端状态不一致导致客户端重新渲染的问题。

- 将容器中的 state 转为 JSON 格式字符串
- 生成代码： `window.__INITIAL__STATE = 容器状态` 语句插入模板页面中
- 【客户端通过 `window.__INITIAL__STATE` 获取该数据】

`entry-server.js`
```js
// entry-server.js
import { createApp } from './app'

export default async context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
  // 以便服务器能够等待所有的内容在渲染前，就已经准备就绪。
  const { app, router, store } = createApp()
  ...

  context.rendered = () => {
    // Renderer 会把 context.state 数据对象内联到页面模板中
    // 最终发送给客户端的页面中会包含一段脚本：window.__INITIAL_STATE__ = context.state
    // 客户端就要把页面中的 window.__INITIAL_STATE__ 拿出来填充到客户端 store 容器中
    context.state = store.state
  }

  return app
}
```

（4）最后，在客户端渲染入口中把服务端传递过来的状态数据填充到客户端 Vuex 容器中：

`entry-client.js`
```js
/**
 * 客户端入口
 */
import { createApp } from './app'

// 客户端特定引导逻辑……

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

...
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210226162130121.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

[项目源码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-04/code/vue-ssr)