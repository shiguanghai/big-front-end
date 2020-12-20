


## 4.4 数据响应式核心
### 响应式处理入口
整个响应式处理的过程是比较复杂的，下面我们先从

- [src\core\instance\init.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/init.js)
	* `initState(vm)`  vm 状态的初始化
	* 初始化 vm 的 _props、methods、_data等

```js
import { initState } from './state'
```
- [src\core\instance\state.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/state.js)

```js
export function initState (vm: Component) {
  ...
  // 数据的初始化
  if (opts.data) {
    // 把data中的成员注入到Vue实例 并转换为响应式对象
    initData(vm)
  } else {
    // observe数据的响应式处理
    observe(vm._data = {}, true /* asRootData */)
  }
  ...
}
```
- `initData(vm)`  vm 数据的初始化
```js
function initData (vm: Component) {
  let data = vm.$options.data
  // 初始化 _data，组件中 data 是函数，调用函数返回结果
  // 否则直接返回 data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  ...
  // proxy data on instance
  // 获取 data 中的所有属性
  const keys = Object.keys(data)
  // 获取 props / methods
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // 判断 data 上的成员是否和  props/methods 重名
  ...
  
  // observe data
  // 数据的响应式处理
  observe(data, true /* asRootData */)
}
```
- [src\core\observer\index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/index.js)
	* observe(value, asRootData) 
	* 负责为每一个 Object 类型的 value 创建一个 observer 实例

```js
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
// 试图为一个value创建一个observer观察者实例，
// 如果成功观察到，则返回新的观察者，
// 如果该值已经有观察者，则返回现有的观察者
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 判断 value 是否是对象 是否是 VNode虚拟DOM 的实例
  // 如果不是对象/是VNode实例：不需要做响应式处理 直接返回
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 如果 value 有 __ob__(observer对象) 属性
  // 判断 value.__ob__ 属性是否是 observer 的实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 赋值 最终返回
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 创建一个 Observer 对象
    ob = new Observer(value)
  }
  // 处理为根数据
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```
### Observer
- [src\core\observer\index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/index.js)
	* 对对象做响应化处理
	* 对数组做响应化处理

```js
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
// 观察者类，附加到每个被观察对象上
// 一旦被附加，观察者就会将目标对象的属性键转换为getter/setter，
// 以收集依赖关系并派发更新
export class Observer {
  // 观测对象
  value: any;
  // 依赖对象
  dep: Dep;
  // 实例计数器
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    // 初始化实例的 vmCount 为0
    this.vmCount = 0
    // def 调用 defineProperty 默认不可枚举
    // 将实例挂载到观察对象的 __ob__ 属性
    def(value, '__ob__', this)
    // 数组的响应式处理
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 为数组中的每一个对象创建一个 observer 实例
      this.observeArray(value)
    } else {
      // 遍历对象中的每一个属性，转换成 setter/getter
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  // 遍历所有属性，并将它们转换为getter/setter
  // 只有当值类型为Object时，才应调用此方法
  walk (obj: Object) {
    // 获取观察对象的每一个属性
    const keys = Object.keys(obj)
    // 遍历每一个属性，设置为响应式数据
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```
- walk(obj) 
	* 遍历 obj 的所有属性，为每一个属性调用 `defineReactive()` 方法，设置 getter/setter
### 对象响应式处理 defineReactive
- [src\core\observer\index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/index.js)
- defineReactive(obj, key, val, customSetter, shallow)
	* 为一个对象定义一个响应式的属性，每一个属性对应一个 dep 对象
	* 如果该属性的值是对象，继续调用 observe
	* 如果给属性赋新值，继续调用 observe
	* 如果数据更新发送通知

```js
/**
 * Define a reactive property on an Object.
 */
// 为一个对象定义一个响应式的属性
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 创建依赖对象实例
  const dep = new Dep()
  // 获取 obj 的属性描述符对象
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 通过 configurable 指定当前属性是否为可配置的
  // 如果为不可配置 意味不可删除/重新定义 直接返回
  if (property && property.configurable === false) {
    return
  }
  // 提供预定义的存取器函数
  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  // 参数为两个时 获取value
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 判断是否递归观察子对象，并将子对象属性都转换成 getter/setter，返回子观察对象
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // 如果预定义的 getter 存在则 value 等于getter 调用的返回值
      // 否则直接赋予属性值
      const value = getter ? getter.call(obj) : val
      // 如果存在当前依赖目标，即 watcher 对象，则建立依赖
      if (Dep.target) {
        ...
      }
      // 返回属性值
      return value
    },
    set: function reactiveSetter (newVal) {
      // 如果预定义的 getter 存在则 value 等于getter 调用的返回值
      // 否则直接赋予属性值
      const value = getter ? getter.call(obj) : val
      // 如果新值等于旧值或者新值旧值为NaN则不执行
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // 如果没有 setter 直接返回
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      // 如果预定义setter存在则调用，否则直接更新新值
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      // 如果新值是对象，观察子对象并返回 子的 observer 对象
      childOb = !shallow && observe(newVal)
      // 派发更新(发布更改通知)
      dep.notify()
    }
  })
}
```
### 数组响应式处理 
- [src\core\observer\index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/index.js)
- Observer 的构造函数中

```js
// 获取 arrayMethods 特有的成员 返回的是包含名字的数组
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

export class Observer {
  ...
  constructor (value: any) {
    ...
    // 数组的响应式处理
    if (Array.isArray(value)) {
      // 判断当前浏览器是否支持对象的原型属性
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 为数组中的每一个对象创建一个 observer 实例
      this.observeArray(value)
    } else {
      ...
    }
  }
  /**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
  // 通过使用__proto__拦截原型链来增强目标对象或数组
  function protoAugment (target, src: Object) {
    /* eslint-disable no-proto */
    target.__proto__ = src
    /* eslint-enable no-proto */
  }

  /**
   * Augment a target Object or Array by defining
   * hidden properties.
   */
  // 通过定义隐藏属性来增强目标对象或数组 
  /* istanbul ignore next */
  function copyAugment (target: Object, src: Object, keys: Array<string>) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i]
      def(target, key, src[key])
    }
  }
}
```

- 处理数组修改数据的方法 
```js
import { arrayMethods } from './array'
```
- [src\core\observer\array.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/array.js)

```js
const arrayProto = Array.prototype
// 使用数组的原型创建一个新的对象
export const arrayMethods = Object.create(arrayProto)
// 修改数组元素的方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
// 拦截突变方法，并发出事件 
methodsToPatch.forEach(function (method) {
  // cache original method
  // 保存数组原方法
  const original = arrayProto[method]
  // 调用 Object.defineProperty() 重新定义修改数组的方法
  def(arrayMethods, method, function mutator (...args) {
    // 执行数组的原始方法
    const result = original.apply(this, args)
    // 获取数组对象的 ob 对象
    const ob = this.__ob__
    // 存储数组新增的元素
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对插入的新元素，重新遍历数组元素设置为响应式数据
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 调用了修改数组的方法，调用数组的ob对象发送通知
    ob.dep.notify()
    return result
  })
})
```
### Dep
1. 在 defineReactive() 的 getter 中创建 dep 对象，并判断 Dep.target 是否有值，如果有, 调用 dep.depend()
2. dep.depend() 内部调用 Dep.target.addDep(this)，也就是 watcher 的 addDep() 方法，它内部最调用 dep.addSub(this)，把 watcher 对象，添加到 dep.subs.push(watcher) 中，也就是把订阅者添加到 dep 的 subs 数组中，当数据变化的时候调用 watcher 对象的 update() 方法
3. 什么时候设置的 Dep.target? 通过[首次渲染的案例调试](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/Vue%E6%BA%90%E7%A0%81-%E5%93%8D%E5%BA%94%E5%BC%8F-%E5%88%9D%E5%A7%8B%E5%8C%96_%E9%A6%96%E6%AC%A1%E6%B8%B2%E6%9F%93.html#%E9%A6%96%E6%AC%A1%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B%E8%B0%83%E8%AF%95)观察。调用 mountComponent() 方法的时候，创建了渲染 watcher 对象，执行 watcher 中的 get() 方法
4.  get() 方法内部调用 pushTarget(this)，把当前 Dep.target = watcher，同时把当前 watcher 入栈，因为有父子组件嵌套的时候先把父组件对应的 watcher 入栈，再去处理子组件的 watcher，子组件的处理完毕后，再把父组件对应的 watcher 出栈，继续操作
5. Dep.target 用来存放目前正在使用的watcher。全局唯一，并且一次也只能有一个 watcher 被使用

```js
export function defineReactive (...) {
  // 创建依赖对象实例 收集每一个属性的依赖
  const dep = new Dep()
  ...
  // 判断是否递归观察子对象，并将子对象属性都转换成 getter/setter，返回子观察对象
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    ...
    get: function reactiveGetter () {
      ...
      // 如果存在当前依赖目标，即 watcher 对象，则建立依赖
      if (Dep.target) {
        dep.depend()
        // 如果子观察目标存在，建立子对象的依赖关系
        if (childOb) {
          // 为当前子对象收集依赖
          childOb.dep.depend()
          // 如果属性是数组，则特殊处理收集数组对象依赖
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      // 返回属性值
      return value
    },
    set: function reactiveSetter (newVal) {
      ...
      // 派发更新(发布更改通知)
      dep.notify()
    }
  })
}
```

- [src\core\observer\dep.js](https://github.com/shiguanghai/vue/blob/dev/src/core/observer/dep.js)
- 依赖对象
- 记录 watcher 对象
- depend() -- watcher 记录对应的 dep
- 发布通知

```js
let uid = 0
// dep 是个可观察对象，可以有多个指令订阅它
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // 静态属性，watcher 对象
  static target: ?Watcher;
  // dep 实例 Id
  id: number;
  // dep 实例对应的 watcher 对象/订阅者数组
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  // 添加新的订阅者 watcher 对象
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  // 移除订阅者
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 将观察对象和 watcher 建立依赖
  depend () {
    if (Dep.target) {
      // 如果 target 存在，把 dep 对象添加到 watcher 的依赖中
      Dep.target.addDep(this)
    }
  }

  // 发布通知
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    // 调用每个订阅者的update方法实现更新
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
// Dep.target 用来存放目前正在使用的watcher
// 全局唯一，并且一次也只能有一个watcher被使用
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []
// 入栈并将当前 watcher 赋值给 Dep.target
// 父子组件嵌套的时候先把父组件对应的 watcher 入栈，
// 再去处理子组件的 watcher，子组件的处理完毕后，再把父组件对应的 watcher 出栈，继续操作
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  // 出栈操作
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```

**依赖收集 - 调试**

- [调试代码](https://github.com/shiguanghai/vue/blob/dev/examples/04-observe/index.html)
- 设置断点：因为我们要去调试收集依赖的过程，而我们在Watcher的get方法中开始去收集依赖，所以断点设置在创建Watcher对象的位置`src/core/instance/lifecycle.js`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212204348837.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F5进入断点，我们可以通过调用栈找到创建Watcher的整个过程：最开始调用new Vue进入Vue的构造函数，在构造函数中调用_init()方法，init方法中会调用入口的\$mount把模板编译成render函数，接下来调用Vue.\$mount，其中会找到mountComponent，在其中设置updateComponent并且创建Watcher对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212204505869.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入Watcher，在watcher的最后面调用了get方法，设置断点
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121220510438.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F8执行到断点处F11进入get方法
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212205207136.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- get方法中首先调用pushTarget，F11进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212205323127.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- pushTarget中传入了Watcher对象并且把Watcher对象存储到Dep.target中，在属性的get方法中会去判断Dep.target是否有值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212205649501.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继续往下会执行Watcher对象的getter方法，这个方法其实就是updateComponent
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212205908965.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入updateComponent，它会调用render方法（生成虚拟DOM，传递给update），update把虚拟DOM转化为真实DOM，帮我们渲染到页面
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212210053279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入到_render方法，在render方法里面会调用用户传入的render或者编译生成的render，F10跳过代码找到调用render的位置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212210422230.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11 进入render函数，在这个函数中调用了_c（creatElement生成虚拟DOM）、_v、_s等渲染相关的方法，当我们访问这些属性的时候就会触发它们的get方法，在get方法里面就会进行收集依赖
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212210534330.png)
- F11进入hasHandler的has方法，这个方法是用来判断当前Vue实例中是否有_c、_v、_s、msg等成员 
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212211013655.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11当我们访问this.msg的时候会进入对应的get方法，这个方法中访问的其实就是this._data.msg
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212211404594.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入this._data.msg的get方法，这个方法下面要去收集依赖，要获取当前访问这个属性的值(msg)Hello Vue
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121221145765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10接下来判断Dep.target，刚刚我们在Watcher对象的get方法中已经设置了Dep.target
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212211620975.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212211920722.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 判断完Dep.target之后，接下来要调用Dep.depend开始收集依赖，depend方法中又判断了Dep.target，接下来调用target.addDep方法即watcher.addDep，把this传递进来
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212212042778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入addDep，在里面先获取dep.id，接着判断newDepId集合中是否已经有了这个Dep对象，如果没有此时才会添加依赖，把dep的id和对象添加到两个集合中，接下来把watcher对象添加到dep的subs数组（addSub）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212212230198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 进入addSub，刚刚的watcher就添加到这个sub里来
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212212559970.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 这是第一次调用msg的时候添加依赖的过程，F10跳过childOb，返回属性值
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212212740700.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接下来第二次访问msg，因为在模板中，使用了两次msg属性，所以当我们第二次再调用msg的时候也会触发get方法
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121221284170.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入render函数，因为当我们访问完msg属性后接下来还要调用_s、_v，F10跳过
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212214627217.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212214839836.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 点击F11进入get方法，在此方法中还是要判断Dep.target，第二次调用depend
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212215102941.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在depend方法中收集依赖
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212215212317.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在addDep里面先获取id，接下来判断newDepIds里面中是否有这个dep对象，由于上一次已经收集过依赖，此时不会再进入if语句，也就不会重复收集依赖
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212215302521.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10跳过，此时msg的依赖就收集完成了，接下来是count的依赖，不再演示
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212215711459.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

### Watcher
- Watcher 分为三种，Computed Watcher、用户 Watcher (侦听器)、**渲染 Watcher**
- 渲染 Watcher 的创建时机
	* [/src/core/instance/lifecycle.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/lifecycle.js)

```js
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  ...
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    ...
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // 我们在watcher的构造函数中设置为vm._watcher，
  // 因为watcher的初始补丁可能会调用$forceUpdate(例如在子组件的挂载钩子中)，
  // 这依赖于vm._watcher已经被定义  
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

- 渲染 wacher 创建的位置 lifecycle.js 的 mountComponent 函数中
- Wacher 的构造函数初始化，处理 expOrFn （渲染 watcher 和侦听器处理不同）
- 调用 this.get() ，它里面调用 pushTarget() 然后 this.getter.call(vm, vm) （对于渲染 wacher 调用 updateComponent），如果是用户 wacher 会获取属性的值（触发get操作）
- 当数据更新的时候，dep 中调用 notify() 方法，notify() 中调用 wacher 的 update() 方法
- update() 中调用 queueWatcher()
- queueWatcher() 是一个核心方法，去除重复操作，调用 flushSchedulerQueue() 刷新队列并执行watcher
- flushSchedulerQueue() 中对 wacher 排序，遍历所有 wacher ，如果有 before，触发生命周期的钩子函数 beforeUpdate，执行 wacher.run()，它内部调用 this.get()，然后调用 this.cb() (渲染wacher 的 cb 是 noop)
- 整个流程结束

### 调试响应式数据执行过程
- 数组响应式处理的核心过程和数组收集依赖的过程
- 当数组的数据改变的时候 watcher 的执行过程
- [调试代码](https://github.com/shiguanghai/vue/blob/dev/examples/05-observe-arr/index.html)

```js
<div id="app">
  {{ arr }}
</div>

<script src="../../dist/vue.js"></script>
<script>
  const vm = new Vue({
    el: '#app',
    data: {
      arr: [2, 3, 5]
    }
  })
</script>
```

- 设置两个断点`src/core/observer/index.js`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212225143120.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212225247220.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F5当前的value就是选项传递过来的data，接下来要把data对象设置成响应式的数据
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212225339449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入Observer
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212225610272.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入walk方法，这里遍历当前对象的所有属性，为每一个属性调用defineReactive，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212225718605.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 这个函数中，它会为每一个属性创建一个Dep对象负责收集依赖
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121222583536.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 它还会处理这个属性的值，会分别为其调用observe，F11进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212225926624.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 首先判断传递进来的内容是否是对象（数组也是对象）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212230237729.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 为数组对象创建一个observer对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212230424589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入，依然是初始化一些属性，接下来判断当前value是否是一个数组，进入判断是否支持原型属性（支持），传入两个参数：第一个参数就是我们的数组，第二个参数是arrayMethods，已经被处理
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212230541623.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- arrayMethods是通过object.create创建的一个对象，我们在调用object.create的时候，传入的参数就是数组构造函数的原型，所以这个对象的原型就是数组构造函数的原型，里面都是数组的原生方法。接下来还会去处理数组中的特殊方法，这些方法都是会修改原数组的方法
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212230834246.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入，此时创建的原型就是arrayMethods，原型的原型才是数组构造函数的原型
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212231308306.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 当数组的特殊方法执行完毕之后会调用observeArray
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212231457376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入，遍历数组的所有元素，为每一个元素调用observe函数，如果这个元素是对象的话，依然会进行响应式的处理
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212231526309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 到此为止，数组响应式处理的核心过程就已经看完了，就是修改了数组的一些原生方法，把那些会改变数组的方法进行了一些特殊的处理。接下来我们再来看数组收集依赖的过程，F8执行到下一个断点
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212232142849.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 此时Dep.target就是watcher对象，接下来调用dep.depend，此时的dep是arr属性所对应的收集依赖的对象，这个方法是把当前的watcher对象添加到dep的sub数组中，跳过，我们需要注意的是：此时的childOb是谁？我们刚刚处理arr属性的时候调用了observe这个方法处理arr属性对应的值，也就是我们这个数组，把这个数组进行响应式的处理，并且生成了一个observe对象，这个childOb里面存储的就是这个数组对象所对应的ob对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212232429710.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 如果这个对象存在，调用这个对象的dep，每一个observer对象里面都有一个dep对象负责为observer对应的对象收集依赖，也就是当前它会为数组收集依赖。接下来会判断value是否是数组
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212232857198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 进入dependArray函数，在这个函数中，去遍历数组中的每一个元素并把这个元素获取到，接下里判断当前这个元素是否存在，如果存在，还要判断当前这个元素是否有ob对象，如果是对象且有ob接下来调用这个ob对象的dep.depend。也就是数组中如果这个元素也是对象也要为这个对象收集依赖，当数组中这个元素是对象的时候，如果这个对象发生了变化也会去发送通知。最后判断当前数组中的元素是否是数组，如果是递归调用
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121223300423.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 到此为止数组对象收集依赖的过程也就结束了，接下来来看一下**当数组数据变化时Watcher的执行过程**，结束调试来设置断点：当数组中的数据发生变化时会发送通知调用Dep.notify方法，所以把断点设置到`src/core/observer/dep.js`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213132115359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 回到Console往数组增加成员`vm.arr.push(300)`之后回车进入断点
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213132253723.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在notify方法中先调用this.subs这个subs数组中存储的就是watcher对象，当前只有一个watcher对象，调用slice返回数组中的指定部分（不加参数返回整个数组），即备份。接下来遍历subs数组中所有的watcher调用其update方法，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213132400659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在这个方法中会先判断this.lazy和this.sync，默认这两个属性的值为false，所以会执行queueWatcher函数，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213132845898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在queueWatcher里面先获取当前watcher的id，判断has数组中是否有这个元素，如果没有说明此watcher对象没有被处理过，于是处理watcher对象，接下来在has数组做标记，接下来flushing判断是否正在刷新queue（watcher队列），默认false，执行会把watcher对象放入队列中
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213133053779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
接下来判断waiting此时值为false，然后将它标记为true表示正在刷新这个队列，接下来会调用nextTick并且把刷新队列的函数传递给nextTick，我们先不研究nextTick，先找到flushSchedulerQueue，F11进入找到flushSchedulerQueue执行的位置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213133413782.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F11进入cb.call
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121313402590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10找到核心的位置，这个函数中首先把flushing置为true标记当前正在刷新watcher队列
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213134156104.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 再接下来，要去对队列进行排序，安装watcher的id从小到大的顺序排序，注释给出原因（中文翻译在我的源码中有给出）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213134432431.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 下面遍历这个队列找到这个队列中的每一个watcher对象，判断watcher对象是否有before选项，有的话调用，before里面触发了beforeUpdate生命周期函数，也就是在watcher更新视图之前先去触发了beforeUpdate。接下来把当前watcher对象标记为null（已经处理过了），再往下执行watcher的run方法，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213134626679.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 在run方法里先判断this.active，它的值默认是true，接下来调用get方法，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213135722295.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 内部调用pushTarget，最终调用this.getter，getter里面存储的就是updateComponent更新组件，进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213140005469.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 先调用render生成虚拟DOM，再调用update更新虚拟DOM把其转化为真实DOM更新到视图
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213140339939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 到此更新就完成了，完成后会进行一些首尾操作，会判断当前是否为深度监听（如果这个对象改变，还会监听对象下的属性，如果属性是对象会继续触发watcher），再往下清理当前依赖
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213140458998.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- run结束过后回到调用的位置（flushSchedulerQueue）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213141137367.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 清理工作：先去备份两个数组，然后reset队列的状态，进入resetSchedulerState
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213141258114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 会把当前的索引以及lehgth都置为0，把has对象置为空，不再记录watcher是否被处理，最后把waiting和flushing置为false
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213141404613.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接下啦触发两个生命周期的钩子函数activated（组件相关）、updated（更新完毕）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213141607920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 到此，数组中的数据改变，watcher中执行的过程就调试结束了

### 响应式处理过程总结
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213142853671.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213142313121.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213143030628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213142730966.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
