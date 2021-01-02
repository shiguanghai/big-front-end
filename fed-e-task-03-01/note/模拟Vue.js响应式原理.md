

## 2.1 数据驱动
> 在学习 Vue 的过程中，经常会看到三个词：数据响应式、双向绑定、数据驱动

- 数据响应式
	* 数据（即数据模型）仅仅是普通的 JavaScript 对象，而当我们修改数据时，视图会进行更新，避免了繁琐的 DOM 操作，提高开发效率
- 双向绑定
	* 数据改变，视图改变；视图改变，数据也随之改变
	* 我们可以使用 v-model 在表单元素上创建双向数据绑定
- 数据驱动是 Vue 最独特的特性之一
	* 开发过程中仅需要关注数据本身，不需要关心数据是如何渲染到视图

## 2.2 数据响应式的核心原理
### Vue 2.x - defineProperty

- [Vue 2.x深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)
- [MDN - Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- 浏览器兼容 IE8 以上（不兼容IE8）

> 当你把一个普通的 JavaScript 对象传入 Vue 实例作为 `data` 选项，Vue 将遍历此对象所有的 property，并使用 `Object.defineProperty` 把这些 property 全部转为 getter/setter。`Object.defineProperty` 是 ES5 中一个无法 shim 的特性，这也就是 Vue 不支持 IE8 以及更低版本浏览器的原因。

```js
// 模拟 Vue 中的 data 选项
let data = {
  msg: 'hello'
}

// 模拟 Vue 的实例
let vm = {}

// 数据劫持：当访问或者设置 vm 中的成员的时候，做一些干预操作
Object.defineProperty(vm, 'msg', {
  // 可枚举（可遍历）
  enumerable: true,
  // 可配置（可以使用 delete 删除，可以通过 defineProperty 重新定义）
  configurable: true,
  // 当获取值的时候执行
  get () {
    console.log('get: ', data.msg)
    return data.msg
  },
  // 当设置值的时候执行
  set (newValue) {
    console.log('set: ', newValue)
    if (newValue === data.msg) {
      return
    }
    data.msg = newValue
    // 数据更改，更新 DOM 的值
    document.querySelector('#app').textContent = data.msg
  }
})

// 测试
vm.msg = 'Hello World'
console.log(vm.msg)
```

如果有一个对象中多个属性需要转换 getter/setter 如何处理？

```js
// 模拟 Vue 中的 data 选项
let data = {
  msg: 'hello', // 此处仅展示 msg
  count: 10
}

// 模拟 Vue 的实例
let vm = {}

proxyData(data)

function proxyData(data) {
  // 遍历 data 对象的所有属性
  Object.keys(data).forEach(key => {
    // 把 data 中的属性，转换成 vm 的 setter/setter
    Object.defineProperty(vm, key, {
      enumerable: true,
      configurable: true,
      get () {
        console.log('get: ', key, data[key])
        return data[key]
      },
      set (newValue) {
        console.log('set: ', key, newValue)
        if (newValue === data[key]) {
          return
        }
        data[key] = newValue
        // 数据更改，更新 DOM 的值
        document.querySelector('#app').textContent = data[key]
      }
    })
  })
}

// 测试
vm.msg = 'Hello World'
console.log(vm.msg)
```
### Vue 3.x - Proxy
- [MDN - Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- 直接监听对象，而非属性。
- ES 6中新增，IE 不支持，性能由浏览器优化

```js
// 模拟 Vue 中的 data 选项
 let data = {
   msg: 'hello',
   count: 0
 }

 // 模拟 Vue 实例
 let vm = new Proxy(data, {
   // 执行代理行为的函数
   // 当访问 vm 的成员会执行
   get (target, key) {
     console.log('get, key: ', key, target[key])
     return target[key]
   },
   // 当设置 vm 的成员会执行
   set (target, key, newValue) {
     console.log('set, key: ', key, newValue)
     if (target[key] === newValue) {
       return
     }
     target[key] = newValue
     document.querySelector('#app').textContent = target[key]
   }
 })

 // 测试
 vm.msg = 'Hello World'
 console.log(vm.msg)
```
我们可以发现 使用 Proxy 比使用 defineProperty 的代码简洁的多。

使用 Proxy 是代理的整个对象，也就是这个对象的所有属性在访问或者设置的时候都会去触发 vm 中的 get和set。

而如果用 defineProperty 处理多个属性的话，我们还要进行循环。

另外，Proxy 会进行浏览器性能优化，其性能也要比 defineProperty 要好。

## 2.3 发布订阅模式和观察者模式
### 发布/订阅模式
- 发布/订阅模式
	* 订阅者
	* 发布者
	* 信号中心

> 我们假定，存在一个"信号中心"，某个任务执行完成，就向信号中心"发布"（publish）一个信号，其他任务可以向信号中心"订阅"（subscribe）这个信号，从而知道什么时候自己可以开始执行。**这就叫做"发布/订阅模式"（publish-subscribe pattern）**

- [Vue 的自定义事件](https://cn.vuejs.org/v2/guide/migration.html#dispatch-%E5%92%8C-broadcast-%E6%9B%BF%E6%8D%A2)

```js
// Vue 自定义事件
let vm = new Vue()
// { 'click': [fn1, fn2], 'change': [fn] }

// 注册事件(订阅消息)
vm.$on('dataChange', () => {
  console.log('dataChange')
})

vm.$on('dataChange', () => {
  console.log('dataChange1')
})
// 触发事件(发布消息)
vm.$emit('dataChange')
```

- 兄弟组件的通信过程

```js
// eventBus.js
// 事件中心
leteventHub = newVue()

// ComponentA.vue
// 发布者
addTodo: function () {
  // 发布消息(事件)
  eventHub.$emit('add-todo', { text: this.newTodoText })
  this.newTodoText=''
}
// ComponentB.vue
// 订阅者
created: function () {
  // 订阅消息(事件)
  eventHub.$on('add-todo', this.addTodo)
}
```

- 模拟 Vue 自定义事件的实现

```js
// 事件触发器
class EventEmitter {
  constructor () {
    // { 'click': [fn1, fn2], 'change': [fn] }
    this.subs = Object.create(null) // 不设置原型属性 提升性能
  }

  // 注册事件
  $on (eventType, handler) {
    this.subs[eventType] = this.subs[eventType] || []
    this.subs[eventType].push(handler)
  }

  // 触发事件
  $emit (eventType) {
    if (this.subs[eventType]) {
      this.subs[eventType].forEach(handler => {
        handler()
      })
    }
  }
}

// 测试
let em = new EventEmitter()
em.$on('click', () => {
  console.log('click1')
})
em.$on('click', () => {
  console.log('click2')
})

em.$emit('click')
```

### 观察者模式
- 观察者（订阅者）- Watcher
	* update()：当事件发生时，具体要做的事情
- 目标（发布者）- Dep
	* subs 数组：存储所有的观察者
	* addSub()：添加观察者
	* notify()：当事件发生，调用所有观察者的updata() 方法
- 没有事件中心

```js
// 发布者-目标
class Dep {
  constructor () {
    // 记录所有的订阅者
    this.subs = []
  }
  // 添加订阅者
  addSub (sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 发布通知
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
// 订阅者-观察者
class Watcher {
  update () {
    console.log('update')
  }
}

// 测试
let dep = new Dep()
let watcher = new Watcher()

dep.addSub(watcher)

dep.notify()
```

### 发布订阅/观察者模式 总结
- **观察者模式**是由具体目标调度，比如当事件触发，Dep 就会去调用观察者的方法，所以观察者模式的订阅者与发布者之间是存在依赖的。
- **发布/订阅模式**由统一调度中心调用，因此发布者和订阅者不需要知道对方的存在。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120213942247.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

## 2.4 模拟Vue响应式原理
### 整体分析

- Vue 基本结构

```js
<!DOCTYPE html>
<html lang="cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Vue 基础结构</title>
</head>
<body>
  <div id="app">
    <h1>差值表达式</h1>
    <h3>{{ msg }}</h3>
    <h3>{{ count }}</h3>
    <h1>v-text</h1>
    <div v-text="msg"></div>
    <h1>v-model</h1>
    <input type="text" v-model="msg">
    <input type="text" v-model="count">
  </div>

  <script src="./js/vue.js"></script>
  <script>
    let vm = new Vue({
      el: '#app',
      data: {
        msg: 'Hello Vue',
        count: 20,
        items: ['a', 'b', 'c']
      }
    })
  </script>
</body>
</html>
```

- 打印 Vue 实例观察

我们只关注需要模拟的成员：
```js
count: (...)
msg: (...)
...
> get count
> set count
> get msg
> set msg
```
> Vue 构造函数内部需要把 data 中的成员转换成 getter 和 setter 注入到 Vue实例，这样可以直接通过 this.msg, this.count 使用

```js
$data: (...)
```
> data 选项中的成员被记录到 \$data 中并且转换成 getter 和 setter，\$data 中的 setter 是真正监视数据变化的地方

```js
$options: {...}
```
> \$options 我们可以简单认为把构造函数的参数记录到 \$options 当中

```js
_data: {...}
```
> _data 和 \$data 指向的是同一个对象，\_ 开头的是私有成员，\$ 开头的是公共成员，我们只需要模拟 \$data 就可以了

```js
$el: div#app
```
> \$el 对应选项中的 el， 我们设置 el 选项时，可以是选择器，也可以是一个DOM对象。如果是选择器，vue 构造函数内部需要把这个选择器转换成对应的DOM对象。

我们最小版本的 Vue 中要模拟 vm 中的 \$data，\$el，\$options，还要把 data 中的成员注入到 Vue 实例中

- 整体结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120220441926.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
> Vue: 把 data 中的成员注入到 Vue 实例，并且把 data 中的成员转成 getter/setter

> Observer: 能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知 Dep

> Compiler: 解析每个元素中的指令/插值表达式，并替换成相应的数据

> Dep: 添加观察者(watcher)，当数据变化通知所有观察者

> Watcher: 数据变化更新视图


[项目完整代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-03-01/code/03-01-03-06-vue-reactivity/minivue)
```js
<!DOCTYPE html>
<html lang="cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Mini Vue</title>
</head>
<body>
  <div id="app">
    <h1>差值表达式</h1>
    <h3>{{ msg }}</h3>
    <h3>{{ count }}</h3>
    <h1>v-text</h1>
    <div v-text="msg"></div>
    <h1>v-model</h1>
    <input type="text" v-model="msg">
    <input type="text" v-model="count">
  </div>
  <script src="./js/dep.js"></script>
  <script src="./js/watcher.js"></script>
  <script src="./js/compiler.js"></script>
  <script src="./js/observer.js"></script>
  <script src="./js/vue.js"></script>
  <script>
    let vm = new Vue({
      el: '#app',
      data: {
        msg: 'Hello Vue',
        count: 100,
        person: { name: 'zs' }
      }
    })
    console.log(vm.msg)
    // vm.msg = { test: 'Hello' }
    vm.test = 'abc'
  </script>
</body>
</html>
```

### Vue
- 功能
	* 负责接收初始化的参数(选项)
	* 负责把 data 中的属性注入到 Vue 实例，转换成 getter/setter
	* 负责调用 observer 监听 data 中所有属性的变化
	* 负责调用 compiler 解析指令/插值表达式
- 结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120223858730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 代码

```js
// js/vue.js

class Vue {
  constructor (options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把data中的成员转换成getter和setter，注入到vue实例中
    this._proxyData(this.$data)
    // 3. 调用observer对象，监听数据的变化
    new Observer(this.$data)
    // 4. 调用compiler对象，解析指令和差值表达式
    new Compiler(this)
  }
  _proxyData (data) {
    // 遍历data中的所有属性
    Object.keys(data).forEach(key => {
      // 把data的属性注入到vue实例中
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}
```
### Observer
- 功能
	* 负责把 data 选项中的属性转换成响应式数据
	* data 中的某个属性也是对象，把该属性转换成响应式数据
	* 数据变化发送通知
- 结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120225500339.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 代码

```js
// js/observer.js

class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    // 1. 判断data是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 2. 遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (obj, key, val) { // 传 val 防止 get 出现死递归访问 obj[key]
    let that = this
	...    
    // 如果val是对象，把val内部的属性转换成响应式数据
    this.walk(val)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () { // 此处发生闭包 不会释放 val变量
        ...
        return val
      },
      set (newValue) {
        if (newValue === val) {
          return
        }
        val = newValue
        // 新赋值的属性如果是对象 会遍历对象调用 defineReactive
        // 注意 this 指向 此时为 data 对象 因此需要在外部记录 that = this
        that.walk(newValue)
        ...
      }
    })
  }
}
```

### Compiler
- 功能
	* 负责编译模板，解析指令/插值表达式
	* 负责页面的首次渲染
	* 当数据变化后重新渲染视图
- 结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120232138566.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 代码

```js
// js/compiler.js

class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile (el) {
    
  }
  // 编译元素节点，处理指令
  compileElement (node) {
   
  }
  // 编译文本节点，处理差值表达式
  compileText (node) {
   
  }
  // 判断元素属性是否是指令
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是否是文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}
```

### Compiler - compile
```js
// 编译模板，处理文本节点和元素节点
compile (el) {
  let childNodes = el.childNodes // 子节点
  // 用 Array.from() 将伪数组转化为数组
  Array.from(childNodes).forEach(node => {
    if (this.isTextNode(node)) {
      // 处理文本节点
      this.compileText(node)
    } else if (this.isElementNode(node)) {
      // 处理元素节点
      this.compileElement(node)
    }

    // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
    if (node.childNodes && node.childNodes.length) {
      this.compile(node)
    }
  })
}
```

### Compiler - compileText
- 负责编译插值表达式
```js
// 编译文本节点，处理差值表达式
compileText (node) {
  // console.dir(node)
  // {{  msg }}
  // . 匹配任意的单个字符
  // + 匹配前面修饰的内容出现一或多次
  // ？ 非贪婪模式 尽可能早的结束匹配
  // () 分组 提取某个位置的内容
  let reg = /\{\{(.+?)\}\}/
  // 通过查看node 可以使用textContent或者nodeValue获取文本节点内容
  let value = node.textContent
  if (reg.test(value)) {
    // RegExp 正则的构造函数; $1 第一个分组的内容; trim() 去空格
    let key = RegExp.$1.trim()
    // 将文本节点原来内容的插值表达式替换成变量对应的值
    node.textContent = value.replace(reg, this.vm[key])
    ...
  }
}
```
### Compiler - compileElement
- 负责编译元素的指令
- 处理 v-text 的首次渲染
- 处理 v-model 的首次渲染

```js
// 编译元素节点，处理指令
compileElement (node) {
  // console.log(node.attributes)
  // 遍历所有的属性节点
  // 用 Array.from() 将伪数组转化为数组
  Array.from(node.attributes).forEach(attr => {
    // 通过查看 node.attributes 
    // 可以使用 node.attributes.name 获取属性名称
    // 使用 node.attributes.value 获取属性值
    // 判断是否是指令
    let attrName = attr.name
    if (this.isDirective(attrName)) {
      // v-text --> text
      attrName = attrName.substr(2)
      let key = attr.value
      this.update(node, key, attrName)
    }
  })
}

update (node, key, attrName) {
  let updateFn = this[attrName + 'Updater']
  updateFn && updateFn(node, this.vm[key])
}

// 处理 v-text 指令
textUpdater (node, value) {
  node.textContent = value
  ...
}
// 处理 v-model 指令
modelUpdater (node, value) {
  node.value = value
  ...
}
```
### Dep (Dependency)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121164045831.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 功能
	* 收集依赖，添加观察者(Watcher)
	* 通知所有观察者
- 结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121164354330.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 代码

```js
// js/dep.js

class Dep {
  constructor () {
    // 存储所有的观察者(Watcher)
    this.subs = []
  }
  // 添加观察者
  addSub (sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 发送通知
  notify () {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
```
接下来我们需要使用这个类，这个类的作用是 收集依赖 和 发送通知，我们需要为每一个响应式数据创建一个Dep对象，在使用响应式数据的时候收集依赖（创建观察者对象），当数据变化的时候通知所有的观察者，调用观察者的 updata 方法来更新视图。

我们需要在 Observer 中来创建 Dep 对象
```js
// js/observer.js

class Observer {
  ...
  defineReactive (obj, key, val) {
    let that = this
    
    // 负责收集依赖，并发送通知
    let dep = new Dep()
    
    this.walk(val)
    Object.defineProperty(obj, key, {
      ...
      get () {
        // 收集依赖
        // target属性（观察者对象）是在 Watcher 中添加的
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set (newValue) {
        ...
        // 发送通知
        dep.notify()
      }
    })
  }
}
```

### Watcher
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121165955637.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 功能
	* 当数据变化触发依赖， dep 通知所有的 Watcher 实例更新视图
	* 自身实例化的时候往 dep 对象中添加自己
- 结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121170249276.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 代码

```js
// js/watcher.js

class Watcher {
  constructor (vm, key, cb) {
    this.vm = vm
    // data中的属性名称
    this.key = key
    // 回调函数负责更新视图
    this.cb = cb

    // 把watcher对象记录到Dep类的静态属性target
    // 可以参考 Observer 的 get() 方法新增的内容 即
    // Dep.target && dep.addSub(Dep.target)
    Dep.target = this
    // 触发get方法，在get方法中会调用addSub
    this.oldValue = vm[key]
    // 防止重复添加 清空 Dep.target
    Dep.target = null
  }
  // 当数据发生变化的时候更新视图
  update () {
    let newValue = this.vm[this.key]
    if (this.oldValue === newValue) {
      return
    }
    this.cb(newValue)
  }
}
```

我们在创建Watcher对象的时候要传递 cb 回调函数，最终调用这个回调函数会将 newValue 传递给cb，我们更新视图的操作其实就是在操作 DOM，而我们所有的 DOM 操作都在 Compile 中

接下来我们要在 Compile 中创建 watcher 对象

我们要找到把数据渲染到 DOM 的位置，也就是处理指令和插值表达式的位置
```js
class Compiler {
  ...
  update (node, key, attrName) {
    let updateFn = this[attrName + 'Updater']
    // 增加key属性后 注意 this 的指向问题, 通过 call 来解决
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }
  // 处理 v-text 指令
  textUpdater (node, value, key) {
    node.textContent = value
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  // 处理 v-model 指令
  modelUpdater (node, value, key) {
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 双向绑定
    // 注册 input 事件: 事件名称 处理函数
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  // 编译文本节点，处理差值表达式
  compileText (node) {
    ...
    if (reg.test(value)) {
      ...
      node.textContent = value.replace(reg, this.vm[key])
      // 创建watcher对象，当数据改变更新视图
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
    }
  }
  ...
}
```
上面三个方法都是在操作 DOM，最终都是把数据渲染到 DOM 元素上，这三个方法都是在页面首次加载的时候执行的。

指令和插值表达式都是依赖于数据的，而所有视图中依赖数据的位置都要创建一个 Watcher 对象，当数据改变的时候，Dep 对象会通知所有的 Watcher 对象重新渲染视图。

**以上，我们模拟 Vue响应式 的代码就结束了**


### 总结
- 问题
	* 给属性重新赋值成对象，是否是响应式的？ 
		+ **是的** 重新赋值会触发 set 方法 记录新的值 调用 walk 方法，其中会遍历这个对象的所有属性重新把它定义成响应式数据
	* 给 Vue 实例新增一个成员是否是响应式的？
		+ **不是** 当创建好 Vue 实例后，新增一个成员，此时data并没有定义该成员，data中的成员是在创建 Vue 对象的时候 new Observer 来将其设置成响应式数据，当 Vue 实例化完成之后，再添加一个成员，此时仅仅是给vm上增加了一个js属性而已，因此并不是响应式的

Vue 文档中给出了解决方案 当新增一个属性时，如何将其转化为响应式数据

> 对于已经创建的实例，Vue不允许动态添加根级别的响应式属性。但是可以使用 `Vue.set(object, propertyName, value)`方法向嵌套对象添加响应式属性。您还可以使用`vm.$set`实例方法，这也是全局`Vue.set`方法的别名。

- 整体流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121182336826.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)


**参考**

[深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)

[剖析Vue实现原理 - 如何实现双向绑定mvvm](https://github.com/DMQ/mvvm)