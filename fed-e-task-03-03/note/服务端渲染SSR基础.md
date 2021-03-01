## 9.1 概述
随着前端技术栈和工具链的迭代成熟，前端工程化、模块化也已成为了当下的主流技术方案。在这波技术浪潮当中，涌现了诸如Angular、React、Vue等基于客户端渲染的前端框架
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102140231857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

这类框架所构造的单页面应用具有用户体验好、开发效率高、渲染性能好、可维护性好等优点。但是也带来了很大的缺陷

首先是单页面应用的 **首屏渲染时间长**：与传统服务端渲染直接获取服务端渲染好的 HTML 不同，单页应用使用 JavaScript 在客户端生成 HTML来呈现内容，用户需要等待客户端 JS 解析执行完成才能看到页面，这就使得首屏加载时间变长，从而影响用户体验。

还有一点那就是单页面应用 **不利于SEO**：当搜索引擎爬取网站 HTML 文件时，单页应用的 HTML 没有内容，因为他它需要通过客户端 JavaScript 解析执行才能生成网页内容，而目前的主流的搜索引擎对于这一部分内容的抓取还不是很好。

为了解决这两个缺陷，业界借鉴了传统的服务端直出 HTML 方案，提出在服务器端执行前端框架（React/Vue/Angular）代码生成网页内容，然后将渲染好的网页内容返回给客户端，客户端只需要负责展示就可以了；
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102140623623.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

当然不仅仅如此，为了获得更好的用户体验，同时会在客户端将来自服务端渲染的内容激活为一个 SPA应用，也就是说之后的页面内容交互都是通过客户端渲染处理。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102140649301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

这种方式简而言之就是：

- 通过服务端渲染首屏直出，解决首屏渲染慢以及不利于 SEO 问题
- 通过客户端渲染接管页面内容交互得到更好的用户体验
- 这种方式我们通常称之为现代化的服务端渲染，也叫同构渲染，所谓的同构指的就是服务端构建渲染 + 客户端构建渲染。同理，这种方式构建的应用称之为服务端渲染应用或者是同构应用。

## 9.2 什么是渲染
渲染指的是**把（数据 + 模板）拼接到一起**的这个事儿。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102140907673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

例如对于我们前端开发者来说最常见的一种场景就是：请求后端接口数据，然后将数据通过模板绑定语法绑定到页面中，最终呈现给用户。这个过程就是我们这里所指的渲染。

渲染本质其实就是字符串的解析替换，实现方式有很多种；但是我们这里要关注的并不是如何渲染，而是在哪里渲染的问题。

## 9.3 传统的服务端渲染
最早期，Web 页面渲染都是在服务端完成的，即服务端运行过程中将所需的数据结合页面模板渲染为HTML，响应给客户端浏览器。所以浏览器呈现出来的是直接包含内容的页面。

工作流程：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228201710252.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

首先，客户端发起一个请求，请求服务端，服务端收到请求以后执行查库操作来拿到页面对应的数据，然后把数据结合页面模板渲染为完整的 HTML，接着把渲染完毕的 HTML 发送给客户端，客户端接收到内容将其直接展示到浏览器当中。

其中，**渲染是在服务端执行的**

这种方式的代表性技术有：ASP、PHP、JSP，再到后来的一些相对高级一点的服务端框架配合一些模板引擎。

无论如何，这种方式对于没有玩儿过后端开发的小伙伴来说可能会比较陌生，所以下面通过我们前端比较熟悉的 Node.js 来了解一下这种方式。

项目介绍：

- [data.json](https://github.com/shiguanghai/big-front-end/blob/master/fed-e-task-03-03/code/3-3-2-4-%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/%E4%BC%A0%E7%BB%9F%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/data.json)，好比数据库，存储了一些数据
- [index.html](https://github.com/shiguanghai/big-front-end/blob/master/fed-e-task-03-03/code/3-3-2-4-%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/%E4%BC%A0%E7%BB%9F%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/index.html)，接下来会在服务端获取数据，将其渲染到此网页展示给用户

安装依赖：
```shell
# 创建 http 服务
npm i express

# 服务端模板引擎
npm i art-template express-art-template
```

服务端代码：

- 基本的 Web 服务
- 使用模板引擎
- 渲染一个页面

```js
// index.js

const express = require('express')
const fs = require('fs')
const template = require('art-template')
// 创建一个 express 实例
const app = express()

// 添加一个路由，当其以get请求网站根路径时触发
app.get('/', (req, res) => {
  // 1. 得到模板内容
  // readFile 是一个异步方法，readFileSync 是一个同步方法
  // 默认得到的是二进制数据，为了得到字符串可以指定utf-8编码
  const templateStr = fs.readFileSync('./index.html', 'utf-8')

  // 2. 得到数据
  // 默认得到的是字符串类型，使用JSON.parse()转换成数据对象
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'))
  
  // 3. 渲染：数据 + 模板 = 完整结果
  // 第一个参数：要渲染的模板字符串
  // 第二个参数：数据对象
  const html = template.render(templateStr, data)
  
  // 4. 把渲染结果发送给客户端
  res.send(html)
})

app.listen(3000, () => console.log('running...'))
```

客户端代码：

```html
// index.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>传统的服务端渲染</title>
</head>
<body>
  <h1>传统的服务端渲染示例</h1>
  <h2>{{ title }}</h2>
  <ul>
    {{ each posts }}
    <li>{{ $value.title }}</li>
    {{ /each }}
  </ul>   
</body>
</html>
```

```shell
node .\index.js
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102144936256.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)


我们可以看到：客户端此时收到的直接就是结果，是不包含大括号内的内容的，客户端也不需要执行任何 js 代码，拿到的就是结果，直接负责展示就可以了。

这也就是最早的网页渲染方式，也就是动态网站的核心工作步骤。在这样的一个工作过程中，因为页面中的内容不是固定的，它有一些动态的内容。

在今天看来，这种渲染模式是不合理或者说不先进的。因为在当下这种网页越来越复杂的情况下，这种模式存在很多明显的不足：

- 应用的前后端部分完全耦合在一起，在前后端协同开发方面会有非常大的阻力
- 前端没有足够的发挥空间，无法充分利用现在前端生态下的一些更优秀的方案
- 由于内容都是在服务端动态生成的，所以服务端的压力较大
- 相比目前流行的 SPA 应用来说，用户体验一般

但是不得不说，在网页应用并不复杂的情况下，这种方式也是可取的。

## 9.4 客户端渲染
### 客户端渲染 概述
传统的服务端渲染有很多问题，但是这些问题随着客户端 Ajax 技术的普及得到了有效的解决，Ajax 技术可以使得客户端动态获取数据变为可能，也就是说原本服务端渲染这件事儿也可以拿到客户端做了。

下面是基于客户端渲染的 SPA 应用的基本工作流程。

![在这里插入图片描述](https://img-blog.csdnimg.cn/202012282024376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

首先，客户端发起请求，请求网页地址，服务端返回一个空白的 HTML 页面，客户端拿到页面以后加载执行里面的脚本代码（如果有动态数据会发起AJAX请求），服务端收到请求之后进行查库相关操作，拿到数据后服务端把数据直接返回给客户端，客户端拿到数据再来渲染动态的页面内容展示给用户。

其中，**服务端只需要负责数据的处理**

通过这个示例可以了解到我们就可以把【数据处理】和【页码渲染】这两件事儿分开了，也就是【后端】负责数据处理，【前端】负责页面渲染，这种分离模式极大的提高了开发效率和可维护性。

而且这样一来，【前端】更为独立，也不再受限制于【后端】，它可以选择任意的技术方案或框架来处理页面渲染。

但是这种模式下，也会存在一些明显的不足，其中最主要的就是：

- 首屏渲染慢
- 不利于 SEO

### 为什么客户端渲染 首屏渲染慢
- 因为 HTML 中没有内容，必须等到 JavaScript 加载并执行完成才能呈现页面内容。

传统的服务端渲染是页面直出，不用再去执行 js ，也不用再去发请求。

而客户端渲染最起码要经历三次 http 请求周期：第一次是页面的请求，第二次是 js 对应的请求，第三次是动态数据请求。
### 为什么客户端渲染 不利于 SEO
```js
// 搜索引擎是怎么获取网页内容的？
const http = require('http')

// 通过程序获取指定的网页内容
// 服务端
// http.get('http://localhost:3000/', res => {
// 客户端
http.get('http://localhost:8080/', res => {
  let data = ''
  res.on('data', chunk => {
    data += chunk
  })
  res.on('end', () => {
    console.log(data)
  })
})
```
```shell
node .\index.js
```
拿到数据后，对于搜索引擎就要去分析：根据权重进行收录，如果发现新的链接就会进入另一个页面再去收录，才有可能通过打开搜索引擎搜索到你的页面。

相较于服务端，客户端需要经过解析执行js才能渲染出来所谓的网页内容。而搜索引擎的程序不是浏览器，而是一个普通的程序，它拿到的都是网页的html字符串，不会像浏览器一样再去加载解析js、发请求拿数据、再来渲染页面，它分析body发现没有内容。

- 因为 HTML 中没有内容，所以对于目前的搜索引擎爬虫来说，页面中没有任何有用的信息，自然无法提取关键词，进行索引了。
## 9.5 现代化的服务端渲染（同构渲染）
### 现代化的服务端渲染 概述
我们在上一小节了解到 SPA 应用有两个非常明显的问题：

- 首屏渲染慢
- 不利于 SEO

对于客户端渲染的 SPA 应用的问题有没有解决方案呢？

- 服务端渲染，严格来说是现代化的服务端渲染，也叫同构渲染

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201229171757297.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

也就是将客户端渲染的工作放到服务端渲染，这个问题不就解决了吗？但需要注意的是这里的服务端渲染不是让我们再回到传统的服务端渲染，本质上确实是需要使用到传统的服务端渲染，但是严格来讲应该叫现代化的服务端渲染，也叫同构渲染，也就是【服务端渲染】 + 【客户端渲染】。

**基本流程：**

- isomorphic web apps（同构应用）：isomorphic/universal，基于 React、Vue 等框架，客户端渲染和服务端渲染的结合
	* 在服务器端执行一次，用于实现服务器端渲染（首屏直出）
	* 在客户端再执行一次，用于接管页面交互
- 核心解决 SEO 和首屏渲染慢的问题
- 拥有传统服务端渲染的优点，也有客户端渲染的优点

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228203351419.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**执行流程：**

1. 客户端发起请求
2. 服务端渲染首屏内容 + 生成客户端 SPA 相关资源
3. 服务端将生成的首屏资源发送给客户端
4. 客户端直接展示服务端渲染好的首屏内容
5. 首屏中的 SPA 相关资源执行之后会激活客户端 Vue
6. 之后客户端所有的交互都由客户端 SPA 处理

**如何实现同构渲染？**

- 使用 Vue、React 等框架的官方解决方案
	* 优点：有助于理解原理
	* 缺点：需要搭建环境，比较麻烦
- 使用第三方解决方案
	* React 生态中的 Next.js
	* Vue 生态中的 Nuxt.js
	* Angular 生态中的 Angular Universal

### 通过 Nuxt 体验 同构渲染
Nuxt.js 是一个基于 Vue.js 生态开发的一个第三方服务端渲染框架，通过它我们可以轻松构建现代化的服务端渲染应用。

```shell
mkdir ssr

cd .\ssr\

npm init -y

npm i nuxt
```

```js
// package.json

"scripts": {
  ...
  "dev": "nuxt"
}
```
```js
// ssr/pages/index.vue

<template>
  <div>
    <h1>Home</h1>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
```
```shell
npm run dev
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102161251982.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

对于第一次接触 Nuxt 的小伙伴可能会感觉很神奇：并没有配置路由，页面就渲染出来了。原因是 Nuxt 会根据 pages 目录来自动生成路由配置。

**接下来来体验同构渲染：**

```shell
npm i axios
```
```js
// ssr/pages/index.vue

<template>
  <div id="app">
    <h2>{{ title }}</h2>
    <ul>
      <li
        v-for="item in posts"
        :key="item.id"
      >{{ item.title }}</li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  components: {},
  // Nuxt 中特殊提供的一个钩子函数
  // 专门用于获取页面服务端渲染的数据 
  async asyncData () {
    const { data } = await axios({
      method: 'GET',
      url: '/data.json'
    })
   
    // 这里返回的数据会和 data() {} 中的数据合并到一起给页面使用
    // return data
    return {
      title: data.title,
      posts: data.posts
    }
  } 
}
</script>

<style>

</style>
```
```js
// ssr/static/data.json

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
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102163558459.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010216423364.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102163924533.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

[项目源码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-2-4-服务端渲染/现代化的服务端渲染/ssr)

### 同构渲染的 SPA 应用
接下来还有一个问题：这个内容是服务端渲染出来的，它还是以前那个单页面应用程序（SPA）吗？

依然是，首屏渲染是通过服务端渲染出来的，之后的交互都是客户端渲染。还是刚刚的项目，来加两个链接看看是客户端渲染还是服务端渲染：
```js
// ssr/pages/about.vue

<template>
  <div>
    <h1>About</h1>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
```
```js
// ssr/layouts/default.vue
// 这个模板会作为所有页面的父模板

<template>
  <div>
    <ul>
      <li>
        <!-- 类似于 router-link，用于单页面导航 -->
        <nuxt-link to="/">Home</nuxt-link>
      </li>
      <li>
        <nuxt-link to="/about">About</nuxt-link>
      </li>
    </ul>

    <!-- 子页面出口 -->
    <nuxt />
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>
```
重启服务
```shell
npm run dev
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102165303974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210102165449361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

此时通过链接跳转页面并不会引起页面刷新，因此可以整明其还是单页面程序，即客户端渲染。

### 同构渲染问题
分析优缺点：

- 优点：首屏渲染速度快、有利于 SEO
- 缺点：
	* 开发成本高
		+ 浏览器特定的代码，只能在某些生命周期钩子函数 (lifecycle hook) 中使用；一些
外部扩展库 (external library) 可能需要特殊处理，才能在服务器渲染应用程序中运行。
		+ 涉及构建设置和部署的更多要求。与可以部署在任何静态文件服务器上的完全静态单页面应用程序(SPA) 不同，服务器渲染应用程序，需要处于 Node.js server 运行环境。
		+ 更多的服务器端负载。在 Node.js 中渲染完整的应用程序，显然会比仅仅提供静态文件的 server。
		+ 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)，因此如果你预料在高流量环境 (high traffic)下使用，请准备相应的服务器负载，并明智地采用缓存策略。
	* 涉及构建设置和部署的更多要求
		+ 与可以部署在任何静态文件服务器上的完全静态单页面应用程序 (SPA) 不同，服务器渲染应用程序，需要处于 Node.js server 运行环境。
	* 更多的服务器端负载
		+ 在 Node.js 中渲染完整的应用程序，显然会比仅仅提供静态文件的 server 更加大量占用 CPU 资源 (CPU-intensive - CPU 密集)。
		+ 因此如果你预料在高流量环境(high traffic) 下使用，请准备相应的服务器负载，并明智地采用缓存策略。
		+ 需要更多的服务端渲染优化工作处理。

在对你的应用程序使用服务器端渲染 (SSR) 之前，你应该问的第一个问题是，是否真的需要它。这主要取决于内容到达时间 (time-to-content) 对应用程序的重要程度。例如，如果你正在构建一个内部仪表盘，初始加载时的额外几百毫秒并不重要，这种情况下去使用服务器端渲染 (SSR) 将是一个小题大作之举。然而，内容到达时间 (time-to-content) 要求是绝对关键的指标，在这种情况下，服务器端渲染(SSR) 可以帮助你实现最佳的初始加载性能。

事实上，很多网站是出于效益的考虑才启用服务端渲染，性能倒是在其次。 假设 A 网站页面中有一个关键字叫“前端性能优化”，这个关键字是 JS 代码跑过一遍后添加到 HTML 页面中的。那么客户端渲染模式下，我们在搜索引擎搜索这个关键字，是找不到 A 网站的——搜索引擎只会查找现成的内容，不会帮你跑 JS 代码。A 网站的运营方见此情形，感到很头大：搜索引擎搜不出来，用户找不到我们，谁还会用我的网站呢？为了把“现成的内容”拿给搜索引擎看，A 网站不得不启用服务端渲染。 但性能在其次，不代表性能不重要。
