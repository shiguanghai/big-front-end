const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')

const resolve = file => path.resolve(__dirname, file)

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
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)

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