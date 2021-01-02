


## 【简答题】一、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么。

```js
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

不是想响应式数据

当创建好 Vue 实例后，新增一个成员，此时 data 并没有定义该成员，data 中的成员是在创建 Vue 对象的时候 new Observer 来将其设置成响应式数据，当 Vue 实例化完成之后，再添加一个成员，此时仅仅是给 vm 上增加了一个js属性而已，因此并不是响应式的

Vue 文档中给出了解决方案 当新增一个属性时，如何将其转化为响应式数据

> 对于已经创建的实例，Vue不允许动态添加根级别的响应式属性。但是可以使用 `Vue.set(object, propertyName, value)`方法向嵌套对象添加响应式属性。您还可以使用`vm.$set`实例方法，这也是全局`Vue.set`方法的别名。

```js
// this.$set()的源码
vue.property.$set = set
```
Vue.set 内部原理：

源码位置: vue/src/core/observer/index.js
```js
export function set (target: Array<any> | Object, key: any, val: any): any {
  ...
  // 判断当前target是不是数组，并且key的值是有效的数组索引
  // 这块代码意思是在修改数组时调用set方法时让我们能够触发响应的代码
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 类似$vm.set(vm.$data.arr, 0, 3)
    // 修改数组的长度, 避免索引>数组长度导致splcie()执行有误
    target.length = Math.max(target.length, key)
    // 利用数组的splice变异方法触发响应式
    target.splice(key, 1, val)
    return val
  }
  // target为对象, key在target或者target.prototype上。
  // 并且key不是Object原型上的属性
  // 说明这个key本来就在对象上面已经定义过了的，直接修改值就可以了，可以自动触发响应
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 以上都不成立, 即开始给target创建一个全新的属性
  // vue给响应式对象都加了一个__ob__属性，如果一个对象有这个__ob__属性，
  // 那么就说明这个对象是响应式对象，我们修改对象已有属性的时候就会触发页面渲染
  // 获取Observer实例
  const ob = (target: any).__ob__
  // Vue 实例对象拥有 _isVue 属性, 即不允许给 Vue 实例对象添加属性
  // 也不允许Vue.set/$set 函数为根数据对象(vm.$data)添加属性
  // 即 当前的target对象是vue实例对象或者是根数据对象，那么就会抛出错误警告
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // target本身就不是响应式数据, 不需要响应，那么直接赋值返回即可
  if (!ob) {
    target[key] = val
    return val
  }
  // 进行响应式处理
  // 给新加的属性添加依赖，以后再直接修改这个新的属性的时候就会触发页面渲染
  defineReactive(ob.value, key, val)
  // 触发当前的依赖（这里的依赖依然可以理解成渲染函数），所以页面就会进行重新渲染
  ob.dep.notify()
  return val
}
```


## 【简答题】二、请简述 Diff 算法的执行过程

- **执行过程：**
	* 在进行同级别节点比较的时候，首先会对新老节点数组的开始和结尾节点设置标记索引，遍历的过程中移动索引
	* 在对**开始和结束节点**比较的时候，总共有四种情况
		+ oldStartVnode / newStartVnode (旧开始节点 / 新开始节点)
		+ oldEndVnode / newEndVnode (旧结束节点 / 新结束节点)
		+ oldStartVnode / oldEndVnode (旧开始节点 / 新结束节点)
		+ oldEndVnode / newStartVnode (旧结束节点 / 新开始节点)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201122155029478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
	* 开始节点和结束节点比较，这两种情况类似
		+ oldStartVnode / newStartVnode (旧开始节点 / 新开始节点)
		+ oldEndVnode / newEndVnode (旧结束节点 / 新结束节点)
	* 如果 oldStartVnode 和 newStartVnode 是 sameVnode (key 和 sel 相同)
		+ 调用 patchVnode() 对比和更新节点
		+ 把旧开始和新开始索引往后移动 oldStartIdx++ / oldEndIdx++
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201122155124831.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
	* oldStartVnode / newEndVnode (旧开始节点 / 新结束节点) 相同
		+ 调用 patchVnode() 对比和更新节点
		+ 把 oldStartVnode 对应的 DOM 元素，移动到右边
		+ 更新索引
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020112216064975.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
	* oldEndVnode / newStartVnode (旧结束节点 / 新开始节点) 相同
		+ 调用 patchVnode() 对比和更新节点
		+ 把 oldEndVnode 对应的 DOM 元素，移动到左边
		+ 更新索引
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201122160852462.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
	* 如果不是以上四种情况
		+ 遍历新节点，使用 newStartNode 的 key 在老节点数组中找相同节点
		+ 如果没有找到，说明 newStartNode 是新节点
		+ 创建新节点对应的 DOM 元素，插入到 DOM 树中
		+ 如果找到了
		+ 判断新节点和找到的老节点的 sel 选择器是否相同
		+ 如果不相同，说明节点被修改了
		+ 重新创建对应的 DOM 元素，插入到 DOM 树中
		+ 如果相同，把 elmToMove 对应的 DOM 元素，移动到左边
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201122161329309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
	* 循环结束
		+ 当老节点的所有子节点先遍历完 (oldStartIdx > oldEndIdx)，循环结束
		+ 新节点的所有子节点先遍历完 (newStartIdx > newEndIdx)，循环结束
	* 如果老节点的数组先遍历完(oldStartIdx > oldEndIdx)，说明新节点有剩余，把剩余节点批量插入到右边
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201122161603599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
	* 如果新节点的数组先遍历完(newStartIdx > newEndIdx)，说明老节点有剩余，把剩余节点批量删除
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201122161621240.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

## 【编程题】一、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。
```js
let _Vue = null

export default class VueRouter {
  static install (Vue) {
    // 1.判断当前插件是否已经被安装
    // 如果插件已经安装直接返回
    if (VueRouter.install.installed && _Vue === Vue) return
    VueRouter.install.installed = true
    // 2.把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3.把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 混入
    _Vue.mixin({
      beforeCreate () {
        // 判断 router 对象是否已经挂载了 Vue 实例上
        if (this.$options.router) {
          // 把 router 对象注入到 Vue 实例上
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    // 记录路径和对应的组件
    this.routeMap = {}
    this.data = _Vue.observable({
      // 当前的默认路径
      current: '/'
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    // routes => [{ name: '', path: '', component: }]
    // 遍历所有的路由信息，记录路径和组件的映射
    this.options.routes.forEach(route => {
      // 记录路径和组件的映射关系
      this.routeMap[route.path] = route.component
    })
  }

  initComponents (Vue) {
    _Vue.component('router-link', {
      // 接收外部传入的参数
      props: {
        to: String
      },
      // 使用运行时版本的 Vue.js
      // 此时没有编译器 直接来写一个 render函数
      render (h) { // 参数 h 创建虚拟DOM render函数中调用h函数并将结果返回
        // h函数 接收三个参数
        return h('a', { // 1. 创建的元素对应的选择器
          attrs: { // 2. 给标签设置属性 attes 指明DOM对象属性
            // history
            // href: this.to
            // hash
            href: '#' + this.to
          },
          on: { // 给 a标签 注册点击事件
            click: this.clickhander
          }
        }, [this.$slots.default]) // 3. 生成元素的子元素
      },
      methods: {
        clickhander (e) { // 时间参数 e
          // 改变浏览器地址栏 pushiState 不向服务器发送请求
          // history
          // history.pushState({}, '', this.to) // data title url
          // hash
          window.location.hash = '#' + this.to
          this.$router.data.current = this.to // 响应式对象data
          e.preventDefault() // 阻止事件默认行为
        }
      }
      // template: '<a :href="to"><slot></slot></a>'
    })

    const self = this // 保存 this
    _Vue.component('router-view', {
      render (h) {
        // 根据当前路径找到对应的组件，注意 this 的问题
        const component = self.routeMap[self.data.current]
        return h(component) // 将组件转换为虚拟DOM返回
      }
    })
  }

  // initEvent () {
  //   window.addEventListener('popstate', () => {
  //     this.data.current = window.location.pathname
  //   })
  // }

  // 监听页面 load 和 hashchange 方法，在这个地方有个判断
  // 如果当前页面的 hash 不存在，则自动加上 '#/' ,并加载 '/' 的组件
  initEvent () {
    window.addEventListener('load', this.hashChange.bind(this))
    window.addEventListener('hashchange', this.hashChange.bind(this))
  }

  hashChange () {
    if (!window.location.hash) {
      window.location.hash = '#/'
    }
    this.data.current = window.location.hash.substr(1)
  }
}

```

## 【编程题】二、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

- v-html 指令
	* 与 v-text 指令相似，将 textContent 更改为 innerHTML

```js
class Compiler {
  ...
  // 处理 v-html 指令
  htmlUpdater (node, value, key) {
    node.innerHTML = value
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue
    })
  }
}
```

- v-on 指令
- 在 vue.js 文件 添加变量 `methods`，把事件注入到 vue 实例
- 在 compiler.js文件 将` on:` 修改为空 只保留后面的事件 再处理相应指令
	

```js
class Vue {
  constructor(options) {
    ...
    this.$methods = options.methods || {}
    this._proxyMethods(this.$methods)
    ...
  }
  ...
  // 把methods注入vue实例
  _proxyMethods(methods) {
    Object.keys(methods).forEach(key => {
      this[key] = this.$methods[key]
    })
  }
}

class Compiler {
  update (node, key, attrName) {
    // 删除 on: 前缀
    if (attrName.startsWith('on:')) {
      attrName = attrName.replace('on:', '')
    }
	...
  }
  ...
  // 处理 v-on 指令 此处举两个例子
  clickUpdater (node, value, key) {
    node.onclick = value
  }
  mouseoverUpdater (node, value, key) {
    node.onmouseover = value
  }
  ...
}
```

测试代码：
```js
<body>
  <h1>v-on</h1>
  <div v-on:click="clickHandler">点击触发</div>
  <div v-on:mouseover="mouseOver">鼠标进入触发</div>
</body>
<script>
  let vm = new Vue({
    el: '#app',
    data: {
      html: '<p style="color: skyblue">这是一个p标签</p>',
    },
    methods: {
      clickHandler() {
        alert('点击了')
      },
      mouseOver(){
        alert('鼠标进入')
      }
    }
  })
</script>
```


## 【编程题】三、参考 Snabbdom 提供的电影列表的示例，利用Snabbdom 实现类似的效果，如图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201117230557796.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

源代码位于 snabbdom/examples/reoder-animation

处理后的[代码仓库](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-03-01/code/snabbdom)

**实现原理：**

1. 导入 init 函数注册模块返回一个 patch，导入 h 函数创建 vnode
2. 导入 `className` 切换类样式、`eventlisteners` 注册事件、`style` 行内样式、`props` 设置DOM元素的属性
3. 当初始的 HTML 文档被完全加载和解析完成之后，使用 h函数 生成 vnode，然后 patch 到 id 为 container 的 div 上生成页面结构
4. 排序按钮通过 **eventlisteners** 的 **on** 属性调用排序函数，点击按钮调用排序函数，然后重新渲染页面；**class** 判断当前的是以什么排序，对应的按钮显示为激活状态；**style** 设置整个列表的高度
5. 在定义列表的行结构时，使用 **props** 模块设置 DOM 的 `key` 属性；通过 **style** 模块添加 `delayed(进场样式)` 和 `remove(退场样式)` 以及 `opacity` 和 `transform`; **hook** 属性中设置了 `insert` 属性，也就是在节点插入到 dom 中后，触发该回调，设置节点的高度
7. 每一行的最后一列添加删除的图标，使用 **eventlisteners** 的 `on` 属性调用删除函数，点击删除按钮删除该行，然后重新渲染页面
8. 添加按钮的回调函数就是随机生成一个数据对象，但是其 `rank` 属性是全局递增的。然后对新数据调用 **h函数** 生成新的 `vnode`，并且 patch 到页面上，重新渲染了页面

注意：当删除剩余一条数据的时候会报错 `Uncaught TypeError: Cannot read property 'offset' of undefined` 是因为当删除仅剩的一条数据是 render 函数中的 `data[data.length - 1] ` 为 undefined，需要对该处代码做判断做对应的处理，此处已改为判断为 undefined 时 将不获取数据 offset 而是赋值为0

```js
// package.json
{
  "scripts": {
    "dev": "parcel index.html --open"
  },
  "devDependencies": {
    "parcel-bundler": "1.12.4",
    "snabbdom": "0.7.4"
  }
}
```
```js
// index.html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Reorder animation</title>
    <style>
    ...
    </style>
  </head>
  <body>
    <div id="container"></div>
    <script src="./script.js"></script>
  </body>
</html>
```
```js
// script.js
import { h, init } from 'snabbdom'
import className from 'snabbdom/modules/class'
import eventlisteners from 'snabbdom/modules/eventlisteners'
import style from 'snabbdom/modules/style'
import props from 'snabbdom/modules/props'

let patch = init([className, eventlisteners, style, props])

var vnode

var nextKey = 11
var margin = 8
var sortBy = 'rank'
var totalHeight = 0
var originalData = [...]
var data = [...]

// 根据prop排序
function changeSort(prop) {
  sortBy = prop
  data.sort((a, b) => {
    if (a[prop] > b[prop]) {
      return 1
    }
    if (a[prop] < b[prop]) {
      return -1
    }
    return 0
  })
  render()
}

// 添加一条数据
function add() {
  // 随机获取 originalData 中的一条数据
  var n = originalData[Math.floor(Math.random() * 10)]
  // 添加数据
  data = [{rank: nextKey++, title: n.title, desc: n.desc, elmHeight: 0}].concat(data)
  render()
  render()
}

// 根据传递的movie移除对应的数据
function remove(movie) {
  data = data.filter((m) => { return m !== movie; })
  render()
}

// 定义列表行
function movieView(movie) {
  return h('div.row', { // 定义行
    key: movie.rank,
    // 行内样式
    style: {opacity: '0', transform: 'translate(-200px)',
            // 进场样式
            delayed: {transform: `translateY(${movie.offset}px)`, opacity: '1'},
            // 退场样式
            remove: {opacity: '0', transform: `translateY(${movie.offset}px) translateX(200px)`}},
    hook: {insert: (vnode) => { movie.elmHeight = vnode.elm.offsetHeight; }},
  }, [ // 定义列表列
    h('div', {style: {fontWeight: 'bold'}}, movie.rank),
    h('div', movie.title),
    h('div', movie.desc),
    h('div.btn.rm-btn', {on: {click: [remove, movie]}}, 'x'),
  ])
}

// 调用patch对比新旧vnode渲染
function render() {
  data = data.reduce((acc, m) => {
    var last = acc[acc.length - 1]
    m.offset = last ? last.offset + last.elmHeight + margin : margin
    return acc.concat(m)
  }, [])
  // 处理删除所有内容报错的问题
  totalHeight = data[data.length - 1].offset + data[data.length - 1].elmHeight
  vnode = patch(vnode, view(data))
}

function view(data) {
  return h('div', [
    h('h1', 'Top 10 movies'),
    h('div', [
      h('a.btn.add', {on: {click: add}}, 'Add'),
      'Sort by: ',
      h('span.btn-group', [
        h('a.btn.rank', {class: {active: sortBy === 'rank'}, on: {click: [changeSort, 'rank']}}, 'Rank'),
        h('a.btn.title', {class: {active: sortBy === 'title'}, on: {click: [changeSort, 'title']}}, 'Title'),
        h('a.btn.desc', {class: {active: sortBy === 'desc'}, on: {click: [changeSort, 'desc']}}, 'Description'),
      ]),
    ]),
    h('div.list', {style: {height: totalHeight+'px'}}, data.map(movieView)),
  ])
}

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('container')
  vnode = patch(container, view(data))
  render()
})
```