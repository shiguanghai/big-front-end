


## 6.1Rollup 打包
### Rollup 概述
Rollup 同样也是一款 ES Modules 的打包器，它也可以将项目当中的散落的细小模块打包为整块的代码，从而使得这些划分的模块可以更好地运行在浏览器环境或者NodeJS环境。

- Rollup 与 Webpack 作用类似
- Rollup 更为小巧，仅仅是一款 ESM 打包器
- Rollup 中并不支持类似 HMR 这种高级特性
- Rollup 并不是要与 Webpack 全面竞争
- Rollup 提供一个充分利用 ESM 各项特性得高效打包器

### Rollup 快速上手
[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-03-01-rollup-demo/01-getting-started)
```
yarn add rollup --dev
```
```
yarn rollup [入口文件：.sec/index.js] --format [输出格式：自调用函数iife] --file [输出路径：dist/bundle.js]
```
- Rollup 默认会开启 Tree Sharking 优化输出结果

### Rollup 配置文件
rollup.config.js 文件运行在NodeJS环境，Rollup 自身会额外处理这个配置文件，所以可以直接使用 ESM
```js
// rollup.config.js
export default {
  input: 'src/index.js', // 入口文件路径
  output: { // 输出相关配置 （对象）
    file: 'dist/bundle.js', // 输出文件名
    format: 'iife' // 输出格式
  }
}
```
```
yarn rollup --config [rollup.config.js] // 需要指明配置文件 默认 rollup.config.js
```

### Rollup 使用插件（rollup-plugin-json）
Rollup 自身的功能就只是 ES Modules 模块的合并打包，如果项目有更高级的需求，例如 想要加载其他类型资源模块 或是 导入 CommonJS模块 又或是 编译 ECMAScript新特性。

- Rollup 支持使用插件的方式扩展
- 插件是 Rollup 唯一扩展途径（不像Webpack划分Loader Plugin Minimizer 三种扩展方式）

这里尝试导入可以让项目代码导入Json文件的插件
```
yarn add rollup-plugin-json --dev
```
```js
import json from 'rollup-plugin-json' // 默认导出插件函数

export default {
  ...
  plugins: [
    json() // 调用结果而不是函数
  ]
}
```
```js
// src/index.js

// 导入模块成员
import { log } from './logger'
...
import { name, version } from '../package.json'

// 使用模块成员
...
log(name)
log(version)
```

### Rollup 加载 npm 模块（rollup-plugin-node-resolve）
Rollup 默认只能按照文件路径的方式加载本地的文件模块，对于 node_modules 当中那些第三方的模块，它并不能像 Webpack 一样直接通过模块的名称导入对应的模块。

为了抹平这样一个差异，Rollup 官方给出了 rollup-plugin-node-resolve 这样一个插件。
```
yarn add rollup-plugin-node-resolve --dev
```
```js
...
import resolve from 'rollup-plugin-node-resolve'

export default {
  ...
  plugins: [
    ...
    resolve()
  ]
}
```
```js
// src/index.js

// 导入模块成员
import _ from 'lodash-es' // Rollup 默认只能处理ESM模块 使用普通版本需要额外处理
...

// 使用模块成员
...
log(_.camelCase('hello world'))
```

### Rollup 加载 CommonJS 模块（rollup-plugin-commonjs）
Rollup设计的就是只处理ESM模块打包，如果我们在代码中导入 CommonJS模块 默认是不被支持的。

但是目前还会有大量的npm模块使用CommonJS的方式导出成员，为了兼容这些模块，官方给出了一个叫做 rollup-plugin-commonjs 的插件。
```
yarn add rollup-plugin-commonjs --dev
```
```js
...
import commonjs from 'rollup-plugin-commonjs'

export default {
  ...
  plugins: [
    ...
    commonjs()
  ]
}
```
```js
// src/cjs-module.js

module.exports = {
  foo: 'bar'
}
```
```js
// src/index.js

// 导入模块成员
...
import { log } from './logger'
...
import cjs from './cjs-module'

// 使用模块成员
...
log(cjs)
```

### Rollup Code Splitting
在 Rollup 最新的版本中已经开始支持代码拆分了，同样可以使用符合ESM标准的动态导入（`Dynamic Imports`）的方式实现模块的按需加载，Rollup 内部也会自动处理代码拆分（`Code Splitting`）也就是我们说的分包。


```js
// src/index.js

import('./logger').then(({ log }) => {
  log('code splitting~')
})
```
自执行函数会把所有的模块都放在同一个函数中，无法实现代码拆分。浏览器环境可以使用amd格式输出，但是Code Splitting需要输出多个文件，就不能再使用file配置，而是使用dir参数。
```js
// rollup.config.js
export default {
  input: 'src/index.js',
  output: {
    // file: 'dist/bundle.js',
    // format: 'iife'
    dir: 'dist', // 输出目录
    format: 'amd' // 输出格式
  }
}
```

### Rollup 多入口打包
- 对于不同入口的公共部分也会自动提取到单个文件作为独立的bunder


```js
export default {
  // input: ['src/index.js', 'src/album.js'],
  input: {
    foo: 'src/index.js',
    bar: 'src/album.js'
  },
  output: {
    dir: 'dist',
    format: 'amd' // 内部使用代码拆分 就不能使用自调用函数
  }
}
```

- 对于 amd 这种输出模式的输出文件，不能直接引用到页面，必须通过实现 AMD 标准的库加载

```
...
<body>
  <!-- AMD 标准格式的输出 bundle 不能直接引用 -->
  <!-- <script src="foo.js"></script> -->
  <!-- 需要 Require.js 这样的库 -->
  <script src="https://unpkg.com/requirejs@2.3.6/require.js" data-main="foo.js"></script>
</body>
```

### Rollup / Webpack 选用规则
我们发现，Rollup 确实有它的优势

- 输出结果更加扁平
- 自动移除未引用代码
- 打包结果依然完全可读

缺点也很明显

- 加载非 ESM 的第三方模块比较复杂
- 模块最终都被打爆到一个函数中，无法实现HMR
- 浏览器环境中，代码拆分功能依赖AMD库

综合以上特点，我们发现

- 如果我们正在开发应用程序（大量引入第三方模块、需要HMR提升开发体验、体积过大需要分包）不适合使用Rollup，建议使用Webpack
- 如果我们正在开发一个框架或者类库（很少依赖第三方模块）适合使用Rollup
- 大多数知名框架/库都在使用 Rollup
- Webpack大而全，Rollup小而美

## 6.2Parcel 打包

- Parcel：零配置的前端应用打包器，[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-03-02-parcel-demo) 

1.在一个空项目中初始化 package.json
```
yarn init
```
2.安装 parcel-bundler 模块
```
yarn add parcel-bundler --dev
```

虽然 Parcel 与 Webpack 一样都支持以任意类型的文件作为打包入口，但是 Parcel 官方建议我们使用html文件，理由为 HTML 是应用运行在浏览器端的入口。
```
// 打包入口 src/index.html
<body>
  <script src="main.js"></script>
</body>
```
Parcel 同样支持对 ESM 的打包
```js
// src/main.js

import foo from './foo'

foo.bar()
```
```js
// src/foo.js

export default {
  bar: () => {
    console.log('hello parcel~')
  }
}
```
```
yarn parcel src/index.html
```
我们可以发现，Parcel 不仅仅帮我们打包了应用，而且还同时开启了一个开发服务器，类似 Webpak 的 Dev Server，如果我们需要模块热替换，Parcel 也支持。
```js
// src/main.js

import foo from './foo'

foo.bar()
if (module.hot) {
  module.hot.accept(() => { // 此处的accept只接受一个参数 当前的模块或所依赖模块更新才会执行
    console.log('hmr')
  })
}
```
除了热替换，Parcel 还支持自动安装依赖，极大程度避免了额外的一些手动操作。

除此之外，Parcel 同样支持加载其他类型的资源模块，而且相比其他的模块打包器，在 Parcel 中加载任意类型的资源模块也是零配置，整个过程不需要安装任何插件。

我们还可以添加图片到项目当中
```js
// src/style.css

body {
  background-color: #282c40;
}
```
```js
// src/main.js

import $ from 'jquery'
...
import './style.css'
import logo from './zce.png'

...
$(document.body).append(`<img src="${logo}" />`)
...
```
Parcel 同样支持使用动态导入，内部如果使用了动态导入，它也会自动拆分代码
```js
// src/main.js

// import $ from 'jquery'
...
import('jquery').then($ => {
  ...
  $(document.body).append(`<img src="${logo}" />`)
})
...
```

我们再来看一下 Parcel 如何以生产环境打包
```
yarn parcel build src/index.html
```
需要注意的是，对于相同体量的打包，Parcel 会比 Webpack 的构建速度快很多。因为在 Parcel 内部是多进程同时去工作，充分发挥了多核CPU的性能。当然 Webpack 中也可以使用 happypack 的插件来实现这一点。