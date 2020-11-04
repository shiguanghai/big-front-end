// webpack.common.js 公共环境配置

// const path = require('path')
const webpack = require('webpack')
// 默认导出一个插件的类型，不需要解构内部成员
const VueLoaderPlugin = require('vue-loader/lib/plugin') // 配合 vue-loader 使用，用于编译转换 .vue 文件
const HtmlWebpackPlugin = require('html-webpack-plugin') // 用于生成 index.html 文件

module.exports = {
  entry: './src/main.js', // 输入
  output: {
    filename: 'bundle.js', // 输出
    // path: path.join(__dirname, 'output') // 输出目录(绝对路径 通过path转换)
  },
  module: {
    rules: [
      {
        test: /\.vue$/, // 匹配打包过程遇到的文件路径
        use: [ // 指定匹配到的文件使用到loader
          // 当我们配置多个loader 执行顺序从下至上
          'vue-loader' // 将Vue组件编译成普通的JavaScript模块
        ]
      },
      {
        test: /.js$/, // 它会应用到普通的 `.js` 文件以及 `.vue` 文件中的 `<script>` 块
        use: {
          loader: 'babel-loader',
          // babel 只是转换JS代码的平台
          //需要基于不同插件转换代码中的具体特性
          options: {
            // 使用preset-env插件集合
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/, // 它会应用到普通的 `.css` 文件以及 `.vue` 文件中的 `<style>` 块
        use: [
          'vue-style-loader', 
          'css-loader'
        ]
      },
      {
        test: /\.less$/, // 配置 less-loader ，应用到 .less 文件，转换成 css 代码
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'less-loader' // compiles Less to CSS
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: {
          // loader: 'file-loader',
          loader: 'url-loader',
          options: {
            // 小于10kb的文件转化为Data URLs 嵌入代码中
    		    // 超出10kb的文件单独提取存放
            limit: 10 * 1024, // 10 KB
            name: 'img/[name].[ext]'
          }
        }
      },
      {
        test: /\.(js|vue)$/, // 配置 eslint-loader 检查代码规范，应用到 .js 和 .vue 文件
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter') // 默认的错误提示方式
          }
        },
        enforce: 'pre', // 编译前检查
        exclude: /node_modules/, // 不检查的文件
        include: [__dirname + '/src'], // 要检查的目录
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // 值要求的是一个代码片段
      BASE_URL: JSON.stringify('')
    }),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: 'sgh vue project', // 设置html标题
      // meta: { // 设置对象中的元数据标签
      //   viewport: 'width=device-width'
      // },
      template: './public/index.html' // 使用的模板地址
    })
  ]
}