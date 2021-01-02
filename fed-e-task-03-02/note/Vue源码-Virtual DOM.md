
## 5.1 虚拟 DOM
### 什么是虚拟 DOM
**虚拟 DOM(Virtual DOM)** 是使用 JavaScript 对象来描述 DOM，虚拟 DOM 的本质就是 JavaScript 对象，使用 JavaScript 对象来描述 DOM 的结构。应用的各种状态变化首先作用于虚拟 DOM，最终映射到 DOM。

Vue.js 中的虚拟 DOM 借鉴了 Snabbdom，并添加了一些 Vue.js 中的特性，例如：指令和组件机制。

> Vue 1.x 中细粒度监测数据的变化，每一个属性对应一个 watcher，开销太大Vue 2.x 中每个组件对应一个 watcher，状态变化通知到组件，再引入虚拟 DOM 进行比对和渲染

**为什么要使用虚拟 DOM**

- 使用虚拟 DOM，可以避免用户直接操作 DOM，开发过程关注在业务代码的实现，不需要关注如何操作 DOM，从而提高开发效率
- 作为一个中间层可以跨平台，除了 Web 平台外，还支持 SSR、Weex。
- 关于性能方面，在首次渲染的时候肯定不如直接操作 DOM，因为要维护一层额外的虚拟 DOM，如果后续有频繁操作 DOM 的操作，这个时候可能会有性能的提升，虚拟 DOM 在更新真实 DOM 之前会通过 Diff 算法对比新旧两个虚拟 DOM 树的差异，最终把差异更新到真实 DOM

### Vue.js 中的虚拟 DOM
-  h 函数就是 [createElement()](https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0)
- vm.\$createElement(tag,data,children,normalizeChildren)
- 参数
	* tag
		+ 标签名称或者组件对象
	* data
		+ 描述 tag，可以设置 DOM 的属性或者标签的属性
	* children
		+ tag 中的文本内容或者子节点
- 返回结果
	* VNode 对象
	* 核心属性
		+ tag
		+ data
		+ children
		+ text
		+ elm
		+ key

### 整体过程分析

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121322403445.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

## 5.2 createElement
**功能**

createElement() 函数，用来创建虚拟节点 (VNode)，我们的 render 函数中的参数 h，就是createElement()

```js
render(h) {
  // 此处的 h 就是 vm.$createElement
  return h('h1', this.msg)
}
```

**定义**

在 vm._render() 中调用了，用户传递的或者编译生成的 render 函数，这个时候传递了 createElement

- [src/core/instance/render.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/render.js)

```js
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // 将 createElement函数 绑定到这个实例上，这样我们就能在其中获得合适的渲染上下文
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  // 对编译生成的 render 进行渲染的方法
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // 对手写 render 函数进行渲染的方法
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
```

`vm._c` 和 `vm.$createElement` 内部都调用了 createElement，不同的是最后一个参数

vm.c 在编译生成的 render 函数内部会调用，vm.\$createElement 在用户传入的 render 函数内部调用

当用户传入render 函数的时候，要对用户传入的参数做处理

- [src/core/vdom/create-element.js](https://github.com/shiguanghai/vue/blob/dev/src/core/vdom/create-element.js)

执行完 createElement 之后创建好了 VNode，把创建好的 VNode 传递给 vm._update() 继续处理

```js
// wrapper function for providing a more flexible interface
// without getting yelled at by flow
// 封装函数，用于提供更灵活的接口
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // 判断第三个参数
  // 如果 data 是数组或者原始值的话就是 children，实现类似函数重载的机制
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // data不为空 且为响应式的
  if (isDef(data) && isDef((data: any).__ob__)) {
    ...
    // 返回空的 VNode 节点
    return createEmptyVNode()
  }
  // <component v-bind:is="currentTabComponent"></component>
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  ...
  // support single function children as default scoped slot
  // 处理作用域插槽
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // 用户传递的render函数
  if (normalizationType === ALWAYS_NORMALIZE) {
    // 返回一维数组，处理用户手写的 render
    // 当手写 render 函数的时候调用
    // 判断 children 的类型，如果是原始值的话转换成 VNode 的数组
    // 如果是数组的话，继续处理数组中的元素
    // 如果数组中的子元素又是数组(slot template)，递归处理
    // 如果连续两个节点都是字符串会合并文本节点
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    // 把二维数组，转换成一维数组
    // 如果 children 中有函数组件的话，函数组件会返回数组形式
    // 这时候 children 就是一个二维数组，只需要把二维数组转换为一维数组
    children = simpleNormalizeChildren(children)
  }
  // 创建 VNode
  let vnode, ns
  // 判断 tag 是字符串还是组件
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 是否是 html 的保留标签
    // 如果是浏览器的保留标签，创建对应的 VNode
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    // 判断是否是 自定义组件
    } else if ((!data || !data.pre) && 
      // 获取组件
      isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 查找自定义组件构造函数的声明
      // 根据 Ctor 创建组件的 VNode
      // component
      // 否则的话创建组件
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      // 在运行时检查未知或未列出命名空间的元素，
      // 因为当它的父元素对子元素进行规范化处理时，可能会被分配一个命名空间。
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```

## 5.3 update
**功能**

内部调用 vm.\_\_patch\_\_() 把虚拟 DOM 转换成真实 DOM

**定义**

- [src/core/instance/lifecycle.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/lifecycle.js)

```js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```
```js
// _update 方法的作用是把 VNode 渲染成真实的 DOM
// 首次渲染会调用，数据更新会调用
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevEl = vm.$el
  const prevVnode = vm._vnode
  const restoreActiveInstance = setActiveInstance(vm)
  vm._vnode = vnode
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  // Vue 原型的 patch 方法是根据所使用的渲染后端在入口中注入
  if (!prevVnode) {
    // initial render
    // 首次渲染
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    // updates
    // 数据变化 比较两个vnode的差异把差异更新到真实DOM
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
  restoreActiveInstance()
  // update __vue__ reference
  if (prevEl) {
    prevEl.__vue__ = null
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm
  }
  // if parent is an HOC, update its $el as well
  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el
  }
  // updated hook is called by the scheduler to ensure that children are
  // updated in a parent's updated hook.
}
```

## 5.4 patch
### patch 函数初始化
**功能**

对比两个 VNode 的差异，把差异更新到真实 DOM。如果是首次渲染的话，会把 虚拟DOM 先转换成 真实DOM 挂载到页面

**Snabbdom0.7.4 中 patch 函数的初始化**

- [src/snabbdom.ts](https://github.com/snabbdom/snabbdom/blob/v0.7.4/src/snabbdom.ts)

```js
// 函数柯里化的方式
export function init (modules: Array<Partial<Module>>, domApi?: DOMAPI) {
  return function patch (oldVnode: VNode | Element, vnode: VNode): VNode {
  }
}
```

- [src/vnode.ts](https://github.com/snabbdom/snabbdom/blob/v0.7.4/src/vnode.ts)

```js
export function vnode(sel: string | undefined,
                      data: any | undefined,
                      children: Array<VNode | string> | undefined,
                      text: string | undefined,
                      elm: Element | Text | undefined): VNode {
  let key = data === undefined ? undefined : data.key;
  return {sel, data, children, text, elm, key};
}
```

**Vue.js 中 patch 函数的初始化**

- [src/platforms/web/runtime/index.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/runtime/index.js)

```js
import { patch } from './patch'
// install platform patch function
// 设置平台相关的 __patch__ 方法 (虚拟DOM 转换成 真实DOM)
// 判断是否是浏览器环境（是 - 直接返回， 非 - 空函数 noop）
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

- [src/platforms/web/runtime/patch.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/runtime/patch.js)

```js
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
// 指令模块应该在所有内置模块被应用后最后应用
const modules = platformModules.concat(baseModules)

// nodeOps 就是一些DOM操作API
export const patch: Function = createPatchFunction({ nodeOps, modules })
```

- [src/core/vdom/patch.js](https://github.com/shiguanghai/vue/blob/dev/src/core/vdom/patch.js)

```js
// createPatchFunction 类似snabbdom中的init
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  // modules 节点的属性/事件/样式的操作
  // nodeOps 节点操作
  const { modules, nodeOps } = backend
  
  // 把模块中的钩子函数全部设置到 cbs 中，将来统一触发
  // cbs --> { 'create': [fn1, fn2], ... }
  for (i = 0; i < hooks.length; ++i) {
    // cbs['update'] = []
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        // cbs['update'] = [updateAttrs, updateClass, update...]
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  ...
  ...
  ...
  // 函数柯里化，让一个函数返回一个函数
  // createPatchFunction({ nodeOps, modules }) 传入平台相关的两个参数

  // core中的createPatchFunction (backend), const { modules, nodeOps } = backend
  // core中方法和平台无关，传入两个参数后，可以在上面的函数中使用这两个参数
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    ...
  }
}
```

### patch 函数执行过程
```js
return function patch (oldVnode, vnode, hydrating, removeOnly) {
    // 新的 VNode 不存在
    if (isUndef(vnode)) {
      // 老的 VNode 存在，执行 Destroy 钩子函数
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    // 老的 VNode 不存在
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      // 空挂载(可能是组件)，创建新的根元素
      isInitialPatch = true
      // 创建新的 VNode
      createElm(vnode, insertedVnodeQueue)
    } else {
      // 新的和老的 VNode 都存在，更新
      const isRealElement = isDef(oldVnode.nodeType)
      // 判断参数1是否是真实 DOM，不是真实 DOM
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // 更新操作，diff 算法
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      } else {
        // 第一个参数是真实 DOM，创建 VNode
        // 初始化
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          ...
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // 创建一个空节点，并将其替换
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        // 取代现有元素
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        // 创建 DOM 节点
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          // 极其罕见的边缘情况：如果旧元素处于leaving过渡动画，不要插入
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          ...
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
```

## 5.5 createElm
**功能**

把 VNode 转换成真实 DOM，挂载到 DOM 树上

```js
  function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      // 这个vnode是在之前的渲染中使用的！
      // 现在作为一个新的节点使用，当它被用作插入/参考节点时，
      // 覆盖它的elm会导致以后潜在的补丁错误。
      // 相反，我们在为它创建相关的DOM元素之前，按需克隆节点
      vnode = ownerArray[index] = cloneVNode(vnode)
    }

    vnode.isRootInsert = !nested // for transition enter check
    // 处理组件情况
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    // 处理标签情况
    if (isDef(tag)) {
      // 开发环境判断是否为未知标签（自定义标签）
      if (process.env.NODE_ENV !== 'production') {
        if (data && data.pre) {
          creatingElmInVPre++
        }
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }

      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      setScope(vnode)

      /* istanbul ignore if */
      if (__WEEX__) {
        ...
      } else {
        // 把 vnode 中所有的子元素 转换为 DOM对象
        createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          // 调用钩子函数
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        // 将 vnode 创建好的dom对象插入到 parenElm
        insert(parentElm, vnode.elm, refElm)
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        creatingElmInVPre--
      }
    } else if (isTrue(vnode.isComment)) {
      // vnode为注释节点
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      // vnode为文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }
```

## 5.6 patchVnode

**功能**

对比新旧VNode，找到差异更新DOM，diff 算法

```js
function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    // 如果新旧节点是完全相同的节点，直接返回
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode)
    }

    const elm = vnode.elm = oldVnode.elm
    ...
    // 触发 prepatch 钩子函数
    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    // 获取新旧 VNode 的子节点
    const oldCh = oldVnode.children
    const ch = vnode.children
    // 触发 update 钩子函数
    if (isDef(data) && isPatchable(vnode)) {
      // 调用 cbs 中的钩子函数，操作节点的属性/样式/事件....
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      // 用户的自定义钩子
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }

    // 新节点没有文本
    // vnode 没有 text 属性（说明有可能有子节点）
    if (isUndef(vnode.text)) {
      // 新节点和老节点都有子节点
      if (isDef(oldCh) && isDef(ch)) {
        // 1.如果新老节点都有子节点并且不相同，
        // 这时候对比和更新子节点
        // 对子节点进行 diff 操作，调用 updateChildren
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // 2.新节点有子节点，老的没有子节点
        // 开发环境 检查新节点的子节点中是否有重复的key
        if (process.env.NODE_ENV !== 'production') {
          checkDuplicateKeys(ch)
        }
        // 如果老节点有文本节点
        // 先清空老节点 DOM 的文本内容，然后为当前 DOM 节点加入子节点
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // 把新节点的子节点添转换成真实DOM，添加到 elm DOM树
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 3.老节点有子节点，新的没有子节点和文本
        // 删除老节点中的子节点
        removeVnodes(oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 新老节点都没有子节点
        // 4.老节点有文本，新节点没有子节点和文本
        // 清空老节点的文本内容
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 新老节点都有文本节点 且不同
      // 修改文本 直接把新节点的文本更新到DOM上
      nodeOps.setTextContent(elm, vnode.text)
    }
    // 触发 postpatch 钩子函数
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

## 5.7 updateChildren
**功能**

对比新老子节点，找到差异更新到DOM树

updateChildren 和 [Snabbdom 中的 updateChildren](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/Virtual%20DOM%20%E7%9A%84%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86.html#updatechildren-%E5%87%BD%E6%95%B0) 整体算法一致，这里就不再展开了。

我们再来看下它处理过程中 key 的作用，在 patch 函数中，调用 patchVnode 之前，会首先调用 sameVnode() 判断当前的新老 VNode 是否是相同节点，sameVnode() 中会首先判断 key 是否相同。

- 通过下面代码来体会 key 的作用

```js
<div id="app">
    <button @click="handler">按钮</button>
    <ul>
      <li v-for="value in arr" :key="value">{{value}}</li>
    </ul>
  </div>
  <script src="../../dist/vue.js"></script>
  <script>
    const vm = new Vue({
      el: '#app',
      data: {
        arr: ['a', 'b', 'c', 'd']
      },
      methods: {
        handler () {
          this.arr.splice(1, 0, 'x')
          // this.arr = ['a', 'x', 'b', 'c', 'd']
        }
      }
    })
  </script>
```

- 当没有设置 key 的时候

在 updateChildren 中比较子节点的时候（a **b c d** / a **x b c d**），会做三次更新 DOM 操作(b-x, c-b, d-c)和一次插入 DOM 的操作(d)

- 当设置 key 的时候

在 updateChildren 中比较子节点的时候，因为 oldVnode 的子节点的 b,c,d 和 newVnode 的 x,b,c 的 key 相同，所以只做比较，没有更新 DOM 的操作，当遍历完毕后，会再把 x 插入到 DOM 上DOM 操作只有一次插入操作。

