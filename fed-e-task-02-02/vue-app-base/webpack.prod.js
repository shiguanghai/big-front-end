// webpack.prod.js 生产环境配置

const common = require('./webpack.common') // 导入公共配置
const merge = require('webpack-merge') // 使用merge方法合并配置
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 打包之前清除 dist 目录
const CopyWebpackPlugin = require('copy-webpack-plugin') // 拷贝静态文件至输出目录

module.exports = merge(common, {
  mode: 'none',
  output: {
    filename: 'js/bundle-[contenthash:8].js' // 文件级别的 不同的文件就有不同的hash值 指定8位
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(['public']) // 通配符或'目录'
  ]
})