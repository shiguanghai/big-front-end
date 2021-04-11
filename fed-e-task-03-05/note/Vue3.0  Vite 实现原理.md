# Vue3.0  Vite 实现原理

## 18.1 Vite 使用

### Vite 概念

- Vite 是一个面向现代浏览器的一个更轻、更快的 Web 应用开发工具
- 它基于 ECMAScript 标准原生模块系统（ES Modules）实现

Vite 的出现是为了解决 Webpack 在开发阶段使用 webpack-dev-server 冷启动时间过长。另外 webpack-hmr 热更新反应速度慢的问题

使用 Vite 创建的项目就是一个普通的 Vue3 的应用，没有太多特殊的地方。相比基于 Vue Cli 创建的项目也少了很多的配置文件和依赖

### Vite 项目依赖

- Vite
  - 接下来会模拟实现的命令行工具
- @vue/compiler-sfc
  - 编译项目中的`.vue`结尾的单文件组件
  - Vue2 使用的是 vue-template/compiler

> Vite 目前只支持 Vue3.0 版本。创建项目时通过指定使用不同的模板也可以支持其他框架

### Vite 基础使用

**Vite 项目下提供了两个子命令：**

- `vite serve`

  - 开启一个用于开发的 Web 服务器，启动服务器时不需要编译所有的代码文件，启动速度非常快
  - vite serve：当浏览器请求服务器，此时在服务器端编译单文件组件，把编译的结果返回给浏览器。模块的处理是在请求到服务器端进行的

  ![image-20210410194341664](https://public.shiguanghai.top/blog_img/image-20210410194341664.png)

  - vue-cli-service serve：内部会使用 webpack 去打包所有的模块（如果模块比较多打包速度会很慢），把打包结果存储在内存，在开启用于开发的 Web 服务器。浏览器请求服务器，把内存中打包的结果直接返回给浏览器

  ![image-20210410194827547](https://public.shiguanghai.top/blog_img/image-20210410194827547.png)

- `vite build`

  - Rollup：Rollup 打包，最终还是会把文件都提前编译并打包到一起
  - Dynamic import：对于代码切割的需求，Vite 内部采用原生的 动态导入 的特性实现，打包结果只能够支持现代浏览器
    - Polyfil

**HMR：**

- Vite HMR
  - 立即编译当前所修改的文件
- Webpack HMR
  - 会自动以这个文件为入口重新 build 一次，所有涉及到的依赖也都会被加载一遍

**打包 or 不打包：**

- 使用 Webpack 打包的两个原因

  - 浏览器环境并不支持模块化

    - 随着现代浏览器对 ES 标准支持的逐渐完善，这个问题已经慢慢不存在了，现阶段绝大多数浏览器都是支持 ES Module 特性的
    - 浏览器对 ES Module 的支持

    ![image-20210410200225235](https://public.shiguanghai.top/blog_img/image-20210410200225235.png)

  - 零散的模块文件会产生大量的 HTTP 请求

    - HTTP2 已经帮我们解决，它可以复用链接

**开箱即用：**

- TypeScript - 内置支持
- less/sass/stylus/postcss - 内置支持（需要单独安装）
- JSX
- Web Assembly

### Vite 特性

- 快速冷启动
  - Web 开发服务器不需要等待，可以立即启动
- 模块热更新
  - 模块热更新几乎是实时的
- 按需编译
  - 所需文件按需编译，编译用不到的文件
- 开箱即用
  - 避免各种 Loader 以及 Plugin 的配置

## 18.2 静态 Web 服务器

**Vite 核心功能：**

- 静态 web 服务器
- 编译单文件组件
  - 拦截浏览器不识别的模块，并处理
- HMR（通过 WebSocket 实现 HMR，跳过）

当启动 Vite 的时候，首先会将当前项目目录作为静态文件服务器的根目录，静态文件服务器会拦截部分请求。例如当请求单文件组件的时候会实时编译，以及处理其它浏览器不能识别的模块

**首先我们使用 Koa 来实现一个能够开启静态 Web 服务器的命令行工具：**

```json
{
  "name": "vite-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "bin": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@vue/compiler-sfc": "^3.0.0-rc.10",
    "koa": "^2.13.0",
    "koa-send": "^5.0.1"
  }
}
```

安装依赖：

```shell
npm i
```

```js
#!/usr/bin/env node
const Koa = require('koa')
const send = require('koa-send')

const app = new Koa()

// 1. 开启静态文件服务器

// 中间件 负责处理静态文件 默认加载当前目录（运行该命令行工具目录）下的 index.html
app.use(async (ctx, next) => {
  // 三个参数：上下文 当前请求的路径 {根目录 默认的页面}
  await send(ctx, ctx.path, { root: process.cwd(), index: 'index.html' })
  await next()
})

// 监听端口
app.listen(3000)
console.log('Server runing @ http://localhost:3000')
```

测试：

```shell
# 把当前项目链接到 npm 安装目录
npm link

# 进入到一个 Vue3 开发的项目根目录 此处用 vite 初始化一个项目
cd ..
npm init vite-app 02-vite-demo
cd 02-vite-demo
npm install
vite-cli
```

![image-20210410204215975](https://public.shiguanghai.top/blog_img/image-20210410204215975.png)

![image-20210410204123516](https://public.shiguanghai.top/blog_img/image-20210410204123516.png)

我们打开项目可以看到错误：解析 vue 模块的时候失败，使用 import 导入模块时要求使用相对路径

![image-20210410204427960](https://public.shiguanghai.top/blog_img/image-20210410204427960.png)

我们可以看到 `main.js` 中导入了 vue，后面的路径没有`/ ./ ../`，浏览器不识别，我们希望它去 node_modules 文件夹加载 vue，这是打包工具的默认行为，但是浏览器不支持

我们来看一下 Vite 是如何处理的：

![image-20210410205208849](https://public.shiguanghai.top/blog_img/image-20210410205208849.png)

当浏览器从 Vite 开启的 Web 服务器加载 `main.js` 的时候首先会去处理加载第三方模块的路径，所以在服务器端要手动处理路径问题

并且其请求头中有`Content-Type:application/javascript`，它的作用是告诉浏览器：‘我们返还给你的文件是一个JavaScript文件’。我们可以在 Web 服务器输出之前先判断当前返回的文件是否是 js 文件，如果是，再来处理里面的第三方模块的路径，然后再去请求`/@modules/vue.js`，再来处理这个不存在的路径

## 18.3 修改第三方模块的路径

```js
#!/usr/bin/env node
...

// 流 -> 字符串，读取流是一个异步过程 返回一个 Promise 对象
const streamToString = stream => new Promise((resolve, reject) => {
  // 定义一个chunks数组 存储读取到的 Buffer
  // Buffer: Node.js提供的一个二进制缓冲区，常用来处理I/O操作
  const chunks = []
  // 注册 stream 的 data 事件监听读取到的 Buffer 存储到 chunks 数组
  stream.on('data', chunk => chunks.push(chunk))
  // 把数组中的 Buffer 合并 转换为字符串 传递获取到的结果给 resolve
  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  // 出错的事件 调用 reject
  stream.on('error', reject)
})

// 1. 开启静态文件服务器
...

// 2. 修改第三方模块的路径
// 中间件 判断当前返回的文件是否是js模块 把加载第三方模块的 import 中的路径改成加载 /@modules/<模块名称>
app.use(async (ctx, next) => {
  // 判断当前返回的文件是否是 javascript 判断 Content-Type
  if(ctx.type === 'application/javascript') {
    // 找到文件中的内容 处理 import 中的路径
    // ctx.body 就是要返回给浏览器的js文件 这个属性是一个流 此处要对字符串进行处理（流->字符串）
    const contents = await streamToString(ctx.body)
    // 把 contents 中加载第三方模块的路径修改 把结果重新赋值给 body 输出
    // 通过正则表达式把第三方模块匹配出来 替换为 /@modules/<模块名称>
    // 处理： import vue from 'vue'
    // 不处理： import App from './App.vue'
    // 匹配 <from '> 替换成 <from '/@modules/>; 即 <from '> 替换成 <from '/@modules/>
    // <//g> 全局匹配; <()> 分组; <\s> 空白; <['"]> 可以是单双引号; <(?!)> 不匹配这个分组的结果;
    // <\.\/> 转义./; <(?![\.\/])> 排除.或/; <$1> 第一个分组的结果
    ctx.body = contents.replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/')
  }
})

// 监听端口
...
```

测试：

![image-20210410230936276](https://public.shiguanghai.top/blog_img/image-20210410230936276.png)

此处 vue 的路径已经被我们修改了，这个路径是不存在的，我们来看一下下一个请求

![image-20210410231048667](https://public.shiguanghai.top/blog_img/image-20210410231048667.png)

这时返回的是404，获取不到文件。所以在静态 Web 服务器中，当请求过来之后它要首先去判断当前请求的路径中是否以`/@modules/`开头，如果是的话就去 node_modules 找对应的模块

## 18.4 加载第三方模块

```js
#!/usr/bin/env node
const path = require('path')
...

// 流 -> 字符串，读取流是一个异步过程 返回一个 Promise 对象
...

// 3. 加载第三方模块
// 中间件 当请求过来之后判断请求路径中是否有 /@modules/<模块名称> 有的话去 node_modules 目录加载对应模块
app.use(async (ctx, next) => {
  // 获取当前的路径 ctx.path --> /@modules/vue
  if(ctx.path.startsWith('/@modules/')) {
    // 截取模块名称
    const moduleName = ctx.path.substr(10)
    // 获取ES Modules模块的入口文件 -> package.json -> module字段的值
    // 获取 package.json 文件的绝对路径 --> ~/node_modules/vue/package.json
    const pkgPath = path.join(process.cwd(), 'node_modules', moduleName, 'package.json')
    // 获取 package.json 内容
    const pkg = require(pkgPath)
    // pkg.module --> dist/vue.runtime.esm-bundler.js
    // 转换成请求 /node_modules/<模块名称>/module字段 --> /node_modules/vue/dist/vue.runtime.esm-bundler.js
    ctx.path = path.join('/node_modules', moduleName, pkg.module)
  }
  await next()
})

// 1. 开启静态文件服务器
...

// 2. 修改第三方模块的路径
...

// 监听端口
...
```

测试：

![image-20210411144059268](https://public.shiguanghai.top/blog_img/image-20210411144059268.png)

vue 这次请求的是`/@modules/vue`。但是已经从服务器拿到结果了，即`/node_modules/vue/dist/vue.runtime.esm-bundler.js`，说明已经加载了 vue 模块

![image-20210411144145493](https://public.shiguanghai.top/blog_img/image-20210411144145493.png)

但是我们加载的是 bundler 的 vue 版本，即需要打包的 vue。这个 vue 里面要去加载 runtime-dom 模块，但是并没有请求这个模块

![image-20210411150137458](https://public.shiguanghai.top/blog_img/image-20210411150137458.png)

这个错误告诉我们加载`App.vue`组件失败，也就是当去加载这个组件的时候浏览器不能识别这个模块。所以我们在服务器还要去处理浏览器不能识别的模块，即单文件组件模块。

> 注意：此处注释掉了项目`main.js`中加载样式文件的代码`import './index.css'`以及`App.vue`中加载图片文件的代码`<img alt="vue logl" src="./assets/logo.png">`，浏览器同样无法处理它们
>
> 这里我们只去处理单文件组件，为避免它们阻塞后续的调试，将其注释

![image-20210411151910408](https://public.shiguanghai.top/blog_img/image-20210411151910408.png)

## 18.5 编译单文件组件

浏览器无法处理 `main.js`中使用`import`加载的单文件组件模块和样式模块，浏览器只能处理 JS 模块，我们通过`import`加载的其他模块都需要在服务器端处理。当请求单文件组件的时候是要在服务器上把单文件组件编译成 JS 模块再返回给浏览器

我们来看一下 Vite 是如何处理的：

![image-20210411152610209](https://public.shiguanghai.top/blog_img/image-20210411152610209.png)

当第一次请求`App.vue`文件的时候，服务器会把单文件组件编译成一个对象。此处先加载`HelloWorld`这个组件，然后创建了一个**组件选项对象**`__script`（此处没有模板，模板最终要被编译为 render 函数，挂载到选项对象上）

![image-20210411152909586](https://public.shiguanghai.top/blog_img/image-20210411152909586.png)

接下来又去加载了`App.vue`，并且在后面加上了一个参数`type=template`，这次请求是告诉服务器：‘你去帮我编译一下这个单文件组件的模板，返回一个 render 函数’（此处加载 render 函数）。浏览器应该再去发送一次请求来请求这个模块，可以看到此处通过`export`把 render 函数导出

![image-20210411154008270](https://public.shiguanghai.top/blog_img/image-20210411154008270.png)

回过头来，把 render 函数挂载到刚刚创建的**组件选项对象**`__script`上来，下边还设置了两个属性（不再模拟），最后导出**组件选项对象**`__script`

```js
import { render as __render } from "/src/App.vue?type=template"
__script.render = __render
export default __script
```

这里我们可以看到：当请求单文件组件时，服务器会来编译单文件组件并把相应结果返回给浏览器，复制此段代码后续使用

> 这是 Vite 中处理单文件组件的方法：它会发送两次请求，第一次请求是把单文件组件编译成一个对象，第二次请求是编译单文件组件的模板，返回一个 render 函数并挂载到刚刚创建对象的 render 方法上

### 第一次请求

```shell
# Vue3 提供了编译单文件组件的模块 compilerSFC
# package.json 已提供，不用重复安装
npm i @vue/compiler-sfc
```

```js
#!/usr/bin/env node
...
const { Readable } = require('stream')
const compilerSFC = require('@vue/compiler-sfc')

// 流 -> 字符串，读取流是一个异步过程 返回一个 Promise 对象
...

// 字符串 -> 流
const stringToStream = text => {
  const stream = new Readable()
  stream.push(text)
  stream.push(null)
  return stream
}

// 3. 加载第三方模块
...

// 1. 开启静态文件服务器
...

// 4. 处理单文件组件
// 中间件 第一次请求单文件组件：把单文件组件编译成一个组件选项对象__script
app.use(async (ctx, next) => {
  // 判断请求的是否为单文件组件 --> .vue 结尾
  if (ctx.path.endsWith('.vue')) {
    // 把 ctx.body 流转换为字符串
    const contents = await streamToString(ctx.body)
    // 调用 compilerSFC 的 parse 方法 编译单文件组件
    // 返回两个成员 descriptor单文件组件描述对象 errors编译过程中收集的错误
    const { descriptor } = compilerSFC.parse(contents)
    // 最终要返回给浏览器的代码 code
    let code
    // 第一次请求 返回选项对象 不带 type
    if(!ctx.query.type) {
      // 单文件组件编译后的js代码
      code = descriptor.script.content
      // console.log(code)
      // 把 code 的内容替换为 我们想要的 <export default > --> <const __script = >
      code = code.replace(/export\s+default\s+/g, 'const __script = ')
      code += `
      import { render as __render } from "${ctx.path}?type=template"
      __script.render = __render
      export default __script
      `
    }
    // 设置响应头中的 Content-Type 为 application/javascript
    ctx.type = 'application/javascript'
    // 把 code 转换为只读流 输出给浏览器
    ctx.body = stringToStream(code)
  }
  await next()
})

// 2. 修改第三方模块的路径
...

// 监听端口
...
```

测试：

![image-20210411175012096](https://public.shiguanghai.top/blog_img/image-20210411175012096.png)

我们看到第一次请求已经成功了，接下来我们来处理的二次请求

![image-20210411175106005](https://public.shiguanghai.top/blog_img/image-20210411175106005.png)

### 第二次请求

我们已经把单文件组件的第一次请求处理完毕，第一次请求会把单文件组件编译成组件选项对象返回给浏览器，但是这个选项对象中没有模板或者 render 函数。接下来来请求单文件组件的第二次请求

```js
// 4. 处理单文件组件
// 中间件 第一次请求单文件组件：...
// 第二次请求单文件组件：把单文件组件的模板编译成 render 函数
app.use(async (ctx, next) => {
  // 判断请求的是否为单文件组件 --> .vue 结尾
  if (ctx.path.endsWith('.vue')) {
    ...
    // 第一次请求 返回选项对象 不带 type
    if(!ctx.query.type) {
      ...
    } else if (ctx.query.type === 'template') {
      // 调用 compilerSFC 的 compileTemplate 方法 编译模板
      // 接收一个对象形式的参数 设置要编译的模板的内容；source：要编译的源
      const templateRender = compilerSFC.compileTemplate({ source: descriptor.template.content })
      // templateRender 的 code 属性就是 render
      code = templateRender.code
    }
    ...
  }
  await next()
})
```

测试：

![image-20210411181216475](https://public.shiguanghai.top/blog_img/image-20210411181216475.png)

此时，服务器返回了编译之后的 render 函数，但是页面并没有任何内容

![image-20210411181334183](https://public.shiguanghai.top/blog_img/image-20210411181334183.png)

告诉我们访问不到 process，我们当前的代码是在浏览器环境下执行的，而 process 是 Node 环境下的对象，现在浏览器环境没有 process 对象，所以报错

![image-20210411181547810](https://public.shiguanghai.top/blog_img/image-20210411181547810.png)

源码中这句话的作用是让打包工具根据环境变量分别进行生产环境或者开发环境的打包操作，但是此时我们没有使用打包工具，没有处理这句话直接返回给了浏览器所以报错。我们可以在服务器去处理，将其替换为 development 开发环境下

```js
// 2. 修改第三方模块的路径
// 中间件 判断当前返回的文件是否是js模块 把加载第三方模块的 import 中的路径改成加载 /@modules/<模块名称>
app.use(async (ctx, next) => {
  // 判断当前返回的文件是否是 javascript 判断 Content-Type
  if(ctx.type === 'application/javascript') {
    ...
    ctx.body = contents
    	...
      .replace(/process\.env\.NODE_ENV/g, '"development"')
  }
})
```

测试：

![image-20210411182136189](https://public.shiguanghai.top/blog_img/image-20210411182136189.png)

完整项目代码：

```js
#!/usr/bin/env node
const path = require('path')
const { Readable } = require('stream')
const Koa = require('koa')
const send = require('koa-send')
const compilerSFC = require('@vue/compiler-sfc')

const app = new Koa()

// 流 -> 字符串，读取流是一个异步过程 返回一个 Promise 对象
const streamToString = stream => new Promise((resolve, reject) => {
  // 定义一个chunks数组 存储读取到的 Buffer
  // Buffer: Node.js提供的一个二进制缓冲区，常用来处理I/O操作
  const chunks = []
  // 注册 stream 的 data 事件监听读取到的 Buffer 存储到 chunks 数组
  stream.on('data', chunk => chunks.push(chunk))
  // 把数组中的 Buffer 合并 转换为字符串 传递获取到的结果给 resolve
  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  // 出错的事件 调用 reject
  stream.on('error', reject)
})

// 字符串 -> 流
const stringToStream = text => {
  const stream = new Readable()
  stream.push(text)
  stream.push(null)
  return stream
}

// 3. 加载第三方模块
// 中间件 当请求过来之后判断请求路径中是否有 /@modules/<模块名称> 有的话去 node_modules 目录加载对应模块
app.use(async (ctx, next) => {
  // 获取当前的路径 ctx.path --> /@modules/vue
  if(ctx.path.startsWith('/@modules/')) {
    // 截取模块名称
    const moduleName = ctx.path.substr(10)
    // 获取ES Modules模块的入口文件 -> package.json -> module字段的值
    // 获取 package.json 文件的绝对路径 --> ~/node_modules/vue/package.json
    const pkgPath = path.join(process.cwd(), 'node_modules', moduleName, 'package.json')
    // 获取 package.json 内容
    const pkg = require(pkgPath)
    // pkg.module --> dist/vue.runtime.esm-bundler.js
    // 转换成请求 /node_modules/<模块名称>/module字段 --> /node_modules/vue/dist/vue.runtime.esm-bundler.js
    ctx.path = path.join('/node_modules', moduleName, pkg.module)
  }
  await next()
})

// 1. 开启静态文件服务器
// 中间件 负责处理静态文件 默认加载当前目录（运行该命令行工具目录）下的 index.html
app.use(async (ctx, next) => {
  // 三个参数：上下文 当前请求的路径 {根目录 默认的页面}
  await send(ctx, ctx.path, { root: process.cwd(), index: 'index.html' })
  await next()
})

// 4. 处理单文件组件
// 中间件 第一次请求单文件组件：把单文件组件编译成一个组件选项对象__script
// 第二次请求单文件组件：把单文件组件的模板编译成 render 函数
app.use(async (ctx, next) => {
  // 判断请求的是否为单文件组件 --> .vue 结尾
  if (ctx.path.endsWith('.vue')) {
    // 把 ctx.body 流转换为字符串
    const contents = await streamToString(ctx.body)
    // 调用 compilerSFC 的 parse 方法 编译单文件组件
    // 返回两个成员 descriptor单文件组件描述对象 errors编译过程中收集的错误
    const { descriptor } = compilerSFC.parse(contents)
    // 最终要返回给浏览器的代码 code
    let code
    // 第一次请求 返回选项对象 不带 type
    if(!ctx.query.type) {
      // 单文件组件编译后的js代码
      code = descriptor.script.content
      // console.log(code)
      // 把 code 的内容替换为 我们想要的 <export default > --> <const __script = >
      code = code.replace(/export\s+default\s+/g, 'const __script = ')
      code += `
      import { render as __render } from "${ctx.path}?type=template"
      __script.render = __render
      export default __script
      `
    } else if (ctx.query.type === 'template') {
      // 调用 compilerSFC 的 compileTemplate 方法 编译模板
      // 接收一个对象形式的参数 设置要编译的模板的内容；source：要编译的源
      const templateRender = compilerSFC.compileTemplate({ source: descriptor.template.content })
      // templateRender 的 code 属性就是 render
      code = templateRender.code
    }
    // 设置响应头中的 Content-Type 为 application/javascript
    ctx.type = 'application/javascript'
    // 把 code 转换为只读流 输出给浏览器
    ctx.body = stringToStream(code)
  }
  await next()
})

// 2. 修改第三方模块的路径
// 中间件 判断当前返回的文件是否是js模块 把加载第三方模块的 import 中的路径改成加载 /@modules/<模块名称>
app.use(async (ctx, next) => {
  // 判断当前返回的文件是否是 javascript 判断 Content-Type
  if(ctx.type === 'application/javascript') {
    // 找到文件中的内容 处理 import 中的路径
    // ctx.body 就是要返回给浏览器的js文件 这个属性是一个流 此处要对字符串进行处理（流->字符串）
    const contents = await streamToString(ctx.body)
    // 把 contents 中加载第三方模块的路径修改 把结果重新赋值给 body 输出
    // 通过正则表达式把第三方模块匹配出来 替换为 /@modules/<模块名称>
    // 处理： import vue from 'vue'
    // 不处理： import App from './App.vue'
    // 匹配 <from '> 替换成 <from '/@modules/>; 即 <from '> 替换成 <from '/@modules/>
    // <//g> 全局匹配; <()> 分组; <\s> 空白; <['"]> 可以是单双引号; <(?!)> 不匹配这个分组的结果;
    // <\.\/> 转义./; <(?![\.\/])> 排除.或/; <$1> 第一个分组的结果
    ctx.body = contents
      .replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/')
      .replace(/process\.env\.NODE_ENV/g, '"development"')
  }
})

// 监听端口
app.listen(3000)
console.log('Server runing @ http://localhost:3000')
```

