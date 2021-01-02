

## 【简答题】一、Webpack 的构建流程主要有哪些环节？如果可以请尽可能详尽的描述 Webpack 打包的整个过程。

六个核心概念：

- **Entry**：*入口*，这是Webpack执行构建的第一步，可理解为输入。
- **Module**：*模块*，在Webpack中一切皆模块，一个模块即为一个文件。Webpack会从Entry开始递归找出所有的依赖模块。
- **Chunk**：*代码块*，一个Chunk由多个模块组合而成，它用于代码合并与分割。
- **Loader**：*模块转换器*，用于将模块的原内容按照需求转换成新内容。
- **Plugin**：*扩展插件*，在Webpack构建过程的特定时机注入扩展逻辑，用来改变或优化构建结果。
- **Output**：*输出结果*，源码在Webpack中经过一系列处理后而得出的最终结果。

**Webpack构建流程：**

1. Webpack 在启动后，会从 Entry 开始，递归解析 Entry 依赖的所有 Module，每找到一个 Module，就会根据 Module.rules 里配置的 Loader 规则进行相应的转换处理；
2. 对 Module 进行转换后，再解析出当前 Module 依赖的 Module ，得到了每个 Module 被转换/翻译后的最终内容以及它们之间的依赖关系；
3. 这些 Module 会以 Entry 为单位进行分组，即为一个 Chunk。（因此一个 Chunk，就是一个 Entry 及其所有依赖的 Module 合并的结果）再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
4. 在确定好输出内容后，根据配置确定输出的路径和文件名，将所有的 Chunk 转换成文件输出 Output。

**在整个构建流程中，Webpack 会在恰当的时机执行 Plugin 里定义的逻辑，从而完成 Plugin 插件的优化任务。**

>详细构建流程见：[webpack的构建流程是什么？从读取配置到输出文件这个过程尽量说全](https://shiguanghai.top/blogs/%E9%9D%A2%E8%AF%95%E9%A2%98/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96/webpack%E7%9A%84%E6%9E%84%E5%BB%BA%E6%B5%81%E7%A8%8B%E6%98%AF%E4%BB%80%E4%B9%88.html)

**Webpack打包过程：**

webpack 的打包思想可以简化为 3 点：

1. 一切源代码文件均可通过各种 Loader 转换为 JS 模块 （`module`），模块之间可以互相引用。
2. webpack 通过入口点（`entry point`）递归处理各模块引用关系，最后输出为一个或多个产物包 js(`bundle`) 文件。
3. 每一个入口点都是一个块组（`chunk group`），在不考虑分包的情况下，一个 chunk group 中只有一个 chunk，该 chunk 包含递归分析后的所有模块。每一个 chunk 都有对应的一个打包后的输出文件（`asset/bundle`）。

>详细打包运行过程见：[Webpack 打包结果运行原理](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96%E5%AE%9E%E6%88%98/Webpack%20%E6%89%93%E5%8C%85.html#webpack-%E6%89%93%E5%8C%85%E7%BB%93%E6%9E%9C%E8%BF%90%E8%A1%8C%E5%8E%9F%E7%90%86)

## 【简答题】二、Loader 和 Plugin 有哪些不同？请描述一下开发 Loader 和 Plugin 的思路。
**Loader 和 Plugin 的不同点：**

- Loader 专注实现资源模块的转换和加载（编译转换代码、文件操作、代码检查）
- Plugin 解决其他自动化工作（打包之前清除 dist 目录、拷贝静态文件、压缩代码等等）

>详细区别见： [说一下在webpack中的loader和plugin的不同](https://shiguanghai.top/blogs/%E9%9D%A2%E8%AF%95%E9%A2%98/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96/webpack%E4%B8%AD%E7%9A%84loader%E5%92%8Cplugin%E7%9A%84%E4%B8%8D%E5%90%8C.html)

**开发 Loader 的思路：**

- 可以直接在项目根目录新建 `test-loader.js` （完成后也可以发布到 npm 作为独立模块使用）
- 这个文件需要导出一个函数，这个函数就是我们的 loader 对所加载到的资源的处理过程
- 函数输入为 *加载到的资源*，输出为 *加工后的结果*
- 输出结果可以有两种形式：第一，输出标准的 JS 代码，让打包结果的代码能正常执行；第二，输出处理结果，交给下一个 loader 进一步处理成 JS 代码
- 在 `webpack.config.js` 中使用 loader，配置 `module.rules` ，其中 use 除了可以使用模块名称，也可以使用模块路径

**开发 Plugin 的思路：**

- Plugin 通过钩子机制实现(类似于事件)，为了便于插件的扩展，Webpack 几乎给每一个环节都埋下了一个钩子，我们在去开发插件时就可以通过往这些不同的节点上挂载不同的任务。
- Webpack 要求每一个插件必须是一个函数或者是一个包含 apply 方法的对象。一般我们都会把这个插件定义为一个类型，然后在这个类型中定义一个 apply 方法。使用就是通过这个类型构建一个实例去使用。
- apply 方法接收一个 compiler 参数，包含了这次构建的所有配置信息，通过这个对象注册钩子函数
- 通过 `compiler.hooks.emit.tap` 注册钩子函数（emit也可以为其他事件），钩子函数第一个参数为**插件名称**，第二个参数 **compilation** 为此次打包的上下文，根据 `compilation.assets` 就可以拿到此次打包的资源，做一些相应的逻辑处理

## 【编程题】一、使用 Webpack 实现 Vue 项目打包任务
- 先下载任务的基础代码  [百度网盘链接](https://pan.baidu.com/s/1pJl4k5KgyhD2xo8FZIms8Q) 提取码: `zrdd`
- 这是一个使用 Vue CLI 创建出来的 Vue 项目基础结构
- 有所不同的是这里我移除掉了 vue-cli-service（包含 webpack 等工具的黑盒工具）
- 这里的要求就是直接使用 webpack 以及你所了解的周边工具、Loader、Plugin 还原这个项目的打包任务
- 尽可能的使用上所有你了解到的功能和特性

[作业项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/vue-app-base)

**项目依赖：**
```
  "@babel/core": "^7.6.3",
  "@babel/preset-env": "^7.6.3",
  "@vue/eslint-config-standard": "^5.1.2",
  "babel-eslint": "^10.1.0",
  "babel-loader": "^8.0.6",
  "clean-webpack-plugin": "^3.0.0",
  "copy-webpack-plugin": "^5.0.4",
  "css-loader": "^3.2.0",
  "eslint": "^6.7.2",
  "eslint-friendly-formatter": "^4.0.1",
  "eslint-loader": "^4.0.2",
  "eslint-plugin-import": "^2.20.2",
  "eslint-plugin-promise": "^4.2.1",
  "eslint-plugin-standard": "^4.0.0",
  "eslint-plugin-vue": "^6.2.2",
  "file-loader": "^4.2.0",
  "html-webpack-plugin": "^3.2.0",
  "less": "^3.0.4",
  "less-loader": "^5.0.0",
  "style-loader": "^1.0.0",
  "url-loader": "^2.2.0",
  "vue-loader": "15.2.1",
  "vue-style-loader": "^4.1.0",
  "vue-template-compiler": "^2.6.11",
  "webpack": "^4.41.2",
  "webpack-cli": "^3.3.9",
  "webpack-dev-server": "^3.9.0",
  "webpack-merge": "^4.2.2"
```
**全局依赖：**

1. 安装项目依赖`yarn`
2. 引入 Webpack@4.40.2, webpack-cli@3.3.9`yarn add webpack@4.40.2 webpack-cli@3.3.9 --dev`

**common.js - module：**

1. 将Vue组件编译成普通的JavaScript模块,'vue-template-compiler'被vue-loader所引用,注意版本要与vue相同`yarn add vue-template-compiler@2.6.11 vue-loader@15.2.1 --dev`
2. 需要Webpack在打包过程中同时处理其他ES6特性的转换`yarn add babel-loader@8.0.6 @babel/core@7.6.3 @babel/preset-env@7.6.3 --dev`
3. 引入资源模块加载处理CSS文件
`yarn add css-loader@3.2.0 vue-style-loader@4.1.0 --dev`
4. 处理 .less 文件的资源模块加载`yarn add less@3.0.4 less-loader@5.0.0 style-loader@1.0.0 --dev`
5. 处理 图片资源模块`yarn add file-loader@4.2.0 url-loader@2.2.0 --dev`
6. ESLint 结合 Webpack`yarn add eslint@6.7.2 eslint-loader@4.0.2 eslint-friendly-formatter@4.0.1 --dev` 创建 .eslintrc 文件并配置

**common.js - plugins：**

1. 通过 Webpack 输出 HTML 文件`yarn add html-webpack-plugin@3.2.0 --dev`

- dev.js:

1. 希望在公共配置原有基础上添加插件而不是覆盖`yarn add webpack-merge@4.2.2 --dev`
2. 提供一个开发服务器`yarn add webpack-dev-server@3.9.0 --dev` 在package.json 为 serve 定义 'webpack-dev-server --config webpack.dev.js'

- prod.js:

1. 打包之前自动清除目录`yarn add clean-webpack-plugin@3.0.0 --dev`
2. 拷贝静态文件至输出目录`yarn add copy-webpack-plugin@5.0.4 --dev`
3. 在package.json 为 build 定义'webpack --config webpack.prod.js'

**.eslintrc.js:**

1. 配置第三方插件`yarn add eslint-plugin-vue@6.2.2 --dev`
2. eslint-config-standard依赖：eslint-plugin-import eslint-plugin-standard eslint-plugin-promise `yarn add eslint-plugin-import@2.20.2 eslint-plugin-promise@4.2.1 eslint-plugin-standard@4.0.0 --dev`
3. 共享配置`yarn add @vue/eslint-config-standard@5.1.2 --dev`
4. 设置解析器`yarn add babel-eslint@10.1.0 --dev` 默认使用Espree
5. 在package.json 为 lint 定义'eslint --ext .js,.vue src',为 lintfix 定义 'eslint --fix --ext .js,.vue src'

**.eslintgnore 忽略文件：**

- 在项目根目录创建一个 .eslintignore 文件告诉 ESLint 去忽略特定的文件和目录

- .eslintignore 文件是一个纯文本文件，其中的每一行都是一个 glob 模式表明哪些路径应该忽略检测。

- eslint总是忽略 /node_modules/\* 和 /bower_components/\* 中的文件

```js
// package.json

{
  "scripts": {
    "serve": "webpack-dev-server --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "lint": "eslint --ext .js,.vue src",
    "lintfix": "eslint --fix --ext .js,.vue src"
  },
}
```
```js
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
```

```js
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
```

```js
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
```

```js
// .eslintrc.js

module.exports = {
  // 默认情况下，ESLint 会在所有父级目录里寻找配置文件，一直到根目录。
  // 如果发现配置文件中有 “root”: true，它就会停止在父级目录中寻找
  "root": true,
  "env": { // 标记当前代码最终的运行环境
    "node": true // Node.js 全局变量和作用域
  },
  "extends": [ // 记录共享配置
    // 插件名称可以省略 eslint-plugin- 前缀
    "plugin:vue/essential", // plugin:插件名称/配置名字
    // 一个配置文件可以从基础配置中继承已启用的规则。
    // 如下，如果值为字符串数组则每个配置继承它前面的配置。
    // 值为 "eslint:recommended" 的 extends 属性启用了eslint默认的规则
    "eslint:recommended",
    "@vue/standard"
  ],
  "parserOptions": {
    // 设置解析器选项能帮助 ESLint 确定什么是解析错误，所有语言选项默认都是 false
    "parser": "babel-eslint" // 解析器，默认使用Espree
  },
  "rules": { // 配置eslint中每一个校验规则的开启/关闭
     // ESLint 附带有大量的规则。你可以在rules选项中设置，
     // 设置的规则将覆盖上面继承的默认规则
     // 要改变一个规则设置，你必须将规则 ID 设置为下列值之一：
     // "off" 或 0 - 关闭规则
     // "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
     // "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
    indent: ["error", 4] // 强制使用一致的缩进
    // eqeqeq: [2, 'always'], // 要求使用 === 和 !==
    // semi: [2, 'never'], // 要求或禁止使用分号代替 ASI
    // quotes: [2, 'single'], // 强制使用一致的反勾号、双引号或单引号
  }
}
```
```js
// .eslintgnore

/build/
/config/
/dist/
/static/
/*.js
```