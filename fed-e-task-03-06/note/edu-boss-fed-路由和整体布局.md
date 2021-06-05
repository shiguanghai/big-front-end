## 21.5 路由处理

### 初始化路由页面组件

我们这里先把这几个主要的页面配置出来，其它页面在随后的开发过程中配置

| 路径          | 说明       |
| ------------- | ---------- |
| /             | 首页       |
| /login        | 用户登录   |
| /role         | 角色管理   |
| /menu         | 菜单管理   |
| /resource     | 资源管理   |
| /course       | 课程管理   |
| /user         | 用户管理   |
| /advert       | 广告管理   |
| /advert-space | 广告位管理 |

例如：`/` -> 创建 `/views/home/index.vue`：

```vue
<template>
  <div class="home">首页</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HomeIndex'
})
</script>

<style lang="scss" scoped></style>
```

依次创建出其他页面，配置路由 `router/index.ts`：

```typescript
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

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

const router = new VueRouter({
  routes
})

export default router
```

此处使用 **路由懒加载**。好处：不使用的话会把所有路由相关的资源打包到一个 chunk 中，使用懒加载打包时会单独分成多个模块来加载，使用到时再加载。建议给分出的模块起一个别名 `/* webpackChunkName: 'name' */`

![image-20210428212155865](https://public.shiguanghai.top/blog_img/image-202104282121558659fAsYd.png)

当我们访问不存在的路由时，我们希望展示 404 页面

`views/error-page/404.vue`

```vue
<template>
  <div class="404">
    <h1>404 Not Found.</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'NotFound'
})
</script>

<style lang="scss" scoped></style>
```

`router/index.ts`

```typescript
  {
    path: '*',
    name: '404',
    component: () => import(/* webpackChunkName: '404' */ '@/views/error-page/404.vue')
  }
```

![image-20210428214046399](https://public.shiguanghai.top/blog_img/image-20210428214046399h2Zk5q.png)

### Layout 和 嵌套路由

当我们把具体的页面组件和路由配置完成后，接下来我们开始考虑具体的布局

我们希望登录页面和404错误页是一种布局，其他页面有共同的侧边栏和顶部，且存在嵌套。我们可以通过嵌套路由的方式来实现

`layout/index.vue`

```vue
<template>
  <div class="layout">
    <h2>头部</h2>
    <h2>侧边栏</h2>

    <!-- 子路由出口 -->
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'LayoutIndex'
})
</script>

<style lang="scss" scoped></style>
```

`router/index.ts`

```typescript
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'

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

export default router
```

![image-20210428220500051](https://public.shiguanghai.top/blog_img/image-20210428220500051eRIUa4.png)

![image-20210428220525599](https://public.shiguanghai.top/blog_img/image-20210428220525599PlxBwR.png)

对根组件进行简单修改 `App.vue`

```vue
<template>
  <div id="app">
    <!-- 根路由出口 -->
    <router-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'App'
})
</script>

<style lang="scss" scoped></style>
```

![image-20210428220835839](https://public.shiguanghai.top/blog_img/image-20210428220835839Ff0XaF.png)

## 21.6 整体布局

### Container 布局容器

接下来我们来处理一下整体结构布局，这里我们参考 [Element - Container 布局容器](https://element.eleme.io/#/zh-CN/component/container)

![image-20210429202312469](https://public.shiguanghai.top/blog_img/image-20210429202312469k6SQ8B.png)

```vue
<el-container>
  <el-aside width="200px">Aside</el-aside>
  <el-container>
    <el-header>Header</el-header>
    <el-main>Main</el-main>
  </el-container>
</el-container>
```

`layout/index.vue`

```vue
<template>
  <el-container>
    <el-aside width="200px">Aside</el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'LayoutIndex'
})
</script>

<style lang="scss" scoped>
  .el-header {
    background-color: #B3C0D1;
  }
  .el-aside {
    background-color: #D3DCE6;
  }
  .el-main {
    background-color: #E9EEF3;
  }
  .el-container {
    min-height: 100vh;
    min-width: 980px;
  }
</style>
```

![image-20210429203501318](https://public.shiguanghai.top/blog_img/image-20210429203501318y6CdYq.png)

### 侧边栏 - NavMenu 导航菜单

参考 [Element - NavMenu 导航菜单](https://element.eleme.io/#/zh-CN/component/menu#menu-group-attribute)

![image-20210429203928602](https://public.shiguanghai.top/blog_img/image-20210429203928602RNoeEr.png)

```vue
<el-row class="tac">
  ...
  <el-col :span="12">
    <h5>自定义颜色</h5> 
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>导航一</span>
        </template>
        <el-menu-item-group>
          <template slot="title">分组一</template>
          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="1-4">
          <template slot="title">选项4</template>
          <el-menu-item index="1-4-1">选项1</el-menu-item>
        </el-submenu>
      </el-submenu>
      <el-menu-item index="2">
        <i class="el-icon-menu"></i>
        <span slot="title">导航二</span>
      </el-menu-item>
      <el-menu-item index="3" disabled>
        <i class="el-icon-document"></i>
        <span slot="title">导航三</span>
      </el-menu-item>
      <el-menu-item index="4">
        <i class="el-icon-setting"></i>
        <span slot="title">导航四</span>
      </el-menu-item>
    </el-menu>
  </el-col>
</el-row>
<script>
  export default {
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>
```

单独提取出来到`layut/components/app-aside.vue`

```vue
<template>
  <div class="aside">
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>导航一</span>
        </template>
        <el-menu-item-group>
          <template slot="title">分组一</template>
          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>
        <el-submenu index="1-4">
          <template slot="title">选项4</template>
          <el-menu-item index="1-4-1">选项1</el-menu-item>
        </el-submenu>
      </el-submenu>
      <el-menu-item index="2">
        <i class="el-icon-menu"></i>
        <span slot="title">导航二</span>
      </el-menu-item>
      <el-menu-item index="3" disabled>
        <i class="el-icon-document"></i>
        <span slot="title">导航三</span>
      </el-menu-item>
      <el-menu-item index="4">
        <i class="el-icon-setting"></i>
        <span slot="title">导航四</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AppAside',
  methods: {
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

在`layout/index.vue`中加载使用

```vue
<template>
  <el-container>
    <el-aside width="200px">
      <app-aside />
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AppAside from './components/app-aside.vue'

export default Vue.extend({
  name: 'LayoutIndex',
  components: {
    AppAside
  }
})
</script>
```

![image-20210429210053375](https://public.shiguanghai.top/blog_img/image-20210429210053375v3zdEM.png)

添加样式`layut/components/app-aside.vue`填满页面

```vue
<style lang="scss" scoped>
  .aside {
    .el-menu {
      min-height: 100vh;
    }
  }
</style>
```

![image-20210429210322843](https://public.shiguanghai.top/blog_img/image-20210429210322843WfoBrp.png)

解决`layut/components/app-aside.vue`编辑器 TypeScript 警告

![image-20210429211542016](https://public.shiguanghai.top/blog_img/image-20210429211542016fOWQkg.png)

参考 [NavMenu - Menu Events](https://element.eleme.io/#/zh-CN/component/menu#menu-events)

![image-20210429211337914](https://public.shiguanghai.top/blog_img/image-20210429211337914a6NFyn.png)

通过代码 `index="1"` 我们判断 `index` 是字符串类型，添加类型声明

```vue
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AppAside',
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

以上问题解决后，我们来自定义侧边栏组件 `layout/components/app-asside.vue`

```vue
<template>
  <div class="aside">
    <el-menu
      default-active="2"
      @open="handleOpen"
      @close="handleClose"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>权限管理</span>
        </template>
          <el-menu-item index="1-1">
            <i class="el-icon-setting"></i>
            <span slot="title">角色管理</span>
          </el-menu-item>
          <el-menu-item index="1-2">
            <i class="el-icon-setting"></i>
            <span slot="title">菜单管理</span>
          </el-menu-item>
          <el-menu-item index="1-3">
            <i class="el-icon-setting"></i>
            <span slot="title">资源管理</span>
          </el-menu-item>
      </el-submenu>
      <el-menu-item index="2">
        <i class="el-icon-menu"></i>
        <span slot="title">课程管理</span>
      </el-menu-item>
      <el-menu-item index="3">
        <i class="el-icon-document"></i>
        <span slot="title">用户管理</span>
      </el-menu-item>
      <el-submenu index="4">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>广告管理</span>
        </template>
          <el-menu-item index="4-1">
            <i class="el-icon-setting"></i>
            <span slot="title">广告列表</span>
          </el-menu-item>
          <el-menu-item index="4-2">
            <i class="el-icon-setting"></i>
            <span slot="title">广告位列表</span>
          </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>
```

![image-20210429213946336](https://public.shiguanghai.top/blog_img/image-20210429213946336ASWuH0.png)

接下来处理路由，参考 [NavMenu - Menu Attribute](https://element.eleme.io/#/zh-CN/component/menu#menu-attribute)

![image-20210429214850150](https://public.shiguanghai.top/blog_img/image-202104292148501508olxLE.png)

它会以 `index` 作为路由路径来跳转，所以我们来修改 `index`

```vue
<template>
  <div class="aside">
    <el-menu
      default-active="2"
      @open="handleOpen"
      @close="handleClose"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router
    >
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>权限管理</span>
        </template>
          <el-menu-item index="/role">
            <i class="el-icon-setting"></i>
            <span slot="title">角色管理</span>
          </el-menu-item>
          <el-menu-item index="/menu">
            <i class="el-icon-setting"></i>
            <span slot="title">菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/resource">
            <i class="el-icon-setting"></i>
            <span slot="title">资源管理</span>
          </el-menu-item>
      </el-submenu>
      <el-menu-item index="/course">
        <i class="el-icon-menu"></i>
        <span slot="title">课程管理</span>
      </el-menu-item>
      <el-menu-item index="/user">
        <i class="el-icon-document"></i>
        <span slot="title">用户管理</span>
      </el-menu-item>
      <el-submenu index="4">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>广告管理</span>
        </template>
          <el-menu-item index="/advert">
            <i class="el-icon-setting"></i>
            <span slot="title">广告列表</span>
          </el-menu-item>
          <el-menu-item index="/advert-space">
            <i class="el-icon-setting"></i>
            <span slot="title">广告位列表</span>
          </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>
```

最后，`layout/index.vue` 添加路由出口

```vue
<template>
  <el-container>
    <el-aside width="200px">
      <app-aside />
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <!-- 子路由出口 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
```

![image-20210429215818040](https://public.shiguanghai.top/blog_img/image-20210429215818040hKQWCB.png)

### 头部 - Breadcrumb 面包屑

参考 [Element -  Breadcrumb 面包屑](https://element.eleme.io/#/zh-CN/component/breadcrumb)

![image-20210501140805095](https://public.shiguanghai.top/blog_img/image-20210501140805095ocwLI3.png)

```vue
<el-breadcrumb separator-class="el-icon-arrow-right">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item>活动管理</el-breadcrumb-item>
  <el-breadcrumb-item>活动列表</el-breadcrumb-item>
  <el-breadcrumb-item>活动详情</el-breadcrumb-item>
</el-breadcrumb>
```

单独提取出来到 `layout/componrnt/app-header.vue`

```vue
<template>
  <div class="header">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'AppHeader'
})
</script>

<style lang="scss" scoped></style>
```

在 `layout/index.vue` 中加载使用

```vue
<template>
  <el-container>
    <el-aside width="200px">
      <app-aside />
    </el-aside>
    <el-container>
      <el-header>
        <app-header />
      </el-header>
      <el-main>
        <!-- 子路由出口 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AppAside from './components/app-aside.vue'
import AppHeader from './components/app-header.vue'

export default Vue.extend({
  name: 'LayoutIndex',
  components: {
    AppAside,
    AppHeader
  }
})
</script>
```

![image-20210501141835958](https://public.shiguanghai.top/blog_img/image-20210501141835958ze1SJw.png)

调整 header 背景颜色避免重色 `layout/index.vue`

```vue
<style lang="scss" scoped>
  .el-header {
    background-color: #FFF;
  }
  ...
</style>
```

调整 app-header 布局样式使其上下居中 `layout/componrnt/app-header.vue`

```vue
<style lang="scss" scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
```

![image-20210501142154510](https://public.shiguanghai.top/blog_img/image-20210501142154510UIB7M2.png)

### 头部 - 登录信息

#### Dropdown 下拉菜单

接下来我们来在头部加入当前登录用户信息，首先参考 [Element - Dropdown 下拉菜单](https://element.eleme.io/#/zh-CN/component/dropdown)

![image-20210501142555871](https://public.shiguanghai.top/blog_img/image-202105011425558717FD2Ru.png)

```vue
<el-dropdown>
  <span class="el-dropdown-link">
    下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
  </span>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>黄金糕</el-dropdown-item>
    <el-dropdown-item>狮子头</el-dropdown-item>
    <el-dropdown-item>螺蛳粉</el-dropdown-item>
    <el-dropdown-item disabled>双皮奶</el-dropdown-item>
    <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
  </el-dropdown-menu>
</el-dropdown>
```

`layout/components/app-header.vue`

```vue
<template>
  <div class="header">
    ...
    <el-dropdown>
      <span class="el-dropdown-link">
        下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>黄金糕</el-dropdown-item>
        <el-dropdown-item>狮子头</el-dropdown-item>
        <el-dropdown-item>螺蛳粉</el-dropdown-item>
        <el-dropdown-item disabled>双皮奶</el-dropdown-item>
        <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
```

![image-20210501142929510](https://public.shiguanghai.top/blog_img/image-20210501142929510tJxAyC.png)

使 其面包屑 和 下拉菜单 两端对齐

```vue
<style lang="scss" scoped>
.header {
  ...
  justify-content: space-between;
}
</style>
```

#### Avatar 头像

自定义头部组件登录用户头像，参考 [Element - Avatar 头像](https://element.eleme.io/#/zh-CN/component/avatar#avatar-tou-xiang)

```vue
<el-dropdown>
  <span class="el-dropdown-link">
    <el-avatar
      shape="square"
      :size="40"
      src="https://public.shiguanghai.top/public/avatar.png"
      ></el-avatar>
    <i class="el-icon-arrow-down el-icon--right"></i>
  </span>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item>用户ID</el-dropdown-item>
    <el-dropdown-item divided>退出</el-dropdown-item>
  </el-dropdown-menu>
</el-dropdown>
```

修改下拉菜单样式

```vue
<style lang="scss" scoped>
.header {
  ...
  .el-dropdown-link {
    display: flex;
    align-items: center;
  }
}
</style>
```

![image-20210501151637469](https://public.shiguanghai.top/blog_img/image-202105011516374693L4doE.png)