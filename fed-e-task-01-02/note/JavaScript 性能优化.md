
# JavaScript 性能优化




## 5.1性能优化介绍
- 性能优化是不可避免的
- 任何一种可以提高运行效率，降低运行开销的行为都可以看做是一种优化操作
- 无处不在的前端性能优化
	* 请求资源用到的网络
	* 数据的传输方式
	* 开发过程中使用到的框架

**本章探索的核心为JavaScript语言的优化**
## 5.2JavaScript 内存管理(Memory Management)
- 内存：由可读写单元组成，表示一片可操作空间
- 管理：人为的去操作一片空间的申请、使用和释放
- 内存管理：开发者主动申请空间、使用空间、释放空间
- 管理流程：申请-使用-释放
- **JavaScript 中的内存管理**
	* 申请内存空间
	* 使用内存空间
	* 释放内存空间 

由于ECMAScript中并没有提供相应的操作API，所以JS语言不能像C或者C++语言那样又开发者主动调用相应的API来完成空间的管理。

即使如此，它也不能影响我们通过JS脚本演示当前一个内存空间的生命周期是怎样完成的：
```js
// 申请
let obj = {}

// 使用
obj.name = 'lg'

// 释放
obj = null
```

## 5.3垃圾回收与常见的GC算法
### JavaScript 中的垃圾回收
**JavaScript 中的垃圾**

- JavaScript 中的内存管理是自动的
- 对象不再被引用时是垃圾
- 对象不能从根上访问到是垃圾

**JavaScript中的可达对象**

- 可以访问到的对象就是可达对象（引用、作用域链）
- 可达的标准就是从根出发是否能够被找到
- JavaScript中的根就可以理解为是全局变量对象

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009152938392.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
### GC算法
- GC就是垃圾回收机制的简写
- GC可以找到内存中的垃圾、并释放和回收空间

**GC里的垃圾**

- 程序中不再需要使用的对象（程序需求角度）

```js
function() func() {
  name = 'lg' // 当函数调用完成，name不再需要使用
  return `${name} is a coder`
}
func()
```
- 程序中不能再访问到的对象（程序运行角度）

```js
function() func() {
  const name = 'lg' // 有了声明变量关键字，当函数调用完成，外部不能再访问到
  return `${name} is a coder`
}
func()
```

**GC算法就是工作时查找和回收所遵循的规则**

**常见的GC算法**

1. 引用计数
2. 标记清除
3. 标记整理
4. 分代回收

### 引用计数算法
**引用计数算法实现原理**

- 核心思想：设置引用数，判断当前引用数是否为0
- 引用计数器
- 引用关系改变时修改引用数字
- 引用数字为0时立即回收

```js
const user1 = {age: 11}
const user2 = {age: 22}
const user3 = {age: 33}

const nameList = [user1.age, user2.age, user3.age]

function fn() {
  num1 = 1
  num2 = 2
}

fn()
```
我们从全局的角度考虑，我们发现，Window的下面可以直接找到user1、user2、user3以及nameList。我们从变量的角度出发，在fn()函数里面定义的num1和num2由于我们没有去设置关键字，所以它同样是被挂载在Window下的，这个时候对于这些变量来说，它们的引用计数都不是0。

接下来我们做一些修改：
```js
function fn() {
  const num1 = 1
  const num2 = 2
}
```
加上了关键字的声明过后就意味着num1和num2只能在作用域内起效果了，所以一旦当fn()函数调用执行结束之后，从外部全局的角度出发就不能再找到num1和num2，此时它们身上的引用计数就会回到0，只要是0的情况下，GC就会立即开始工作，将它们当作垃圾进行对象回收。

而user1、user2、user3以及nameList，nameList里面都指向了上述三个对象空间，所以即使脚本执行完以后，它们都还被引用，所以此时的引用计数器不为0，此时就不会被当做垃圾回收。

**引用计数算法优缺点**

- 引用计数算法优点
	* 发现垃圾时立即回收
	* 最大限度减少程序暂停
- 引用计数算法缺点
	* 无法回收循环引用的对象
	* 时间开销大（资源消耗较大）

**循环引用的对象**

```js
function fn() {
  const obj1 = {} // 虽然全局无法找到
  const obj2 = {}
  
  obj1.name = obj2 // 但是此作用域内还互相引用 引用计数不为0
  obj2.name = obj1

  return 'lg is a coder'
}

fn()
```

### 标记清除算法
**标记清除算法实现原理**

- 核心思想：分标记和清除两个阶段完成
- 遍历所有对象找标记活动对象（可达对象）
- 遍历所有对象清除没有标记对象
- 回收相应的空间到空闲列表

**标记清除算法优缺点**

- 标记清除算法优点
	* 解决对象循环引用的回收操作

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009152844235.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
- 标记清除算法缺点
	* 回收到空闲列表的地址不连续，浪费空间（空间碎片化）
	* 不会立即回收垃圾对象（清除时会阻塞代码的执行）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009152855618.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 标记整理算法
**标记整理算法实现原理**

- 标记整理可以看做是标记清除的增强
- 标记阶段的操作和标记清除一致
- 清除阶段会先执行整理，移动对象位置

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009153656558.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009153705369.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/202010091537159.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

**标记整理算法优缺点**

- 标记整理算法优点
	* 减少碎片化空间
- 标记整理算法缺点
	* 不会立即回收垃圾对象

## 5.4V8引擎的垃圾回收
- V8 是一款主流的 JavaScript 执行引擎（Chrome、Node）
- V8 采用即时编译（直接将源码翻译为机器码）
- V8 内存设限（浏览器下足够使用，非增量标记最多需要1S）
	* 64bit 1.5G
	* 32bit 800M

### V8 垃圾回收策略
- 采用分代回收的思想
- 内存分为新生代、老生代
- 针对不同对象采用不同算法

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009160233855.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
**V8 中常用 GC 算法**

- 分代回收
- 空间复制
- 标记清除
- 标记整理
- 标记增量

### V8 如何回收新生代对象
**V8 内存分配**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009160544641.png#pic_center)
**新生代对象说明**

- V8 内存空间一分为二
- 小空间用于存储新生代对象
- 64位操作系统32M，32位操作系统16M
- 新生代指的是存活时间较短的对象

**新生代对象回收实现**

1. 回收过程采用复制算法+标记整理
2. 新生代内存区分为两个等大小空间
3. 使用空间From，空闲空间To
4. 活动对象存储于From空间
5. 标记整理后将活动对象拷贝至To
6. From与To交换空间完成释放

**回收细节说明**

- 拷贝过程中可能会出现晋升
- 晋升就是将新生代对象移动至老生代
- 一轮 GC 还存活的新生代需要晋升
- To 空间的使用率超过25%需要晋升

### V8 如何回收老生代对象
**老年代对象说明**

- 老年代对象存放在右侧老生代区域
- 64位操作系统1.4G，32位操作系统700M
- 老年代对象就是指存活时间较长的对象

**老年代对象回收实现**

- 主要采用标记清除、标记整理、增量标记算法
- 首先使用标记清除完成垃圾空间的回收
- 采用标记整理进行空间优化（空间不足以晋升）
- 采用增量标记进行效率优化

**细节对比**

- 新生代区域垃圾回收使用空间换时间（复制算法）
- 老生代区域垃圾回收不适合复制算法

**全停顿**
由于 JavaScript 是运行在主线程之上的，一旦执行垃圾回收算法，都需要将正在执行的 JavaScript 脚本暂停下来，待垃圾回收完毕后再恢复脚本执行，称全停顿（Stop-The-World）。

在 V8 新生代的垃圾回收中，因其空间较小，且存活对象较少，所以全停顿的影响不大，但老生代就不一样了。
为了降低老生代的垃圾回收而造成的卡顿，V8 将标记过程分为一个个的子标记过程，同时让垃圾回收标记和 JavaScript 应用逻辑交替进行，直到标记阶段完成，我们把这个算法称为增量标记（Incremental Marking）算法。

**增量标记如何优化垃圾回收**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009162641520.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
使用增量标记算法，可以把一个完整的垃圾回收任务拆分为很多小的任务，这些小的任务执行时间比较短，可以穿插在其他的 JavaScript 任务中间执行，这样当执行上述动画效果时，就不会让用户因为垃圾回收任务而感受到页面的卡顿了。

## 5.5Performance工具
### Performance工具介绍
**为什么使用Performanc**

- GC的目的是为了实现内存空间的良性循环
- 良性循环的基石是合理使用
	* ECMAScript没有提供操作内存空间的API
- 时刻关注才能确定是否合理
- Performance提供多种监控方式

**总结**：通过Performance时刻监控程序运行时这个内存的变化，从而去发现一些内存的问题，辅助我们能够在代码当中做一些变化，从而提高代码执行效率。

**Performance使用步骤**
1. 打开浏览器输入目标网址
2. 进入开发人员工具面板，选择性能
3. 开启录制功能，访问具体界面
4. 执行用户行为，一段时间后停止录制
5. 分析界面中记录的内存信息

### 内存问题的体现
**内存问题的外在表现**

- 页面出现延迟加载或经常性暂停（网络正常的前提）
- 页面持续性出现糟糕的性能
- 页面的性能随时间延长越来越差

### 监控内存的几种方式
**界定内存问题的标准**

- 内存泄露：内存使用持续升高
- 内存膨胀：在多数设备上都存在性能优化
	* 当前应用本身为了达到最优的效果需要很大的内存空间
-  频繁垃圾回收：通过内存变化图进行分析

**监控内存的几种方式**

- 浏览器任务管理器
- Timeline 时序图记录
- 堆快照查找分离 DOM
- 判断是否存在频繁的垃圾回收（获取内存走势图分析）

### 任务管理器监控内存
1. 通过快捷键 Shift + Esc 调出当前浏览器自带的任务管理器
2. 定位到当前正在执行的脚本
3. 可以对其右击打开JavaScript内存选项（默认关闭）
4. 选项**内存**表示原生内存（DOM节点所占据的）
5. 选项**JavaScript内存**表示JS堆，实时内存表示界面所有可达对象正在使用的内存大小 
6. 如果JS实时内存一直增大就意味着内存是有问题的（只能发现问题，无法定位问题）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010205050251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### Timeline时序图记录内存
timeline是google的chrome浏览器中的一个开发者工具，它有助于前端开发者来分析页面的解析、脚本运行以及渲染、布局的情况，从而帮助开发者去优化页面的性能。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010204534402.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 堆快照查找分离DOM
**什么是分离DOM**

- 界面元素存活在DOM树上
- 垃圾对象时的DOM节点
	* 如果一个节点从当前DOM树脱离，而且JS代码中没有引用此节点，就称其为垃圾DOM
- 分离状态的DOM节点
	* 如果一个节点从当前DOM树脱离，但是JS代码还有引用此节点，就称其为分离DOM

分离DOM在界面上是看不见的，但其在内存里占据空间，这种情况下就是一种内存泄露。因此我们可以通过堆快照的功能把它们找出来，只要可以找到就可以回到代码针对性的清除，从而使内存得到释放，脚本的执行更加迅速。

- 打开开发人员工具面板，选择内存面板
- 通过分析用户行为执行前后，对比所拍摄快照中是否存在detached来确定脚本中是否存在分离DOM

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010204917328.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 判断是否存在频繁GC

**为什么确定频繁垃圾回收**

- GC工作时应用程序是停止的
- 频繁且过长的GC会导致应用假死
- 用户使用中感知应用卡顿

**确定频繁的垃圾回收方法**

- Timeline中频繁的上升下降（蓝色线）
- 任务管理器中数据频繁的增加减小

出现了这样的情况过后就需要去定位到相应的时间节点看一下我们具体做了什样的操作造成了这样现象的产生以便我们回到代码去处理。

## 5.6代码优化
### 代码优化介绍
**如何精准测试JavaScript性能**

- 本质上就是采集大量的执行样本进行数学统计和分析从而得出比对结果来证明什么样的脚本效率更高
- 我们可以使用 [JSBench](https://jsbench.me/)（在线测试JS代码的网站）完成

### 慎用全局变量
在程序执行过程中，如果针对于某些数据需要进行存储，我们可以尽可能将其放置在局部作用域中，变成一个局部变量。

**为什么要慎用**

- 全局变量定义在全局执行上下文，是所有作用域链的顶端（查找时间消耗大）
- 全局执行上下文一直存在于上下文执行栈，直到程序退出
- 如果某个局部作用域出现了同名变量则会遮蔽或污染全局

```js
var i, str = ''
for (i = 0; i < 1000; i++) {
  str += i
}
```
```js
for (let i = 0; i < 1000; i++) {
  let str = ''
  str += i
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010212523879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
### 缓存全局变量
在程序执行过程中，将无法避免的全局变量缓存到局部。

```
<body>
  <input type="button" value="btn" id="btn1">
  <input type="button" value="btn" id="btn2">
  <input type="button" value="btn" id="btn3">
  <input type="button" value="btn" id="btn4">
  <p>1111</p>
  <input type="button" value="btn" id="btn5">
  <input type="button" value="btn" id="btn6">
  <p>222</p>
  <input type="button" value="btn" id="btn7">
  <input type="button" value="btn" id="btn8">
  <p>333</p>
  <input type="button" value="btn" id="btn9">
  <input type="button" value="btn" id="btn10">

  <script>
    function getBtn() {
      let oBtn1 = document.getElementById('btn1')
      let oBtn3 = document.getElementById('btn3')
      let oBtn5 = document.getElementById('btn5')
      let oBtn7 = document.getElementById('btn7')
      let oBtn9 = document.getElementById('btn9')
    }

    function getBtn2() {
      let obj = document // 缓存
      let oBtn1 = obj.getElementById('btn1')
      let oBtn3 = obj.getElementById('btn3')
      let oBtn5 = obj.getElementById('btn5')
      let oBtn7 = obj.getElementById('btn7')
      let oBtn9 = obj.getElementById('btn9')
    }
  </script>

</body>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010212952508.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 通过原型新增方法
JavaScript中存在构造函数、原型对象、实例对象三种概念，而实例对象和构造函数都可以指向原型对象。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010213531147.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

如果构造函数内部具有一个成员方法，后续的实例对象都需要频繁调用，我们就可以在原型对象上新增实例对象需要的方法，而不需将其放在构造函数内部。

```js
var fn1 = function() {
  this.foo = function() {
    console.log(11111)
  }
}

let f1 = new fn1()
```
```js
var fn2 = function() {}
fn2.prototype.foo = function() {
  console.log(11111)
}

let f2 = new fn2()
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010213724475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 避开闭包陷阱
- 闭包是一种强大的语法
- 闭包使用不当容易出现内存泄露
- 不要为了闭包而闭包

```
<body>
 <button id = "btn">add</button>
  <script>
    function foo() {
      var el = document.getElementById('btn')
        el.onclick = function() {
          console.log(el.id)
        }
		el = null // 通过这种方式释放
    }
  </script>
</body>
```

### 避免属性访问方法使用
- JS不需要属性的访问方法，所有属性都是外部可见的
- 使用属性访问方法只会增加一层重定义，没有访问的控制力

```js
function Person() {
  this.name = 'icoder'
  this.age = 18
  this.getAge = function() {
    return this.age
  }
}
const p1 = new Person()
const a = p1.getAge()
```
```js
function Person() {
  this.name = 'icoder'
  this.age = 18
}
const p2 = new Person()
const b = p2.age
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010214912709.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### For循环优化
```js
var arrList = []
arrList[10000] = 'icoder'

for (var i = 0; i < arrList.length; i++) {
  console.log(arrList[i])
}
```
```js
for (var i = arrList.length; i; i--) {
  console.log(arrList[i])
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010215048386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 采用最优循环方式
```js
var arrList = new Array(1, 2, 3, 4, 5)

arrList.forEach(function(item) {
  console.log(item)
})
```
```js
for (var i = arrList.length; i; i--) {
  console.log(arrList[i])
}
```
```js
for (var i in arrList) {
  console.log(arrList[i])
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010215319539.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 文档碎片优化节点添加
- 节点的添加操作必然会有回流和重绘

```
<body>
  <script>

    for (var i = 0; i < 10; i++) {
      var oP = document.createElement('p')
      oP.innerHTML = i 
      document.body.appendChild(oP)
    }

    const fragEle = document.createDocumentFragment()
    for (var i = 0; i < 10; i++) {
      var oP = document.createElement('p')
      oP.innerHTML = i 
      fragEle.appendChild(oP)
    }

    document.body.appendChild(fragEle)

  </script>
</body>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010215532794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 克隆优化节点操作
```
<body>
  <p id="box1">old</p>

  <script>
    for (var i = 0; i < 3; i++) {
      var oP = document.createElement('p')
      oP.innerHTML = i 
      document.body.appendChild(oP)
    }

    var oldP = document.getElementById('box1')
    for (var i = 0; i < 3; i++) {
      var newP = oldP.cloneNode(false)
      newP.innerHTML = i 
      document.body.appendChild(newP)
    }
  </script>

</body>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010215719343.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### 直接量替换 Object 操作
```js
var a = [1, 2, 3]
```
```js
var a1 = new Array(3)
a1[0] = 1
a1[1] = 2
a1[2] = 3
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010215844918.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
