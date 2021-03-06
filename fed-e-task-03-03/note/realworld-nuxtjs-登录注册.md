
## 11.3 登录注册
### 实现基本登录功能
登录：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105175119496.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

请求方法：`POST `

请求地址：`/api/users/login`

请求体示例：
```js
{
  "user":{
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

接口不需要登录权限，成功返回`User`

必须字段：`email`，`password`


`pages/login/index.vue`：
```js
<fieldset class="form-group">
  <input v-model="user.email" class="form-control form-control-lg" type="text" placeholder="Email">
</fieldset>
<fieldset class="form-group">
  <input v-model="user.password" class="form-control form-control-lg" type="password" placeholder="Password">
</fieldset>
```
```js
export default {
  ...
  data () {
    return {
      user: {
        "email": '',
        "password": ''
      }
    }
  }
}
```
验证：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105180054680.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

`pages/login/index.vue`：
```js
<!-- .prevent 阻止默认提交行为 -->
<form @submit.prevent="onSubmit">
  <fieldset v-if="!isLogin" class="form-group">
    <input class="form-control form-control-lg" type="text" placeholder="Your Name">
  </fieldset>
  <fieldset class="form-group">
    <input v-model="user.email" class="form-control form-control-lg" type="text" placeholder="Email">
  </fieldset>
  <fieldset class="form-group">
    <input v-model="user.password" class="form-control form-control-lg" type="password" placeholder="Password">
  </fieldset>
  <button class="btn btn-lg btn-primary pull-xs-right">
    {{ isLogin ? 'Sign in' : 'Sign up' }}
  </button>
</form>
```
```js
import request from '@/utils/request'

export default {
  ...

  methods: {
    async onSubmit () {
      // 提交表单请求登录
      const { data } = await request({
        method: 'POST',
        url: '/api/users/login',
        data: {
          user: this.user
        }
      })

      console.log(data)
      // TODO: 保存用户的登录状态

      // 跳转到首页
      this.$router.push('/')
    }
  }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105183246995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105183313511.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 封装请求方法
不建议在项目中直接写请求代码，这涉及到接口改动，统一的组织管理有助于后期维护以及重用。

注册：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105184134801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

请求方法：`POST `

请求地址：`/api/users`

将请求封装为方法来使用：`api/user.js`
```js
import request from '@/utils/request'

// 用户登录
export const login = data => {
  return request({
    method: 'POST',
    url: '/api/users/login',
    data
  })
}

// 用户注册
export const register = data => {
  return request({
    method: 'POST',
    url: '/api/users',
    data
  })
}
```

`pages/login/index.vue`：
```js
import { login } from '@/api/user'

export default {
  ...

  methods: {
    async onSubmit () {
      // 提交表单请求登录
      const { data } = await login({
        user: this.user
      })

      console.log(data)
      // TODO: 保存用户的登录状态

      // 跳转到首页
      this.$router.push('/')
    }
  }
}
```
### 表单验证
在我们提交表单之前，需要做一个基本的表单验证，这里我们用一个简单的HTML5原生表单验证来处理一下

必填项：

首先，`input` 标签增加 `required` 必填项

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105194902845.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

邮箱格式校验：

将 Email 的 `input` 标签的 `type` 设置为 `email`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105195127126.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

密码格式校验：

将 Password 的 `input` 标签增加 `minlength="8"` 长度限制

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105210308948.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)


### 错误处理
接下来来处理登录/注册失败的情况：

获取到登录失败的信息（捕获请求的异常）

`pages/login/index.vue`：
```js
methods: {
  async onSubmit () {
    try {
      // 提交表单请求登录
      const { data } = await login({
        user: this.user
      })

      console.log(data)
      // TODO: 保存用户的登录状态

      // 跳转到首页
      this.$router.push('/')
    } catch (error) {
      console.dir(error)
    }
  }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105200359849.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
```js
data () {
  return {
    ...
    errors: {} // 错误信息
  }
}

methods: {
  async onSubmit () {
    try {
      ...
    } catch (error) {
      // console.dir(error)
      this.errors = errors.response.data.errors
    }
  }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105201020675.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

遍历错误信息：
```js
<ul class="error-messages">
  <!-- messages数据值：错误的文本信息数组
    field数据名：email or password -->
  <template v-for="(messages, field) in errors">
  <!-- <li>That email is already taken</li> -->
    <li
      v-for="(message, index) in messages"
      :key="index"
    >{{ field }} {{ message }}</li>
  </template>
</ul>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105201950181.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 用户注册
`pages/login/index.vue`：
```js
data () {
  return {
    user: {
      username: '',
      "email": '',
      "password": ''
    },
    errors: {} // 错误信息
  }
}
```
```js
<fieldset v-if="!isLogin" class="form-group">
  <input v-model="user.username" class="form-control form-control-lg" type="text" placeholder="Your Name" required>
</fieldset>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010520531424.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
```js
import { login, register } from '@/api/user'

export default {
  ...

  methods: {
    async onSubmit () {
      try {
        // 提交表单请求登录
        const { data } = this.isLogin 
          ? await login({
            user: this.user
          })
          : await register({
            user: this.user
          })
        ...
      } catch (error) {
        ...
      }
    }
  }
}
```
### 跨域身份验证（JWT）
- 既要在客户端渲染获取到登录状态
- 在服务端渲染也要能拿到登录状态

**跨域身份验证（JWT）**

使用Nuxt.js通过外部API服务(jsonwebtoken)进行身份验证
### 将登录状态存储到容器中
NuxtJS已经集成了Vuex，不用创建容器实例，直接将内部基本结构定义并导出即可，Nuxt会来加载注册到容器当中。

初始化容器数据：`store/index.js`

```js
// 在服务端渲染期间运行的都是同一个实例
// 为了防止数据冲突
// 务必将 state 定义成一个函数，返回数据对象
export const state = () => {
  return {
    // 当前登录用户的登录状态
    user: null
  }
}

export const mutations = {
  setUser (state, data) {
    state.user = data
  }
}

export const actions = {}
```

登录成功，将用户信息存入容器：`pages/login/index.vue`
```js
// 保存用户的登录状态
this.$store.commit('setUser', data.user)
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105215228525.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

但是要注意的是：此时数据只是存储在内存当中，刷新过后将会消失，因此接下来我们要将登录状态持久化。
### 登录状态持久化
为了防止页面刷新数据丢失，我们需要持久化处理。

但是我们不能放到本地存储，因为本地存储只有客户端可以获取到，我们希望数据既能被客户端获取又能被服务端获取。因此我们将数据放到cookie，这样前后端都能获取。

`js-cookie`：一个专门用于操作浏览器中cookie的第三方包
```shell
npm i js-cookie
```

登陆的操作是在客户端进行的，因此我们要在客户端将登录状态持久化到 Cookie 中
：`pages/login/index.vue`
```js
// 仅在客户端加载 js-cookie 包
// process.client 是Nuxt中特殊提供的数据
// 运行在客户端为 true; 运行在服务端为 false
const Cookie = process.client ? require('js-cookie') : undefined

// 为了防止刷新页面数据丢失，需要将数据持久化
Cookie.set('user', data.user)
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105220920994.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

`cookieparser`：用于将Cookie字符串解析为一个对象
```shell
npm i cookieparser
```

从 Cookie 中获取并初始化用户登录状态：`store/index.js`
```js
const cookieparser = process.server ? require
('cookieparser') : undefined

export const actions = {
  // nuxtServerInit 是一个特殊的 action 方法
  // 这个 action 会在服务端渲染期间自动调用
  // 作用：初始化容器数据，传递数据给客户端使用

  // commit：用来提交 mutation 的 commit 方法
  // req：服务端渲染期间的 request 请求对象
  nuxtServerInit ({ commit }, { req }) {
    let user = null

    // 如果请求头中有 Cookie
    if (req.headers.cookie) {
      // 将请求头中的 Cookie 字符串解析为一个对象
      const parsed = cookieparser.parse(req.headers.cookie)
      try {
        // 将 user 还原为 JavaScript 对象
        user = JSON.parse(parsed.user)
      } catch (error) {
        // No valid cookie found
      }
    }

    // 提交 mutation 修改 state 状态
    commit('setUser', user)
  }    
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105222700415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 处理导航栏链接展示状态
`pages/layout/index.vue`
```js
import { mapState } from 'vuex'

export default {
  name: 'LayoutIndex',
  computed: {
    ...mapState(['user'])
  }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105223346327.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

```js
<!-- 已登录 -->
<template v-if="user">
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
    <nuxt-link class="nav-link" to="/profile/shiguanghai">
      <img class="user-pic" :src="user.image">
      {{ user.username }}
    </nuxt-link>
  </li>
</template>

<!-- 未登录 -->
<template v-else>
  <li class="nav-item">
    <!-- <a class="nav-link" href="">Sign up</a> -->
    <nuxt-link class="nav-link" to="/register">Sign up</nuxt-link>
  </li>
  <li class="nav-item">
    <nuxt-link class="nav-link" to="/login">Sign in</nuxt-link>
  </li>
</template>  
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105223832422.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105224415803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 处理页面访问权限
如果是Vue项目，你可能会想到**路由拦截器**来处理页面访问权限。但是我们需要考虑到同构渲染页面的拦截：

从服务端角度出发，在进入页面处理之前就需要处理页面的访问（中间件拦截），NuxtJS提供了一种方案：[路由中间件](https://www.nuxtjs.cn/guide/routing#%E4%B8%AD%E9%97%B4%E4%BB%B6)

> 中间件允许您定义一个自定义函数运行在一个页面或一组页面渲染之前。

它既能处理服务端渲染的路由拦截又能处理客户端渲染的路由拦截。

`middleware/authenticated.js`
```js
/**
 * 验证是否登录的中间件
 */

export default function ({ store, redirect }) {
  // If the user is not authenticated
  if (!store.state.user) {
    return redirect('/login')
  }
}
```

`middlewares/not-authenticated.js`
```js
export default function ({ store, redirect }) {
  // If the user is authenticated redirect to home page
  if (store.state.user) {
    return redirect('/')
  }
}
```

在需要判断登录权限的页面中配置使用中间件：

`pages/[editor, profile, settings]/index.vue`
```js
export default {
  ...
  // 在路由匹配组件渲染之前会先执行中间件处理
  middleware: ['authenticated']
}
```

`pages/login/index.vue`
```js
export default {
  ...
  // 在路由匹配组件渲染之前会先执行中间件处理
  middleware: ['not-authenticated']
}
```
