## 21.16 权限控制

### 头部 - 面包屑 - 重构路由结构

`router/index.ts`

```typescript
// 路由守卫（钩子）内使用可能会有一些问题
router.beforeEach((to, from, next) => {
  // 处理面包屑: 获取当前的路由匹配记录
  console.log('router.currentRoute.matched', router.currentRoute.matched)
})
```

或者 `layout/app-header.vue`

```typescript
created () {
  ...
  console.log('router.currentRoute.matched', this.$route.matched)
},
```

![image-20210603150831382](https://public.shiguanghai.top/blog_img/image-20210603150831382vdIWVX.png)

那么如何获取文字内容呢？我们可以通过改造路由数据让其满足我们的需求

之前我们为了实现校验页面访问权限曾经自定义过 `meta: { requiresAuth: true }`，同理只需给每个路由加上 `meta: { title: '' }` 即可

```typescript
{
  path: '/role',
  name: 'role',
  component: () => import(/* webpackChunkName: 'role' */ '@/views/role/index.vue'),
  meta: {
    // requiresAuth: true
    title: '角色管理'
  }
},
```

需要注意的是，我们并没有提供**权限管理**这一路由，它只是一个导航栏容器，如果我们希望面包屑中有权限管理就要在路由表中与其一致，因此我们需要修改路由结构

权限管理 `router/modules/rights.ts`

```typescript
import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteConfig = {
  path: '/',
  component: Layout,
  meta: { // meta 默认就是一个空对象
    requiresAuth: true, // 访问权限。自定义数据
    title: '权限管理'
  },
  children: [
    {
      path: '/role',
      name: 'role',
      component: () => import(/* webpackChunkName: 'role' */ '@/views/role/index.vue'),
      meta: {
        // requiresAuth: true
        title: '角色管理'
      }
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import(/* webpackChunkName: 'menu' */ '@/views/menu/index.vue'),
      meta: {
        title: '菜单管理'
      }
    },
    {
      path: '/resource',
      name: 'resource',
      component: () => import(/* webpackChunkName: 'resource' */ '@/views/resource/index.vue'),
      meta: {
        title: '资源管理'
      }
    },
    {
      path: '/menu/create',
      name: 'menu-create',
      component: () => import(/* webpackChunkName: 'menu-create-edit' */ '@/views/menu/create.vue'),
      meta: {
        title: '创建菜单'
      }
    },
    {
      path: '/menu/:id/edit',
      name: 'menu-edit',
      component: () => import(/* webpackChunkName: 'menu-create-edit' */ '@/views/menu/edit.vue'),
      meta: {
        title: '更新菜单'
      }
    },
    {
      path: '/role/:roleId/alloc-menu',
      name: 'alloc-menu',
      component: () => import(/* webpackChunkName: 'alloc-menu' */ '@/views/role/alloc-menu.vue'),
      meta: {
        title: '分配菜单'
      },
      props: true // 将路由路径参数映射到组件的 props 数据中
    },
    {
      path: '/role/:roleId/alloc-resource',
      name: 'alloc-resource',
      component: () => import(/* webpackChunkName: 'alloc-menu' */ '@/views/role/alloc-resource.vue'),
      meta: {
        title: '分配资源'
      },
      props: true // 将路由路径参数映射到组件的 props 数据中
    }
  ]
}

export default routes
```

课程管理 `router/modules/course.ts`

```typescript
import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteConfig = {
  path: '/',
  component: Layout,
  meta: { // meta 默认就是一个空对象
    requiresAuth: true, // 访问权限。自定义数据
    title: '课程管理'
  },
  children: [
    {
      path: '/course',
      name: 'course',
      component: () => import(/* webpackChunkName: 'course' */ '@/views/course/index.vue'),
      meta: {
        // title: '课程列表'
      }
    },
    {
      path: '/course/create',
      name: 'course-create',
      component: () => import(/* webpackChunkName: 'course-create' */ '@/views/course/create.vue'),
      meta: {
        title: '创建课程'
      }
    },
    {
      path: '/course/:courseId/edit',
      name: 'course-edit',
      component: () => import(/* webpackChunkName: 'course-edit' */ '@/views/course/edit.vue'),
      meta: {
        title: '更新课程'
      },
      props: true // 将路由路径参数映射到组件的 props 数据中
    },
    {
      path: '/course/:courseId/section',
      name: 'course-section',
      component: () => import(/* webpackChunkName: 'course-section' */ '@/views/course/section.vue'),
      meta: {
        title: '课程内容'
      },
      props: true // 将路由路径参数映射到组件的 props 数据中
    },
    {
      path: '/course/:courseId/video',
      name: 'course-video',
      component: () => import(/* webpackChunkName: 'course-video' */ '@/views/course/video.vue'),
      meta: {
        title: '视频上传'
      },
      props: true // 将路由路径参数映射到组件的 props 数据中
    }
  ]
}

export default routes
```

用户管理 `router/modules/user.ts`

```typescript
import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

// 路由配置规则
const routes: RouteConfig = {
  path: '/',
  component: Layout,
  meta: { // meta 默认就是一个空对象
    requiresAuth: true, // 访问权限。自定义数据
    title: '用户管理'
  },
  children: [
    {
      path: '/user',
      name: 'user-list',
      component: () => import(/* webpackChunkName: 'user' */ '@/views/user/index.vue'),
      meta: {
        // title: '用户列表'
      }
    }
  ]
}

export default routes
```

广告管理 `router/modules/advert.ts`

```typescript
import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteConfig = {
  path: '/',
  component: Layout,
  meta: { // meta 默认就是一个空对象
    requiresAuth: true, // 访问权限。自定义数据
    title: '广告管理'
  },
  children: [
    {
      path: '/advert',
      name: 'advert',
      component: () => import(/* webpackChunkName: 'advert' */ '@/views/advert/index.vue'),
      meta: {
        title: '广告列表'
      }
    },
    {
      path: '/advert-space',
      name: 'advert-space',
      component: () => import(/* webpackChunkName: 'advert-space' */ '@/views/advert-space/index.vue'),
      meta: {
        title: '广告位列表'
      }
    }
  ]
}

export default routes
```

汇总 `router/modules/index.ts`

```typescript
import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'
import advertRoules from './advert'
import courseRoules from './course'
import rightsRoules from './rights'
import ruserRoules from './user'

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
      }
    ]
  },
  advertRoules,
  courseRoules,
  rightsRoules,
  ruserRoules,
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: '404' */ '@/views/error-page/404.vue')
  }
]

export default routes
```

引入 `router/index.ts`

```typescript
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import routes from './modules/index'

Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  // 处理面包屑: 获取当前的路由匹配记录
  // console.log('router.currentRoute.matched', router.currentRoute.matched)
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

export default router
```

![image-20210603161035125](https://public.shiguanghai.top/blog_img/image-20210603161035125EOu1c0.png)

到此，路由表结构就重构完毕了

### 头部 - 面包屑 - 展示

封装面包屑组件 `components/Breadcrumb/index.vue`

```vue
<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item
      v-for="route in routerRecords"
      :key="route.path"
    >{{ route.meta.title }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts">
import Vue from 'vue'
// import { RouteRecord } from 'vue-router'
export default Vue.extend({
  name: 'BreadCrumb',
  // data () {
  //   return {
  //     routerRecords: [] as Array<RouteRecord>
  //   }
  // },
  computed: {
    routerRecords () {
      return this.$route.matched.filter((route) => route.meta.title !== undefined)
    }
  }
  // created () {
  //   this.getRouterRecords()
  // },
  // watch: {
  //   $route () {
  //     this.getRouterRecords()
  //   }
  // },
  // methods: {
  //   getRouterRecords () {
  //     this.routerRecords = this.$route.matched.filter((route) => {
  //       return route.meta.title !== undefined
  //     })
  //   }
  // }
})
</script>
```

加载面包屑组件 `layout/components/app-header.vue`

```vue
<!-- 面包屑组件 -->
<Breadcrumb />

<script lang="ts">
...
import Breadcrumb from '@/components/Breadcrumb/index.vue'

export default Vue.extend({
  name: 'AppHeader',
  components: {
    Breadcrumb
  }
})
</script>
```

![image-20210603170435333](https://public.shiguanghai.top/blog_img/image-20210603170435333AUre9M.png)

### 路由 - NProgress 进度条

NProgress是页面跳转是出现在浏览器顶部的进度条

- [官网](http://ricostacruz.com/nprogress/ )
- [GitHub](https://github.com/rstacruz/nprogress)

```shell
npm install --save nprogress

# 用法
NProgress.start()
NProgress.done()
```

使用

```typescript
//导入
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})
```

![image-20210603171356077](https://public.shiguanghai.top/blog_img/image-20210603171356077OyQluH.png)

### 导航栏 - RBAC 权限控制

权限路由菜单目前比较主流的两种方案：

1. 基于 RBAC 的前后端权限控制方案
2. 基于纯前端的权限控制方案

RBAC (Role-Based Access Control)，也就是所谓的 **基于角色的访问控制权限**。核心是在后端对接口和数据的处理，前端主要负责展示部分的控制，我们主要实现前端这部分

**实现思路：**

**通过动态添加路由的方式：**

- 参考 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin)

1. 初始化的时候只挂载一些登录或者不用权限的公共页面

2. 当用户登录后，获取 `role`，将 `role` 和路由表每个页面的需要的权限作比较，生成最终用户可访问的路由表

3. 调用 `router.addRoute(store.getters.addRouters)` 添加用户可访问的路由

   a. 动态添加路由之后如果 `next()` 跳转会重新走进这个流程，进入死循环

   b. 所以你必须在钩子中判断有没有拿到权限，没有才判断（有 不能判断 会进循环）

4. 使用 vuex 管理路由表，根据 vuex 中可访问的路由渲染侧边栏组件

这个方案有个缺陷：动态 `addRoute` 之后必须让路由重定向才能生效，会导致不能在每次页面导航的时候动态加载权限路由。它只能在页面初始化访问的时候加载一次权限路由，假如用户在使用期限，管理员修改了它的权限，用户如果不刷新页面，菜单不会改变

**通过权限比对的方式：**

1. 默认加载所有路由表
2. 在路由导航钩子中动态获取用户的列表权限，然后判断当前访问的路由是否在权限路由中。如果在，则允许访问；如果不在，则不允许访问，跳转到 403 页面
3. 把权限路由保存到 Vuex 容器中，在侧边栏中遍历展示权限路由菜单

这里我们使用权限比对的方式实现：

403 页面 `views/error-page/403.vue`

```vue
<template>
  <div class="403">
    <h1>403 Not Permistion.</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'NotPermistion'
})
</script>

<style lang="scss" scoped></style>
```

路由 `router/modules/index.ts`

```typescript
{
  path: '/not-permission',
  name: 'not-permistion',
  component: () => import(/* webpackChunkName: '403' */ '@/views/error-page/403.vue')
},
```

路由导航钩子 `router/index.ts`

```typescript
// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach((to, from, next) => {
  ...
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.user) { // 如果没有登录状态
      // 跳转到登录状态
      ...
    } else { // 有登录状态 校验访问权限
      // 1. 获取用户权限列表
      // 2. 判断当前访问的路由是否存在于权限列表中
      //      - 如果存在，则通过访问
      //      - 不存在，跳转到 403 页面
      next() // 允许通过
    }
  } else {
    next() // 确保一定要调用 next()
  }
})
```

封装请求 `services/user.ts`

[edu-boss-boot - 获取用户菜单和资源权限列表](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E7%94%A8%E6%88%B7%E6%9D%83%E9%99%90/getUserPermissionsUsingGET)

```typescript
export const getUserPermissions = () => {
  return request({
    method: 'GET',
    url: '/boss/permission/getUserPermissions'
  })
}
```

加载请求获取数据存储到 vuex 容器 `store/index.ts`

```typescript
import Vue from 'vue'
import Vuex from 'vuex'
import { getUserPermissions } from '@/services/user'

Vue.use(Vuex)

export default new Vuex.Store({
  // 容器的状态实现了数据共享，在组件里面访问方便，但是没有持久化的功能
  state: {
    user: JSON.parse(window.localStorage.getItem('user') || 'null'),
    // user: null // 当前登录用户状态
    menuList: [], // 权限菜单
    resourceList: [] // 权限资源
  },
  mutations: {
    // 修改容器数据必须使用 mutation 函数
    ...
    SET_MENU_LIST (state, payload) {
      state.menuList = payload
    },
    SET_RESOURCE_LIST (state, payload) {
      state.resourceList = payload
    }
  },
  actions: { // 异步加载数据
    async getUserPermissions ({ commit }) {
      const { data } = await getUserPermissions()
      commit('SET_MENU_LIST', data.content.menuList)
      commit('SET_RESOURCE_LIST', data.content.resourceList)
      return data
    }
  },
  modules: {
  }
})
```

核心逻辑实现 `router/index.ts`

```typescript
// 全局前置守卫：任何页面的访问都要经过这里
router.beforeEach(async (to, from, next) => {
  nprogress.start()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.user) { // 如果没有登录状态
      // 跳转到登录状态
      ...
    }
    // 1. 获取用户权限列表
    const { content } = await store.dispatch('getUserPermissions')
    const menuList = content.menuList
    // 2. 判断当前访问的路由是否存在于权限列表中
    //      - 如果存在，则通过访问
    for (let i = 0; i < menuList.length; i++) {
      const menu = menuList[i]
      // meta.menuId 需要对照 menuList 手动给每个路由分配 用于标识（这里不再赘述）
      if (menu.href === to.meta.menuId) {
        // 有权限，允许通过
        return next()
      }
      if (menu.subMenuList) {
        for (let j = 0; j < menu.subMenuList.length; j++) {
          const subMenu = menu.subMenuList[j]
          if (subMenu.href === to.meta.menuId) {
            // 有权限，允许通过
            return next()
          }
        }
      }
    }
    //      - 不存在，跳转到 403 页面
    // 代码运行到这里意味着上面没有 return next()
    // 这里就要让用户到 403 页面了
    return next('/not-permission')
  }
  next() // 确保一定要调用 next()
})
```

在侧边栏中遍历展示权限路由菜单

封装侧边栏组件 `components/AppMenu/index.vue`

```vue
<template>
  <el-menu
    default-active="2"
    @open="handleOpen"
    @close="handleClose"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    router
  >
    <MenuItem
      v-for="menu in menuList"
      :key="menu.id"
      :menu="menu"
    />
  </el-menu>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import MenuItem from './MenuItem.vue'

export default Vue.extend({
  name: 'AppMenu',
  components: {
    MenuItem
  },
  computed: {
    // 映射 menuList 权限菜单
    ...mapState(['menuList'])
  },
  methods: {
    handleOpen (key: string, keyPath: string): void {
      console.log(key, keyPath)
    },
    handleClose (key: string, keyPath: string): void {
      console.log(key, keyPath)
    }
  }
})
</script>
```

注册侧边栏组件 `layout/components/app-aside.vue`

```vue
<template>
  <div class="aside">
    <router-link class="logo" to="/" title="Back to Home">
      <img src="https://public.shiguanghai.top/public/logo.png" alt="EduBoss">
      <h1>Edu Boss</h1>
    </router-link>
    <!-- 侧边菜单栏 -->
    <AppMenu />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AppMenu from '@/components/AppMenu/index.vue'

export default Vue.extend({
  name: 'AppAside',
  components: {
    AppMenu
  }
})
</script>

<style lang="scss" scoped>
.aside {
  .logo {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    background: #545c64;
    color: #fff;
    text-decoration: none;
    img {
      width: 40px;
      border-radius: 10px;
    }
  }
  .el-menu {
    min-height: 100vh;
  }
}
</style>
```

封装 Menu 组件 `components/AppMenu/MenuItem.vue`

```vue
<template>
  <div v-if="menu.shown" class="menu-item">
    <!-- 如果有子菜单并且至少有一个孩子是 shown 展示状态 -->
    <el-submenu
      v-if="menu.subMenuList && menu.subMenuList.some(item => item.shown)"
      :index="transform(menu.href)"
    >
      <template slot="title">
        <i class="el-icon-location"></i>
        <span>{{ menu.name }}</span>
      </template>
      <!-- 组件递归必须有 name -->
      <MenuItem
        v-for="subMenu in menu.subMenuList"
        :key="subMenu.id"
        :menu="subMenu"
      />
    </el-submenu>

    <el-menu-item v-else :index="transform(menu.href)">
      <i class="el-icon-setting"></i>
      <span slot="title">{{ menu.name }}</span>
    </el-menu-item>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuItem',
  props: {
    menu: {
      type: Object,
      required: true
    }
  },
  methods: {
    transform (href: string) {
      switch (href) {
        case 'Role':
          return '/role'
        case 'Menu':
          return '/menu'
        case 'Resource':
          return '/resource'
        case 'Courses':
          return '/course'
        case 'Users':
          return '/user'
        case 'Advertise':
          return '/advert'
        case 'AdvertiseSpace':
          return '/advert-space'
        default:
          return ''
      }
    }
  }
})
</script>

<style lang='scss' scoped></style>
```

![image-20210604002001555](https://public.shiguanghai.top/blog_img/image-20210604002001555os3Pdw.png)