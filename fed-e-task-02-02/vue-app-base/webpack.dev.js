// webpack.dev.js 开发环境配置

const webpack = require('webpack')
const merge = require('webpack-merge') // 使用merge方法合并配置
const common = require('./webpack.common') // 导入公共配置

module.exports = merge(common, {
  mode: 'development', // 开发依赖
  devtool: 'cheap-eval-module-source-map',
  devServer: {
    host: 'localhost',
    port: '2020',
    open: true, // 启动服务时，自动打开浏览器
    hot: true, // 开启热更新功能
    contentBase: 'public'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})