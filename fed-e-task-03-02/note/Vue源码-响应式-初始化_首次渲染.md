

## 4.1 准备工作
### Vue 源码获取

- 项目地址 [https://github.com/vuejs/vue](https://github.com/vuejs/vue)
- Fork 一份到自己仓库，克隆到本地，可以自己写注释提交到 github
- 为什么分析 Vue 2.6
	* 到目前为止 Vue 3.0 的正式版还没有发布
	* 新版本发布后，现有项目不会升级到 3.0，2.x 还有很长的一段过渡期
	* 3.0 项目地址：[https://github.com/vuejs/vue-next](https://github.com/vuejs/vue-next)

> **可以参考我 Fork 的[源码](https://github.com/shiguanghai/vue)**，相较官网增加了一些额外的代码批注以及部分官方注释的翻译，文章未展示到的代码可以自己深入来看，另外用到[案例](https://github.com/shiguanghai/vue/tree/dev/examples)也可以在其中获取
### 源码目录结构
```js
src
├─compiler 		编译相关	
├─core 			Vue 核心库（与平台无关的代码）
│	components	定义 vue 自带的 keep-alive 组件
│	global-api	定义 vue 静态方法
│	instance	创建 vue 实例（构造函数、初始化、生命周期函数）
│	observer	响应式机制实现（本章重点）
│	util		公共成员
│	vdom		虚拟dom
├─platforms 	平台相关代码
│	web			
│	weex		基于vue移动端框架
├─server 		SSR，服务端渲染
├─sfc 			单文件组件（.vue 文件编译为 js 对象）
└─shared 		公共的代码
```

我们可以看到，Vue 在开发的时候首先会按照**功能**把代码拆分到**不同的文件夹**，然后再拆分成小的**模块**，这样的代码结构清楚，可以提高其**可读性**和**可维护性**。


### 调试设置
**打包**

- 打包工具 Rollup
	* Vue.js 源码的打包工具使用的是 Rollup，比 Webpack 轻量
	* Webpack 把所有文件当做模块，Rollup 只处理 js 文件更适合在 Vue.js 这样的库中使用
	* Rollup 打包不会生成冗余的代码
	* 详细可见 [Rollup 打包](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96%E5%AE%9E%E6%88%98/Rollup%E3%80%81Parcel%20%E6%89%93%E5%8C%85.html#_6-1-rollup-%E6%89%93%E5%8C%85)

安装依赖
```bash
 npm i
```
设置 sourcemap

- package.json 文件中的 dev 脚本中添加参数 --sourcemap 开启代码地图

```js
"dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:webfull-dev"
```

- 执行 dev
	* 首先我们先将 `dist` 目录删除，以便看得更清楚
	* `npm run dev` 执行打包，用的是 rollup，-w 参数是监听文件的变化，文件变化自动重新打包；-c 是设置配置文；最后一个参数是配置环境变量，从而来打包生成不同版本的 vue
	* **注意**：Window 系统的朋友可能会遇到一个问题：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205154633545.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
在这里，我初次从 github 将 vue 源代码 clone 下来，`npm i` 安装依赖之后执行 `npm run dev` 打包报出如上错误，而当我们查看文件我们发现并没有创建 dist 目录，这个错误大致的意思是找不到你的某个文件（文件不一定，之前遇到过core/index文件找不到）

我猜想这是因为 **rollup** 打包使用 **rollup-plugin-alias** 来处理一些常用的公共路径。但是在 win 环境下，这个别名的解析好像工作不正常，文件缺少了.js后缀导致识别不到文件，最简单的方式是下载 [此版本的 rollup-plugin-alias](https://github.com/ideayuye/rollup-plugin-alias) 并覆盖原文件，具体操作过程如下：

- clone [仓库源码](https://github.com/ideayuye/rollup-plugin-alias) 到本地
- `npm i` 安装依赖
- `npm run build` 编译
- 将编译后的 `src/index.js` 与 `dist/rollup-plugin-alias.es2015.js` 与 `dist/rollup-plugin-alias.js` 文件替换你从 vue 官网克隆下来的代码里 `node_modules/rollup-plugin-alias` 中的`src` 和 `dist` 内的内容
- 如果你感兴趣可以对比下[二者的代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-03-02/code/rollup-plugin-alias)
- 此时再次运行 `nom run dev` 打包vue源码，如下图所示就证明打包成功了

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020120516023619.png)
此时 dist 目录重新生成内容如下，新增了 vue.js 和 vue.js.map

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205160849737.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
至于其他版本的js文件我们后续可以通过调用 `npm run build` 得到

**调试**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201208215140578.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)


- examples 的示例中引入的 vue.min.js 改为 vue.js
- 打开 Chrome 的调试工具中的 source
- 此时就可以看到源文件了

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201208215355426.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### Vue 的不同构建版本

- `npm run build` 重新打包所有文件

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201208215728699.png)

- 官方文档 - [对不同构建版本的解释](https://cn.vuejs.org/v2/guide/installation.html#%E5%AF%B9%E4%B8%8D%E5%90%8C%E6%9E%84%E5%BB%BA%E7%89%88%E6%9C%AC%E7%9A%84%E8%A7%A3%E9%87%8A)
- dist/README.md

| | UMD | CommonJS | ES Module |
| --- | --- | --- | --- |
| **Full** | vue.js | vue.common.js | vue.esm.js |
| **Runtime-only** | vue.runtime.js | vue.runtime.common.js | vue.runtime.esm.js |
| **Full (production)** | vue.min.js | | |
| **Runtime-only (production)** | vue.runtime.min.js | | |

**术语**

- **完整版**：同时包含**编译器**和**运行时**的版本
- **编译器**：用来将模板字符串编译成为 JavaScript 渲染函数的代码，体积大、效率低
- **运行时**：用来创建 Vue 实例、渲染并处理虚拟 DOM 等的代码，体积小、效率高。基本上就是除去编译器的代码
- [UMD](https://github.com/umdjs/umd)：UMD 版本通用的模块版本，支持多种模块方式。 vue.js 默认文件就是运行时 + 编译器的UMD 版本
- [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1)(cjs)：CommonJS 版本用来配合老的打包工具比如 [Browserify](http://browserify.org/) 或 [webpack 1](https://webpack.github.io/)
- [ES Module](http://exploringjs.com/es6/ch_modules.html)：从 2.6 开始 Vue 会提供两个 ES Modules (ESM) 构建文件，为现代打包工具提供的版本
	* ESM 格式被设计为可以被静态分析，所以打包工具可以利用这一点来进行“tree-shaking”并将用不到的代码排除出最终的包
	* [ES6 模块与 CommonJS 模块的差异](https://es6.ruanyifeng.com/#docs/module-loader#ES6-%E6%A8%A1%E5%9D%97%E4%B8%8E-CommonJS-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82)

**Runtime + Compiler vs. Runtime-only**

```js
// <script src="../../dist/vue.js"></script>
// Compiler
// 需要编译器，把 template 转换成 render 函数
const vm = new Vue({
  el: '#app',
  template: '<h1>{{ msg }}</h1>',
  data: {
    msg: 'Hello Vue'
  }
})
```
```js
// <script src="../../dist/vue.runtime.js"></script>
// Runtime
// 不需要编译器
const vm = new Vue({
  el: '#app',
  // template: '<h1>{{ msg }}</h1>',
  render (h) {
    return h('h1', this.msg)
  },
  data: {
    msg: 'Hello Vue'
  }
})
```

- 推荐使用运行时版本，因为运行时版本相比完整版体积要小大约 30%
- 基于 Vue-CLI 创建的项目默认使用的是 `vue.runtime.esm.js`

```js
// src/main.js
import Vue from 'vue'
```

- 通过查看 webpack 的配置文件
	* 终端输入
```bash
vue inspect > output.js
```
```js
// output.js
  resolve: {
    alias: {
	  ...
	  vue$: 'vue/dist/vue.runtime.esm.js'
	}
  }
```
- **注意**： `*.vue` 文件中的模板是在构建时预编译的，最终打包后的结果不需要编译器，只需要运行时版本即可

### 寻找入口文件
- 查看 dist/vue.js 的构建过程

**执行构建**
```bash
npm run dev
# "dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev"
# --environment TARGET:web-full-dev 设置环境变量 TARGET
```

- `script/config.js` 的执行过程（文件末尾）
	* 作用：生成 rollup 构建的配置文件
	* 使用环境变量 TARGET = web-full-dev

```js
// 判断环境变量是否有 TARGET
// 如果有的话 使用 genConfig() 生成 rollup 配置文件
if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  // 否则获取全部配置
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
```

- genConfig(name)
	* 根据环境变量 TARGET 获取配置信息
	* `const opts = builds[name]`
	* builds[name] 获取生成配置的信息

```js
const builds = {
  ...
  // Runtime+compiler development build (Browser)
  'web-full-dev': {
    // 入口
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
}
```

- resolve()
	* 获取入口和出口文件的绝对路径

```js
const aliases = require('./alias')
const resolve = p => {
  // 根据路径中的前半部分去alias中找别名
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}
```
```js
// scripts/alias
const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  ...
  web: resolve('src/platforms/web'),
}
```

**结果**

- 把 src/platforms/web/entry-runtime-with-compiler.js 构建成 dist/vue.js，如果设置 --sourcemap 会生成 vue.js.map
- src/platform 文件夹下是 Vue 可以构建成不同平台下使用的库，目前有 weex 和 web，还有服务器端渲染的库

### 从入口开始
- [src/platforms/web/entry-runtime-with-compiler.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/entry-runtime-with-compiler.js)

**观察[以下代码](https://github.com/shiguanghai/vue/blob/dev/examples/02-debug/index.html)，通过阅读源码，回答在页面上输出的结果**

```js
const vm = new Vue({
  el: '#app',
  template: '<h1>Hello Template</h1>',
  render(h) {
    return h('h1', 'Hello Render')
  }
})
```

- 阅读源码记录
	* el 不能是 body 或者 html 标签
	* 如果没有 render，把 template 转换成 render 函数
	* 如果有 render 方法，直接调用 mount 挂载 DOM

```js
// 保留 Vue 实例的 $mount 方法
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  // 非ssr情况下为 false，ssr 时候为true
  hydrating?: boolean
): Component {
  // 获取 el 对象
  el = el && query(el)

  /* istanbul ignore if */
  // el 不能是 body 或者 html
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 把 template/el 转换成 render 函数
  if (!options.render) {
    ...
  }
  // 调用 mount 方法，渲染 DOM
  return mount.call(this, el, hydrating)
}
```

> 抛出问题：$mount 是谁调用的? 又是在什么位置？

- 调试代码的方法

注意：如果你最后执行了 `npm run build`操作，disy/vue.js 中的最后一行的 sourceMap 映射 `//# sourceMappingURL=vue.js.map` 会被清除，所以如果想在调试过程看到 src 源码，需要重新 `npm run dev` 开启代码地图。

- 调试代码[`examples/02-debug/index.html`](https://github.com/shiguanghai/vue/blob/dev/examples/02-debug/index.html)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205181754168.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
在调用堆栈位置，我们可以看到方法调用的过程，当前执行的是 `Vue.$mount` 方法，再往下可以看到 `Vue._init`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201209200109284.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
Vue 构造函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201209200724907.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

从而我们得知：**`$mount` 是 `_init()` 调用的**

同时也验证了开始的答案：**如果 `new Vue` 同时设置了 `template` 和 `render()` ，此时只会执行 `render()`**

> Vue 的构造函数在哪？
> Vue 实例的成员 / Vue 的静态成员 从哪里来的？


## 4.2 Vue初始化
### Vue 初始化过程
**Vue 的构造函数在哪里**

- src/platform/web/entry-runtime-with-compiler.js 中引用了  './runtime/index'

```js
import Vue from './runtime/index'
```

- [src/platform/web/runtime/index.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/runtime/index.js)
	* 设置 Vue.config
	* 设置平台相关的指令和组件
		+ 指令 v-model、v-show
		+ 组件 transition、transition-group
	* 设置平台相关的 \_\_patch\_\_ 方法（打补丁方法，对比新旧的 VNode）
	* **设置 $mount 方法，挂载 DOM**

```js
import config from 'core/config'
...
// install platform runtime directives & components
// 设置平台相关的指令和组件(运行时)
// extend() 将第二个参数对象成员 拷贝到 第一个参数对象中去
// 指令 v-model、v-show
extend(Vue.options.directives, platformDirectives)
// 组件 transition、transition-group
extend(Vue.options.components, platformComponents)

// install platform patch function
// 设置平台相关的 __patch__ 方法 (虚拟DOM 转换成 真实DOM)
// 判断是否是浏览器环境（是 - 直接返回， 非 - 空函数 noop
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
// 设置 $mount 方法，挂载 DOM
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
- src/platform/web/runtime/index.js 中引用了  'core/index'
```js
import Vue from 'core/index'
```
- [src/core/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/index.js)
	* 定义了 Vue 的静态方法
	* `initGlobalAPI(Vue)`
- src/core/index.js 中引用了 './instance/index'
```js
import Vue from './instance/index'
```
- [src/core/instance/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/index.js)
	* 定义了 Vue 的构造函数
	* 设置 Vue 实例的成员

```js
// 此处不用 class 的原因是因为方便后续给 Vue 实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 _init() 方法
  this._init(options)
}
// 注册 vm 的 _init() 方法，初始化 vm
initMixin(Vue)
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关方法
// $on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 混入 render
// $nextTick/_render
renderMixin(Vue)

export default Vue
```

### 整理四个导出 Vue 的模块
- [src/platforms/web/entry-runtime-with-compiler.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/entry-runtime-with-compiler.js)
	* web 平台相关的入口
	* 重写了平台相关的 $mount()方法
	* 注册了 Vue.compile() 方法，传递一个 HTML 字符串返回 render 函数
- [src/platform/web/runtime/index.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/runtime/index.js)
	* web 平台相关
	* 注册和平台相关的全局指令：v-model、v-show
	* 注册和平台相关的全局组件： v-transition、v-transition-group
	* 全局方法：
		+ \_\_patch\_\_：把虚拟 DOM 转换成真实 DOM
		+ $mount：挂载方法
- [src/core/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/index.js)
	* 与平台无关
	* 设置了 Vue 的静态方法，initGlobalAPI(Vue)
- [src/core/instance/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/index.js)
	* 与平台无关
	* 定义了构造函数，调用了 this._init(options) 方法
	* 给 Vue 中混入了常用的实例成员

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020120518555115.png)


### Vue 静态成员初始化
通过 [src/core/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/index.js) 的 `initGlobalAPI(Vue)` 来到 **初始化 Vue 的静态方法** 所在文件
```js
import { initGlobalAPI } from './global-api/index'
...
// 注册 Vue 的静态属性/方法
initGlobalAPI(Vue)
```
- [src/core/global-api/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/index.js)
	* 初始化 Vue 的静态方法
		+ initUse() : [src/core/global-api/use.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/use.js)
		+ initMixin() : [src/core/global-api/mixin.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/mixin.js)
		+ initExtend() : [src/core/global-api/extend.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/extend.js)
		+ initAssetRegisters() : [src/core/global-api/assets.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/assets.js)
	* 可参考 [Vue 全局 API 文档](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80-API)
```js
export function initGlobalAPI (Vue: GlobalAPI) {
  ...
  // 初始化 Vue.config 对象
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 这些工具方法不视作全局API的一部分，除非你已经意识到某些风险，否则不要去依赖他们
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  // 静态方法 set/delete/nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 让一个对象可响应
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  // 初始化 Vue.options 对象，并给其扩展
  // components/directives/filters
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 这是用来标识 "base "构造函数，在Weex的多实例方案中，用它来扩展所有普通对象组件
  Vue.options._base = Vue

  // 设置 keep-alive 组件
  extend(Vue.options.components, builtInComponents)

  // 注册 Vue.use() 用来注册插件
  initUse(Vue)
  // 注册 Vue.mixin() 实现混入
  initMixin(Vue)
  // 注册 Vue.extend() 基于传入的options返回一个组件的构造函数
  initExtend(Vue)
  // 注册 Vue.directive()、Vue.component()、Vue.filter()
  initAssetRegisters(Vue)
}
```

### Vue 实例成员初始化

- [src/core/instance/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/index.js)
	* 定义 Vue 的构造函数
	* 初始化 Vue 的实例成员
		+ initMixin() : [src/core/instance/init.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/init.js)
		+ stateMixin() : [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)
		+ eventsMixin() : [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)
		+ lifecycleMixin() : [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)
		+ renderMixin() : [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)
	* 可参考 [Vue 实例 文档](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B-property)
```js
// 此处不用 class 的原因是因为方便后续给 Vue 实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 _init() 方法
  this._init(options)
}
// 注册 vm 的 _init() 方法，初始化 vm
initMixin(Vue)
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关方法
// $on/$once/$off/$emit
eventsMixin(Vue)
// 初始化生命周期相关的混入方法
// _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 混入 render
// $nextTick/_render
renderMixin(Vue)
```

### 实例成员 - init

- initMixin(Vue)
	* 注册 vm 的 _init() 方法，初始化 vm
	* [src/core/instance/init.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/init.js)
	* 可参考 [Vue 实例 文档](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B-property)

```js
export function initMixin (Vue: Class<Component>) {
  // 给 Vue 实例增加 _init() 方法
  // 合并 options / 初始化操作
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 如果是 Vue 实例不需要被 observe
    vm._isVue = true
    // merge options
    // 合并 options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 优化内部组件实例化，因为动态选项合并非常慢，而且内部组件选项都不需要特殊处理。
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // vm 的生命周期相关变量初始化
    // $children/$parent/$root/$refs
    initLifecycle(vm)
    // vm 的事件监听初始化, 父组件绑定在当前组件上的事件
    initEvents(vm)
    // vm 的编译render初始化
    // $slots/$scopedSlots/_c/$createElement/$attrs/$listeners
    initRender(vm)
    // beforeCreate 生命钩子的回调
    callHook(vm, 'beforeCreate')
    // 把 inject 的成员注入到 vm 上
    initInjections(vm) // resolve injections before data/props
    // 初始化 vm 的 _props/methods/_data/computed/watch
    initState(vm)
    // 初始化 provide
    initProvide(vm) // resolve provide after data/props
    // created 生命钩子的回调
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 调用 $mount() 挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

### 实例成员 - initState

- initState(vm)
	* 初始化 vm 的 _props/methods/_data/computed/watch
	* [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)
	* 可参考 [Vue 实例 文档](https://cn.vuejs.org/v2/api/#%E5%AE%9E%E4%BE%8B-property)

```js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  // 将props成员转换成响应式数据，并注入到vue实例
  if (opts.props) initProps(vm, opts.props)
  // 初始化选项中的方法(methods)
  if (opts.methods) initMethods(vm, opts.methods)
  // 数据的初始化
  if (opts.data) {
    // 把data中的成员注入到Vue实例 并转换为响应式对象
    initData(vm)
  } else {
    // observe数据的响应式处理
    observe(vm._data = {}, true /* asRootData */)
  } 
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```


### 初始化过程调试
- 初始化过程[调试代码](https://github.com/shiguanghai/vue/tree/dev/examples/03-initVue/index.html)

**设置断点**

- 断点1：ssrc/core/instance/index.js
![在这里插入图片描述](https://img-blog.csdnimg.cn/202012101712459.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 断点2：src/core/index.js
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210171416950.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 断点3：src/platforms/web/runtime/index.js
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210171628529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 断点4：src/platforms/web/entry-runtime-with-compiler.js
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210171842446.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**开始调试**

- F5 进入断点
- 首先进入`core/instance/index.js`，它是与平台无关的，在这里调用了Mixin的一些函数，这些函数里面给Vue的原型上增加了一些实例成员
- 此时我们来监视这些函数执行完毕后Vue身上发生的一些变化
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210173112595.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10 跳过函数 initMixin，新增_init()
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210173433857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继续，跳过函数 stateMixin()，新增 \$data / \$props / \$set / \$delete / \$watch 几个成员。但是 \$data 和 \$props 此时都是 undefined，仅仅初始化了这两个属性，将来需要通过选项去赋值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210173807530.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接下来调用函数 eventsMixin()，初始化事件相关的四个方法 \$on / \$once / \$off / \$emit
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210174440813.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 再调用函数 lifecycleMixin()，它注册了根生命周期相关的方法 _update / \$forceUpdate / \$destroy。其中_updata内部调用了 patch 方法，把 VNode 渲染成真实的 DOM
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210175020573.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 最后调用函数renderMixin()，其执行过后，会给原型挂载一些 _ 开头的方法，这些方法的作用是当我们把模板转换成 render函数的时候，在render函数中调用，除此之外还注册了 \$nextTick / _render, _render的作用是调用用户定义 或 模板渲染的render函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210175640380.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F8 跳转到下一个导出Vue的文件`core/index.js`，这个文件中执行了 initGlobalAPI()，给Vue的构造函数初始化了静态成员
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210175848447.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入 initGlobalAPI()，F10执行到初始化 Vue.config 对象的地方，Vue的构造函数新增 config属性，这是一个对象，并且这个对象已经初始化了很多内容，这些内容是通过给config对象增加一个get方法，在get方法中返回了`../config`中导入的config
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210180830750.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继续F10执行三个静态方法 set / delete / nextTick
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210180952531.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10 初始化 observable
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210181622787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继续F10 初始化 options对象，但此时options对象为空，因为是通过Object.create(null)来初始化的，没有原型，继续F10 增添全局组件、指令以及过滤器 components / directives / filters，再F10初始化_base即Vue
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210182105899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10为options.compents设置keep-alive组件
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210182231433.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10 初始化静态方法 Vue.use()、Vue.mixin()、Vue.extend()。以及Vue.directive()、Vue.component()、Vue.filter()，它们是用来注册全局的指令、组件和过滤器，我们调用这些方法的时候，它们会把指令、组件和过滤器分别帮我们注册到Vue.options中对应的属性里面来
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210183122739.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 再按F8进入`platforms/web/runtime/index.js`，此时我们看到的代码都是与平台相关的，它首先给Vue.config中注册了一些与平台相关的一些公共的方法，当它执行完过后 又注册了几个与平台相关的指令和组件
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121018412182.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10将其执行完观察指令和组件的变化
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210184422488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继续F10给Vue原型上注册了patch和\$mount，其执行是在Vue._init中调用的
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210184845819.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F8 进入到最后一个文件`platforms/web/runtime/entry-runtime-with-compiler.js`的断点，这个文件重写了\$mount，新增了把模板编译成render函数的功能
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210185244457.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在文件最后给Vue构造函数挂载了compile方法，这个方法的作用是让我们手共把模板转换成render函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121018542615.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
## 4.3 Vue首次渲染
### 首次渲染过程调试
- Vue 初始化完毕，开始真正的执行
- 调用 new Vue() 之前，已经初始化完毕
- 通过调试[代码](https://github.com/shiguanghai/vue/blob/dev/examples/03-initVue/index.html)，记录首次渲染过程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210222319829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**开始调试**

- F8 跳过初始化阶段，进入新增断点
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210222517378.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入_init()，来到initMixin()，F10来到合并options的位置判断是否为组件，当前为创建Vue实例，并不是组件，进入else
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210222919315.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 合并options：将用户传递进来的options和构造函数中的options进行合并
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210223536985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11 进入initProxy，函数中先判断当前浏览器是否支持Proxy代理对象，如果支持，通过Proxy代理Vue实例，如果不支持代理对象，直接将Vue实例设置给_renderProxy
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210223853972.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10执行完毕，继续往下执行一些init，给Vue实例挂载一些成员，先不去调试，我们将断点设置到后面\$mount处，F8执行到断点处
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210224134775.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入\$mount()函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210224710559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10 获取Vue实例的options选项，判断是否有render函数，没有render获取选项中的template
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210225057825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 判断template是否存在，当前项目只传入了el和data，template为undefined
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210225241530.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10进入else，选项中没有设置模板，判断是否有el，有el调用getOuterHTML()函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210225754480.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入函数getOuterHTML()，函数内部判断是否有outerHTML属性，有的话直接作为模板返回，没有的话说明此时的el不是DOM元素（文本节点/注释节点），此时会创建一个div，把el克隆一份添加到container中，最终将innerHTML返回作为模板
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210225839455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10 返回el(#app)内部的模板
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210230203984.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10往下开始编译（将模板编译成render函数），先不去观察如何执行
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210230516357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- render函数生成，将其存储到options.render选项中，同时还存储了staticRenderFns
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210230728225.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10最终执行mount方法，此处的mount()是在`platforms/web/runtime/index.js`中定义的\$mount，我们在入口文件重写了\$mount
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210231131844.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入，此文件会重新获取el(当执行带编译器的Vue，已经获取过el，但是如果此时执行的是运行版本的Vue就不会执行)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210231646710.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11调用mountCompoent()，与浏览器无关，也是Vue的核心代码
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210231925791.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10首先判断选项中是否有render函数，如果有且此时为运行时版本则会警告`运行时版本不支持编译器`，此时为带编译器版本，未手动传入render，但是编译器已经帮我们编译过了
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210232345606.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 下面调用一个生命周期的beforeMount钩子函数，F10接下来挂载(更新组件)，updateComponent将虚拟DOM传递给_update()转化为真实DOM
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210232530310.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10此函数执行完，我们就可以看到将模板渲染到界面上，但是此时只是定义，并未执行。接下来创建Watcher对象，并传递进来updateComponent，其执行是在Watcher()中调用的，我们在此处设置一个断点
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211184357378.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入断点，看Watcher具体做了哪些事情，构造函数内传入了几个参数：第一个参数是Vue的实例，第二个参数是updateComponent（可以是字符串/函数，此处传入的为函数），**Vue中的Watcher有三种：1.渲染Watcher(当前)，2.计算属性Watcher，3.侦听器Watcher**，最后一个参数isRenderWatcher是否是渲染Watcher，此处为true
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211184536540.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 构造函数内部还定义了许多属性，此处的`this.lazy = !!options.lazy`为延时执行的意思，因为Watcher要更新视图，lazy意思是是否延迟更新视图，而我们当前是首次渲染，我们要立即更新，所以此处指为false，而如果此处为计算属性Wather，它会延迟执行，因为在计算属性中，当数据变化之后才去更新视图
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211185732880.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10接下来要判断expOrFn，也就是钩子函数中的第二个参数，它是function或者string，如果是function直接把变量赋给getter，如果是string需要进一步处理（创建侦听器再说）。当前getter中存储的是updateComponent也就是首次渲染时的值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211190106817.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10接下来要给this.value赋值，它会首先判断this.lazy，如果当前lazy的值是false也就是不延迟执行的话，会立即执行this.get方法
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211190518264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11来查看get做了哪些事情，首先pushTarget把当前的Watcher对象存入栈中（每一个组件都会对应一个Watcher，Watcher会去渲染视图，如果组件有嵌套会先渲染内部的组件，所以要把父组件对应的Watcher保存）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211190743392.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10接下里调用了刚刚存储的getter（也就是updateComponent），因此在get内部调用了updateComponent，并且改变了函数内部this的指向，指向Vue的实例并传入vm。**最终我们找到了调用updateComponent的位置**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191111654.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接下来我们再按F11就会进入updateComponent里面
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191249648.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 此时就会调用_render和_update两个方法，这两个方法执行完毕，就会将模板渲染到界面，点击F10
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191556945.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 此时我们看到视图渲染完毕，按F10将Watcher执行完毕回到`lifecycle.js`，再按F10让其执行完毕
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191740367.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121119181272.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191824751.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191853177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 最后回到Vue构造函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201211191923675.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 以上就是首次渲染的一个过程

### 首次渲染总结
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205195820451.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
