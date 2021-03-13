#!/usr/bin/env node

const path = require('path')
const { Readable, crea } = require('stream')
const Koa = require('koa')
const send = require('koa-send')
const compiler = require('@vue/compiler-sfc')

// 获取当前执行 node 的目录
const cwd = process.cwd()

const app = new Koa()

const streamToString = stream => new Promise((resolve, reject) => {
  const chunks = []
  stream.on('data', chunk => chunks.push(chunk))
  stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  stream.on('error', reject)
})

const stringToStream = text => {
  const stream = new Readable()
  stream.push(text)
  // 设置null，代表这个流结束
  stream.push(null)
  return stream
}

// 3. 重写请求路径，/@modules/xxx => /node_modules/
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/@modules/')) {
    const moduleName = ctx.path.substr(10) // => vue
    // 加载包中的 package.json 文件
    const modulePkg = require(path.join(cwd, 'node_modules', moduleName, 'package.json'))
    // 加载 package.json 中指定的 module 模块路径
    ctx.path = path.join('/node_modules', moduleName, modulePkg.module)
  }
  await next()
})

// 1. 实现静态服务器
app.use(async (ctx, next) => {
  await send(ctx, ctx.path, { root: cwd, index: 'index.html' })
  await next()
})

// 4. .vue 文件请求的处理，即时编译
app.use(async (ctx, next) => {
  if (ctx.path.endsWith('.vue')) {
    const contents = await streamToString(ctx.body)
    const { descriptor } = compiler.parse(contents)
    let code

    if (ctx.query.type === undefined) {
      code = descriptor.script.content
      code = code.replace(/export\s+default\s+/, 'const __script = ')
      code += `
import { render as __render } from "${ctx.path}?type=template"
__script.render = __render
console.log('haha')
export default __script
      `
    } else if (ctx.query.type === 'template') {
      const templateRender = compiler.compileTemplate({ source: descriptor.template.content })
      code = templateRender.code
    }
    ctx.type = 'application/javascript'
    ctx.body = stringToStream(code)
  }
  await next()
})

// 2. 在把内容返回给浏览器之前，替换代码中特殊位置
app.use(async (ctx, next) => {
  if (ctx.type === 'application/javascript') {
    const contents = await streamToString(ctx.body)
    ctx.body = contents
      // 非获取匹配，正向否定预查，在任何不匹配pattern的字符串开始处匹配查找字符串，该匹配不需要获取供以后使用。例如“Windows(?!95|98|NT|2000)”能匹配“Windows3.1”中的“Windows”，但不能匹配“Windows2000”中的“Windows”。
      // import vue from 'vue' ---> import vue from '/@modules/vue'
      // import db from '../db/index' ---> import db from '../db/index'
      .replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/')
      .replace(/process\.env\.NODE_ENV/g, '"development"')
  }
})

app.listen(3080)

console.log('Server running @ http://localhost:3080')

// 读取流中的字符串
// const streamToString = stream => new Promise((resolve, reject) => {
//   const chunks = []
//   stream.on('data', chunk => chunk.push(chunk))
// })
