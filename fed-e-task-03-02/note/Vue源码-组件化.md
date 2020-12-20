


## 7.1 组件化
### 组件化回顾

> 一个 Vue 组件就是一个拥有预定义选项的一个 Vue 实例

- 一个组件可以组成页面上一个功能完备的区域，组件可以包含脚本、样式、模板
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219143128846.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
像上面这个图，我们可以把一个页面抽象成若干个组件，把这些组件组合成一个页面。组件就像 ‘积木块’，当我们有了组件之后搭建页面就好像在拼积木。这个图中把一个页面划分成了三部分：页头、主内容区域、侧边栏，每一个组件内部又可能嵌套了粒度更小的组件：比如主内容区域对应的组件，它里面又嵌套了列表组件，它们最终组合成了一个页面。 

> **我们可以总结一下**：组件化可以让我们方便地把页面拆分成多个可重用的组件，使用组件可以让我们重用页面中的某一个区域。另外，组件之间是可以嵌套的，有了组件之后我们开发页面就像搭积木一样。

**组件化机制**

- 组件化可以让我们方便的把页面拆分成多个可重用的组件
- 组件是独立的，系统内可重用，组件之间可以嵌套
- 有了组件可以像搭积木一样开发网页
- 下面我们将从源码的角度来分析 Vue 组件内部如何工作

### 组件注册
- Vue中注册组件的两种方式
	* 全局注册：在任何位置都可以使用
	* 局部注册：只能在当前注册的范围中使用

**全局组件的注册方式**

```js
<div id="app">
</div>
<script>
  const Comp = Vue.component('comp', {
    template: '<div>Hello Component</div>'
  })
  const vm = new Vue({
    el: '#app',
    render (h) {
	  return h(Comp)
    }
  })
</script>
```
以上创建了一个全局组件`Comp`，在任何位置都可以直接使用，在Vue的选项render函数中通过h函数创建组件对应的vnode，下面我们来看一下注册全局组件的`Vue.component`这个函数的内部实现：

- [src/core/global-api/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/index.js)
```js
import { initAssetRegisters } from './assets'
...
// 注册 Vue.directive()、Vue.component()、Vue.filter()
initAssetRegisters(Vue)
```
- [src/core/global-api/assets.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/assets.js)
```js
import { ASSET_TYPES } from 'shared/constants'
...
// 接收Vue构造函数作为参数
export function initAssetRegisters (Vue: GlobalAPI) {
  // 遍历 ASSET_TYPES 数组，为 Vue 定义相应方法
  // ASSET_TYPES 包括了directive、 component、filter
  ASSET_TYPES.forEach(type => {
    ...
  })
}
```
- [src/shared/constans.js](https://github.com/shiguanghai/vue/blob/dev/src/shared/constans.js)
```js
// 对应 Vue.component、Vue.directive、Vue.filter
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
```
- [src/core/global-api/assets.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/assets.js)
```js
ASSET_TYPES.forEach(type => {
  Vue[type] = function (
    id: string,
    definition: Function | Object
  ): Function | Object | void {
    if (!definition) {
      // 没有传定义 直接取出定义好的 directives、components、filters 并返回
      return this.options[type + 's'][id]
    } else {
      /* istanbul ignore if */
      // 环境判断
      if (process.env.NODE_ENV !== 'production' && type === 'component') {
        validateComponentName(id)
      }
      // Vue.component('comp', { template: '' })
      // 类型(type)是否是组件 如果是 判断传递的对象(definition)是否是原始对象([object Object])
      if (type === 'component' && isPlainObject(definition)) {
        definition.name = definition.name || id
        // 把组件配置转换为组件的构造函数
        // _base == Vue
        definition = this.options._base.extend(definition)
      }
      // 类型(type)是否是指令 如果是 判断传递的函数(definition) 将function设置给bind update
      if (type === 'directive' && typeof definition === 'function') {
        definition = { bind: definition, update: definition }
      }
      // 指令 - 传对象 或 组件 - 直接传构造函数：则直接存储
      // 全局注册，存储资源并赋值
      // this.options['components']['comp'] = definition
      this.options[type + 's'][id] = definition
      return definition
    }
  }
})
```
重点来看 `Vue.component` 全局组件的注册过程，其中如果第二个参数传递是对象，调用`Vue.extend`，把组件的选项对象转换成组件的构造函数，最终记录到`options.compents`中；如果第二个参数是函数，会直接把这个函数记录到`options.compents`中。
```js
// Vue.component('comp', { template: '' })
// 类型(type)是否是组件 如果是 判断传递的对象(definition)是否是原始对象([object Object])
if (type === 'component' && isPlainObject(definition)) {
  definition.name = definition.name || id
  // 把组件配置转换为组件的构造函数
  // _base == Vue
  definition = this.options._base.extend(definition)
}
```

### Vue.extend
- [src/core/global-api/extend.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/extend.js)

```js
export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheriance and cache them.
   */
  // 包括Vue在内的每个实例构造函数都有一个唯一的cid
  // 这使我们能够为原型继承创建封装的 "子构造函数"，并将它们缓存起来。
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // Vue 构造函数
    const Super = this
    const SuperId = Super.cid
    // 从缓存中加载组件的构造函数
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    // 通过cid获取缓存的组件的构造函数，有的话直接返回
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      // 如果是开发环境验证组件的名称
      validateComponentName(name)
    }

    // 给Sub初始化VueComponent构造函数（组件构建的构造函数）
    const Sub = function VueComponent (options) {
      // 调用 _init() 初始化
      this._init(options)
    }
    // 原型继承自 Vue
    // Vue的原型上之前注入了_init()
    // 所以Sub的实例也可以访问到_init()
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 合并 options
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 对于props和计算属性，我们在扩展时在Vue实例上，在扩展原型上定义代理获取器
    // 这样就避免了对每个创建的实例进行Object.defineProperty调用
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    // 把组件构造构造函数保存到 Ctor.options.components.comp = Ctor
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 把组件的构造函数缓存到 options._Ctor
    cachedCtors[SuperId] = Sub
    return Sub
  }
}
```

> 通过源码我们可以看到，它内部就是基于传入的选项对象创建了组件的构造函数，组件的构造函数继承自Vue构造函数，所以组件对象拥有和Vue实例一样的成员

### 调试组件注册过程
- 接下来通过调试查看全局组件的注册过程
- [调试代码](https://github.com/shiguanghai/vue/tree/dev/examples/14-component/index.html)
```js
<div id='app'>
</div>
<script src="../../dist/vue.js"></script>
<script>
  const Comp = Vue.component('comp', {
    template: '<div>Hello Component</div>'
  })
  const vm = new Vue({
    el: '#app',
    render (h) {
    return h(Comp)
    }
  })
</script>
```
- 增加断点并F5进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121916350489.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 此时的type就是component，我们调用的是Vue.component这个方法，id是组件的名称comp、definition是调用时传入的第二个参数：组件的选项对象，里边只有template选项。往下执行，如果第二个参数为空，会获取这个组件，此时第二个参数有值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219163553725.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 开发环境中，会验证组件的名称，如果组件的名称不合法会警告
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121916391367.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接下来获取组件的名称，调用vue.extend，进入extend，在这个方法上面已经初始化了cid，用来唯一标识当前组件的构造函数并且作为缓存的键。接下来获取options选项中的_Ctor（缓存的构造函数）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219164142210.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 当前的_Ctor是undefined，它初始化为一个空对象，接下来从缓存中获取构造函数（取不到，因为此时缓存中还没有）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219164414214.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接下来验证组件名称，Vue.component中已经验证过组件名称，但是如果直接调用Vue.extend也要去验证（且刚刚是在开发环境执行的，生产环境下会过滤掉，不用担心性能问题）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219164547968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接着，创建了组件的构造函数VueComponent
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219164901537.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 组件的构造函数继承自Vue构造函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165012171.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165050159.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- cid++ 记录到sub中，然后合并Super.options和当前调用Vue.extend传入的选项
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165347881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165421641.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 执行完毕后Sub的选项，可以看到它把刚刚两个选项合并起来了，在组件的构造函数的选项中也可以访问到_base，从这里还可以看出Vue的选项都被合并到组件的选项中，所以Vue选项中的成员可以在任何组件中去使用
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165454823.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 再去初始化组件中的props、computed
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165745836.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继承Vue中的一些静态成员，记录不同的options
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219165918540.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 此处的extendOptions里面有一个_Ctor空对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219170049162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 缓存当前组件的构造函数，当这个构造函数换成完毕之后，再来看extendOptions中的_Ctor，里面记录了刚刚缓存好的构造函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219170310752.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 返回到Vue.component方法，把创建好的构造函数最终记录到Vue构造函数的options选项的components对应的组件名称中，当前是comp。因为记录到了Vue的构造函数中，所以所有位置都可以直接使用全局组件
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201219170632317.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 全局组件注册完毕

### 组件创建过程
- 回顾首次渲染过程
	* Vue 构造函数
	* this._init()
	* this.$mount()
	* mountComponent()
	* new Watcher() 渲染 Watcher
	* updateComponent()
	* vm._render() -> createElement()
	* vm._updata()

**观察如下代码：**
```js
const Comp = Vue.component('comp', {
  template: '<div>Hello Component</div>'
})
const vm = new Vue({
  el: '#app',
  render (h) {
  return h(Comp)
  }
})
```
首先通过Vue.component返回了一个组件的构造函数，在render中的h函数就是createElement函数，调用createElement的时候传入了组件的构造函数。

我们要看的就是在createElement中是如何去处理组件的

- _createElement() 中调用 createComponent()
- [src/core/vdom/create-element.js](https://github.com/shiguanghai/vue/blob/dev/src/core/vdom/create-element.js)
```js
// 判断 tag 是字符串还是组件
if (typeof tag === 'string') { ...
} else {
  // direct component options / constructor
  vnode = createComponent(tag, data, context, children)
}
```
- createComponent() 中调用创建自定义组件对应的 VNode
- [src/core/vdom/create-component.js](https://github.com/shiguanghai/vue/blob/dev/src/core/vdom/create-component.js)
```js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }

  // context.$options._base 就是 Vue构造函数
  // 在_init()会把Vue构造函数中的选项合并到Vue实例的选项中
  // 所以此处可以通过context（实例的选项）获取_base
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  // 如果 Ctor 不是一个构造函数，是一个对象
  // 使用 Vue.extend() 创造一个子组件的构造函数
  // render: h => h(App)  这种情况会进入
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  ...

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // 解决在创建组件构造函数后合并当前组件选项和通过Vue.mixins混入的情况下的构造函数选项
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  // 处理组件上的 v-model
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  ...

  // install component management hooks onto the placeholder node
  // 安装组件的钩子函数 init/prepatch/insert/destroy
  // 准备好了 data.hook 中的钩子函数
  installComponentHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  // 创建自定义组件的 VNode，设置自定义组件的名字
  // 记录this.componentOptions = componentOptions
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  
  ...

  return vnode
}
```
- installComponentHooks() 初始化组件的 data.hook
```js
function installComponentHooks (data: VNodeData) {
  // 获取用户传入的组件的钩子函数
  const hooks = data.hook || (data.hook = {})
  // 用户可以传递自定义钩子函数
  // 把用户传入的自定义钩子函数和 componentVNodeHooks 中预定义的钩子函数合并
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}
```
```js
const hooksToMerge = Object.keys(componentVNodeHooks)
```
- 钩子函数定义的位置（init()钩子中创建组件的实例）
```js
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    ...
  },

  insert (vnode: MountedComponentVNode) {
    ...
  },

  destroy (vnode: MountedComponentVNode) {
    ...
  }
}
```
- 创建组件实例的位置，由自定义组件的 init() 钩子方法调用
```js
export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any, // activeInstance in lifecycle state
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  // check inline-template render functions
  // 获取 inline-template
  // <comp inline-template> xxxx </comp>
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  // 创建组件实例
  return new vnode.componentOptions.Ctor(options)
}
```
- init()钩子函数又是在什么地方调用的呢？ 它是在patch的过程中调用的

### 组件实例的创建和挂载过程
>我们看过了组件被转换为VNode的过程，接下来再来看init钩子函数调用的位置，因为在init钩子函数在中最终创建了组件对象，init钩子函数是在patch中调用的

- [src/core/vdom/patch.js](https://github.com/shiguanghai/vue/blob/dev/src/core/vdom/patch.js)
- Vue._update() --> patch() --> createElm() --> createComponent()
- 创建组件实例，挂载到真实 DOM
```js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      // 调用 init() 方法，创建和挂载组件实例
      // init() 的过程中创建好了组件的真实 DOM,挂载到了 vnode.elm 上
      i(vnode, false /* hydrating */)
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      // 调用钩子函数（VNode的钩子函数初始化属性/事件/样式等，组件的钩子函数）
      initComponent(vnode, insertedVnodeQueue)
      // 把组件对应的 DOM 插入到父元素中
      insert(parentElm, vnode.elm, refElm)
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
      }
      return true
    }
  }
}
```
-  调用钩子函数，设置局部作用于样式
```js
function initComponent (vnode, insertedVnodeQueue) {
  if (isDef(vnode.data.pendingInsert)) {
    insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
    vnode.data.pendingInsert = null
  }
  vnode.elm = vnode.componentInstance.$el
  if (isPatchable(vnode)) {
    // 调用钩子函数
    invokeCreateHooks(vnode, insertedVnodeQueue)
    // 设置局部作用于样式
    setScope(vnode)
  } else {
    // empty component root.
    // skip all element-related modules except for ref (#3455)
    registerRef(vnode)
    // make sure to invoke the insert hook
    insertedVnodeQueue.push(vnode)
  }
}
```
- 调用钩子函数
```js
  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    // 调用 VNode 的钩子函数
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    // 调用组件的钩子函数
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }
```
**总结**
- 组件实例的创建过程是从上而下（父组件->子组件）
- 组件实例的挂载过程是从下而上（子组件->父组件）

> 由此我们可以总结出来，组件的粒度不是越小越好，因为嵌套一层组件，就会重复执行一遍组件的创建过程，比较消耗性能。组件的抽象过程要合理，比如侧边栏组件，它内部的导航如果外部没有再次使用的话，可以把侧边栏和内部的导航设计成一个组件，减少组件重新创建的过程。