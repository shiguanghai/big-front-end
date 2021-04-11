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