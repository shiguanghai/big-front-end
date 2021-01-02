

## 【简答题】一、请简述 Vue 首次渲染的过程。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205195820451.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 对 Vue 构造函数进行初始化，挂载实例成员和静态成员
- 初始化结束，调用Vue的构造函数 `new Vue()`
- 在构造函数中，调用 `_init()`，相当于整个Vue的入口
- 在 `_init` 方法中最终调用了入口文件`entry-runtime-with-compiler.js`的 `$mount()`，把 `template` 模板编译成 `render` 函数
	* 判断是否传入了 `render` 选项，如果没有传入，会去获取 `templiate` 选项，如果 `template` 中也没有，会把 `el` 中的内容作为模板
	* 通过 `compileToFunctions()` 把模板编译成 `render` 函数
	* 把 `render` 函数存到 `options.render`
- 调用 `platforms/web/runtime/index.js` 中的 `$mount()`
	* 如果是运行时版本，重新获取 `el`（运行时版本不会走入口文件获取 `el` ）
- 调用 `core/instance/lifecycle.js` 文件中定义的 `mountComponent(this, el)`
	* 如果是开发环境，判断是否有 `render` 选项，如果传入模板且没有设置 `render` 选项则发送警告（运行时版本，没有传入 `render`，传入模板会告诉我们运行时版本不支持编译器）
	* 触发生命周期的 `beforeMount` 钩子函数（开始挂载之前）
	* 定义 `updateComponent()`
		+ 调用 `vm._render` 和 `vm._update`
		+ `vm._render` 的作用是生成虚拟DOM（用户传入的或编译生成的 `render`）
		+ `vm._update` 的作用是将虚拟DOM转换成真实DOM，并且挂载到页面上（调用 `__patch__` 方法，记录 `vm.$el`）
	* 创建 `Watcher` 实例
		+ 传递了 `updateComponent` 这个函数，最终在 `Watcher` 内部调用
		+ 调用 `get()` 方法，`get()` 方法中调用 `updaraComponent()`
	* 触发生命周期的 `mounted` 钩子函数（挂载结束）
	* 返回Vue实例 `return vm`

## 【简答题】二、请简述 Vue 响应式原理。
- Vue的响应式是从Vue的实例`init()`方法中开始的

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213142853671.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 在`init()`方法中先调用`initState()`初始化Vue实例的状态，在`initState`方法中调用了`initData()`，`initData()`是把data属性注入到Vue实例上，并且调用`observe(data)`将`data`对象转化成响应式的对象
- `observe`是响应式的入口
	* 在`observe(value)`中，首先判断传入的参数`value`是否是对象，如果不是对象直接返回
	* 再判断`value`对象是否有`__ob__`这个属性，如果有说明做过了响应式处理，则直接返回
	* 如果没有，创建`observer`对象
	* 返回`observer`对象

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213142313121.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 在创建`observer`对象时，给当前的`value`对象定义不可枚举的`__ob__`属性，记录当前的`observer`对象，然后再进行数组的响应式处理和对象的响应式处理
	* 数组的响应式处理，就是设置数组的几个特殊的方法，`push`、`pop`、`sort`等，这些方法会改变原数组，所以这些方法被调用的时候需要发送通知
		+ 找到数组对象中的`__ob__`对象中的`dep`,调用`dep`的`notify()`方法
		+ 再遍历数组中每一个成员，对每个成员调用`observe()`，如果这个成员是对象的话，也会转换成响应式对象
	* 对象的响应式处理，就是调用`walk`方法，`walk`方法就是遍历对象的每一个属性，对每个属性调用`defineReactive`方法
- `defineReactive`会为每一个属性创建对应的`dep`对象，让`dep`去收集依赖，如果当前属性的值是对象，会调用`observe`，`defineReactive`中最核心的方法是`getter` 和 `setter`
	* `getter` 的作用是收集依赖，收集依赖时，为每一个属性收集依赖，如果这个属性的值是对象，那也要为子对象收集依赖，最后返回属性的值
	* 在`setter` 中，先保存新值，如果新值是对象，也要调用 `observe` ，把新设置的对象也转换成响应式的对象，然后派发更新（发送通知），调用`dep.notify()`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213143030628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 收集依赖时
	* 在`watcher`对象的`get`方法中调用`pushTarget`, 记录`Dep.target`属性
	* 访问`data`中的成员的时候收集依赖，`defineReactive`的`getter`中收集依赖
	* 把属性对应的 `watcher` 对象添加到`dep`的`subs`数组中，也就是为属性收集依赖
	* 如果属性的值也是对象，给`childOb`收集依赖，目的是子对象添加和删除成员时发送通知

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213142730966.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 在数据发生变化的时候
	* 调用`dep.notify()`发送通知，`dep.notify()`会调用`watcher`对象的`update()`方法
	* `update()`中的调用`queueWatcher()`，会去判断`watcher`是否被处理，如果这个`watcher`对象没有被处理的话，添加到`queue`队列中，并调用`flushScheduleQueue()`
		+ 在`flushScheduleQueue()`中触发`beforeUpdate`钩子函数
		+ 调用`watcher.run()` : `run()-->get() --> getter() --> updateComponent()`
		+ 然后清空上一次的依赖
		+ 触发`actived`的钩子函数
		+ 触发`updated`钩子函数


## 【简答题】三、请简述虚拟 DOM 中 Key 的作用和好处。

**作用**：追踪列表中哪些元素被添加、被修改、被移除的辅助标志。可以快速对比两个虚拟DOM对象，找到虚拟DOM对象被修改的元素，然后仅仅替换掉被修改的元素，然后再生成新的真实DOM

> 在交叉对比的时候，当新节点跟旧节点头尾交叉对比没有结果的时候，会根据新节点的 key 去对比旧节点数组中的 key，从而找到相应旧节点（这里对应的是一个 key => index 的 map 映射）。如果没找到就认为是一个新增节点。而如果没有 key，那么就会采用一种遍历查找的方式去找到对应的旧节点。一种是一个 map 映射，另一种是遍历查找。相比而言。map 映射的速度更快。

**好处**：可以优化 DOM 的操作，减少Diff算法和渲染所需要的时间，提升性能。


## 【简答题】四、请简述 Vue 中模板编译的过程。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218234256724.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

- 模版编译入口函数`compileToFunctions`
	* 内部首先从缓存加载编译好的`render`函数
	* 如果缓存中没有，调用`compile`开始编译
- 在 `compile` 函数中
	* 首先合并选项`options`
	* 调用 `baseCompile` 编译模版
- `compile`的核心是合并选项`options`， 真正处理是在`basCompile`中完成的，把模版和合并好的选项传递给`baseCompile`, 这里面完成了模版编译的核心三件事情
	* `parse()`
		+ 把模版字符串转化为AST 对象，也就是抽象语法树
	* `optimize()`
		+ 对抽象语法树进行优化，标记静态语法树中的所以静态根节点
		+ 检测到静态子树，设置为静态，不需要在每次重新渲染的时候重新生成节点
		+ `patch`的过程中会跳过静态根节点
	* `generator()` 
		+ 把优化过的`AST`对象，转化为字符串形式的代码
- 执行完成之后，会回到入口函数`complieToFunctions`
	* `compileToFunction`会继续把字符串代码转化为函数
	* 调用createFunction
	* 当 `render` 和 `staticRenderFns`初始化完毕，最终会挂在到`Vue`实例的`options`对应的属性中


