---
title: NuxtJS案例 - Realworld项目 - 文章/发布部署
date: 2021-01-16 00:08:19
sidebar: 'auto'
tags:
 - Vue.js
 - Part3·Vue.js 框架源码与进阶
 - NuxtJS
categories:
 - 大前端
publish: true 
isShowComments: false
---


## 11.5 文章详情
### 展示基本信息
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210111163438711.png)

请求方法：`GET `

请求地址：`/api/articles/:slug`

`api/article.js`
```js
// 获取文章详情
export const getArticle = slug => {
  return request({
    method: 'GET',
    url: `/api/articles/${slug}`
  })
}
```
`pages/article/index.vue`
```js
import { getArticles } from '@/api/article'

export default {
  name: 'ArticleIndex',
  async asyncData ({ params }) {
    const { data } = await getArticles(params.slug)
    console.log(data)
  }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210111170459261.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)



```js
export default {
  name: 'ArticleIndex',
  async asyncData ({ params }) {
    const { data } = await getArticles(params.slug)
    return {
      article: data.article
    }
  }
}
```

```js
<h1>{{ article.title }}</h1>

...
<div class="row article-content">
  <div class="col-md-12">{{ article.body }}</div>
</div>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021011117064323.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 把Markdown转为HTML
`markdown-it`：将Markdown文档转换为Html

```shell
npm install markdown-it --save
```

在文章的详情页面加载包`pages/article/index.vue`
```js
import MarkdownIt from 'markdown-it'

export default {
  name: 'ArticleIndex',
  async asyncData ({ params }) {
    const { data } = await getArticle(params.slug)
    const { article } = data
    const md = new MarkdownIt
    article.body = md.render(article.body)
    return {
      article: article
    }
  }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112205517953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

```js
<div class="row article-content">
  <div class="col-md-12" v-html="article.body"></div>
</div>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112210113851.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 展示文章作者相关信息
效果图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021011221061515.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

模板：
```js
<div class="article-meta">
  <a href=""><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
  <div class="info">
    <a href="" class="author">Eric Simons</a>
    <span class="date">January 20th</span>
  </div>
  <button class="btn btn-sm btn-outline-secondary">
    <i class="ion-plus-round"></i>
    &nbsp;
    Follow Eric Simons <span class="counter">(10)</span>
  </button>
  &nbsp;&nbsp;
  <button class="btn btn-sm btn-outline-primary">
    <i class="ion-heart"></i>
    &nbsp;
    Favorite Post <span class="counter">(29)</span>
  </button>
</div>
```
我们可以把它们封装为组件以便我们的重用：`pages/article/components/article-meta.vue`
```js
<template>
插入模板...
</template>
```
```js
export default {
  name: 'ArticleMeta'
}
```

注册组件：`pages/article/index.vue`
```js
import ArticleMeta from './components/article-meta.vue'

export default {
  ...
  components: {
    ArticleMeta
  }
}
```

加载组件：
```js
<article-meta />
```

数据展示：
```js
<article-meta :article="article" />
```
子组件声明接收：`pages/article/components/article-meta.vue`
```js
export default {
  name: 'ArticleMeta',
  props: {
    article: Object,
    required: true // 必须的
  }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112212615491.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

```js
<template>
  <div class="article-meta">
    <nuxt-link :to="{
      name: 'profile',
      params: {
        username: article.author.username
      }
    }">
      <img :src="article.author.image" />
    </nuxt-link>
    <div class="info">
      <nuxt-link class="author" :to="{
        name: 'profile',
        params: {
          username: article.author.username
        }
      }">
        {{ article.author.username }}
      </nuxt-link>
      <span class="date">{{ article.createdAt | date('MMMM DD, YYYY') }}</span>
    </div>
    <!-- 用户关注状态 -->
    <button 
      class="btn btn-sm btn-outline-secondary"
      :class="{
        active: article.author.following
      }"
    >
      <i class="ion-plus-round"></i>
      &nbsp;
      Follow Eric Simons <span class="counter">(10)</span>
    </button>
    &nbsp;&nbsp;
    <!-- 用户是否已点赞 -->
    <button 
      class="btn btn-sm btn-outline-primary"
      :class="{
        active: article.favorited
      }"
      >
      <i class="ion-heart"></i>
      &nbsp;
      Favorite Post <span class="counter">(29)</span>
    </button>
  </div>
</template>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112214345738.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 设置页面meta优化SEO
除了根据正文内容来处理SEO，页面的标题以及跟meta标签相关的内容对于收录同样非常重要：

[NuxtJS相关文档](https://www.nuxtjs.cn/guide/views#html-%E5%A4%B4%E9%83%A8)：

> Nuxt.js 使用了 [vue-meta](https://github.com/nuxt/vue-meta) 更新应用的 `头部标签(Head) `and `html 属性`。

Nuxt.js 允许你在 `nuxt.config.js` 里定义应用所需的所有默认 meta 标签，在 `head` 字段里配置就可以了。

如果我们有针对某个特定的页面来定制：[页面头部配置API](https://www.nuxtjs.cn/api/pages-head)

`pages/article/index.vue`
```js
export default {
  ...
  head() {
    return {
      title: `${this.article.title} - RealWorld`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.article.description
        }
      ]
    }
  }
}
```

> 注意：为了避免子组件中的 meta 标签不能正确覆盖父组件中相同的标签而产生重复的现象，建议利用 hid 键为 meta 标签配一个唯一的标识编号。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112220241886.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 文章评论-通过客户端渲染展示评论列表
将评论列表封装为组件：`pages/article/components/article-comments.vue`
```js
<template>
  <div>
    <form class="card comment-form">
      <div class="card-block">
        <textarea class="form-control" placeholder="Write a comment..." rows="3"></textarea>
      </div>
      <div class="card-footer">
        <img src="http://i.imgur.com/Qr71crq.jpg" class="comment-author-img" />
        <button class="btn btn-sm btn-primary">
        Post Comment
        </button>
      </div>
    </form>

    <div class="card">
      <div class="card-block">
        <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
      </div>
      <div class="card-footer">
        <a href="" class="comment-author">
          <img src="http://i.imgur.com/Qr71crq.jpg" class="comment-author-img" />
        </a>
        &nbsp;
        <a href="" class="comment-author">Jacob Schmidt</a>
        <span class="date-posted">Dec 29th</span>
      </div>
    </div>

    <div class="card">
      <div class="card-block">
        <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
      </div>
      <div class="card-footer">
        <a href="" class="comment-author">
          <img src="http://i.imgur.com/Qr71crq.jpg" class="comment-author-img" />
        </a>
        &nbsp;
        <a href="" class="comment-author">Jacob Schmidt</a>
        <span class="date-posted">Dec 29th</span>
        <span class="mod-options">
          <i class="ion-edit"></i>
          <i class="ion-trash-a"></i>
        </span>
      </div>
    </div>
  </div>
</template>
```
```js
export default {
  name: 'ArticleComments'
}
```

加载注册组件：`pages/article/index.vue`
```js
<article-comments />
```
```js
import ArticleComments from './components/article-comments.vue'

components: {
  ...
  ArticleComments
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112221626929.png)

请求方法：`GET `

请求地址：`/api/articles/:slug/comments`

`api/article.js`
```js
// 获取文章评论
export const getComments = slug => {
  return request({
    method: 'GET',
    url: `/api/articles/${slug}/comments`
  })
}
```

加载请求方法：`pages/article/components/article-comments.vue`
```js
import { getComments } from '@/api/article'
```

在父组件传递文章对象给子组件：`pages/article/index.vue`
```js
<article-comments :article="article" />
```

评论并不需要SEO：`pages/article/components/article-comments.vue`
```js
export default {
  name: 'ArticleComments',
  props: {
    article: {
      type: Object,
      required: true // 必须的
    }
  },
  data () {
    return {
      comments: [] // 文章列表
    }
  },
  // 评论不需要SEO
  // 客户端加载
  async mounted () {
    const { data } = await getComments(this.article.slug)
    this.comments = data.comments
  }
}
```
遍历数据：
```js
<div 
  class="card" 
  v-for="comment in comments"
  :key="comment.id"
>
  <div class="card-block">
    <p class="card-text">{{ comment.body }}</p>
  </div>
  <div class="card-footer">
    <nuxt-link 
      class="comment-author"
      :to="{
        name: 'profile',
        params: {
          username: comment.author.username
        }
      }"
    >
      <img :src="comment.author.image" class="comment-author-img" />
    </nuxt-link>
    &nbsp;
    <nuxt-link 
      class="comment-author"
      :to="{
        name: 'profile',
        params: {
          username: comment.author.username
        }
      }"
    >
      {{ comment.author.username }}
    </nuxt-link>
    <span class="date-posted">{{ comment.createdAt | date('MMMM DD, YYYY')}}</span>
  </div>
</div>
```
## 11.6 发布部署
### 打包
- [https://www.nuxtjs.cn/guide/commands](https://www.nuxtjs.cn/guide/commands)

|命令|	描述|
|-|-|
|nuxt|	启动一个热加载的 Web 服务器（开发模式） [localhost:3000](http://localhost:3000/)。
nuxt build	|利用 webpack 编译应用，压缩 JS 和 CSS 资源（发布用）。
nuxt start|	以生产模式启动一个 Web 服务器 (需要先执行`nuxt build`)。
nuxt generate	|编译应用，并依据路由配置生成对应的 HTML 文件 (用于静态站点的部署)。

`package.json`：
```js
{
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start"
  }
}
```

```shell
npm run build
```

生成结果：`.nuxt`以及`.nuxt/dist`

```shell
npm run start
```
### 最简单的部署方式
- 配置 Host + Post

`nuxt.config.js`：
```js
server: {
  host: '0.0.0.0', // 默认localhost
  port: 3000
}
```

- 压缩发布包

	* `.nuxt`：Nuxt打包生成的资源文件
	* `static`：项目静态资源
	* `nuxt.config.js`：提供给Nuxt服务
	* `package.json`：用于服务端第三方包的安装
	* `package-lock.json`：用于服务端第三方包的安装

- 把发布包传到服务端

得到`realworld-nuxtjs.zip`传递到服务端

```shell
ssh root@xxx.xxx.xxx.xxx

mkdir realworld-nuxtjs

cd realworld-nuxtjs/

pwd
```
复制路径`path`并`exit`退出服务
```shell
scp .\realworld-nuxtjs.zip root@xxx.xxx.xxx.xxx:path
```

- 解压

```shell
ssh root@xxx.xxx.xxx.xxx

cd realworld-nuxtjs/

unzip realworld-nuxtjs.zip

ls -a
```

- 安装依赖

```shell
npm i
```

- 启动服务

```shell
npm run start
```

### 使用PM2启动Node服务
**PM2 是什么？**

刚才我们在服务端是直接通过`npm run start`命令来启动了Web服务，如果我们通过这种方式启动起来以后，此时占用了命令行。我们希望它在后台运行这个应用，因此就需要用到pm2工具：

**使用 PM2 启动服务**

- GitHub 仓库地址：[https://github.com/Unitech/pm2](https://github.com/Unitech/pm2)
- 官方文档：[https://pm2.io/](https://pm2.io/)
- 安装：`npm install --global pm2`
- 启动：`pm2 start 脚本路径`

```shell
# 没有node环境的话
# wget -qO- https://getpm2.com/install.sh | bash

npm install --global pm2

pm2 start npm -- start
```

**PM2 常用命令**

|命令|说明|
|:-|:-|
pm2 list|查看应用列表
pm2 start|启动应用
pm2 stop|停止应用
pm2 reload|重载应用
pm2 restart|重启应用
pm2 delete|删除应用

### 自动化部署介绍
传统的部署方式需要反复地更新、构建、发布，显得很麻烦。我们希望这件事情能够自动化，即使用现代化的部署方式（CI/CD）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210113205229222.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**CI/CD 服务**

- Jenkins
- Gitlab CI
- GitHub Actions
- Travis CI
- Circle CI
- ...
### GitHub Actions 自动部署
这里我们使用 GitHub Actions 实现自动部署：

**环境准备**

- Linux 服务器
- 把代码提交到 GitHub 远程仓库

**配置 GitHub Access Token**

- 生成：[https://github.com/settings/tokens](https://github.com/settings/tokens)

这是我的配置，供参考：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210113211447932.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
复制令牌（令牌只显示一次，请保管）
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021011321251887.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)


- 配置到项目的 Secrets 中：[https://github.com/shiguanghai/realworld-nuxtjs/settings/secrets](https://github.com/shiguanghai/realworld-nuxtjs/settings/secrets)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210113211854169.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

新建`TOKEN`，将生成的token放入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210113212438232.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**配置 GitHub Actions 执行脚本**

- 在项目根目录创建 `.github/workflows` 目录
- 下载 [main.yml](https://gist.github.com/lipengzhou/b92f80142afa37aea397da47366bd872) 到 workflows 目录中

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021011321400087.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210113214155922.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 修改配置

```shell
# 打包构建
- run: tar -zcvf release.tgz .nuxt static nuxt.config.js package.json package-lock.json pm2.config.json

...

pm2 reload pm2.config.json
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210113221338956.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)


- 配置 PM2 配置文件

`pm2.config.json`
```js
{
  "apps": [
    {
      "name": "RealWorld",
      "script": "npm",
      "args": "start"
    }
  ]
}
```

- 提交更新

```shell
git add .

git commit -m "发布部署-测试"

git tag v0.1.0

git push origin v0.1.0
```

- 查看自动部署状态
- 访问网络
- 提交更新

---

到此，RealWorld项目的大致框架就已经介绍完毕，剩余内容可以自行补充，后续补充内容将以Tag版本形式在仓库更新：

项目仓库地址：[https://github.com/shiguanghai/realworld-nuxtjs](https://github.com/shiguanghai/realworld-nuxtjs)

项目展示地址：[http://demo.shiguanghai.top:3000](http://demo.shiguanghai.top:3000/)
