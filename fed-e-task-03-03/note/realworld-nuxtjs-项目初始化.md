
## 11.1 案例介绍
### 案例相关资源
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104225015863.png)

- GitHub仓库：[https://github.com/gothinkster/realworld](https://github.com/gothinkster/realworld)
- 在线示例：[https://demo.realworld.io/#/](https://demo.realworld.io/#/)
- 接口文档：[https://github.com/gothinkster/realworld/tree/master/api](https://github.com/gothinkster/realworld/tree/master/api)
- 页面模板：[https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INS
TRUCTIONS.md](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md)

## 11.2 项目初始化
### 创建项目
```shell
# 创建项目目录
mkdir realworld-nuxtjs

# 进入项目目录
cd realworld-nuxtjs

# 生成 package.json 文件
npm init -y

# 安装 nuxt 依赖
npm install nuxt
```

在 `package.json` 中添加启动脚本：
```js
"scripts": {
"dev": "nuxt"
}
```

创建 `pages/index.vue` 
```js
<template>
  <div class="home">首页</div>
</template>

<script>
export default {
  name: 'HomePage',
}
</script>

<style>

</style>
```

启动服务：
```shell
npm run dev
```

在浏览器中访问 [http://localhost:3000/](http://localhost:3000/) 测试

### 导入样式资源
- 页面模板：[https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INS
TRUCTIONS.md](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104163041313.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
```html
<!-- Import Ionicon icons & Google Fonts our Bootstrap theme relies on -->
<link href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css">
<link href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic" rel="stylesheet" type="text/css">
<!-- Import the custom Bootstrap 4 theme from our hosted CDN -->
<link rel="stylesheet" href="//demo.productionready.io/main.css">
```

需要三个样式资源，但这三个资源都在国外，建议将其本土化提高其加载速度：
```html
<!-- Import Ionicon icons & Google Fonts our Bootstrap theme relies on -->
<!-- 字体图标 样式文件 使用jsdelivr加速 -->
<!-- <link href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css"> -->
<link href="https://cdn.jsdelivr.net/npm/ionicons@2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css">
<!-- googleapis 谷歌字体文件 国内自动支持 -->
<link href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic" rel="stylesheet" type="text/css">
<!-- Import the custom Bootstrap 4 theme from our hosted CDN -->
<!-- 自定义 CSS 样式文件 直接下载下来保存到 static/index.css -->
<!-- <link rel="stylesheet" href="//demo.productionready.io/main.css"> -->
<link rel="stylesheet" href="/index.css">
```

 Nuxt.js 默认的应用模板：
```js
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

视图 - 模板：`app.html`
```js
<!DOCTYPE html>
<html {{ HTML_ATTRS }}>
  <head {{ HEAD_ATTRS }}>
    {{ HEAD }}
    <!-- 样式资源 -->
    插入本土化后的样式资源...
    <!-- /样式资源 -->
  </head>
  <body {{ BODY_ATTRS }}>
    {{ APP }}
  </body>
</html>
```

### 配置布局组件
- 页面模板：[https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INS
TRUCTIONS.md](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104165949541.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104174019344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

Header：
```html
<nav class="navbar navbar-light">
 <div class="container">
   <a class="navbar-brand" href="index.html">conduit</a>
   <ul class="nav navbar-nav pull-xs-right">
     <li class="nav-item">
       <!-- Add "active" class when you're on that page" -->
       <a class="nav-link active" href="">Home</a>
     </li>
     <li class="nav-item">
       <a class="nav-link" href="">
         <i class="ion-compose"></i>&nbsp;New Post
       </a>
     </li>
     <li class="nav-item">
       <a class="nav-link" href="">
         <i class="ion-gear-a"></i>&nbsp;Settings
       </a>
     </li>
     <li class="nav-item">
       <a class="nav-link" href="">Sign up</a>
     </li>
   </ul>
 </div>
</nav>
```
Footer：
```html
<footer>
  <div class="container">
    <a href="/" class="logo-font">conduit</a>
    <span class="attribution">
      An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.
    </span>
  </div>
</footer>
```

 Nuxt.js 默认布局的源码如下：
 ```js
 <template>
  <nuxt />
</template>
 ```

视图 - 布局：`pages/layout/index.vue`
```js
<template>
  <div>
    <!-- 顶部导航栏 -->
    插入Header...
    <!-- /顶部导航栏 -->

    <!-- 子路由 -->
    <nuxt-child/>
    <!-- /子路由 -->

    <!-- 底部 -->
    插入Footer...
    <!-- /底部 -->
  </div>
</template>

<script>
export default {
  name: 'LayoutIndex'
}
</script>

<style>

</style>
```

自定义路由规则：`nuxt.config.js`
```js
/**
 * Nuxt.js 配置文件
 */

module.exports = {
  router: {
    // 自定义路由表规则
    // routes: 一个数组，路由配置表
    // resolve: 解析路由组件路径
    extendRoutes(routes, resolve) {
      // 清除 Nuxt.js 基于 pages 目录默认生成的路由表规则
      routes.splice(0)
      // 添加自己的路由规则
      routes.push(...[
        {
          path: '/',
          component: resolve(__dirname, 'pages/layout/')  
        }
      ])
    }    
  }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104173052947.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

删除 `pages/index.vue` ，添加首页：`pages/home/index.vue`
```js
<template>
  <div>Home</div>
</template>

<script>
export default {
  name: 'HomeIndex'
}
</script>

<style>

</style>
```

配置路由表：`nuxt.config.js`
```js
routes.push(...[
  {
    path: '/',
    component: resolve(__dirname, 'pages/layout/'),
    children: [
      {
        path: '', // 默认子路由
        name: 'home',
        component: resolve(__dirname, 'pages/home/')
      }
    ]
  }
])
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104173706201.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

Home：
```html
<div class="home-page">

  <div class="banner">
    <div class="container">
      <h1 class="logo-font">conduit</h1>
      <p>A place to share your knowledge.</p>
    </div>
  </div>

  <div class="container page">
    <div class="row">

      <div class="col-md-9">
        <div class="feed-toggle">
          <ul class="nav nav-pills outline-active">
            <li class="nav-item">
              <a class="nav-link disabled" href="">Your Feed</a>
            </li>
            <li class="nav-item">
              <a class="nav-link active" href="">Global Feed</a>
            </li>
          </ul>
        </div>

        <div class="article-preview">
          <div class="article-meta">
            <a href="profile.html"><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
            <div class="info">
              <a href="" class="author">Eric Simons</a>
              <span class="date">January 20th</span>
            </div>
            <button class="btn btn-outline-primary btn-sm pull-xs-right">
              <i class="ion-heart"></i> 29
            </button>
          </div>
          <a href="" class="preview-link">
            <h1>How to build webapps that scale</h1>
            <p>This is the description for the post.</p>
            <span>Read more...</span>
          </a>
        </div>

        <div class="article-preview">
          <div class="article-meta">
            <a href="profile.html"><img src="http://i.imgur.com/N4VcUeJ.jpg" /></a>
            <div class="info">
              <a href="" class="author">Albert Pai</a>
              <span class="date">January 20th</span>
            </div>
            <button class="btn btn-outline-primary btn-sm pull-xs-right">
              <i class="ion-heart"></i> 32
            </button>
          </div>
          <a href="" class="preview-link">
            <h1>The song you won't ever stop singing. No matter how hard you try.</h1>
            <p>This is the description for the post.</p>
            <span>Read more...</span>
          </a>
        </div>

      </div>

      <div class="col-md-3">
        <div class="sidebar">
          <p>Popular Tags</p>

          <div class="tag-list">
            <a href="" class="tag-pill tag-default">programming</a>
            <a href="" class="tag-pill tag-default">javascript</a>
            <a href="" class="tag-pill tag-default">emberjs</a>
            <a href="" class="tag-pill tag-default">angularjs</a>
            <a href="" class="tag-pill tag-default">react</a>
            <a href="" class="tag-pill tag-default">mean</a>
            <a href="" class="tag-pill tag-default">node</a>
            <a href="" class="tag-pill tag-default">rails</a>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>
```

替换首页：`pages/home/index.vue`
```js
<template>
  <!-- 首页 -->
  插入Home...
  <!-- /首页 -->
</template>  
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104174722859.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
### 导入登录注册页面
- 页面模板：[https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INS
TRUCTIONS.md](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104200229905.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

Login/Register：
```html
<div class="auth-page">
  <div class="container page">
    <div class="row">

      <div class="col-md-6 offset-md-3 col-xs-12">
        <h1 class="text-xs-center">Sign up</h1>
        <p class="text-xs-center">
          <a href="">Have an account?</a>
        </p>

        <ul class="error-messages">
          <li>That email is already taken</li>
        </ul>

        <form>
          <fieldset class="form-group">
            <input class="form-control form-control-lg" type="text" placeholder="Your Name">
          </fieldset>
          <fieldset class="form-group">
            <input class="form-control form-control-lg" type="text" placeholder="Email">
          </fieldset>
          <fieldset class="form-group">
            <input class="form-control form-control-lg" type="password" placeholder="Password">
          </fieldset>
          <button class="btn btn-lg btn-primary pull-xs-right">
            Sign up
          </button>
        </form>
      </div>

    </div>
  </div>
</div>
```

登录/注册：`pages/login/index.vue`
```js
<template>
  <!-- 登录注册 -->
  插入Login/Register...
  <!-- /登录注册 -->
</template>

<script>
export default {
  name: 'LoginIndex'
}
</script>

<style>

</style>
```
配置路由表：`nuxt.config.js`
```js
routes.push(...[
  {
    path: '/',
    component: resolve(__dirname, 'pages/layout/'),
    children: [
      ...
      {
        path: '/login',
        name: 'login',
        component: resolve(__dirname, 'pages/login/')
      },
      {
         path: '/register',
         name: 'register',
         component: resolve(__dirname, 'pages/login/')
       }
    ]
  }
])
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104201121770.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104201540602.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
定制登录/注册页：`pages/login/index.vue`
```js
<template>
  <!-- 登录注册 -->
  <div class="auth-page">
    <div class="container page">
      <div class="row">

        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">{{ isLogin ? 'Sign in' : 'Sign up' }}</h1>
          <p class="text-xs-center">
            <!-- <a href="">Have an account?</a> -->
            <nuxt-link v-if="isLogin" to="/register">Need an account?</nuxt-link>
            <nuxt-link v-else to="/login">Have an account?</nuxt-link>
          </p>

          <ul class="error-messages">
            <li>That email is already taken</li>
          </ul>

          <form>
            <fieldset v-if="!isLogin" class="form-group">
              <input class="form-control form-control-lg" type="text" placeholder="Your Name">
            </fieldset>
            <fieldset class="form-group">
              <input class="form-control form-control-lg" type="text" placeholder="Email">
            </fieldset>
            <fieldset class="form-group">
              <input class="form-control form-control-lg" type="password" placeholder="Password">
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right">
              {{ isLogin ? 'Sign in' : 'Sign up' }}
            </button>
          </form>
        </div>

      </div>
    </div>
  </div>
  <!-- /登录注册 -->
</template>

<script>
export default {
  name: 'LoginIndex',
  computed: {
    // 定制登录/注册页
    isLogin() { // 登录为true
      return this.$route.name === 'login'
    }
  }
}
</script>

<style>

</style>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104202821520.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104202834553.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 导入剩余页面
- 页面模板：[https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INS
TRUCTIONS.md](https://github.com/gothinkster/realworld-starter-kit/blob/master/FRONTEND_INSTRUCTIONS.md)

|路径| 页面
|:-|:-|
/ |首页
/login |登录
/register |注册
/settings |用户设置
/editor |发布文章
/editor/:slug| 编辑文章
/article/:slug |文章详情
/profile/:username |用户页面
/profile/:username/favorites |用户页面/喜欢的文章

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104223541931.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

**Routing Guidelines**
- Home page (URL: /#/ )
	* List of tags
	* List of articles pulled from either Feed, Global, or by Tag
	* Pagination for list of articles
- Sign in/Sign up pages (URL: /#/login, /#/register )
	* Uses JWT (store the token in localStorage)
	* Authentication can be easily switched to session/cookie based
- Settings page (URL: /#/settings )
- Editor page to create/edit articles (URL: /#/editor, /#/editor/article-slug-here )
- Article page (URL: /#/article/article-slug-here )
	* Delete article button (only shown to article's author)
	* Render markdown from server client side
	* Comments section at bottom of page
	* Delete comment button (only shown to comment's author)
- Profile page (URL: /#/profile/:username, /#/profile/:username/favorites )
	* Show basic user info
	* List of articles populated from author's created articles or author's favorited articles

Profile:
```html
<div class="profile-page">

  <div class="user-info">
    <div class="container">
      <div class="row">

        <div class="col-xs-12 col-md-10 offset-md-1">
          <img src="http://i.imgur.com/Qr71crq.jpg" class="user-img" />
          <h4>Eric Simons</h4>
          <p>
            Cofounder @GoThinkster, lived in Aol's HQ for a few months, kinda looks like Peeta from the Hunger Games
          </p>
          <button class="btn btn-sm btn-outline-secondary action-btn">
            <i class="ion-plus-round"></i>
            &nbsp;
            Follow Eric Simons 
          </button>
        </div>

      </div>
    </div>
  </div>

  <div class="container">
    <div class="row">

      <div class="col-xs-12 col-md-10 offset-md-1">
        <div class="articles-toggle">
          <ul class="nav nav-pills outline-active">
            <li class="nav-item">
              <a class="nav-link active" href="">My Articles</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="">Favorited Articles</a>
            </li>
          </ul>
        </div>

        <div class="article-preview">
          <div class="article-meta">
            <a href=""><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
            <div class="info">
              <a href="" class="author">Eric Simons</a>
              <span class="date">January 20th</span>
            </div>
            <button class="btn btn-outline-primary btn-sm pull-xs-right">
              <i class="ion-heart"></i> 29
            </button>
          </div>
          <a href="" class="preview-link">
            <h1>How to build webapps that scale</h1>
            <p>This is the description for the post.</p>
            <span>Read more...</span>
          </a>
        </div>

        <div class="article-preview">
          <div class="article-meta">
            <a href=""><img src="http://i.imgur.com/N4VcUeJ.jpg" /></a>
            <div class="info">
              <a href="" class="author">Albert Pai</a>
              <span class="date">January 20th</span>
            </div>
            <button class="btn btn-outline-primary btn-sm pull-xs-right">
              <i class="ion-heart"></i> 32
            </button>
          </div>
          <a href="" class="preview-link">
            <h1>The song you won't ever stop singing. No matter how hard you try.</h1>
            <p>This is the description for the post.</p>
            <span>Read more...</span>
            <ul class="tag-list">
              <li class="tag-default tag-pill tag-outline">Music</li>
              <li class="tag-default tag-pill tag-outline">Song</li>
            </ul>
          </a>
        </div>


      </div>

    </div>
  </div>

</div>
```

用户页面：`pages/profile/index.vue`
```js
<template>
  <!-- 用户页面-->
  插入Profile...
  <!-- /用户页面 -->
</template>

<script>
export default {
  name: 'UserProfile'
}
</script>

<style>

</style>
```
配置路由表：`nuxt.config.js`
```js
routes.push(...[
  {
    path: '/',
    component: resolve(__dirname, 'pages/layout/'),
    children: [
      ...
      {
        path: '/profile/:username',
        name: 'profile',
        component: resolve(__dirname, 'pages/profile/')
      }
    ]
  }
])
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104205317397.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

Settings：
```html
<div class="settings-page">
  <div class="container page">
    <div class="row">

      <div class="col-md-6 offset-md-3 col-xs-12">
        <h1 class="text-xs-center">Your Settings</h1>

        <form>
          <fieldset>
              <fieldset class="form-group">
                <input class="form-control" type="text" placeholder="URL of profile picture">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Your Name">
              </fieldset>
              <fieldset class="form-group">
                <textarea class="form-control form-control-lg" rows="8" placeholder="Short bio about you"></textarea>
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="text" placeholder="Email">
              </fieldset>
              <fieldset class="form-group">
                <input class="form-control form-control-lg" type="password" placeholder="Password">
              </fieldset>
              <button class="btn btn-lg btn-primary pull-xs-right">
                Update Settings
              </button>
          </fieldset>
        </form>
      </div>

    </div>
  </div>
</div>
```

设置：`pages/settings/index.vue`
```js
<template>
  <!-- 设置 -->
  插入Settings...
  <!-- /设置 -->
</template>

<script>
export default {
  name: 'SettingsIndex'
}
</script>

<style>

</style>
```

配置路由表：`nuxt.config.js`
```js
routes.push(...[
  {
    path: '/',
    component: resolve(__dirname, 'pages/layout/'),
    children: [
      ...
      {
        path: '/settings',
        name: 'settings',
        component: resolve(__dirname, 'pages/settings/')
      }
    ]
  }
])
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104210055867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
Create/Edit Article：
```html
<div class="editor-page">
  <div class="container page">
    <div class="row">

      <div class="col-md-10 offset-md-1 col-xs-12">
        <form>
          <fieldset>
            <fieldset class="form-group">
                <input type="text" class="form-control form-control-lg" placeholder="Article Title">
            </fieldset>
            <fieldset class="form-group">
                <input type="text" class="form-control" placeholder="What's this article about?">
            </fieldset>
            <fieldset class="form-group">
                <textarea class="form-control" rows="8" placeholder="Write your article (in markdown)"></textarea>
            </fieldset>
            <fieldset class="form-group">
                <input type="text" class="form-control" placeholder="Enter tags"><div class="tag-list"></div>
            </fieldset>
            <button class="btn btn-lg pull-xs-right btn-primary" type="button">
                Publish Article
            </button>
          </fieldset>
        </form>
      </div>

    </div>
  </div>
</div>
```

创建/编辑文章：`pages/editor/index.vue`
```js
<template>
  <!-- 创建编辑文章 -->
  插入Create/Edit Article...
  <!-- /创建编辑文章 -->
</template>

<script>
export default {
  name: 'EditorIndex'
}
</script>

<style>

</style>
```
配置路由表：`nuxt.config.js`
```js
routes.push(...[
  {
    path: '/',
    component: resolve(__dirname, 'pages/layout/'),
    children: [
      ...
      {
        path: '/editor',
        name: 'editor',
        component: resolve(__dirname, 'pages/editor/')
      }
    ]
  }
])
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104211045639.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
Article：
```html
<div class="article-page">

  <div class="banner">
    <div class="container">

      <h1>How to build webapps that scale</h1>

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

    </div>
  </div>

  <div class="container page">

    <div class="row article-content">
      <div class="col-md-12">
        <p>
        Web development technologies have evolved at an incredible clip over the past few years.
        </p>
        <h2 id="introducing-ionic">Introducing RealWorld.</h2>
        <p>It's a great solution for learning how other frameworks work.</p>
      </div>
    </div>

    <hr />

    <div class="article-actions">
      <div class="article-meta">
        <a href="profile.html"><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
        <div class="info">
          <a href="" class="author">Eric Simons</a>
          <span class="date">January 20th</span>
        </div>

        <button class="btn btn-sm btn-outline-secondary">
          <i class="ion-plus-round"></i>
          &nbsp;
          Follow Eric Simons <span class="counter">(10)</span>
        </button>
        &nbsp;
        <button class="btn btn-sm btn-outline-primary">
          <i class="ion-heart"></i>
          &nbsp;
          Favorite Post <span class="counter">(29)</span>
        </button>
      </div>
    </div>

    <div class="row">

      <div class="col-xs-12 col-md-8 offset-md-2">

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

    </div>

  </div>

</div>
```

文章详情：`pages/article/index.vue`
```js
<template>
  <!-- 文章详情 -->
  插入Article...
  <!-- /文章详情 -->
</template>

<script>
export default {
  name: 'ArticleIndex'
}
</script>

<style>

</style>
```
配置路由表：`nuxt.config.js`
```js
routes.push(...[
  {
    path: '/',
    component: resolve(__dirname, 'pages/layout/'),
    children: [
      ...
      {
        path: '/article/:slug',
        name: 'article',
        component: resolve(__dirname, 'pages/article/')
      }
    ]
  }
])
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104212642510.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
### 处理顶部导航链接
模板中的导航栏链接默认为`a`链接，需要替换并补全一些缺少的`li`标签：

`pages/layout/index.vue`
```js
<nav class="navbar navbar-light">
  <div class="container">
    <!-- <a class="navbar-brand" href="index.html">conduit</a> -->
    <nuxt-link class="navbar-brand" to="/">conduit</nuxt-link>
    <ul class="nav navbar-nav pull-xs-right">
      <li class="nav-item">
        <!-- Add "active" class when you're on that page" -->
        <!-- <a class="nav-link active" href="">Home</a> -->
        <nuxt-link class="nav-link active" to="/">Home</nuxt-link>
      </li>
      <li class="nav-item">
        <!-- <a class="nav-link" href=""> -->
        <nuxt-link class="nav-link" to="/editor">
          <i class="ion-compose"></i>&nbsp;New Post
        </nuxt-link>  
        <!-- </a> -->
      </li>
      <li class="nav-item">
        <!-- <a class="nav-link" href=""> -->
        <nuxt-link class="nav-link" to="/settings">  
          <i class="ion-gear-a"></i>&nbsp;Settings
        </nuxt-link>   
        <!-- </a> -->
      </li>
      <li class="nav-item">
        <!-- <a class="nav-link" href="">Sign up</a> -->
        <nuxt-link class="nav-link" to="/register">Sign up</nuxt-link>
      </li>
      <li class="nav-item">
        <nuxt-link class="nav-link" to="/login">Sign in</nuxt-link>
      </li>
      <li class="nav-item">
        <nuxt-link class="nav-link" to="/profile/shiguanghai">
          <img class="user-pic" src="https://shiguanghai.top/avatar.png">
          shiguanghai
        </nuxt-link>
      </li>
    </ul>
  </div>
</nav>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104221038449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 处理导航链接高亮
NuxtJS 匹配到路由以后，会给`nuxt-link`对应的导航链接添加一个`nuxt-link-active`的类名，我们可以将它修改为我们需要的

Nuxt.js 配置文件：`nuxt.config.js`
```js
router: {
  linkActiveClass: 'active',
  ...
}
```
此时匹配到路由后对应导航就是高亮显示了。然后我们将`Home`写死的`active`去掉，发现不论到那个页面，`Home`还是高亮
```js
<nuxt-link class="nav-link" to="/">Home</nuxt-link>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104222030952.png)

这是由于路由的匹配关系，`'/' `被包含在了其他路由内，因此我们还需要将其精确匹配：
```js
<!-- 精确匹配，只有路由等于'/'才会高亮 -->
<nuxt-link class="nav-link" to="/" exact>Home</nuxt-link>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104222405965.png)

### 封装请求模块
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210104223618774.png)

Using the hosted API：

Simply point your [API requests](https://github.com/gothinkster/realworld/tree/master/api) to `https://conduit.productionready.io/api` and you're good to go!

安装 `axios`：
```shell
npm i axios
```
请求模块：`utils/request.js`
```js
/**
 * 基于 axios 封装的请求模块
 */

import axios from 'axios'

const request = axios.create({
  baseURL: 'https://conduit.productionready.io/'
})

export default request
```
