


## 4.5 实例方法/数据
### vm.$set
- 功能

向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性 (比如 `this.myObject.newProperty = 'hi'`)

> 注意：对象不能是 Vue 实例，或者 Vue 实例的根数据对象($data)。

- 实例

```js
 vm.$set(obj, 'foo', 'test')
```

**定义位置**

- Vue.set()
	* [src/core/global-api/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/index.js)

```js
  // 静态方法 set/delete/nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
```

- vm.$set()
	* [src/core/instance/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/index.js)
	* [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)

```js
// instance/index.js
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)

// instance/state.js
Vue.prototype.$set = set
Vue.prototype.$delete = del
```

**源码**

- set()方法
	* [src/core/observer/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/index.js)

```js
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
// 设置对象的属性。添加新的属性，如果该属性不存在，则触发更改通知
export function set (target: Array<any> | Object, key: any, val: any): any {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 判断 target 是否是数组，key 是否是合法的索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 判断当前key和数组length的最大值给length
    // 当我们调用$set传递的索引有可能超过数组的length属性
    target.length = Math.max(target.length, key)
    // 通过 splice 对key位置的元素进行替换
    // splice 在 array.js 进行了响应化的处理
    target.splice(key, 1, val)
    return val
  }
  // 如果 key 在对象中已经存在且不是原型成员 直接赋值
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 获取 target 中的 observer 对象
  const ob = (target: any).__ob__
  // 如果 target 是 vue 实例或者 $data 直接返回
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 如果 ob 不存在，target 不是响应式对象直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 如果 ob 存在，把 key 设置为响应式属性
  defineReactive(ob.value, key, val)
  // 发送通知
  ob.dep.notify()
  return val
}
```

**[代码](https://github.com/shiguanghai/vue/blob/dev/examples/06-set/index.html)调试**

- 设置断点`src/core/observer/index.js`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213184234460.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 修改数组的第一个元素`vm.$set(vm.arr, 0, 200)`，回车
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213184445322.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 再set函数中，先做一些辅助的判断，判断target是否是数组并判断索引是否在合法范围内，如果条件满足，求数组的长度（length3，key0）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213184532442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入splice方法
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213184729393.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 来到定义splice方法的位置因为数组的原生方法并不会调用notify方法所以此处通过def给arrayMethods中定义了splice，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/202012131848195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 进入后第一件事是调用数组中的原生splice方法（original），改变其this为数组对象，args是传递的参数（0：截取第0个元素，1：直截取一个元素，200：替换的值），result里面就是截取之后的值。接下来获取当前数组对象的ob（observer），判断当前的method是否是push/unshift/splice，当前调用为splice，这个case里面会把第三个参数存入到inserted里面（即新插入的参数）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213185304183.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 如果有新插入的参数会调用ob.observeArray，这个方法里面会遍历新传入的数组并把里面的每一个元素取出并调用observe函数，在observe里面会把当前元素（对象的话）转化为响应式数据。接下来嗲用ob.dep.notify方法发送通知因为在收集依赖的时候曾经为每一个子对象的childOb收集过依赖，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213185830118.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在notify中最终调用每一个watcher的update方法，不再演示
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121319015878.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)



### vm.$delete
- 功能

删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 Vue 不能检测到属性被删除的限制，但是你应该很少会使用它。

> 注意：对象不能是 Vue 实例，或者 Vue 实例的根数据对象。

- 实例

```js
 vm.$delete(vm.obj, 'msg')
```

**定义位置**

- Vue.delete()
	* [src/core/global-api/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/global-api/index.js)

```js
  // 静态方法 set/delete/nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
```

- vm.$delete()
	* [src/core/instance/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/index.js)
	* [src/core/instance/state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)

```js
// instance/index.js
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)

// instance/state.js
Vue.prototype.$set = set
Vue.prototype.$delete = del
```

**源码**


- delete()方法
	* [src/core/observer/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/index.js)

```js
/**
 * Delete a property and trigger change if necessary.
 */
// 删除一个属性并在必要时触发更改
export function del (target: Array<any> | Object, key: any) {
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 判断是否是数组，以及 key 是否合法
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 如果是数组通过 splice 删除
    // splice 做过响应式处理
    target.splice(key, 1)
    return
  }
  // 获取 target 的 ob 对象
  const ob = (target: any).__ob__
  // target 如果是 Vue 实例或者 $data 对象，直接返回
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  // 如果 target 对象没有 key 属性直接返回
  if (!hasOwn(target, key)) {
    return
  }
  // 删除属性
  delete target[key]
  // 判断是否是响应式的
  if (!ob) {
    return
  }
  // 通过 ob 发送通知
  ob.dep.notify()
}
```
### vm.$watch
vm.$watch( expOrFn, callback, [options] )

- 功能

观察 Vue 实例变化的一个表达式或计算属性函数。回调函数得到的参数为新值和旧值。表达式只接受监督的键路径。对于更复杂的表达式，用一个函数取代。

- 参数
	* expOrFn：要监视的 $data 中的属性，可以是表达式或函数
	* callback：数据变化后执行的函数
		+ 函数：回调函数
		+ 对象：具有 handler 属性(字符串或者函数)，如果该属性为字符串则 methods 中相应的定义
	* options：可选的选项
		+ deep：布尔类型，深度监听
		+ immediate：布尔类型，是否立即执行一次回调函数

- 示例

```js
const vm = new Vue({
  el: '#app',
  data: {
  	a: '1',
  	b: '2',
  	msg: 'Hello vue',
    user: {
      firstName: '诸葛',
      lastName: '亮'
    }
  }
})
// expOrFn 是表达式
vm.$watch('msg', function (newVal, oldVal) {
  onsole.log(newVal, oldVal)
})
vm.$watch('user.firstName', function (newVal, oldVal) {
  console.log(newVal)
})
// expOrFn 是函数
vm.$watch(function () {
  return this.a + this.b
}, function (newVal, oldVal) {
  console.log(newVal)
})
// deep 是 true，消耗性能
vm.$watch('user', function (newVal, oldVal) {
  // 此时的 newVal 是 user 对象
  console.log(newVal === vm.user)
}, {
  deep: true
})
// immediate 是 true
vm.$watch('msg', function (newVal, oldVal) {
  console.log(newVal)
}, {
  immediate: true
})
```

**三种类型的 Watcher 对象**

- 没有静态方法，因为 $watch 方法中要使用 Vue 的实例
- Watcher 分三种：计算属性 Watcher、用户 Watcher (侦听器)、渲染 Watcher
- [创建顺序](https://github.com/shiguanghai/vue/blob/dev/examples/08-watch/index.html)：计算属性 Watcher(`id:1`)、用户 Watcher (侦听器 `id:2`)、渲染 Watcher(`id:3`)
- 执行顺序：按照 id 从小到大排序，与创建顺序相同
- vm.$watch()
	* src\core\instance\state.js

```js
Vue.prototype.$watch = function (
  expOrFn: string | Function,
  cb: any,
  options?: Object
): Function {
  // 获取 Vue 实例 this
  const vm: Component = this
  if (isPlainObject(cb)) {
    // 判断如果 cb 是对象执行 createWatcher
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  // 标记为用户 watcher
  options.user = true
  // 创建用户 watcher 对象
  const watcher = new Watcher(vm, expOrFn, cb, options)
  // 判断 immediate 如果为 true
  if (options.immediate) {
    // 立即执行一次 cb 回调，并且把当前值传入
    try {
      cb.call(vm, watcher.value)
    } catch (error) {
      handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
    }
  }
  // 返回取消监听的方法
  return function unwatchFn () {
    watcher.teardown()
  }
}
```
### 异步更新队列 nextTick()

- Vue 更新 DOM 是异步执行的([示例代码](https://github.com/shiguanghai/vue/blob/dev/examples/09-nextTick/index.html))，批量的
	* 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM
- `vm.$nextTick(function () { /* 操作 DOM */ }) / Vue.nextTick(function () {})`

**定义位置**

- [src\core\instance\render.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/render.js)

```js
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }
```

**源码**

- 手动调用 vm.$nextTick()
- 在 Watcher 的 queueWatcher 中执行 nextTick()
- [src\core\util\next-tick.js](https://github.com/shiguanghai/vue/blob/dev/src/core/util/next-tick.js)

```js
const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 遍历回到函数数组 依次调用
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
// 在这里，我们有使用微任务的异步延迟包装器。
// 在2.5中，我们使用了(宏)任务(与微任务相结合)。
// 然而，当状态在重绘之前就被改变时，它有微妙的问题。
// 另外，在事件处理程序中使用(宏)任务会导致一些奇怪的行为。
// 另外，在事件处理程序中使用（宏）任务会导致一些奇怪的行为。
// 所以我们现在又到处使用微任务。
// 这种权衡的一个主要缺点是，有些情况下，
// 微任务的优先级太高，在所谓的顺序事件之间开火，甚至在同一事件的冒泡之间开火
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
// nextTick行为利用了微任务队列，
// 可以通过原生的Promise.then或MutationObserver访问
// MutationObserver有更广泛的支持，然而在iOS >= 9.3.3的UIWebView中，
// 当在触摸事件处理程序中触发时，它有严重的bug。
// 触发几次后就完全停止工作了......所以，如果原生Promise可用，我们会使用它。
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    // 在有问题的UIWebViews中，Promise.then并没有完全break，
    // 但它可能会卡在一个奇怪的状态，即回调被推送到微任务队列中，
    // 但队列并没有被刷新，直到浏览器需要做一些其他工作，例如处理一个计时器
    // 因此，我们可以通过添加一个空的定时器来 "强制 "微任务队列被刷新。
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  // 在没有本地Promise的地方使用MutationObserver
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  // 降级到setImmediate
  // 从技术上讲，它利用了（宏）任务队列，
  // 但它仍然是比setTimeout更好的选择
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  // 降级到 setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // callbacks 存储所有的回调函数
  // 把 cb 加上异常处理存入 callbacks 数组中
  callbacks.push(() => {
    if (cb) {
      try {
        // 调用 cb()
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 判断队列是否正在被处理
  if (!pending) {
    pending = true
    // 调用
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    // 返回 promise 对象
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```
