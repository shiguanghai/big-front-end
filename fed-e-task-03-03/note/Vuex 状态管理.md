
## 8.1 组件通信方式
### 组件内的状态管理流程
Vue 最核心的两个功能：[ 数据驱动 ](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/%E6%A8%A1%E6%8B%9FVue.js%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%86.html#_2-1-%E6%95%B0%E6%8D%AE%E9%A9%B1%E5%8A%A8)和[ 组件化](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/Vue%E6%BA%90%E7%A0%81-%E7%BB%84%E4%BB%B6%E5%8C%96.html#_7-1-%E7%BB%84%E4%BB%B6%E5%8C%96)。

组件化开发给我们带来了：

- 更快的开发效率
- 更好的可维护性

**每个组件都有自己的状态（state）、视图（view）和行为（actions）等组成部分**

下面是一个最简单的组件的代码，每个组件内部都有自己的数据、模板还有方法。

- 数据可以称之为状态，每个组件内部都可以管理自己的内部状态
- 模板可以称之为视图，每个组件都有自己的视图，把状态绑定到视图上给用户
- 用户与视图交互的时候可能会更改状态，当状态发生变化后会自动更新到视图，更改状态的部分可以称之为行为

```js
new Vue({
  // state
  data () {
    return {
      count: 0
    }
  },
  // view
  template: `
    <div>{{ count }}</div>
  `,
  // actions
  methods: {
    increment () {
      this.count++
    }
  }
})
```
这里我们描述的是单个组件的状态管理，实际开发过程中可能多个组件都要共享状态，我们所说的状态管理就是通过状态集中管理和分发解决多个组件共享状态的问题。

状态管理包含以下几部分：

- **state**：驱动应用的数据源
- **view**：以声明方式将 **state** 映射到视图
- **actions**：响应在 **view** 上的用户输入导致的状态变化

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227164009672.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
这里的箭头是数据的流向，此处数据的流向是单向的，State状态就是我们所说的数据，数据绑定到视图展示给用户，当用户和视图交互，通过Actions更改数据之后，更改后的数据重新绑定到视图。

单向的数据流程非常清晰，但是多个组件共享数据时会破坏这种简单的结构，接下来我们来看一下组件之间的通信方式。

### 组件间通信方式
- 大多数场景下的组件都并不是独立存在的，而是相互协助共同构成了一个复杂的业务功能
- 在 Vue 中为不同的组件关系提供了不同的通信规则

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227164316368.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 父组件给子组件传值
- [父传子：Props Down](https://cn.vuejs.org/v2/guide/components.html#通过-Prop-向子组件传递数据)
	*  [演示代码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/01-statemanagement/src/components/01-props-down)

子组件中通过 `props` 接收数据：
```js
// Child.vue

<template>
  <div>
    <h1>Props Down Child</h1>
    <h2>{{ title }}</h2>
  </div>
</template>

<script>
export default {
  // props: ['title'],
  props: {
    title: String
  }
}
</script>
```
父组件中给子组件通过相应属性传值：
```js
// Parent.vue

<template>
  <div>
    <h1>Props Down Parent</h1>
    <child title="My journey with Vue"></child>
  </div>
</template>

<script>
import child from './01-Child'
export default {
  components: {
    child
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227165656538.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 子组件给父组件传值
- [子传父：Event Up](https://cn.vuejs.org/v2/guide/components.html#%E7%9B%91%E5%90%AC%E5%AD%90%E7%BB%84%E4%BB%B6%E4%BA%8B%E4%BB%B6)
	* [演示代码](github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/01-statemanagement/src/components/02-event-up)

在子组件中使用 `$emit` 发布一个自定义事件：
```js
// Child.vue

<template>
  <div>
    <h1 :style="{ fontSize: fontSize + 'em' }">Props Down Child</h1>
    <button @click="handler">文字增大</button>
  </div>
</template>

<script>
export default {
  props: {
    fontSize: Number
  },
  methods: {
    handler () {
      // this：当前子组件对象
      this.$emit('enlargeText', 0.1)
    }
  }
}
</script>
```
在使用这个组件的时候，使用 `v-on` 监听这个自定义事件，然后当在父级组件监听这个事件的时候，我们可以通过 `$event` 访问到被抛出的这个值：

[使用事件抛出一个值](https://cn.vuejs.org/v2/guide/components.html#%E4%BD%BF%E7%94%A8%E4%BA%8B%E4%BB%B6%E6%8A%9B%E5%87%BA%E4%B8%80%E4%B8%AA%E5%80%BC)
```js
// Parent.vue

<template>
  <div>
    <h1 :style="{ fontSize: hFontSize + 'em'}">Event Up Parent</h1>

    这里的文字不需要变化

    <child :fontSize="hFontSize" v-on:enlargeText="enlargeText"></child>
    <child :fontSize="hFontSize" v-on:enlargeText="enlargeText"></child>
    <child :fontSize="hFontSize" v-on:enlargeText="hFontSize += $event"></child>
  </div>
</template>

<script>
import child from './02-Child'
export default {
  components: {
    child
  },
  data () {
    return {
      hFontSize: 1
    }
  },
  methods: {
    enlargeText (size) {
      this.hFontSize += size
    }
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227170529984.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227170557392.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 不相关组件传值
- [非父子组件：Event Bus](https://cn.vuejs.org/v2/guide/migration.html#dispatch-%E5%92%8C-broadcast-%E6%9B%BF%E6%8D%A2)
	* [演示代码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/01-statemanagement/src/components/03-event-bus)

我们可以使用一个非常简单的 Event Bus（创建一个公共的Vue实例作为事件总线/事件中心）来解决这个问题：
```js
// evenrbus.js

import Vue from 'vue'
export default new Vue() 
```
然后在需要通信的两端：

使用 `$emit` 发布：
```js
// Sibling-01.vue

<template>
  <div>
    <h1>Event Bus Sibling01</h1>
    <div class="number" @click="sub">-</div>
    <input type="text" style="width: 30px; text-align: center" :value="value">
    <div class="number" @click="add">+</div>
  </div>
</template>

<script>
import bus from './eventbus'

export default {
  props: {
    // 文本框默认显示的商品个数
    num: Number
  },
  // 因为props的值不建议直接修改，将props数据存储到value中
  created () {
    this.value = this.num
  },
  data () {
    return {
      value: -1
    }
  },
  methods: {
    sub () {
      if (this.value > 1) {
        this.value--
        bus.$emit('numchange', this.value)
      }
    },
    add () {
      this.value++
      bus.$emit('numchange', this.value)
    }
  }
}
</script>
```
使用 `$on` 订阅：
```js
// Sibling-02.vue

<template>
  <div>
    <h1>Event Bus Sibling02</h1>

    <div>{{ msg }}</div>
  </div>
</template>

<script>
import bus from './eventbus'
export default {
  data () {
    return {
      msg: ''
    }
  },
  created () {
    bus.$on('numchange', (value) => {
      this.msg = `您选择了${value}件商品`
    })
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227172435822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### 通过 ref 获取子组件
- [父直接访问子组件：通过 ref 获取子组件](https://cn.vuejs.org/v2/guide/components-edge-cases.html#%E8%AE%BF%E9%97%AE%E5%AD%90%E7%BB%84%E4%BB%B6%E5%AE%9E%E4%BE%8B%E6%88%96%E5%AD%90%E5%85%83%E7%B4%A0)
	* [演示代码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/01-statemanagement/src/components/04-ref)

ref 有两个作用：

- 如果你把它作用到普通 HTML 标签上，则获取到的是 DOM 对象
- 如果你把它作用到组件标签上，则获取到的是组件实例对象

在使用子组件的时候，添加 `ref` 属性：
```js
// Child.vue

<template>
  <div>
    <h1>ref Child</h1>
    <input ref="input" type="text" v-model="value">
  </div>
</template>

<script>
export default {
  data () {
    return {
      value: ''
    }
  },
  methods: {
    // 用来从父级组件聚焦输入框
    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>
```
然后在父组件等渲染完毕后使用 `$refs` 访问：
```js
// Parent.vue

<template>
  <div>
    <h1>ref Parent</h1>

    <child ref="c"></child>
  </div>
</template>

<script>
import child from './04-Child'
export default {
  components: {
    child
  },
  mounted () {
    this.$refs.c.focus()
    this.$refs.c.value = 'hello input'
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227175332422.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
> **\$refs** 只会在组件渲染完成之后生效，并且它们不是响应式的。这仅作为一个用于直接操作子组件的“逃生舱”——你应该避免在模板或计算属性中访问 **\$refs**。

### 简易的状态管理方案
如果多个组件之间要共享状态（数据），使用上面的方式虽然可以实现，但是比较麻烦，而且多个组件之间互相传值很难追踪数据的变化，如果出现问题很难定位问题。

当遇到多个组件需要共享状态的时候，典型的场景：购物车。我们使用上述的方式都不合适，我们会遇到以下的问题：

- 多个视图依赖同一状态
- 来自不同视图的行为需要变更同一状态

对于问题一，传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力。

对于问题二，我们经常会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。

以上的这些模式非常脆弱，通常会导致无法维护的代码。

因此，我们为什么不把组件的的共享状态抽取出来（将来使用时保证其为响应式的），以一个全局单例模式来管理呢？在这种模式下，我们的组件树构成了一个巨大的“视图”，不管树在哪个位置，任何组件都能获取状态或者触发行为。

我们可以把多个组件的状态，或者整个程序的状态放到一个集中的位置存储，并且可以检测到数据的更改。你可能已经想到了 Vuex，这里我们先以一种简单的方式来实现：

- [简易的状态管理方案](https://cn.vuejs.org/v2/guide/state-management.html)
	* [演示代码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/01-statemanagement/src/components/05-easystate)

首先创建一个共享的状态仓库 `store` 对象，这是集中式的状态管理，所有状态都在 `store` 中进行管理，且它为全局唯一的对象，任意的组件都可以导入 `store` 模块使用其中的状态，更改状态也是在该模块中实现的：
```js
// store.js

export default {
  debug: true,
  state: {
    user: {
      name: 'xiaomao',
      age: 18,
      sex: '男'
    }
  },
  setUserNameAction (name) {
    if (this.debug) {
      console.log('setUserNameAction triggered：', name)
    }
    this.state.user.name = name
  }
}
```
把共享的仓库 `store` 对象，存储到需要共享状态的组件 `data` 中
```js
// componentA.vue

<template>
  <div>
    <h1>componentA</h1>
    user name: {{ sharedState.user.name }}
    <button @click="change">Change Info</button>
  </div>
</template>

<script>
import store from './store'
export default {
  methods: {
    // 点击按钮的时候通过 action 修改状态
    change () {
      store.setUserNameAction('componentA')
    }
  },
  data () {
    return {
      // 当前组件特有的自己的状态，存储到privateState
      privateState: {},
      // 把store中的state（共享的状态）存储到sharedState
      sharedState: store.state
    }
  }
}
</script>
```
componentA 和 componentB 两个组件共享了 `store` 中的状态，并且和用户交互的时候还会更改状态中的 `name` 属性
```js
// componentB.vue

<template>
  <div>
    <h1>componentB</h1>
    user name: {{ sharedState.user.name }}
    <button @click="change">Change Info</button>
  </div>
</template>

<script>
import store from './store'
export default {
  methods: {
    change () {
      store.setUserNameAction('componentB')
    }
  },
  data () {
    return {
      privateState: {},
      sharedState: store.state
    }
  }
}
</script>
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201227182624804.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020122718243555.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
这里我们采用了集中式的状态管理，使用了全局唯一的对象 store 来存储状态，并且有一个共同点约定：组件不允许直接变更属于 store 对象的 State，而应执行 Action 来分发（dispatch）事件通知 store 去改变，这样最终的样子跟 Vuex 的结构就类似了。

这样约定的好处是，我们能够记录所有 store 中发生的 State 变更，同时实现能做到记录变更、保存状态快照、历史回滚/时光旅行的先进的调试工具。

## 8.2 Vuex 核心概念
### 什么是 Vuex
> [Vuex](https://vuex.vuejs.org/zh/) 是一个专为 Vue.js 应用程序开发的**状态管理模式**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。Vuex 也集成到 Vue 的官方调试工具 [devtools extension](https://github.com/vuejs/vue-devtools)，提供了诸如零配置的 time-travel 调试、状态快照导入导出等高级调试功能。

- Vuex 是专门为 Vue.js 设计的状态管理库
- Vuex 采用集中式的方式存储需要共享的数据
- 从使用角度，Vuex 就是一个 JavaScript 库
- Vuex 的作用是进行状态管理，解决复杂组件通信，数据共享
- Vuex 集成到了 devtools 中，提供了 time-travel 时光旅行历史回滚功能

### 什么情况下使用 Vuex
官方文档：

- 非必要的情况不要使用 Vuex


> Vuex 可以帮助我们管理共享状态，并附带了更多的概念和框架。这需要对短期和长期效益进行权衡。

- 大型的单页应用程序
	* 多个视图依赖同一状态
	* 来自不同视图的行为需要变更同一状态

> 如果您不打算开发大型单页应用，使用 Vuex 可能是繁琐冗余的。确实是如此——如果您的应用够简单，您最好不要使用 Vuex。一个简单的 [store模式](https://cn.vuejs.org/v2/guide/state-management.html#%E7%AE%80%E5%8D%95%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%E8%B5%B7%E6%AD%A5%E4%BD%BF%E7%94%A8) 就足够您所需了。但是，如果您需要构建一个中大型单页应用，您很可能会考虑如何更好地在组件外部管理状态，Vuex 将会成为自然而然的选择。引用 Redux 的作者 Dan Abramov 的话说就是：Flux 架构就像眼镜：您自会知道什么时候需要它。

建议符合这种场景的业务使用 Vuex 来进行数据管理，例如非常典型的场景：[购物车案例](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/Vuex%20%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86-%E8%B4%AD%E7%89%A9%E8%BD%A6%E6%A1%88%E4%BE%8B.html)

**注意：Vuex 不要滥用，不符合以上需求的业务不要使用，反而会让你的应用变得更麻烦。**

### Vuex 核心概念

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201228165148439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
这张图展示了 Vuex 的核心概念，并且演示了整个工作流程：

 --> 从State开始，State 是我们管理的全局状态

 --> 把状态绑定到 Vue Components 组件（也就是视图上）渲染到用户界面展示给用户

 --> 用户可以和视图交互（比如点击购买按钮支付的时候），此时 Dispatch 分发 Actions（此处不直接提交 Mutations 是因为 Actions 中可以做异步的操作，购买的时候要发送异步请求）

 --> 当异步请求结束再通过提交 Mutations 记录状态的更改（Mutations必须是同步的，所有状态的更改都要通过Mutations，这样做的目的是为了追踪到所有状态的变化，阅读代码的时候更容易分析应用内部状态改变，还可以记录其改变实现高级的调试功能，比如 time-travel，历史回滚功能。）

**Vuex 核心概念**

- Store：仓库，是使用Vuex应用程序的核心，每一个应用仅有一个Store。Store是一个容器，包含应用中的大部分状态，不能直接改变Store中的状态，要通过提交Mutation的方式
- State：状态保存至Store中，因为Store是唯一的，因此状态也是唯一的，称为单一状态树。但是如果所有的状态都保存在State中，程序则难以维护，可以通过后续的模块来解决该问题。注意，这里的状态时响应式的
- Getter：像是Vuex中的计算实现，方便从一个属性派生出其他的值。它内部可以对计算的结果进行缓存，只有当依赖的状态发生改变时才会重新计算
- Mutation：状态的变化必须通过提交Mutation来完成
- Action：和Mutation类似，不同的是Action可以进行异步操作，内部改变状态的时候都需要提交Mutation
- Module：模块，由于使用单一状态树，应用的所有状态会集中到一个比较大的对象上来，当应用变得非常复杂时，Store对象就有可能变得非常臃肿。为了解决这个问题，Vuex允许我们将Store分割成模块每个模块拥有自己的State、Mutation、Action、Getter甚至是嵌套的子模块

## 8.3 Vuex 基本使用
### 基本结构
使用 Vue-cli 创建项目的时候，如果选择了 Vuex，会自动生成 Vuex 的基本结构：

Vuex 和 VueRputer 都是 Vue 的插件。插件内部把 Vuex 的 Store 注入到 Vue 的实例上，然后创建 Vuex 中的 Store 对象并且导出。

Store 构造函数接收 state、mutations、actions，modules，如果有需要还可以有 getters。

[案例代码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/02-vuex-demo)
```js
// store/index.js

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
```
创建 Vue 实例的时候传入 store 选项，这个 store 选项会被注入到 Vue 实例中，在组件中使用到的 `this.$store` 就是在这个位置注入的。
```js
// main.js

import store from './store'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```
### State
Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。

```js
state: {
  count: 0,
  msg: 'Hello Vuex'
}
```
```js
count：{{ $store.state.count }} <br>
msg: {{ $store.state.msg }}
```

使用 mapState 简化 State 在视图中的使用，mapState 返回计算属性

mapState 有两种使用的方式：

- 接收数组参数

```js
count：{{ count }} <br>
msg: {{ msg }}
```
```js
// 该方法是 vuex 提供的，所以使用前要先导入
import { mapState } from 'vuex'

// mapState 返回名称为 count 和 msg 的计算属性
// 在模板中直接使用 count 和 msg
computed: {
  // count: state => state.count
  ...mapState(['count', 'msg'])
}
```
- 接收对象参数

如果当前视图中已经有了 count 和 msg，如果使用上述方式的话会有命名冲突，解决的方式：
```js
count：{{ num }} <br>
msg: {{ message }}
```
```js
// 该方法是 vuex 提供的，所以使用前要先导入
import { mapState } from 'vuex'

// 通过传入对象，可以重命名返回的计算属性
// 在模板中直接使用 num 和 message
// ...mapState({ num: 'count', message: 'msg' })
computed: {
  ...mapState({
    num: state => state.count,
    message: state => state.msg
  })
}
```
### Getter
```js
getters: {
  reverseMsg (state) {
    return state.msg.split('').reverse().join('')
  }
}
```
Getter 就是 store 中的计算属性，使用 mapGetter 简化视图中的使用
```js
<!-- reverseMsg: {{ $store.getters.reverseMsg }} -->
reverseMsg: {{ reverse }}
```
```js
import { mapGetter } from 'vuex'

computed: {
  // ...mapGetter(['reverseMsg']),
  // 改名，在模板中使用 reverse
  ...mapGetter({
    reverse: 'reverseMsg'
  })
}
```
### Mutation
更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 **事件类型 (type)** 和 一个 **回调函数 (handler)**。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 `state` 作为第一个参数。

使用 Mutation 改变状态的好处是，集中的一个位置对状态修改，不管在什么地方修改，都可以追踪到状态的修改。可以实现高级的 time-travel 调试功能
```js
mutations: {
  increate (state, payload) {
    state.count += payload
  }
}
```
```js
<!-- <button @click="$store.commit('increate', 2)">Mutation</button> -->
<button @click="increateMut(3)">Mutation</button>
```
```js
import { mapMutations } from 'vuex'

methods: {
  // ...mapMutations(['increate']),
  // 传对象解决重名的问题
  ...mapMutations({
    increateMut: 'increate'
  })
}
```
接下来打开 devtools 查看 time-travel：刷新浏览器，我们可以看到调用 mutations 的记录，点击可以看到 state 中的 count和msg 以及 reverseMsg 的值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231160216104.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
你可以点击上面这些 increate，可以看到每次调用 increate 的时候 count 对应的值，如果此时数据与你预期不一致，可以方便你找到问题。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231160327506.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
鼠标点击这个位置开始时光旅行，当点击这个位置后，观察当前count的值和界面上的值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231160605264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
可以看到，界面上的值发生了改变，也就是此时的状态还原到了点击这次按钮的时候提交的值，这就是时光旅行
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231160721300.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
同样，我们也可以回滚到此次提交之前，此次以及之后的提交都会被清空
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231160916384.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
以及把当前这次提交作为最后一次提交
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231161148716.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
需要注意的是：不要在 Mutations 中执行异步操作修改 state，否则调试工具无法正常地观测到状态的变化，如果需要，可以使用Aciton
### Action
Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态
- Action 可以包含任意异步操作

```js
actions: {
  increateAsync (context, payload) {
    setTimeout(() => {
      context.commit('increate', payload)
    }, 2000)
  }
}
```
```js
<!-- <button @click="$store.dispatch('increateAsync', 5)">Action</button> -->
<button @click="increateAsync(6)">Action</button>
```
```js
import { mapActions } from 'vuex'

methods: {
  ...mapActions(['increateAsync']),
}
```
### Module
由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成**模块（module）**。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块。

```js
// store/moudules/cart.js

const state = {}
const getters = {}
const mutations = {}
const actions = {}

export default {
  namespaced: true, // 开启命名空间
  state,
  getters,
  mutations,
  actions
}
```
```js
// store/moudules/products.js

const state = {
  products: [
    { id: 1, title: 'iPhone 11', price: 8000 },
    { id: 2, title: 'iPhone 12', price: 10000 }
  ]
}
const getters = {}
const mutations = {
  setProducts (state, payload) {
    state.products = payload
  }
}
const actions = {}

export default {
  namespaced: true, // 开启命名空间
  state,
  getters,
  mutations,
  actions
}
```
```js
modules: {
  products,
  cart
}
```
```js
<!-- products: {{ $store.state.products.products }} <br>
<button @click="$store.commit('setProducts', [])">Mutation</button> -->
products: {{ products }} <br>
<button @click="setProducts([])">Mutation</button>
```
```js
computed: {
  ...mapState('products', ['products'])
},
methods: {
  ...mapMutations('products', ['setProducts'])
}
```

这里可以清楚的看到映射的 State 和 Mutation 是从哪个模块中获取到的，不带命名空间的话就是从全局的store中获取的。

### strict 严格模式
所有的状态变更必须通过提交Mutation，但是这仅仅是一个约定。

如果你想的话，你可以在组件中随时获取到 `$store.state.msg` 对它进行修改，从语法层面这是没有问题的，但是这破坏了Vuex的约定。如果在组件中直接修改 state，devtools 无法跟踪到这次状态的修改。

开启严格模式后，如果你在组件中直接修改 state 状态，会抛出错误。

- 开启严格模式
```js
// store/index.js

export default new Vuex.Store({
  strict: true
  ...
})
```
测试：
```js
<button @click="$store.state.msg = 'Lagou'">strict</button>
```
抛出异常，告诉我们：不要在 Mutation 之外修改 Vuex 中状态。虽然此处抛出异常，但是state中的数据也被修改了。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201231164618590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
最后，需要强调的是：**不要在生产环境下开启严格模式**

严格模式会深度检查状态树，来检查不合规的状态改变，会影响性能。我们可以在开发环境中启用严格模式，在生产中关闭。
```js
export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production'
})
```
## 8.4 模拟 Vuex
### 基本结构
- 自己模拟实现一个 Vuex 实现同样的功能

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
    msg: 'Hello World'
  },
  getters: {
    reverseMsg (state) {
      return state.msg.split('').reverse().join('')
    }
  },
  mutations: {
    increate (state, payload) {
      state.count += payload
    }
  },
  actions: {
    increateAsync (context, payload) {
      setTimeout(() => {
        context.commit('increate', payload)
      }, 2000)
    }
  }
})
```
```js
<template>
  <div id="app">
    <h1>Vuex - Demo</h1>
    count：{{ $store.state.count }} <br>
    msg: {{ $store.state.msg }}

    <h2>Getter</h2>
    reverseMsg: {{ $store.getters.reverseMsg }}

    <h2>Mutation</h2>
    <button @click="$store.commit('increate', 2)">Mutation</button>

    <h2>Action</h2>
    <button @click="$store.dispatch('increateAsync', 5)">Action</button>
  </div>
</template>
```
**实现思路**

- 实现 install 方法
	* Vuex 是 Vue 的一个插件，所以和模拟 VueRouter 类似，先实现 Vue 插件约定的 install 方法
- 实现 Store 类
	* 实现构造函数，接收 options
	* state 的响应化处理
	* getter 的实现
	* commit、dispatch 方法

### install
```js
// 存储 install 中获取到的 vue构造函数
let _Vue = null

function install (Vue) {
  _Vue = Vue
  // 获取 vue 实例 从而拿到选项中的 store
  _Vue.mixin({
    // 当创建Vue的根实例，会把store注入到所有vue实例
    beforeCreate () {
      // 如果是组件实例，没有store选项
      if (this.$options.store) {
        _Vue.prototype.$store = this.$options.store
      }
    }
  })
}
```
### Store 类
```js
class Store {
  constructor (options) {
    const {
      // 防止用户未传入相应选项
      state = {},
      getters = {},
      mutations = {},
      actions = {}
    } = options
    
	// state 是响应式的
    this.state = _Vue.observable(state)
    
    // 此处不直接 this.getters = getters，是因为下面的代码中要方法 getters 中的 key
    // 如果这么写的话，会导致 this.getters 和 getters 指向同一个对象
    // 当访问 getters 的 key 的时候，实际上就是访问 this.getters 的 key 
    // 会触发 key 属性的 getter，会产生死递归
    this.getters = Object.create(null)
    Object.keys(getters).forEach(key => {
      // 把对应的key注册到this.getters对象中
      Object.defineProperty(this.getters, key, {
        get: () => getters[key](state)
      })
    })
    // 使用 _开头 标识私有
    this._mutations = mutations
    this._actions = actions
  }

  // Mutation
  commit (type, payload) {
    this._mutations[type](this.state, payload)
  }

  // Action
  dispatch (type, payload) {
    // 简单模拟，传入this即可
    this._actions[type](this, payload)
  }
}

// 导出模块
export default {
  Store,
  install
}
```

### 使用自己实现的 Vuex
src/store/index.js 中修改导入 Vuex 的路径，测试

```js
import Vuex from '../myvuex'

Vue.use(Vuex)
```

[myvuex 项目源码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-03/code/3-3-1-4-vuex/04-my-vuex)
