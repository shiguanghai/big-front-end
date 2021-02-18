---
title: NuxtJS 基础
date: 2021-01-03 21:56:25
sidebar: 'auto'
tags:
 - Vue.js
 - Part3·Vue.js 框架源码与进阶
 - 服务端渲染
 - NuxtJS
categories:
 - 大前端
publish: true 
isShowComments: false
---


## 10.1 NuxtJS 介绍
### NuxtJS 是什么
- [英文官网](https://zh.nuxtjs.org/)
- [中文官网](https://www.nuxtjs.cn/)
- [GitHub 仓库](https://github.com/nuxt/nuxt.js)

Nuxt.js 是一个基于 Vue.js 的第三方开源服务端渲染应用框架，它可以帮我们轻松的实现同构应用。

通过对客户端/服务端基础架构的抽象组织，Nuxt.js 主要关注的是应用的 **UI渲染**。

我们的目标是创建一个灵活的应用框架，你可以基于它初始化新项目的基础结构代码，或者在已有 Node.js 项目中使用 Nuxt.js。

Nuxt.js 预设了利用 Vue.js 开发**服务端渲染**的应用所需要的各种配置。

除此之外，我们还提供了一种命令叫：`nuxt generate` ，为基于 Vue.js 的应用提供生成对应的静态站点的功能。

我们相信这个命令所提供的功能，是向开发集成各种微服务（Microservices）的 Web 应用迈开的一步。

作为框架，Nuxt.js 为 `客户端/服务端` 这种典型的应用架构模式提供了许多有用的特性，例如异步数据加载、中间件支持、布局支持等非常实用的功能。

### NuxtJS 框架是如何运作的
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201229175358309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

Nuxt.js 集成了以下组件/框架，用于开发完整而强大的 Web 应用：

- Vue.js
- Vue Router
- Vuex
- Vue Server Renderer

压缩并 gzip 后，总代码大小为：**57kb** （如果使用了 Vuex 特性的话为 60kb）。

另外，Nuxt.js 使用 [Webpack](https://github.com/webpack/webpack) 和 [vue-loader](https://github.com/vuejs/vue-loader) 、 [babel-loader](https://github.com/babel/babel-loader) 来处理代码的自动化构建工作（如打包、代码分层、压缩等等）。

### NuxtJS 特性
- 基于 Vue.js
	* Vue、Vue Router、Vuex、Vue SSR
- 自动代码分层
- 服务端渲染
- 强大的路由功能，支持异步数据
- 静态文件服务
- ES2015+ 语法支持
- 打包和压缩 JS 和 CSS
- HTML 头部标签管理
- 本地开发支持热加载
- 集成 ESLint
- 支持各种样式预处理器： SASS、LESS、 Stylus 等等
- 支持 HTTP/2 推送

### NuxtJS 渲染流程
下图阐述了 Nuxt.js 应用一个完整的服务器请求到渲染（或用户通过 `<nuxt-link>` 切换路由渲染页面）的流程：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201229192855778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### NuxtJS 使用方式
- 初始项目
- 已有的 Node.js 服务端项目
	* 直接把 Nuxt 当作一个中间件集成到 Node Web Server 中
- 现有的 Vue.js 项目
	* 非常熟悉 Nuxt.js
	* 至少百分之 10 的代码改动

## 10.2 初始化 NuxtJS
Nuxt 提供了两种方式用来创建项目：

- [官方文档](https://www.nuxtjs.cn/guide/installation#%E4%BB%8E%E5%A4%B4%E5%BC%80%E5%A7%8B%E6%96%B0%E5%BB%BA%E9%A1%B9%E7%9B%AE)
	* 使用 create-nuxt-app 脚手架工具
	* 手动创建

> 为了让大家有一个更好的学习效果，这里我们通过手动创建的方式来学习 Nuxt。

**(1) 准备**
```shell
# 创建示例项目
mkdir nuxt-app-demo

# 进入示例项目目录中
cd nuxt-app-demo

# 初始化 package.json 文件
npm init -y

# 安装 nuxt
npm install nuxt
```

在 `package.json` 文件的 `scripts` 中新增：
```js
"scripts": {
  "dev": "nuxt"
}
```
上面的配置使得我们可以通过运行 `npm run dev` 来运行 `nuxt` 。

**(2) 创建页面并启动项目**

创建 `pages` 目录：
```shell
mkdir pages
```

创建我们的第一个页面的 `pages/index.vue`：
```js
<template>
  <h1>Hello world!</h1>
</template>
```

然后启动项目：
```shell
npm run dev
```

现在我们的应用运行在 `http://localhost:3000` 上运行。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103170145113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

> 注意：Nuxt.js 会监听 pages 目录中的文件更改，因此在添加新页面时无需重新启动应用程序。

(3) Nuxt 中的基础路由

Nuxt.js 会根据 `pages` 目录中的所有 `*.vue` 文件生成应用的路由配置。

## 10.3 NuxtJS 路由
Nuxt.js 依据 `pages` 目录结构自动生成 [vue-router](https://github.com/vuejs/vue-router) 模块的路由配置。
### 基础路由
- [Nuxt.js 官方文档](https://www.nuxtjs.cn/guide/routing#%E5%9F%BA%E7%A1%80%E8%B7%AF%E7%94%B1)

假设 `pages` 的目录结构如下：
```
pages/
--| user/
-----| index.vue
-----| one.vue
--| index.vue
```

那么，Nuxt.js 自动生成的路由配置如下：
```js
router: {
  routes: [
    {
      name: 'index',
      path: '/',
  	  component: 'pages/index.vue'
  	},
  	{
  	  name: 'user',
  	  path: '/user',
  	  component: 'pages/user/index.vue'
  	},
  	{
  	  name: 'user-one',
  	  path: '/user/one',
  	  component: 'pages/user/one.vue'
  	}
  ]
}
```
### 路由导航
- a 标签
	* 它会刷新整个页面，不要使用
- `<nuxt-link>` 组件
	* [https://router.vuejs.org/zh/api/#router-link-props](https://router.vuejs.org/zh/api/#router-link-props)
- 编程式导航
	* [https://router.vuejs.org/zh/guide/essentials/navigation.html](https://router.vuejs.org/zh/guide/essentials/navigation.html)

```js
<template>
  <div>
    <h1>About page</h1>
    <!-- a 链接，刷新导航，走服务端渲染 -->
    <h2>a 链接</h2>
    <a href="/">首页</a>

    <!-- router-link 导航链接组件 -->
    <h2>router-link</h2>
    <router-link to="/">首页</router-link>

    <!-- 编程式导航 -->
    <h2>编程式导航</h2>
    <button @click="onClick">首页</button>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  methods: {
    onClick () {
      this.$router.push('/')
    }
  }
}
</script>
```
### 动态路由
- 官方文档
	* [Vue Router 动态路由](https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#%E5%8A%A8%E6%80%81%E8%B7%AF%E7%94%B1%E5%8C%B9%E9%85%8D)
	* [Nuxt.js 动态路由](https://www.nuxtjs.cn/guide/routing#%E5%8A%A8%E6%80%81%E8%B7%AF%E7%94%B1)

在 Nuxt.js 里面定义带参数的动态路由，需要创建对应的**以下划线作为前缀**的 Vue 文件 或 目录。

以下目录结构：
```
pages/
--| _slug/
-----| comments.vue
-----| index.vue
--| users/
-----| _id.vue
--| index.vue
```

Nuxt.js 生成对应的路由配置表为：
```js
router: {
  routes: [
    {
      name: 'index',
      path: '/',
      component: 'pages/index.vue'
    },
    {
      name: 'users-id',
      path: '/users/:id?',
      component: 'pages/users/_id.vue'
    },
    {
      name: 'slug',
      path: '/:slug',
      component: 'pages/_slug/index.vue'
    },
    {
      name: 'slug-comments',
      path: '/:slug/comments',
      component: 'pages/_slug/comments.vue'
    }
  ]
}
```

```js
// pages/user/_id.vue

<template>
  <div>
    <h1>User Pages</h1>
  </div>
</template>

<script>
export default {
  name: 'UserPage'
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103170425415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103170441368.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103170511510.png)

你会发现名称为 `users-id` 的路由路径带有 `:id?` 参数，表示该路由是可选的。如果你想将它设置为必选的路由，需要在 `users/_id` 目录内创建一个 `index.vue` 文件。

我们也可以获取到动态路由参数：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103170829783.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

```js
<template>
  <div>
    <h1>User Pages</h1>
    <h2>{{ $route.params.id }}</h2>
  </div>
</template>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103171026953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 嵌套路由
- 官方文档
	* [Vue Router 嵌套路由](https://router.vuejs.org/zh/guide/essentials/nested-routes.html)
	* [Nuxt.js 嵌套路由](https://www.nuxtjs.cn/guide/routing#%E5%B5%8C%E5%A5%97%E8%B7%AF%E7%94%B1)

你可以通过 vue-router 的子路由创建 Nuxt.js 应用的嵌套路由。

创建内嵌子路由，你需要添加一个 Vue 文件，同时添加一个**与该文件同名**的目录用来存放子视图组件。

> **Warning:** 别忘了在父组件( `.vue` 文件) 内增加 `<nuxt-child/>` 用于显示子视图内容。

假设文件结构如：
```
pages/
--| users/
-----| _id.vue
-----| index.vue
--| users.vue
```

Nuxt.js 自动生成的路由配置如下：
```js
router: {
  routes: [
    {
      path: '/users',
      component: 'pages/users.vue',
      children: [
        {
          path: '',
          component: 'pages/users/index.vue',
          name: 'users'
        },
        {
          path: ':id',
          component: 'pages/users/_id.vue',
          name: 'users-id'
        }
      ]
    }
  ]
}
```

### 自定义路由配置
- [官方文档](https://zh.nuxtjs.org/docs/2.x/configuration-glossary/configuration-router/)

这里举几个例子：
```js
// nuxt.config.js

/**
 * Nuxt.js 配置文件
 */

module.exports = {
  router: {
    base: '/abc'
  }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103173609466.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
```js
module.exports = {
  router: {
    base: '/abc',
    // routes: 一个数组，路由配置表
    // resolve: 解析路由组件路径
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'hello',
        path: '/hello',
        component: resolve(__dirname, 'pages/about.vue')
      })
    }
  }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010317434713.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 10.4 NuxtJS 视图
### 概述
[官方文档](https://www.nuxtjs.cn/guide/views)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201229191429921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

在 NuxtJS 中页面结构一般由三部分组成：

1. 第一部分是最外层的文档页面，也就是单页面或者说服务端渲染的HTML页面。
2. 在HTML 页面里面包裹着 Layout布局组件（可选），相当于所有页面的父路由。
3. 再往里面是页面组件，每个页面组件有自己额外的成员方法，包括页面的子组件之类的可选内容。

### 模板
你可以定制化 Nuxt.js 默认的应用模板。

定制化默认的 html 模板，只需要在 `src` 文件夹下（默认是应用根目录）创建一个 `app.html` 的文件。

默认模板为：
```html
<!DOCTYPE html>
<html {{ HTML_ATTRS }}>
  <head {{ HEAD_ATTRS }}>
    {{ HEAD }}
  </head>
  <body {{ BODY_ATTRS }}>
    {{ APP }}
  </body>
</html>
```
修改为
```html
// app.html

<!DOCTYPE html>
<html {{ HTML_ATTRS }}>
  <head {{ HEAD_ATTRS }}>
    {{ HEAD }}
  </head>
  <body {{ BODY_ATTRS }}>
    <!-- 渲染的内容最终会注入到这里 -->
    <h1>app.html</h1>
    {{ APP }}
  </body>
</html>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103201409716.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010320143051.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 布局
Nuxt.js 允许你扩展默认的布局，或在 `layout` 目录下创建自定义的布局。

可通过添加 `layouts/default.vue` 文件来扩展应用的默认布局。

> **提示**: 别忘了在布局文件中添加 <nuxt/> 组件用于显示页面的主体内容。

默认布局的源码如下：
```js
<template>
  <nuxt />
</template>
```
```js
// layouts/default.vue
// 一旦使用，默认所有页面都会作用，不能取消，只能更改

<template>
  <div>
    <h1>layouts/default.vue 组件</h1>
    <!-- 页面出口，类似于子路由出口 -->
    <nuxt />
  </div>
</template>

<script>
export default {
  name: 'LayoutDefault'
}
</script>
```
然后我们必须告诉页面 (即`pages/index.vue`) 使用您的自定义布局：
```js
<template>
  <h1>Hello world!</h1>
</template>

<script>
export default {
  name: 'HomePage',
  // 默认 default 可修改
  layout: 'default'
}
</script>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103202136892.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103202255599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 10.5 NuxtJS 异步数据
Nuxt.js 扩展了 Vue.js，增加了一个叫 `asyncData` 的方法，使得我们可以在设置组件的数据之前能异步获取或处理数据。

[官方文档](https://www.nuxtjs.cn/guide/async-data)
### asyncData
我们先来增加一个数据：
```js
// static/data.json

{
  "posts": [
    {
      "id": 1,
      "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
    },
    {
      "id": 2,
      "title": "qui est esse",
      "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
    },
    {
      "id": 3,
      "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
      "body": "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
    },
    {
      "id": 4,
      "title": "eum et est occaecati",
      "body": "ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit"
    },
    {
      "id": 5,
      "title": "nesciunt quas odio",
      "body": "repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque"
    }
  ],
  "title": "拉勾教育"
}
```
NuxtJS默认在Web服务中将数据暴露出来，可以直接通过 `.../data.json` 获取数据
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103203746765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

假设想在首页直接获取数据（服务端获取异步数据）：

```shell
npm i axios
```
```js
// pages/index.vue

<script>
import axios from 'axios'

export default {
  name: 'HomePage',
  layout: 'default',
  async asyncData () {
    console.log('asyncData')
    console.log(this)
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/abc/data.json'
    })
    return res.data
  },
  data () {
    return {
      foo: 'bar'
    }
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103204535145.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

通过查看发现，它会将 asyncData 返回的数据融合组件 data 方法返回数据并一并给组件。

在页面中使用数据：
```js
// pages/index.vue

<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>
```

我们可以看到 `console.log('asyncData')` 执行的时机是在服务端（Nuxt SSR包裹起来在客户端），同时可以通过 `console.log(this)` 看到 this 返回值为undefined，因为它是在组件初始化之前被调用的。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103205058238.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**注意**：asyncData 方法除了会在服务端渲染期间来运行，还会在客户端路由导航之前运行

我们通过添加一个链接跳转来查看：
```js
// pages/index.vue

<template>
  <div>
    <h1>{{ title }}</h1>
    <nuxt-link to="/about">About</nuxt-link>
  </div>
</template>
```
我们先通过链接进入about再从about返回index发现：`asyncData`输出两次（第一次服务端首屏渲染，第二次客户端调用）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103205731606.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

也就是说：服务端首屏渲染既能确保异步数据能在渲染到客户端之前已经被渲染好（提高首屏渲染速度，有利于SEO）。达到页面后又变成SPA客户端应用，同样可以被调用从而更新数据。

接下来，我们来创建一个非页面组件，看看它能否在非页面组件中使用：
```js
// components/Foo.vue

<template>
  <div>
    <h1>FooPage</h1>
	<p>{{ foo }}</p>
  </div>
</template>

<script>
export default {
  name: 'FooPage',
  async asyncData () {
    console.log('foo asyncData')
    return {
      foo: 'bar'
    }
  }
}
</script>
```
```js
// pages/index.vue

<template>
  <div>
    ...
    <br>
    <foo :posts="posts" />    
  </div>
</template>

<script>
...
import Foo from '@/components/Foo'

export default {
  name: 'HomePage',
  layout: 'default',
  components: {
    Foo
  }
  ...
}
</script>
```
保存过后报错：foo未定义，`console.log('foo asyncData')`也并未调用。因此证明非页面组件并不会调用asyncData。

因此我们通过页面组件获取动态数据再传给子组件：
```js
// components/Foo.vue

<template>
  <div>
    <h1>FooPage</h1>
    <ul>
      <li
        v-for="item in posts"
        :key="item.id"
      >
      {{ item.title }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'FooPage',
  props: ['posts'],
  // asyncData 只能在页面组件中使用
  // async asyncData () {
  //   console.log('foo asyncData')
  //   return {
  //     foo: 'bar'
  //   }
  // }
}
</script>
```
```js
// pages/index.vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <nuxt-link to="/about">About</nuxt-link>
    <br>
    <foo :posts="posts" />    
  </div>
</template>

<script>
import axios from 'axios'
import Foo from '@/components/Foo'

export default {
  name: 'HomePage',
  layout: 'default',
  components: {
    Foo
  },
  // 当你想要动态页面内容有利于 SEO
  // 或者是提升首屏渲染速度的时候，
  // 就在 asyncData 中发请求拿数据
  async asyncData () {
    console.log('asyncData')
    console.log(this)
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/abc/data.json'
    })
    return res.data
  },

  // 如果是非异步数据或者普通数据，则正常的初始化到 data 中即可
  data () {
    return {
      foo: 'bar'
    }
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103213629498.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)


**总结**：

- 基本用法
	* 它会将 asyncData 返回的数据融合组件 data 方法返回数据并一并给组件
	* 调用时机：服务端渲染期间和客户端路由更新之前
- 注意事项
	* 只能在页面组件中使用
	* 没有 this，因为它是组件初始化之前被调用的

### 上下文对象
我们通过一个实例来理解：

```js
// components/Foo.vue

<template>
  <div>
    <h1>FooPage</h1>
    <ul>
      <li
        v-for="item in posts"
        :key="item.id"
      >
      <!-- {{ item.title }} -->
      <nuxt-link :to="'/article/' + item.id">{{ item.title }}</nuxt-link>
      </li>
    </ul>
  </div>
</template>
```
```js
// pages/article/_id.vue

<template>
  <div>
    <h1>article page</h1>
  </div>
</template>

<script>
export default {
  name: 'ArticlePage'
}
</script>
```
这里给这些文章标题加了链接，希望点击标题跳转到文章页面，所以准备了`pages/article/_id.vue` 详情页面（动态路由），希望拿到对应的id，获取文章内容展示到页面。并且要使数据有利于SEO，提高首屏渲染速度。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103213739423.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103214415324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

解决方案：

```js
// pages/article/_id.vue

<template>
  <div>
    <!-- <h1>article page</h1> -->
    <h1>{{ article.title }}</h1>
    <div>{{ article.body }}</div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ArticlePage',
  // asyncData 上下文对象
  async asyncData (context) {
    // 这里有我们需要的数据
    console.log(context)
    const { data } = await axios({
      method: 'GET',
      url: 'http://localhost:3000/data.json'
    })
    // asyncData 里面没有 this
    // 不能通过这种方式获取 id
    // console.log(this.$router.params)

    // 可以通过上下文对象的 params.id 或者 router.params.id
    // 拿到后将字符串类型转换为数字类型
    const id = Number.parseInt(context.params.id)
    return {
      article: data.posts.find(item => item.id === id)
    }
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010321533210.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210103215345733.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
[API context](https://www.nuxtjs.cn/api/context)

## 10.6 NuxtJS 生命周期
钩子函数 | 说明 | Server | Client 
--|--|--|--
beforeCreate| 在实例创建之前被调用，此时还拿不到数据和 DOM。| ✔ |✔
created |在实例创建完成后被调用，此时可以操作数据了。| ✔ |✔
beforeMount |在挂载开始之前被调用：相关的 render 函数首次被调用。| ❌| ✔
mounted| 实例被挂载后调用，此时可以执行一些初始 DOM 操作。 |❌| ✔
beforeUpdate|数据更新时调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。|❌| ✔
updated|由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。当这个钩子被调用时，组件DOM 已经更新，所以你现在可以执行依赖于 DOM 的操作。|❌| ✔
activated |被 keep-alive 缓存的组件激活时调用。 |❌| ✔
deactivated |被 keep-alive 缓存的组件停用时调用。| ❌| ✔
beforeDestroy| 实例销毁之前调用。在这一步，实例仍然完全可用。| ❌| ✔
destroyed|实例销毁后调用。该钩子被调用后，对应 Vue 实例的所有指令都被解绑，所有的事件监听器被移除，所有的子实例也都被销毁。|❌| ✔
errorCaptured |当捕获一个来自子孙组件的错误时被调用。| ✔ |✔
