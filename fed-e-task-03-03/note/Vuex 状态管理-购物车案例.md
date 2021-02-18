---
title: Vuex 状态管理 - 购物车案例
date: 2020-12-31 19:22:16
sidebar: 'auto'
tags:
 - Vue.js
 - Part3·Vue.js 框架源码与进阶
 - Vuex
categories:
 - 大前端
publish: true 
isShowComments: false
---


## 8.5 Vuex 购物车案例

> 接下来我们通过一个购物车案例来演示 Vuex 在项目中的使用方式，首先把购物车的[ 项目模板 ](https://github.com/goddlts/vuex-cart-demo-template)下载下来。

### 案例演示
- [完整案例代码仓库](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/03-vuex-cart-demo)

**运行项目**：
```shell
# 第一个进程
node server

# 第二个进程
npm run serve
```
**运行效果**：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228192831340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228192851984.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228192908673.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228192931148.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 功能列表
- 商品列表组件
	* 展示商品列表
	* 添加购物车
- 商品列表中弹出框组件
- 购物车列表组件

### 商品列表
**商品列表功能**

- Vuex 中创建两个模块，分别用来记录商品列表和购物车的状态，store 的结构：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228174039165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- products 模块，store/modules/products.js

```js
import axios from 'axios'

const state = {
  products: [] // 记录所有商品
}
const getters = {}
const mutations = {
  // 修改商品数据状态
  setProducts (state, payload) {
    state.products = payload
  }
}
// 请求接口获取数据
const actions = {
  async getProducts ({ commit }) {
    const { data } = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/products'
    })
    // 提交 Mutation
    commit('setProducts', data)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
```

- store/index.js 中注册 products.js 模块
```js
import products from './modules/products'
```

- views/products.vue 中实现商品列表的功能
```js
import { mapState, mapActions } from 'vuex'
export default {
  name: 'ProductList',
  computed: {
    ...mapState('products', ['products'])
  },
  methods: {
    ...mapActions('products', ['getProducts'])
  },
  created () {
    this.getProducts()
  }
}
```

### 添加购物车
- cart 模块实现添加购物车功能，store/modules/cart.js

```js
const mutations = {
  addToCart (state, product) {
    // 1. cartProducts 中没有该商品，把该商品(product)添加到数组，
    // 并增加 count=1，isChecked=true，totalPrice
    // 2. cartProducts 有该商品，让商品的数量(count)加1，选中，计算小计
    const prod = state.cartProducts.find(item => item.id === product.id)
    if (prod) {
      prod.count++
      prod.isChecked = true
      prod.totalPrice = prod.count * prod.price
    } else {
      state.cartProducts.push({
        ...product,
        count: 1,
        isChecked: true,
        totalPrice: product.price
      })
    }
  }
}  
```

- store/index.js 中注册 cart 模块
```js
import cart from './modules/cart'
```

- view/products.vue 中实现添加购物车功能
```js
<!-- 修改模板 -->
<!-- <template slot-scope="scope"> -->
<template v-slot="scope">
  <el-button @click="addToCart(scope.row)">加入购物车</el-button>
</template>
```
```js
<!-- 映射 cart 中的 mutations -->
import { mapMutations } from 'vuex'

methods: {
  ...mapMutations('cart', ['addToCart'])
}
```
### 我的购物车 - 列表
- components/pop-cart.vue 中展示购物车列表
```js
import { mapState } from 'vuex'

export default {
  name: 'PopCart',
  computed: {
    ...mapState('cart', ['cartProducts'])
  }
}
```
### 我的购物车 - 统计
- cart 模块实现统计总数和总价，store/modules/cart.js
```js
const state = {
  cartproducts: []
}

const getters = {
  totalCount (state) {
    return state.cartProducts.reduce((count, prod) => {
      return count + prod.count
    }, 0)
  },
  totalPrice (state) {
    return state.cartProducts.reduce((count, prod) => {
      return count + prod.totalPrice
    }, 0).toFixed(2)
  }
}
```

- components/pop-cart.vue 中显示徽章和小计
```js
<div>
  <p>共 {{ totalCount }} 件商品 共计¥{{ totalPrice }}</p>
  <el-button size="mini" type="danger" @click="$router.push({ name: 'cart' })">
去购物车</el-button>
</div>
<el-badge :value="totalCount" class="item" slot="reference">
  <el-button type="primary">我的购物车</el-button>
</el-badge>
```
```js
import { mapGetters } from 'vuex'

computed: {
  ...mapGetters('cart', ['totalCount', 'totalPrice'])
}
```
### 我的购物车 - 删除
- cart 模块实现从购物车删除的功能，store/modules/cart.js
```js
// mutations 中添加

deleteFromCart (state, prodId) {
  const index = state.cartProducts.findIndex(item => item.id === prodId)
  index !== -1 && state.cartProducts.splice(index, 1)
}
```

- components/pop-cart.vue 中实现删除功能
```js
<template slot-scope="scope">
  <el-button
    @click="deleteFromCart(scope.row.id)"
    size="mini"
  >删除</el-button>
</template>
```
```js
import { mapMutations } from 'vuex'

methods: {
  ...mapMutations('cart', ['deleteFromCart'])
}
```
### 购物车组件 - 购物车列表
-  views/cart.vue 中展示购物车列表
```js
import { mapState } from 'vuex'

computed: {
  ...mapState('cart', ['cartProducts']),
}
```
### 购物车组件 - 全选功能
- cart 模块实现更新商品的选中状态，store/modules/cart.js
```js
// 更新所有商品的选中状态（点击全选）
updateAllProductChecked (state, checked) {
  state.cartProducts.forEach(prod => {
    prod.isChecked = checked
  })
},
// 更新某个商品的选中状态（点击单个商品）
updateProductChecked (state, {
  checked,
  prodId
}) {
  const prod = state.cartProducts.find(prod => prod.id === prodId)
  prod && (prod.isChecked = checked)
}
```

- views/cart.vue，实现全选功能
	* [使用事件抛出一个值](https://cn.vuejs.org/v2/guide/components.html#%E4%BD%BF%E7%94%A8%E4%BA%8B%E4%BB%B6%E6%8A%9B%E5%87%BA%E4%B8%80%E4%B8%AA%E5%80%BC)

```js
<el-table-column width="55">
  <template v-slot:header>
    <el-checkbox v-model="checkedAll" size="mini">
    </el-checkbox>
  </template>
  <!--
    @change="updateProductChecked"  默认参数：更新后的值
    @change="updateProductChecked(productId, $event)"  123, 原来那个默认参数
    当你传递了自定义参数的时候，还想得到原来那个默认参数，就手动传递一个 $event
  -->
  <template v-slot="scope">
    <el-checkbox
      size="mini"
      :value="scope.row.isChecked"
      @change="updateProductChecked({
        prodId: scope.row.id,
        checked: $event
      })"
    >
    </el-checkbox>
  </template>
</el-table-column>
```
```js
import { mapMutations } from 'vuex'

computed: {
  checkedAll: {
    get () {
      return this.cartProducts.every(prod => prod.isChecked)
    },
    set (value) {
      this.updateAllProductChecked(value)
    }
  }
},
methods: {
  ...mapMutations('cart', [
    'updateAllProductChecked',
    'updateProductChecked'
  ])
}
```
### 购物车组件 - 数字文本框
- cart 模块实现更新商品数量，store/modules/cart.js
```js
updateProduct (state, {
  prodId,
  count
}) {
  const prod = state.cartProducts.find(prod => prod.id === prodId)
  if (prod) {
    prod.count = count
    prod.totalPrice = count * prod.price
  }
}
```

- views/cart.vue，实现数字文本框功能
```js
<el-table-column
  prop="count"
  label="数量">
  <template v-slot="scope">
    <el-input-number :value="scope.row.count" @change="updateProduct({
      prodId: scope.row.id,
      count: $event
    })" size="mini"></el-input-number>
  </template>
</el-table-column>
```
```js
methods: {
  ...mapMutations('cart', [
    'updateProduct'
  ])
}
```
### 购物车组件 - 统计
- cart 模块实现统计选中商品价格和数量，store/modules/cart.js
```js
checkedCount (state) {
  return state.cartProducts.reduce((sum, prod) => {
    if (prod.isChecked) {
      sum += prod.count
    }
    return sum
  }, 0)
},
checkedPrice (state) {
  return state.cartProducts.reduce((sum, prod) => {
    if (prod.isChecked) {
      sum += prod.totalPrice
    }
    return sum
  }, 0)
}
```

- views/cart.vue，实现小计
```js
<p>已选 <span>{{ checkedCount }}</span> 件商品，总价：<span>{{ 
checkedPrice }}</span></p>
```
```js
import { mapGetters } from 'vuex'

computed: {
  ...mapGetters('cart', ['checkedCount', 'checkedPrice']),
}
```
### 购物车组件 - 删除
- views/cart.vue，实现删除功能
```js
<template slot-scope="scope">
  <el-button @click="deleteFromCart(scope.row.id)" size="mini">删除</el-button>
</template>
```
```js
methods: {
  ...mapMutations('cart', [
    'deleteFromCart'
  ])
}
```
### 本地存储
- store/modules/cart.js，获取存储在本地的数据
```js
const state = {
  // 把字符串转换为对象
  cartProducts: JSON.parse(window.localStorage.getItem('cart-products')) || []
}
```

- store/index.js，当购物车的数据更改，重新存储到localStorage
	* Vuex 插件介绍
		+ Vuex 的插件就是一个函数
		+ 这个函数接收一个 store 的参数

因此我们可以注册一个函数让它可以在所有的mutation结束之后执行：
```js
const myPlugin = store => {
  // 当 store 初始化后调用
  store.subscribe((mutation, state) => {
    // 每次 mutation 之后调用
    // mutation 的格式为 { type, paylod }
    if (mutation.type.startsWith('cart/')) { // 判断是否为cart模块的mutation
      window.localStorage.setItem('cart-products', JSON.stringify(state.cart.cartProducts))
    }
  })
}

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    products,
    cart
  },
  // 注册插件
  plugins: [myPlugin]
})
```
