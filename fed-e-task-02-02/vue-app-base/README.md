# vue-app-base

1. 这是一个使用 Vue CLI 创建出来的 Vue 项目基础结构
2. 有所不同的是这里我移除掉了 vue-cli-service（包含 webpack 等工具的黑盒工具）
3. 这里的要求就是直接使用 webpack 以及你所了解的周边工具、Loader、Plugin 还原这个项目的打包任务
4. 尽可能的使用上所有你了解到的功能和特性



  `  "@babel/core": "^7.6.3",
  `  "@babel/preset-env": "^7.6.3",
  `  "@vue/eslint-config-standard": "^5.1.2",
  `  "babel-eslint": "^10.1.0",
  `  "babel-loader": "^8.0.6",
  `  "clean-webpack-plugin": "^3.0.0",
  `  "copy-webpack-plugin": "^5.0.4",
  `  "css-loader": "^3.2.0",
  `  "eslint": "^6.7.2",
  `  "eslint-friendly-formatter": "^4.0.1",
  `  "eslint-loader": "^4.0.2",
  `  "eslint-plugin-import": "^2.20.2",
  `  "eslint-plugin-promise": "^4.2.1",
  `  "eslint-plugin-standard": "^4.0.0",
  `  "eslint-plugin-vue": "^6.2.2",
  `  "file-loader": "^4.2.0",
  `  "html-webpack-plugin": "^3.2.0",
  `  "less": "^3.0.4",
  `  "less-loader": "^5.0.0",
  `  "style-loader": "^1.0.0",
  `  "url-loader": "^2.2.0",
  `  "vue-loader": "15.2.1",
  `  "vue-style-loader": "^4.1.0",
  `  "vue-template-compiler": "^2.6.11",
  `  "webpack": "^4.41.2",
  `  "webpack-cli": "^3.3.9",
  `  "webpack-dev-server": "^3.9.0",
  `  "webpack-merge": "^4.2.2"


全局：

1. 安装项目依赖`yarn`
2. 引入 Webpack@4.40.2, webpack-cli@3.3.9`yarn add webpack@4.40.2 webpack-cli@3.3.9 --dev`

common.js - module：

1. 将Vue组件编译成普通的JavaScript模块,'vue-template-compiler'被vue-loader所引用,注意版本要与vue相同`yarn add vue-template-compiler@2.6.11 vue-loader@15.2.1 --dev`
2. 需要Webpack在打包过程中同时处理其他ES6特性的转换`yarn add babel-loader@8.0.6 @babel/core@7.6.3 @babel/preset-env@7.6.3 --dev`
3. 引入资源模块加载处理CSS文件
`yarn add css-loader@3.2.0 vue-style-loader@4.1.0 --dev`
4. 处理 .less 文件的资源模块加载`yarn add less@3.0.4 less-loader@5.0.0 style-loader@1.0.0 --dev`
5. 处理 图片资源模块`yarn add file-loader@4.2.0 url-loader@2.2.0 --dev`
6. ESLint 结合 Webpack`yarn add eslint@6.7.2 eslint-loader@4.0.2 eslint-friendly-formatter@4.0.1 --dev` 创建 .eslintrc 文件并配置

common.js - plugins：

1. 通过 Webpack 输出 HTML 文件`yarn add html-webpack-plugin@3.2.0 --dev`

dev.js:

1. 希望在公共配置原有基础上添加插件而不是覆盖`yarn add webpack-merge@4.2.2 --dev`
2. 提供一个开发服务器`yarn add webpack-dev-server@3.9.0 --dev` 在package.json 为 serve 定义 'webpack-dev-server --config webpack.dev.js'

prod.js:

1. 打包之前自动清除目录`yarn add clean-webpack-plugin@3.0.0 --dev`
2. 拷贝静态文件至输出目录`yarn add copy-webpack-plugin@5.0.4 --dev`
3. 在package.json 为 build 定义'webpack --config webpack.prod.js'

.eslintrc.js:

1. 配置第三方插件`yarn add eslint-plugin-vue@6.2.2 --dev`
2. eslint-config-standard依赖：eslint-plugin-import eslint-plugin-standard eslint-plugin-promise `yarn add eslint-plugin-import@2.20.2 eslint-plugin-promise@4.2.1 eslint-plugin-standard@4.0.0 --dev`
3. 共享配置`yarn add @vue/eslint-config-standard@5.1.2 --dev`
4. 设置解析器`yarn add babel-eslint@10.1.0 --dev` 默认使用Espree
<!-- 5. 最终的运行环境`yarn add eslint-plugin-node@11.1.0 --dev` -->
5. 在package.json 为 lint 定义'eslint --ext .js,.vue src',为 lintfix 定义 'eslint --fix --ext .js,.vue src'

.eslintgnore 忽略文件：

- 在项目根目录创建一个 .eslintignore 文件告诉 ESLint 去忽略特定的文件和目录

- .eslintignore 文件是一个纯文本文件，其中的每一行都是一个 glob 模式表明哪些路径应该忽略检测。

- eslint总是忽略 /node_modules/\* 和 /bower_components/\* 中的文件