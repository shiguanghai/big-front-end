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
