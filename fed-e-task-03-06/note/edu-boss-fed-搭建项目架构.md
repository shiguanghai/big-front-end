
## 21.1 创建项目

### 使用 Vue CLI 创建项目

本章我们通过使用 TypeScript 编程语言，基于 Vue.js 全家桶（Vue.js、Vue Router、Vuex、Element UI）开发 B 端管理系统项目（dashboard)。通过实战深入掌握 Vue.js 及其相关技术栈的使用。[项目仓库](https://github.com/shiguanghai/edu-boss-fed)

安装 Vue CLI：

```shell
npm i @vue/cli -g
```

```shell
vue create edu-boss-fed

Vue CLI v4.5.11
? Please pick a preset: (Use arrow keys)
  Default ([Vue 2] babel, eslint)
  Default (Vue 3 Preview) ([Vue 3] babel, eslint)
❯ Manually select features
```

![iShot2021-04-21 19.19.28](https://public.shiguanghai.top/blog_img/iShot2021-04-21%2019.19.28.png)

```js
? Please pick a preset: Manually select features
? Check the features needed for your project: Babel, TS, Router, Vuex, CSS Pre-processors, Linter
? Use class-style component syntax? Yes
? Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)? Yes
? Use history mode for router? (Requires proper server setup for index fallback in production) No
? Pick a CSS pre-processor (PostCSS, Autoprefixer and CSS Modules are supported by default): Sass/SCSS (with dart-sass)
? Pick a linter / formatter config: Standard
? Pick additional lint features: Lint on save, Lint and fix on commit
? Where do you prefer placing config for Babel, ESLint, etc.? In dedicated config files
? Save this as a preset for future projects? No

⚓  Running completion hooks...

📄  Generating README.md...

🎉  Successfully created project edu-boss-fed.
👉  Get started with the following commands:

 $ cd edu-boss-fed
 $ npm run serve
```

安装结束，启动开发服务器：

```shell
# 进入你的项目目录
cd edu-boss-fed

# 启动开发服务
npm run serve
```

启动成功，根据提示访问给出的服务地址

![image-20210421193957132](https://public.shiguanghai.top/blog_img/image-20210421193957132.png)

### 初始目录结构说明

```shell
.
├── node_modules # 第三⽅包存储⽬录
├── public # 静态资源⽬录，任何放置在 public ⽂件夹的静态资源都会被简单的复制，⽽不经过 webpack
│ ├── favicon.ico
│ └── index.html
├── src
│ ├── assets # 公共资源⽬录，放图⽚等资源
│ ├── components # 公共组件⽬录
│ ├── router # 路由相关模块
│ ├── store # 容器相关模块
│ ├── views # 路由⻚⾯组件存储⽬录
│ ├── App.vue # 根组件，最终被替换渲染到 index.html ⻚⾯中 #app ⼊⼝节点
│ ├── main.ts # 整个项⽬的启动⼊⼝模块
│ ├── shims-tsx.d.ts # ⽀持以 .tsc 结尾的⽂件，在 Vue 项⽬中编写 jsx 代码
│ └── shims-vue.d.ts # 让 TypeScript 识别 .vue 模块
├── .browserslistrc # 指定了项⽬的⽬标浏览器的范围。这个值会被 @babel/preset-env 和 Autoprefixer ⽤来确定需要转译的 JavaScript 特性和需要添加的 CSS 浏览器前缀
├── .editorconfig # EditorConfig 帮助开发⼈员定义和维护跨编辑器（或IDE）的统⼀的代码⻛格
├── .eslintrc.js # ESLint 的配置⽂件
├── .gitignore # Git 的忽略配置⽂件，告诉Git项⽬中要忽略的⽂件或⽂件夹
├── README.md # 说明⽂档
├── babel.config.js # Babel 配置⽂件
├── package-lock.json # 记录安装时的包的版本号，以保证⾃⼰或其他⼈在 npm i nstall 时⼤家的依赖能保证⼀致
├── package.json # 包说明⽂件，记录了项⽬中使⽤到的第三⽅包依赖信息等内容
└── tsconfig.json # TypeScript 配置⽂件
```

### 调整初始目录结构

默认⽣成的⽬录结构不满⾜我们的开发需求，所以需要做⼀些⾃定义改动。

这⾥主要处理下⾯的内容：

- 删除初始化的默认⽂件
- 新增调整我们需要的⽬录结构

修改`App.vue`:

在 style 标签上添加 scoped 作用域防止当前组件的样式污染其它组件。实现原理：vue 通过 postcss 给每个 dom 元素添加一个以 data-开头 的随机自定义属性实现的

```vue
<template>
  <div id="app">
    <h1>时光海</h1>
    <!-- 跟路由出口 -->
    <router-view/>
  </div>
</template>

<style lang="scss" scoped></style>
```

修改 `router/index.ts`:

```typescript
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

// 路由配置规则
const routes: Array<RouteConfig> = [
]

const router = new VueRouter({
  routes
})

export default router
```

删除默认示例⽂件：

- src/views/About.vue
- src/views/Home.vue
- src/components/HelloWorld.vue
- src/assets/logo.png

创建以下内容：

- src/services ⽬录，接⼝模块
- src/utils ⽬录，存储⼀些⼯具模块
- src/styles ⽬录，存储⼀些样式资源

调整之后的⽬录结构如下。

```shell
.
├── public
│ ├── favicon.ico
│ └── index.html
├── src
│ ├── assets
│ ├── components
│ ├── router
│ ├── services
│ ├── store
│ ├── styles
│ ├── utils
│ ├── views
│ ├── App.vue
│ ├── main.ts
│ ├── shims-tsx.d.ts
│ └── shims-vue.d.ts
├── .browserslistrc
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── README.md
├── babel.config.js
├── package-lock.json
├── package.json
└── tsconfig.json
```

## 21.2 代码规范 和 ESLint

### 代码规范介绍

不管是多⼈合作还是个⼈项⽬，代码规范都是很重要的。这样做不仅可以很⼤程度地避免基本语法错误，也保证了代码的可读性

这⾥主要说明以下⼏点：

- 代码格式规范介绍
- 我们项⽬中配置的具体代码规范是什么
- 遇到代码格式规范错误怎么办
- 如何⾃定义代码格式校验规范

良好的代码格式规范更有利于：

- 更好的多⼈协作
- 更好的阅读
- 更好的维护

### 标准是什么

没有绝对的标准，下⾯是⼀些⼤⼚商根据多数开发者的编码习惯制定的⼀些编码规范：

- [JavaScript Standard Style](https://standardjs.com/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

这里我介绍我比较喜欢的 JavaScript Standard Style：

- **使用两个空格** – 进行缩进
- **字符串使用单引号** – 需要转义的地方除外
- **不再有冗余的变量** – 这是导致 大量 bug 的源头!
- **无分号** – [这没什么不好。不骗你！](https://www.youtube.com/watch?v=gsfbh17Ax9I)
- **行首不要以  `(`, `[`, or `` ` 开头**
  - 这是省略分号时**唯一**会造成问题的地方 – 工具里已加了自动检测！
  - [详情](https://standardjs.com/rules-zhcn.html#semicolons)
- **关键字后加空格** `if (condition) { ... }`
- **函数名后加空格** `function name (arg) { ... }`
- 坚持使用全等 `===` 摒弃 `==` 一但在需要检查 `null || undefined` 时可以使用 `obj == null`
- 一定要处理 Node.js 中错误回调传递进来的 `err` 参数
- 使用浏览器全局变量时加上 `window` 前缀 – `document` 和 `navigator` 除外
  - 避免无意中使用到了这些命名看上去很普通的全局变量， `open`, `length`, `event` 还有 `name`

### 如何约束代码规范

只靠⼝头约定肯定是不⾏的，所以要利⽤⼯具来强制执⾏

- [JSLint](https://jslint.com/)
- [JSHint](https://jshint.com/)
- [ESLint](https://cn.eslint.org/)

![iShot2021-04-21 19.28.43](https://public.shiguanghai.top/blog_img/iShot2021-04-21%2019.19.28-0019d4XxE.png)

![iShot2021-04-21 19.21.58](https://public.shiguanghai.top/blog_img/iShot2021-04-21%2019.26.45m9QrIX.png)

### 项目中的代码规范是什么

ESLint 的配置文件 `.eslintrc.js`

```js
module.exports = {
  root: true,
  env: {
    node: true
  },
  // 使用插件的编码规则
  extends: [
    'plugin:vue/essential', // eslint-plugin-vue
    '@vue/standard', // @vue/eslint-config-standard
    '@vue/typescript/recommended' // @vue/eslint-config-typescript
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  // 自定义编码校验规则
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
```

- [**Eslint-plugin-vue**](https://eslint.vuejs.org/) - Vue.js 官方开发的一个插件。专门用于将 ESLint 适配到 Vue 项目当中，校验 `.vue` 单文件组件中 `<template>`、`<script>` 的代码格式规范
  - 找到语法错误
  - 找到 [**Vue 指令**](https://cn.vuejs.org/v2/api/#%E6%8C%87%E4%BB%A4) 的错误使用
  - 找到 [**Vue 风格指南**](https://cn.vuejs.org/v2/style-guide) 的侵害
- [**@vue/eslint-config-standard**](https://github.com/vuejs/eslint-config-standard#readme) - 内部使用 standard 的[校验规则](https://standardjs.com/)。
- [**@vue/eslint-config-typescript**](https://github.com/vuejs/eslint-config-typescript#readme) - 兼容 ESLint 的 typeScript 的[校验规则](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules)。这里只要求 recommended

### 如何自定义代码格式校验规范

编码规范只是一个参考，我们在实际使用过程当中还要根据自己的需要做一些灵活的配置来满足自己的需求

```js
// 自定义编码校验规则
rules: {
  'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
}
```

**[Configuring Rules](https://cn.eslint.org/docs/user-guide/configuring#configuring-rules)：**

ESLint 附带有大量的规则。你可以使用注释或配置文件修改你项目中要使用的规则。要改变一个规则设置，你必须将规则 ID 设置为下列值之一：

- `"off"` 或 `0` - 关闭规则
- `"warn"` 或 `1` - 开启规则，使用警告级别的错误：`warn` (不会导致程序退出)
- `"error"` 或 `2` - 开启规则，使用错误级别的错误：`error` (当被触发的时候，程序会退出)

```typescript
<script lang="ts">
import Vue from 'vue'

const foo = 'bar';
// console.log(foo)

export default Vue.extend({
  name: 'App'
})
</script>
```

![image-20210424181907933](https://public.shiguanghai.top/blog_img/image-20210424181907933kacxSa.png)

对于 semicolon，它要求我们不能使用分号。如果我们想关闭这个规则该如何去做呢？

我们看到 semicolon 规则后面有一个 **semi** 的灰色代号，我们打开 `.eslintrc`

```js
// 自定义编码校验规则
rules: {
  'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  'semi': 'off'
}
```

重启服务 `npm run serve` 生效，加不加 `;` 都不会报错

此时我们有一个新的需求：我们想必须加 `;`，否则就会报错，该怎么做呢？这需要这个规则支持这个配置

**[Rules](https://cn.eslint.org/docs/rules/)：**

找到对应的规则 [semi](https://cn.eslint.org/docs/rules/semi)

- `"always"` (默认) 要求在语句末尾使用分号
- `"never"` 禁止在语句末尾使用分号 (除了消除以 `[`、`(`、`/`、`+` 或 `-` 开始的语句的歧义)

```js
// 自定义编码校验规则
rules: {
  'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  'semi': ['err', 'always']
}
```

清空 `node_modules/.cache` 的缓存，重启服务 `npm run serve` 生效

最后，针对于项目中的 TypeScript 代码如何禁止规则或者配置规则，则可以通过到对应 [校验规则列表](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules) 查找并参照修改

> 更多有关 ESLint 相关的知识，诸如怎么配置 env 环境、怎么配置注释以及怎么结合 GitHooks 等可以参考我的文章 [规范化标准](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96%E5%AE%9E%E6%88%98/%E8%A7%84%E8%8C%83%E5%8C%96%E6%A0%87%E5%87%86.html)

## 21.3 样式处理

### 导入 Element 组件库

Element，⼀套为开发者、设计师和产品经理准备的基于 Vue 的桌⾯端组件库。

- [官⽹](https://element.eleme.cn/)
- [GitHub 仓库](https://github.com/ElemeFE/element)

1. 安装 element-ui

   ```shell
   npm i element-ui
   ```

2. 在 `main.ts` 中导入配置

   ```typescript
   import Vue from 'vue'
   import App from './App.vue'
   import router from './router'
   import store from './store'
   import ElementUI from 'element-ui'
   import 'element-ui/lib/theme-chalk/index.css'
   
   Vue.use(ElementUI)
   
   Vue.config.productionTip = false
   
   new Vue({
     router,
     store,
     render: h => h(App)
   }).$mount('#app')
   ```

3. 测试使用 `App.vue`

   ```vue
   <template>
     <div id="app">
       <h1>时光海</h1>
       <!-- 根路由出口 -->
       <router-view/>
       <el-row>
         <el-button>默认按钮</el-button>
         <el-button type="primary">主要按钮</el-button>
         <el-button type="success">成功按钮</el-button>
         <el-button type="info">信息按钮</el-button>
         <el-button type="warning">警告按钮</el-button>
         <el-button type="danger">危险按钮</el-button>
       </el-row>
     </div>
   </template>
   ```

   ![image-20210424195253186](https://public.shiguanghai.top/blog_img/image-20210424195253186fHkE5p.png)

### 自定义 element-ui 样式

![iShot2021-04-21 19.21.58](https://public.shiguanghai.top/blog_img/iShot2021-04-21%2019.26.456lujh2.png)

```shell
src/styles
├── index.scss # 全局样式（在⼊⼝模块被加载⽣效）
├── mixin.scss # 公共的 mixin 混⼊（可以把重复的样式封装为 mixin 混⼊到复⽤ 的地⽅）
├── reset.scss # 重置基础样式
└── variables.scss # 公共样式变量
```

`variables.scss`

```scss
$primary-color: #40586F; // 主要
$success-color: #51cf66; // 成功
$warning-color: #fcc419; // 警告
$danger-color: #ff6b6b; // 危险
$info-color: #868e96; // 信息 #22b8cf;

$body-bg: #E9EEF3; // #f5f5f9;

$sidebar-bg: #F8F9FB;
$navbar-bg: #F8F9FB;

$font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helve tica, Arial, sans-serif;
```

`index.scss`

```scss
@import './variables.scss';

// globals
html {
  font-family: $font-family;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  // better Font Rendering
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background-color: $body-bg;
}

// custom element theme
$--color-primary: $primary-color;
$--color-success: $success-color;
$--color-warning: $warning-color;
$--color-danger: $danger-color;
$--color-info: $info-color;
// change font path, required
$--font-path: '~element-ui/lib/theme-chalk/fonts';
// import element default theme
@import '~element-ui/packages/theme-chalk/src/index';
// node_modules/element-ui/packages/theme-chalk/src/common/var.scss

// overrides

// .el-menu-item, .el-submenu__title {
//   height: 50px;
//   line-height: 50px;
// }

.el-pagination {
  color: #868e96;
}

// components

.status {
  display: inline-block;
  cursor: pointer;
  width: .875rem;
  height: .875rem;
  vertical-align: middle;
  border-radius: 50%;

  &-primary {
    background: $--color-primary;
  }

  &-success {
    background: $--color-success;
  }

  &-warning {
    background: $--color-warning;
  }

  &-danger {
    background: $--color-danger;
  }

  &-info {
    background: $--color-info;
  }
}
```

`main.ts`

```typescript
// import 'element-ui/lib/theme-chalk/index.css'

// 加载全局样式
import './styles/index.scss'
```

由于 `index.scss` 中已经加载了 element-ui 的样式模块，因此入口中就不需要加载了

### 共享全局样式变量

我们要使用 `variables.scss` 的样式

```vue
<template>
  <div id="app">
    <h1>时光海</h1>
    <!-- 根路由出口 -->
    <router-view/>

    <p class="text">hello world</p>
  </div>
</template>
...
<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.text {
  color: $success-color;
}
</style>
```

![image-20210424225104568](https://public.shiguanghai.top/blog_img/image-20210424225104568oxxdWO.png)

如果每次使用都要使用 import 加载比较麻烦，我们希望把 `variables.scss` 注入到所有组件当中，每个组件就都可以直接使用变量了。可以参考 [向预处理器 Loader 传递选项](https://cli.vuejs.org/zh/guide/css.html#%E5%90%91%E9%A2%84%E5%A4%84%E7%90%86%E5%99%A8-loader-%E4%BC%A0%E9%80%92%E9%80%89%E9%A1%B9)

> 有的时候你想要向 webpack 的预处理器 loader 传递选项。你可以使用 `vue.config.js` 中的 `css.loaderOptions` 选项

在项目根目录下添加 `vue.config.js` 配置文件

```js
module.exports = {
  css: {
    loaderOptions: {
      // 默认情况下 `sass` 选项会同时对 `sass` 和 `scss` 语法同时生效
      // 因为 `scss` 语法在内部也是由 sass-loader 处理的
      // 但是在配置 `prependData` 选项的时候
      // `scss` 语法会要求语句结尾必须有分号，`sass` 则要求必须没有分号
      // 在这种情况下，我们可以使用 `scss` 选项，对 `scss` 语法进行单独配置
      scss: {
        prependData: `@import "~@/styles/variables.scss";`
      }
    }
  }
}
```

修改 `App.vue`

```vue
<style lang="scss" scoped>
.text {
  color: $success-color;
}
</style>
```

至此，我们就可以在任何组件当中直接使用全局样式变量了

## 21.4 和服务器的交互 - 接口处理

### 基础逻辑

在 `vue-element-admin` 中，⼀个完整的前端 UI 交互到服务端处理流程是这样的：

1. UI 组件交互操作
2. 调⽤统⼀管理的 api service 请求函数
3. 使⽤封装的 request.js 发送请求
4. 获取服务端返回
5. 更新 data

从上⾯的流程可以看出，为了⽅便管理维护，统⼀的请求处理都放在 `@/api` ⽂件夹中，并且⼀般按照 model 纬度进⾏拆分⽂件，如：

```shell
api/
  login.js
  article.js
  remoteSearch.js
  ...
```

### 服务端接口说明

后台为我们提供了数据接口，分别是：

- [http://eduboss.lagou.com](http://eduboss.lagou.com/boss/doc.html#/home)：后台管理的数据接口
- [http://edufront.lagou.com](http://edufront.lagou.com/front/doc.html#/home)：前台相关的数据接口

这两个接口都没有提供 CORS 跨域请求，所以需要在客户端配置服务端代理处理跨域请求

### 接口跨域问题

平时被问到最多的问题还是关于跨域的，其实跨域问题真的不是⼀个很难解决的问题。这⾥我来简单总结⼀下⼏种跨域解决⽅案

我最推荐的⽅式就是： CORS 全称为 Cross Origin Resource Sharing（跨域资源共享）。这种⽅案对于前端来说没有什么⼯作量，和正常发送请求写法上没有任何区别，⼯作量基本都在后端这⾥。每⼀次请求，浏览器必须先以 options 请求⽅式发送⼀个预请求（[也不是所有请求都会发送 options](https://panjiachen.github.io/awesome-bookmarks/blog/cs.html#cors)），通过预检请求从⽽获知服务器端对跨源请求⽀持的 HTTP ⽅法。在确认服务器允许该跨源请求的情况下，再以实际的 HTTP 请求⽅法发送那个真正的请求。推荐的原因是：只要第⼀次配好了，之后不管有多少接⼝和项⽬复⽤就可以了，⼀劳永逸的解决了跨域问题，⽽且不管是开发环境还是正式环境都能⽅便的使⽤。详细 [MDN ⽂档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)

但总有后端觉得麻烦不想这么搞，那纯前端也是有解决⽅案的：

在 `dev` 开发模式下可以下使⽤ webpack 的 `proxy`，[参照⽂档](https://www.webpackjs.com/configuration/dev-server/#devserver-proxy)。但这种⽅法在⽣产环境是不能使⽤的，在⽣产环境中需要使⽤ `nginx` 进⾏反向代理。不管是 `proxy` 还是 `nginx` 的原理都是⼀样的，通过搭建⼀个中转服务器来转发请求规避跨域的问题

![image-20210425212646869](https://public.shiguanghai.top/blog_img/image-20210425212646869ew9fCA.png)

配置客户端层⾯的服务端代理跨域可以参考官⽅⽂档中的说明：

- [Vue CLI 官方文档：devServer.proxy](https://cli.vuejs.org/zh/config/#devserver-proxy)
- [devServer 使用了非常强大的 http-proxy-middleware 包](https://github.com/chimurai/http-proxy-middleware)

下面是具体操作流程：

 `vue.config.js` 配置文件

```js
module.exports = {
  ...
  devServer: {
    proxy: {
      '/boss': {
        target: 'http://eduboss.lagou.com',
        // changeOrigin: true 以实际代理请求的主机名请求
        // 设置请求头中的 host 为 target，防⽌后端反向代理服务器⽆法识别
        changeOrigin: true
      },
      '/front': {
        target: 'http://edufront.lagou.com',
        changeOrigin: true
      }
    }
  }
}
```

重启服务器 `npm run serve`，测试：

- [http://localhost:8080/boss/doc.html#/home](http://localhost:8080/boss/doc.html#/home)
- [http://localhost:8080/front/doc.html#/home](http://localhost:8080/front/doc.html#/home)

### 封装请求模块

安装 axios：

```shell
npm i axios
```

创建 `src/utils/request.ts`：

```js
import axios from 'axios'

const request = axios.create({
  // 配置选项
  // baseURL
  // timeout
})

// 请求拦截器

// 相应拦截器

export default request
```

`App.vue` 测试功能

```vue
<script lang="ts">
import Vue from 'vue'
import request from '@/utils/request'

request({
  method: 'GET',
  url: '/boss/doc.html#/home'
}).then(res => {
  console.log(res)
})

export default Vue.extend({
  name: 'App'
})
</script>
```

![image-20210425215248291](https://public.shiguanghai.top/blog_img/image-20210425215248291xrMP9F.png)