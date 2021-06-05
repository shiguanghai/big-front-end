## 21.8 身份认证

### 把登录状态存储到 Vuex 容器中

我们现在这个登录其实是没有意义的，登录的意义是能够进入所谓的后台页面，实际上现在这个应用不登录的话也可以访问，完全可以直接在地址栏输入`http://localhost:8080/#/`访问。我们希望用户没有登录，后台页面就不能访问

思路：

1. 在用于登录成功以后记录登录状态，状态需要能够全局访问（不是指像全局变量，直接访问。而是可以在应用的任何模块、任何组件中能够访问到登录状态），我们可以使用 Vuex 来存储
2. 然后在访问需要登录的页面的时候判断有没有登录状态，从而决定是否可以进入后台页面，我们可以利用路由拦截器（VueRouter的功能）

我们先来实现 登录成功，记录登录状态，状态需要能够全局访问（放到 Vuex 容器中）

`store/index.ts`

```typescript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null // 当前登录用户状态
  },
  mutations: {
    // 修改容器数据必须使用 mutation 函数
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
```

`views/login/index.vue`

```typescript
// 3. 处理请求结果
//      失败 -> 给出提示
if (data.state !== 1) {
  this.$message.error(data.message)
} else {
  // 1.登录成功，记录登录状态，状态需要能够全局访问（放到 Vuex 容器中）
  this.$store.commit('setUser', 123)
  // 2.然后在访问登录页面的时候判断是否有登录状态（VueRouter 路由拦截器）
  //      成功 -> 跳转到首页
  this.$router.push({
    name: 'home'
  })
  this.$message.success('登录成功')
}
```

测试

![image-20210502121801349](https://public.shiguanghai.top/blog_img/image-20210502121801349uNxsRr.png)

接下来存储当前登录用户的状态

![image-20210502122037049](https://public.shiguanghai.top/blog_img/image-20210502122037049UChji5.png)

`content` 是一个 json 格式的字符串，里面有 `access_token`、`user_id`等表示用户身份的数据，我们要把这个数据存储到容器中 `this.$store.commit('setUser', data.content)`

此时的数据是一个 jsone 格式的字符串，我们在使用时并不方便，我们希望得到一个对象，因此我们需要对得到数据做一下处理

`store/index.ts`

```typescript
setUser (state, payload) {
  state.user = JSON.parse(payload)
}
```

测试

![image-20210502122747866](https://public.shiguanghai.top/blog_img/image-20210502122747866Qc5LEg.png)

我们可以看到我们传递的是一个字符串，得到的是一个对象

### 登录状态持久化

到此时，其实状态并没有完整拿到。容器的数据是共享的，在任何页面都可以访问到，但是当我们刷新页面之后，容器状态就会被清空。因此我们可以把数据放到本地存储当中来进行持久化

`store/index.ts`

```vue
setUser (state, payload) {
  state.user = JSON.parse(payload)

  // 为了防止页面刷新数据丢失，我们需要把 user 数据持久化
  // 注意：本地存储只能存字符串
  window.localStorage.setItem('user', payload)
}
```

![image-20210503154652612](https://public.shiguanghai.top/blog_img/image-202105031546526121T85ym.png)

页面刷新或关闭，数据依然存在。因此我们可以让 user 在数据初始化时赋值

`window.localStorage.getItem()` 接收的是 String 类型，返回的是 String 或者 Null 类型，为了解决 TypeScript 类型报错我们可以这样做

![image-20210503155331934](https://public.shiguanghai.top/blog_img/image-20210503155331934Ts6vJJ.png)

`store/index.ts`

```vue
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  // 容器的状态实现了数据共享，在组件里面访问方便，但是没有持久化的功能
  state: {
    user: JSON.parse(window.localStorage.getItem('user') || 'null')
    // user: null // 当前登录用户状态
  },
  mutations: {
    // 修改容器数据必须使用 mutation 函数
    setUser (state, payload) {
      state.user = JSON.parse(payload)

      // 为了防止页面刷新数据丢失，我们需要把 user 数据持久化
      // 注意：本地存储只能存字符串
      window.localStorage.setItem('user', payload)
    }
  },
  actions: {
  },
  modules: {
  }
})
```

这样我们在登录后刷新页面，user 里依然有数据

![image-20210503155645580](https://public.shiguanghai.top/blog_img/image-20210503155645580gcD33D.png)

### 校验页面访问权限 - 路由拦截器

接下来处理 在访问登录页面的时候判断是否有登录状态（VueRouter 路由拦截器）

参考 [导航守卫 - 全局前置守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%85%A8%E5%B1%80%E5%89%8D%E7%BD%AE%E5%AE%88%E5%8D%AB)

```javascript
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  // ...
})
```

当一个导航触发时，全局前置守卫按照创建顺序调用。守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 **等待中**

- to: 要去哪里的路由信息
- from: 从哪里来的路由信息
- next: 通行的标志，路由守卫中一定要调用 next，否则页面无法展示

`router/index.ts`

```typescript
// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  if(to.path !== '/login') {
    // 校验登录状态
  }
})
```

我们可以这样来实现我们的项目，但是它不够灵活。我们可以参考 [路由原信息](https://router.vuejs.org/zh/guide/advanced/meta.html#%E8%B7%AF%E7%94%B1%E5%85%83%E4%BF%A1%E6%81%AF)，定义路由的时候可以配置 `meta` 字段，`meta` 默认就是一个空对象，我们可以在里面添加自定义数据

谁需要登录访问就给谁加上`meta: { requiresAuth: true }`，相比上一种方法就很灵活

```typescript
...

// 路由配置规则
const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: 'login' */ '@/views/login/index.vue')
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '', // 默认子路由
        name: 'home',
        component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index.vue'),
        meta: { // meta 默认就是一个空对象
          requiresAuth: true // 访问权限。自定义数据
        }
      },
      {
        path: '/role',
        name: 'role',
        component: () => import(/* webpackChunkName: 'role' */ '@/views/role/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/menu',
        name: 'menu',
        component: () => import(/* webpackChunkName: 'menu' */ '@/views/menu/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/resource',
        name: 'resource',
        component: () => import(/* webpackChunkName: 'resource' */ '@/views/resource/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/course',
        name: 'course',
        component: () => import(/* webpackChunkName: 'course' */ '@/views/course/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/user',
        name: 'user',
        component: () => import(/* webpackChunkName: 'user' */ '@/views/user/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/advert',
        name: 'advert',
        component: () => import(/* webpackChunkName: 'advert' */ '@/views/advert/index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/advert-space',
        name: 'advert-space',
        component: () => import(/* webpackChunkName: 'advert-space' */ '@/views/advert-space/index.vue')
      }
    ]
  },
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: '404' */ '@/views/error-page/404.vue')
  }
]

...

// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  console.log('to => ', to)
  console.log('from => ', from)

  // to.matched 是一个数组（匹配到的路由记录）
  if (to.matched.some(record => record.meta.requiresAuth)) {

  }

  // 路由守卫中一定要调用 next，否则页面无法显示
  next()

  // if(to.path !== '/login') {
  //   // 校验登录状态
  // }
})

...
```

`to.matched`: 数组（匹配到的路由数组）例如我们匹配 菜单管理，它还有一个父路由`Layout`，也属于它的路由记录。整个路由记录里面，如果父路由也配置了必须登录才能访问，则子路由也需要登录才能访问

![image-20210503164416372](https://public.shiguanghai.top/blog_img/image-20210503164416372CSfTWj.png)

一旦有一个记录项 `record` 的 `meta` 有 `requiresAuth`为`true`，则证明这个路由需要检验登录状态

![image-20210503165601982](https://public.shiguanghai.top/blog_img/image-20210503165601982mPKrl6.png)

```typescript
...
import store from '@/store'

...

// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  // console.log('to => ', to)
  // console.log('from => ', from)

  // to.matched 是一个数组（匹配到的路由记录）
  // 一旦路由记录有一个记录项record
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.user) { // 如果没有登录状态
      // 跳转到登录状态
      next({
        name: 'login'
      })
    } else { // 有登录状态
      next() // 允许通过
    }
  } else {
    next() // 确保一定要调用 next()
  }

  // 路由守卫中一定要调用 next，否则页面无法显示
  // next()

  // if(to.path !== '/login') {
  //   // 校验登录状态
  // }
})

...
```

清除 Local Storage，测试

- 在导航栏输入 [http://localhost:8080/#/menu](http://localhost:8080/#/menu)，可以发现跳转到了 `http://localhost:8080/#/login` 登录页面
- 输入 [http://localhost:8080/#/advert-space](http://localhost:8080/#/advert-space)，可以正常访问，因为`/advert-space` 没有设置 `meta` 权限认证
- 登录过后，所有页面则均可访问

测试完成，给`Layout`父路由加上身份认证 `meta: { requiresAuth: true }`，删除子路由的所有 `meta`

```typescript
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'
import store from '@/store'

Vue.use(VueRouter)

// 路由配置规则
const routes: Array<RouteConfig> = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: 'login' */ '@/views/login/index.vue')
  },
  {
    path: '/',
    component: Layout,
    meta: { // meta 默认就是一个空对象
      requiresAuth: true // 访问权限。自定义数据
    },
    children: [
      {
        path: '', // 默认子路由
        name: 'home',
        component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index.vue')
      },
      {
        path: '/role',
        name: 'role',
        component: () => import(/* webpackChunkName: 'role' */ '@/views/role/index.vue')
      },
      {
        path: '/menu',
        name: 'menu',
        component: () => import(/* webpackChunkName: 'menu' */ '@/views/menu/index.vue')
      },
      {
        path: '/resource',
        name: 'resource',
        component: () => import(/* webpackChunkName: 'resource' */ '@/views/resource/index.vue')
      },
      {
        path: '/course',
        name: 'course',
        component: () => import(/* webpackChunkName: 'course' */ '@/views/course/index.vue')
      },
      {
        path: '/user',
        name: 'user',
        component: () => import(/* webpackChunkName: 'user' */ '@/views/user/index.vue')
      },
      {
        path: '/advert',
        name: 'advert',
        component: () => import(/* webpackChunkName: 'advert' */ '@/views/advert/index.vue')
      },
      {
        path: '/advert-space',
        name: 'advert-space',
        component: () => import(/* webpackChunkName: 'advert-space' */ '@/views/advert-space/index.vue')
      }
    ]
  },
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: '404' */ '@/views/error-page/404.vue')
  }
]

const router = new VueRouter({
  routes
})

// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  // to.matched 是一个数组（匹配到的路由记录）
  // 一旦路由记录有一个记录项record
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.user) { // 如果没有登录状态
      // 跳转到登录状态
      next({
        name: 'login'
      })
    } else { // 有登录状态
      next() // 允许通过
    }
  } else {
    next() // 确保一定要调用 next()
  }
})

export default router
```

### 登录成功跳转回原来页面

`router/index.ts`

```typescript
// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  // to.matched 是一个数组（匹配到的路由记录）
  // 一旦路由记录有一个记录项record
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.user) { // 如果没有登录状态
      // 跳转到登录状态
      next({
        name: 'login',
        // query 告诉登录页面从哪来的
        query: { // 通过 url 传递查询字符串参数
          redirect: to.fullPath // 把登录成功需要返回的页面告诉登录页
        }
      })
    } else { // 有登录状态
      next() // 允许通过
    }
  } else {
    next() // 确保一定要调用 next()
  }
})
```

在导航栏输入 [http://localhost:8080/#/menu](http://localhost:8080/#/menu)，可以发现跳转到了 `http://localhost:8080/#/login?redirect=%2Fmenu` 登录页面，可以发现 url 携带了参数

现在我们来对登录页做一些修改，之前我们登录成功跳转到首页`this.$router.push({  name: 'home' })`，现在我们根据当前路由信息跳转

![image-20210503183508507](https://public.shiguanghai.top/blog_img/image-20210503183508507T8zwj0.png)

```typescript
//      成功 -> 跳转到首页
// this.$router.push({
//   name: 'home'
// })
this.$router.push(this.$route.query.redirect || '/')
this.$message.success('登录成功')
```

此时 typeScript 类型校验有报错：`push` 要求接收一个字符串或者一个 location 地址对象

![image-20210503183839819](https://public.shiguanghai.top/blog_img/image-202105031838398196kZVzN.png)

但是`this.$route.query`拿到的是一个字符串或者`undefined`，所以我们可以将其转换为字符串类型确保其能够通过`push()`参数的类型校验

```typescript
//      成功 -> 跳转到首页
// this.$router.push({
//   name: 'home'
// })
this.$router.push(this.$route.query.redirect as string || '/')
this.$message.success('登录成功')
```

![image-20210503184352849](https://public.shiguanghai.top/blog_img/image-20210503184352849puu4HX.png)

### 测试获取当前登录用户信息接口

接下来我们处理头部 展示当前用户登录信息，思路：找到数据接口，发送请求拿到数据，绑定展示到页面

[edu-front-boot - 用户基本信息](http://edufront.lagou.com/front/doc.html#/edu-front-boot/%E7%94%A8%E6%88%B7%E6%8E%A5%E5%8F%A3/getInfoUsingGET)

根据文档提示在 Postman 中测试

![image-20210503181419796](https://public.shiguanghai.top/blog_img/image-20210503181419796x3P6kF.png)

Postman 有一种方式自动设置 Auth 数据

![image-20210503181730333](https://public.shiguanghai.top/blog_img/image-20210503181730333W8s0xt.png)

更新完毕

![image-20210503181759775](https://public.shiguanghai.top/blog_img/image-20210503181759775amHBYk.png)

### 展示当前登录用户信息

封装请求方法 `servieces/user.ts`

```typescript
/**
 * 用户相关请求模块
 */

import request from '@/utils/request'
import qs from 'qs'
import store from '@/store'

interface User {
  phone: string
  password: string
}

export const login = (data: User) => {
  return request({
    method: 'POST',
    url: '/front/user/login',
    // headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data)
  })
}

export const getUserInfo = () => {
  return request({
    method: 'GET',
    url: '/front/user/getInfo',
    headers: {
      Authorization: store.state.user.access_token
    }
  })
}
```

**关闭在导出的函数和类的公共类方法上需要显式的返回值和参数类型的警告**：

在`.eslintrc.js`的`rules`添加`'@typescript-eslint/explicit-module-boundary-types': 'off'`，重启服务。详见[@typescript-eslint/explicit-module-boundary-types](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-module-boundary-types.md)

`layout/component/app-header.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import { getUserInfo } from '@/services/user'

export default Vue.extend({
  name: 'AppHeader',
  created () {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo () {
      const { data } = await getUserInfo()
      console.log(data)
    }
  }
})
</script>
```

测试

![image-20210503202923849](https://public.shiguanghai.top/blog_img/image-20210503202923849YAI8rz.png)

```typescript
<script lang="ts">
import Vue from 'vue'
import { getUserInfo } from '@/services/user'

export default Vue.extend({
  name: 'AppHeader',
  data () {
    return {
      userInfo: {} // 当前登录用户信息
    }
  },
  created () {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo () {
      const { data } = await getUserInfo()
      this.userInfo = data.content
    }
  }
})
</script>
```

![image-20210503203828660](https://public.shiguanghai.top/blog_img/image-20210503203828660Sio5DK.png)

将用户信息展示到 header

```vue
<el-dropdown>
  <span class="el-dropdown-link">
    <el-avatar
               shape="square"
               :size="40"
               :src="userInfo.portrait || 'https://public.shiguanghai.top/blog_img/default-avatarnUSD98.png'"
               ></el-avatar>
    <i class="el-icon-arrow-down el-icon--right"></i>
  </span>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>{{ userInfo.userName }}</el-dropdown-item>
    <el-dropdown-item divided>退出</el-dropdown-item>
  </el-dropdown-menu>
</el-dropdown>
```

![image-20210503204045362](https://public.shiguanghai.top/blog_img/image-20210503204045362Kvy4Xa.png)

此时，当前登录用户的头像和ID就显示出来了，且当用户没有头像时就可以显示预设图片了

![image-20210503210820735](https://public.shiguanghai.top/blog_img/image-20210503210820735n32m4v.png)

如果你想将图片存到项目，使用相对路径访问则可以使用`require(@/assets/xxx.png)`来访问

### 使用 axios 请求拦截器统一设置 Token

在获取用户信息的时候，接口需要提供 Token 也就是用户的身份来获取这个数据。在这个应用中，基本上除了登录接口，其他很多页面都需要提供 Token 才能拿到相应的数据，否则就表示没有权限，会返回401

对于其他需要授权的接口，都去手动提供 Token 过于繁琐，我们希望它能够自动设置 Token，就像Postman的管理工具一样自动设置

我们可以使用请求拦截器完成这一需求，参照 [axios - Interceptors](https://github.com/axios/axios#interceptors)

![image-20210503213439493](https://public.shiguanghai.top/blog_img/image-20210503213439493RQ3pRg.png)

```js
// Add a request interceptor
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });
```

`utils/request.ts`

```typescript
import axios from 'axios'
import store from '@/store'

const request = axios.create({
  // 配置选项
  // baseURL
  // timeout
})

// 请求拦截器
// 任何请求都要经过请求拦截器
// 我们可以在请求拦截器中做一些公共的业务处理，例如统一设置 Token
// config 包括本次请求的请求地址、方法、参数等等
request.interceptors.request.use(function (config) {
  // 请求就会经过这里（正确）
  // 我们在这里通过改写 config 配置信息类实现业务功能的统一处理
  const { user } = store.state
  if (user && user.access_token) {
    config.headers.Authorization = user.access_token
  }

  // 返回 config 请求配置对象
  return config
}, function (error) {
  // 如果请求失败（此时请求还没有发出去）就会进入这里
  return Promise.reject(error)
})

// 相应拦截器

export default request
```

删除之前单独设置的 Token `services/user.ts`

```typescript
/**
 * 用户相关请求模块
 */

import request from '@/utils/request'
import qs from 'qs'

...

export const getUserInfo = () => {
  return request({
    method: 'GET',
    url: '/front/user/getInfo'
  })
}
```

### 用户退出

我们希望点击退出按钮，退出用户登录状态，回到登录页面

`layout/component/app-header.vue`

```vue
<el-dropdown-item
  divided
  @click.native="handleLogout"
>退出</el-dropdown-item>
```

组件是否支持注册原生dom事件么

- 看组件有无可用事件，参考 [Dropdown Events](https://element.eleme.cn/#/zh-CN/component/dropdown#dropdown-events) 可以使用 `command`  点击菜单项触发的事件回调（内部做判断）
- 给 `@click` 用 `.native` 修饰符注册则可以监听组件根元素的原生事件

```typescript
handleLogout () {
  // 清除用户登录转态
  this.$store.commit('setUser', null)

  // 跳转到登录页面
  this.$router.push({
  name: 'login'
  })
}
```

增加确认退出的交互，参照 [Element - MessageBox 弹框](https://element.eleme.cn/#/zh-CN/component/message-box)

![image-20210503222324315](https://public.shiguanghai.top/blog_img/image-20210503222324315oLWNOo.png)

```vue
this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning'
}).then(() => {
  this.$message({
    type: 'success',
    message: '删除成功!'
  });
}).catch(() => {
  this.$message({
    type: 'info',
    message: '已取消删除'
  }); 
});
```

```typescript
    handleLogout () {
      this.$confirm('确认退出?', '退出提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 清除用户登录转态
        this.$store.commit('setUser', null)

        // 跳转到登录页面
        this.$router.push({
          name: 'login'
        })
        this.$message({
          type: 'success',
          message: '退出成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出'
        })
      })
    }
```

![image-20210503222809500](https://public.shiguanghai.top/blog_img/image-20210503222809500BoiSKm.png)

![image-20210503222823178](https://public.shiguanghai.top/blog_img/image-20210503222823178Q4hHhm.png)