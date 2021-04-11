# Vue3.0 响应式系统原理

## 17.1 Vue.js 响应式回顾

- Proxy 对象实现属性监听
  - Vue3 重写了响应式系统，和 Vue2 相比 Vue3 的响应式系统底层采用 Proxy 对象实现。在初始化的时候不需要遍历所有的属性，再把属性通过 defineProperty 转换成 getter 和 setter
- 多层嵌套，在访问属性过程中处理下一级属性
  - 如果有多层属性嵌套的话，只有访问某个属性的时候才会递归处理下一级属性，所以 Vue3 中响应式系统的性能要比 Vue2 好
- 默认监听动态添加的属性
- 默认监听属性的删除操作
- 默认监听数组索引和 length 属性
- 可以作为单独的模块使用

**核心方法：**

- reactive/ref/toRefs/computed
- effect
- track
- trigger

> watch/watchEffect 是 Vue3 的 runtime.core 中实现的，watch 函数的内部其实实现了一个底层函数 effect 
>
> 我们会模拟实现 effect 函数以及 Vue3 中收集依赖和触发更新的函数 track 和 trigger

## 17.2 Proxy 对象回顾

**Reflect 介绍：**

[Reflect](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/JavaScript%20%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/ECMAScript%20%E6%96%B0%E7%89%B9%E6%80%A7.html#reflect) 借鉴 JAVA C# 的反射，是ES6中新增的成员，是在代码运行期间用来获取或设置对象中的成员。

由于 JavaScript 的特殊性，代码在运行期间可以随意给对象增加成员或者获取对象中成员的信息，在过去的时候 JavaScript 中并没有反射，可以很随意地把一些方法挂载到 `Object` 中，比如`getPrototypeOf()`，`Reflect` 中也有对应的方法，方法的作用是一样的，只是表达语义的问题

如果在`Reflect`中有对应的`Object`中的方法，都建议使用`Reflect`中的方法，所以接下来都是使用`Reflect`去操作对象中的成员，Vue3 的源码中也是使用的`Reflect`

来看两个小问题：

```js
'use strict'
// 问题1： set 和 deleteProperty 中需要返回布尔类型的值
//        在严格模式下，如果返回 false 的话会出现 Type Error 的异常
const target = {
  foo: 'xxx',
  bar: 'yyy'
}

const proxy = new Proxy(target, {
  get (target, key, receiver) {
    // return target[key]
    return Reflect.get(target, key, receiver)
  },
  set (target, key, value, receiver) {
    // target[key] = value
    Reflect.set(target, key, value, receiver)
  },
  deleteProperty (target, key) {
    // delete target[key]
    Reflect.deleteProperty(target, key)
  }
})

proxy.foo = 'zzz'
// delete proxy.foo
```

比如`set`中我们给只读属性赋值会设置失败，返回`false`，当前代码中的`set`和`deleteProperty`都没有写`return`，默认返回的是`undefined`，转换成布尔类型的话是`false`

所以如果我们在最后去给属性赋值或者删除属性的时候都会报类型错误，注意：前提是在严格模式下，非严格模式下不会报错，我们已经开启了严格模式，且使用`ESModule`模块的时候也默认开启严格模式

![image-20210409181859623](https://public.shiguanghai.top/blog_img/image-20210409181859623.png)

`Reflect.set`方法设置成功后会返回`true`，设置失败会返回`false`，`deleteProperty`同理

```js
// Reflect.set(target, key, value, receiver)
return Reflect.set(target, key, value, receiver)

// Reflect.deleteProperty(target, key)
return Reflect.deleteProperty(target, key)
```

![image-20210409182232604](https://public.shiguanghai.top/blog_img/image-20210409182232604.png)

第二个小问题和`receiver`相关

在`Proxy`的`handler`对象的`get`和`set`中会接收一个`receiver`。它是当前创建的`Proxy`对象，或者继承自当前`Proxy`的子对象，`Reflect`中调用`set`和`get`的时候也传入了一个`recerver`对象

```js
'use strict'
// 问题2：Proxy 和 Reflect 中使用的 receiver

// Proxy 中 receiver：Proxy 或者继承 Proxy 的对象
// Reflect 中 receiver：如果 target 对象中设置了 getter，getter 中的 this 指向 receiver

const obj = {
  get foo() {
    console.log(this)
    return this.bar
  }
}

const proxy = new Proxy(obj, {
  get (target, key, receiver) {
    if (key === 'bar') { 
      return 'value - bar' 
    }
    return Reflect.get(target, key)
  }
})
console.log(proxy.foo)
```

​	我们访问`proxy.foo`时首先会去执行`obj`对象的`foo`，打印`this`，再来访问`this.bar`，当`proxy`的`get`没有设置`receiver`的时候，此处的`this`就是`obj`对象

```js
return Reflect.get(target, key)
```

![image-20210409183552529](https://public.shiguanghai.top/blog_img/image-20210409183552529.png)

```js
// return Reflect.get(target, key)

return Reflect.get(target, key, receiver)
```

此时，我们再访问`target`对象中的`getter`时会让`this`指向`receiver`对象，即代理对象，当我们访问`this.bar`时会执行代理对象的`get`方法

![image-20210409184654869](https://public.shiguanghai.top/blog_img/image-20210409184654869.png)

Vue3 的响应式源码中，在获取或设置值的时候，都会传入`receiver`，防止类似的意外发生

## 17.3 reactive

- 接收一个参数，判断这个参数是否是对象
  - 如果不是，直接返回
  - 只能把对象转换为响应式对象
- 创建拦截器对象 handler，设置 get/set/deleteProperty
- 返回 Proxy 对象

**整体结构：**

```js
// 辅助函数 判断一个变量是否为对象
const isObject = val => val !== null && typeof val === 'object'

export function reactive (target) {
  // 判断 target 是否是对象 不是则返回
  if (!isObject(target)) return target

  // 把 targer 转换为代理对象
  const handler = {
    get (target, key ,receiver) {
      
    },
    set (target, key, value, receiver) {

    },
    deleteProperty (target, key) {

    }
  }

  return new Proxy(target, handler)
}
```

**get 方法：**

```js
// 辅助函数 判断是对象继续处理
const convert = target => isObject(target) ? reactive(target) : target

get (target, key ,receiver) {
  // 收集依赖
  console.log('get', key)
  const result = Reflect.get(target, key, receiver)
  return convert(result)
}
```

**set 方法：**

```js
set (target, key, value, receiver) {
  // 获取 key 属性的值
  const oldValue = Reflect.get(target, key, receiver)
  // 最终返回的值 默认为 true
  let result = true
  // 判断传入新值 与 oldValue 是否相等
  if (oldValue !== value) {
    result = Reflect.set(target, key, value, receiver)
    // 触发更新
    console.log('set', key, value)
  }
  return result
}
```

**deleteProperty 方法：**

```js
// 辅助函数 判断某个对象本身是否有指定属性
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

deleteProperty (target, key) {
  // 判断 target 中是否有自己的 key 属性
  const hasKey = hasOwn(target, key)
  const result = Reflect.deleteProperty(target, key)
  if (hasKey && result) {
    // 触发更新
    console.log('delete', key)
  }
  return result
}
```

**测试：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive } from './reactivity/index.js'
    const obj = reactive({
      name: 'sgh',
      age: 21
    })
    obj.name = 'zs'
    delete obj.age
    console.log(obj)
  </script>
</body>
</html>
```

![image-20210409195445423](https://public.shiguanghai.top/blog_img/image-20210409195445423.png)

## 17.4 收集依赖 和 触发更新

### 整体思路

![image-20210409205712626](https://public.shiguanghai.top/blog_img/image-20210409205712626.png)

在依赖收集的过程中会创建三个集合`targetMap`、`depsMap`、`dep`

其中`targetMap`的作用是用来记录目标对象和一个字典，也就是中间的`Map`。`targetMap`使用的类型是`WeakMap`，弱引用的 Map，此处的 key 就是 target 对象即目标对象，因为是弱引用，目标对象失去引用后可以销毁

`targetMap`的值是`depsMap`，又是一个字典，类型是`Map`，这个字典中的 key 是目标对象的属性名称，值是一个`Set`集合

`Set`集合中存储的元素不会重复，它里面存储的是 effect 函数，因为我们可以多次调用一个 effect，在 effect 中访问同一个属性，此时该属性会收集多次依赖，对应多个 effect 函数

通过这种结构可以存储 目标对象、目标对象的属性 以及 属性对应的 effect 函数。一个属性可能对应多个函数，将来触发更新的时候可以来这个结构中，根据目标对象的属性找到 effect 函数执行

### effect

接收一个函数作为参数

```js
let activeEffect = null
export function effect (callback) {
  // 把 callback 存储起来
  activeEffect = callback
  // 首先执行一次 callback，访问响应式对象属性 去收集依赖
  callback()
  activeEffect = null
}
```

### track 收集依赖

内部首先要根据当前的 `targetMap` 对象找到 `depsMap`。如果没有找到，给当前对象创建一个 `depsMap` 并添加到 `targetMap` 中；如果找到，再去根据当前使用的属性来 `depsMap` 中找到对应的 `dep`。里面存储的是 effect 函数，如果没有找到，为当前属性创建对应的 `dep` 并且存储到 `depsMap` 中；如果找到当前属性对应的集合，就把当前的 effect 函数存储到 `dep` 集合

```js
let targetMap = new WeakMap()
export function track (target, key) {
  // 判断 activeEffect 是否为空，因为最终要保存它
  if(!activeEffect) return
  // 去 targetMap 根据当前的 target 找 depsMap，当前的 target 就是 targetMap 中的键
  let depsMap = targetMap.get(target)
  // 判断是否找到 depsMap 未找到则为当前的对象创建一个 depsMap 并添加到 targetMap
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }
  // 根据属性查找对应的 dep 里面存储的是 effect 函数
  let dep = depsMap.get(key)
  // 判断 dep 是否存在 未找到则为当前属性创建对应的 dep 并存储到 depsMap
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  // 把 effect 函数添加到 dep 集合
  dep.add(activeEffect)
}
```

**完善 get 方法：**

```js
// 收集依赖
// console.log('get', key)
track(target, key)
```

### trigger 触发更新

这个过程与 track 正好相反，trigger 函数要去 `targetMap` 中找到属性对应的 effect 函数执行

```js
export function trigger (target, key) {
  // 根据 target 去 targetMap 中找到 depsMap
  const depsMap = targetMap.get(target)
  // 未找到 depsMap 返回
  if(!depsMap) return
  // 根据 key 找对应的 dep 集合
  const dep = depsMap.get(key)
  // 找到 dep 执行 effect 函数
  if(dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}
```

**完善 set 方法 和 deleteProperty 方法：**

```js
// 触发更新
// console.log('set', key, value)
trigger(target, key)

// 触发更新
// console.log('delete', key)
trigger(target, key)
```

**测试：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect } from './reactivity/index.js'

    const product = reactive({
      name: 'iPhone',
      price: 5000,
      count: 3
    })
    let total = 0 
    effect(() => {
      total = product.price * product.count
    })
    console.log(total)

    product.price = 4000
    console.log(total)

    product.count = 1
    console.log(total)

  </script>
</body>
</html>
```

![image-20210409220028866](https://public.shiguanghai.top/blog_img/image-20210409220028866.png)

## 17.5 ref

- 接收一个参数，可以是原始值，也可以是对象
  - 如果是对象，并且是 ref 创建的，直接返回
  - 如果是普通对象，内部会调用 reactive 来创建响应式对象
  - 否则创建一个只有 value 属性的响应式对象，并返回

```js
export function ref (raw) {
  // 判断 raw 是否是使用 ref 创建的对象 如果是的话直接返回
  if (isObject(raw) && raw.__v_isRef) {
    return
  }
  // 判断 raw 是否是对象 是的话调用 reactive 创建响应式对象 否则返回原始值
  let value = convert(raw)
  // 创建一个只有 value 属性的对象，value 属性具有getter setter
  const r = {
    __v_isRef: true,
    get value () {
      // 收集依赖
      track(r, 'value')
      return value
    },
    set value (newValue) {
      // 判断新旧值是否相等
      if (newValue !== value) {
        raw = newValue
        // value 依旧是响应式的
        value = convert(raw)
        // 触发更新
        trigger(r, 'value')
      }
    }
  }
  return r
}
```

**测试：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect, ref } from './reactivity/index.js'

    const price = ref(5000)
    const count = ref(3)
   
    let total = 0 
    effect(() => {
      total = price.value * count.value
    })
    console.log(total)

    price.value = 4000
    console.log(total)

    count.value = 1
    console.log(total)

  </script>
</body>
</html>
```

![image-20210409222752293](https://public.shiguanghai.top/blog_img/image-20210409222752293.png)

### reactive vs ref

- ref 可以把基本数据类型数据，转换成响应式对象
  - 当获取数据时，要使用 value 属性，模板中使用可以省略 value
  - reactive 不可以把基础类型数据转化成响应式对象
- ref 返回的对象，重新给 value 属性赋值成对象也是响应式的
  - 代码中通过 `convert` 处理
- reactive 返回的对象，重新赋值丢失响应式
  - 重新赋值的对象不再是代理对象
- reactive 返回的对象的属性不可以解构 
  - 需要使用 toRefs 处理 reactive 返回的对象
  - 如果一个函数内部只有一个响应式数据，使用 ref  比较方便因为可以直接解构返回

## 17.6 toRefs

- toRefs 接收一个 reactive 返回的响应式对象，即 Proxy 对象
  - 如果传入的参数不是 reactive 创建的响应式对象，直接返回
  - 再把传入对象的所有属性转换成一个类似 ref 返回的对象
  - 把转换后的属性挂载到一个新的对象上返回

```js
export function toRefs (proxy) {
  // 判断函数参数是否是 reactive 创建的对象 如果不是发送警告
  // reactive 中没有做标识的属性 跳过

  // 判断传过来的参数 是否为数组 否则返回一个空对象
  const ret = proxy instanceof Array ? new Array(proxy.length) : {}
  // 遍历 prxoy 对象的所有属性 如果是数组遍历索引
  for (const key in proxy) {
    ret[key] = toProxyRef(proxy, key)
  }
  return ret
}

// 辅助函数 把每一个属性都转换成类似 ref 返回的对象
function toProxyRef (proxy, key) {
  const r = {
    __v_isRef: true,
    get value () {
      // 不需要收集依赖 此处访问的是响应式对象 当访问其属性时 内部getter会收集依赖
      return proxy[key]
    },
    set value (newValue) {
      proxy[key] = newValue
    }
  }
  return r
}
```

toRefs 是把 reactive 返回的对象的所有属性都转换成了一个对象，所以我们对响应式对象解构的时候，解构出的每一个属性都是对象，而对象是按引用传递的，所以解构出的数据依然是响应式的

**测试：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect, toRefs } from './reactivity/index.js'

    function useProduct () {
      const product = reactive({
        name: 'iPhone',
        price: 5000,
        count: 3
      })
      
      return toRefs(product)
    }

    const { price, count } = useProduct()

    let total = 0 
    effect(() => {
      total = price.value * count.value
    })
    console.log(total)

    price.value = 4000
    console.log(total)

    count.value = 1
    console.log(total)

  </script>
</body>
</html>
```

![image-20210409230316060](https://public.shiguanghai.top/blog_img/image-20210409230316060.png)

## 17.7 computed

- computed 需要接收一个有返回值的函数作为参数
  - 这个函数的返回值就是计算属性的值
  - 要监听函数内部使用的响应式数据的变化
  - 返回函数执行的结果

```js
export function computed (getter) {
  // 最终返回一个 ref 创建的具有 value 属性的对象
  // 不传参 默认传入 undefined 所以返回的 value 的值是 undefined
  const result = ref()
  // 调用 effect 直接调用其 getter 函数 把其结果存储到 result.value 中
  effect(() => (result.value = getter()))
  
  return result
}
```

computed 函数内部会通过 effect 监听 getter 内部的响应式数据的变化，因为在 effect 中执行 getter 的时候访问响应式数据的属性会去收集依赖，当数据变化后会重新执行 effect 函数，把 getter 的结果再存储到 result 当中

**测试：**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    import { reactive, effect, computed } from './reactivity/index.js'

    const product = reactive({
      name: 'iPhone',
      price: 5000,
      count: 3
    })
    let total = computed(() => {
      return product.price * product.count
    })
   
    console.log(total.value)

    product.price = 4000
    console.log(total.value)

    product.count = 1
    console.log(total.value)

  </script>
</body>
</html>
```

![image-20210409231904767](https://public.shiguanghai.top/blog_img/image-20210409231904767.png)

到此，响应式原理的这几个函数就介绍完毕。

完整项目代码：

```js
// 辅助函数 判断一个变量是否为对象
const isObject = val => val !== null && typeof val === 'object'
// 辅助函数 判断是对象继续处理
const convert = target => isObject(target) ? reactive(target) : target
// 辅助函数 判断某个对象本身是否有指定属性
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive (target) {
  // 判断 target 是否是对象 不是则返回
  if (!isObject(target)) return target

  // 把 targer 转换为代理对象
  const handler = {
    get (target, key ,receiver) {
      // 收集依赖
      // console.log('get', key)
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      return convert(result)
    },
    set (target, key, value, receiver) {
      // 获取 key 属性的值
      const oldValue = Reflect.get(target, key, receiver)
      // 最终返回的值 默认为 true
      let result = true
      // 判断传入新值 与 oldValue 是否相等
      if (oldValue !== value) {
        result = Reflect.set(target, key, value, receiver)
        // 触发更新
        // console.log('set', key, value)
        trigger(target, key)
      }
      return result
    },
    deleteProperty (target, key) {
      // 判断 target 中是否有自己的 key 属性
      const hasKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hasKey && result) {
        // 触发更新
        // console.log('delete', key)
        trigger(target, key)
      }
      return result
    }
  }

  return new Proxy(target, handler)
}

let activeEffect = null
export function effect (callback) {
  // 把 callback 存储起来
  activeEffect = callback
  // 首先执行一次 callback，访问响应式对象属性 去收集依赖
  callback()
  activeEffect = null
}

let targetMap = new WeakMap()
export function track (target, key) {
  // 判断 activeEffect 是否为空，因为最终要保存它
  if(!activeEffect) return
  // 去 targetMap 根据当前的 target 找 depsMap，当前的 target 就是 targetMap 中的键
  let depsMap = targetMap.get(target)
  // 判断是否找到 depsMap 未找到则为当前的对象创建一个 depsMap 并添加到 targetMap
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }
  // 根据属性查找对应的 dep 里面存储的是 effect 函数
  let dep = depsMap.get(key)
  // 判断 dep 是否存在 未找到则为当前属性创建对应的 dep 并存储到 depsMap
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  // 把 effect 函数添加到 dep 集合
  dep.add(activeEffect)
}

export function trigger (target, key) {
  // 根据 target 去 targetMap 中找到 depsMap
  const depsMap = targetMap.get(target)
  // 未找到 depsMap 返回
  if(!depsMap) return
  // 根据 key 找对应的 dep 集合
  const dep = depsMap.get(key)
  // 找到 dep 执行 effect 函数
  if(dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}

export function ref (raw) {
  // 判断 raw 是否是使用 ref 创建的对象 如果是的话直接返回
  if (isObject(raw) && raw.__v_isRef) {
    return
  }
  // 判断 raw 是否是对象 是的话调用 reactive 创建响应式对象 否则返回原始值
  let value = convert(raw)
  // 创建一个只有 value 属性的对象，value 属性具有getter setter
  const r = {
    __v_isRef: true,
    get value () {
      // 收集依赖
      track(r, 'value')
      return value
    },
    set value (newValue) {
      // 判断新旧值是否相等
      if (newValue !== value) {
        raw = newValue
        // value 依旧是响应式的
        value = convert(raw)
        // 触发更新
        trigger(r, 'value')
      }
    }
  }
  return r
}

export function toRefs (proxy) {
  // 判断函数参数是否是 reactive 创建的对象 如果不是发送警告
  // reactive 中没有做标识的属性 跳过

  // 判断传过来的参数 是否为数组 否则返回一个空对象
  const ret = proxy instanceof Array ? new Array(proxy.length) : {}
  // 遍历 prxoy 对象的所有属性 如果是数组遍历索引
  for (const key in proxy) {
    ret[key] = toProxyRef(proxy, key)
  }
  return ret
}

// 辅助函数 把每一个属性都转换成类似 ref 返回的对象
function toProxyRef (proxy, key) {
  const r = {
    __v_isRef: true,
    get value () {
      // 不需要收集依赖 此处访问的是响应式对象 当访问其属性时 内部getter会收集依赖
      return proxy[key]
    },
    set value (newValue) {
      proxy[key] = newValue
    }
  }
  return r
}

export function computed (getter) {
  // 最终返回一个 ref 创建的具有 value 属性的对象
  // 不传参 默认传入 undefined 所以返回的 value 的值是 undefined
  const result = ref()
  // 调用 effect 直接调用其 getter 函数 把其结果存储到 result.value 中
  effect(() => (result.value = getter()))
  
  return result
}
```

