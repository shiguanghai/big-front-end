# 【大前端01-02】ES新特性与TypeScript、JS性能优化

- 本阶段主要围绕 JavaScript 语言本身以及它的周边语言进行深度介绍，让你从深度和广度两方面更深入掌握 JavaScript 这门语言以及相关编程范式，夯实前端开发基础，从而应对大型复杂应用开发，同时也为后期的高阶内容打下坚实的基础。


	* ECMAScript 新特性课程带你快速回顾 ES 新版本中的语言新特性；TypeScript 编程课程让你快速掌握 TypeScript 语言特性，使用 TS 解决 JavaScript 类型系统的不足；另外你还会了解到 JavaScript 性能优化的常用方案，以及使用 Chrome Performance 来检测 JS 代码中的性能问题。
        

## 【简答题】一、请说出下列最终的执行结果，并解释为什么。
```js
var a = [];
for(var i = 0; i < 10; i++) {
  a[i] = function () {
    console.log(i)
  }
}
a[6]()
```
运行结果：
```
10
```
原因：

代码中存在两个全局变量，数组a与循环变量i（变量i是var声明的，因此在全局范围内都有效）。每一次循环，新的i值都会覆盖旧值（循环内被赋给数组a的函数内部的console.log(i)，里面的i指向的就是全局的i）。这就导致最后输出的是最后一轮的i的值。
而使用let声明的变量仅在块级作用域内有效，则不会出现这个问题。

## 【简答题】二、请说出下列最终的执行结果，并解释为什么。
```js
var tmp = 123;

if (true) {
  console.log(tmp)
  let tmp
}
```
运行失败：
```
ReferenceError: Cannot access 'tmp' before initialization
```
原因：

1. 代码中的 let tmp 创建过程会提升到block（块级作用域）第一行。因此 console.log(tmp) 中的 tmp 指的是下面的tmp，而不是全局的tmp。
2. 执行 console.log(tmp) 时，tmp 的初始化还没有被提升，也就是出现了暂时死区，因此不能用。
## 【简答题】三、结合ES6新语法，用最简单的方法找出数组中的最小值。
```js
var arr = [12, 34, 32, 89, 4]
```
解答：
```
console.log(Math.min(...arr))
```
## 【简答题】四、请详细说明var，let，const三种声明变量的方式之间的具体差别。
1. var定义的变量，没有块的概念，可以跨块访问, 不能跨函数访问。
2. let定义的变量，只能在块作用域里访问，不能跨块访问，也不能跨函数访问。
3. const用来定义常量，使用时必须初始化(即必须赋值)，只能在块作用域里访问，而且不能修改。

- var、let与const的区别
	* 第一点不同是 let 与 const 是块作用域，即其在整个大括号 {} 之内可见。
	* 第二点不同是 let 与 const 在变量声明之前就访问变量的话，会直接提示 ReferenceError，而不像 var 那样使用默认值 undefined。
	* 第三点不同是 let 与 const 存在暂时性死区，只要块级作用域有 let 或者 const 命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。在 let/const 变量被赋值(LexicalBinding)以前是不可以读写的。
	* 第四点不同是 let 与 const 不允许重复声明。。
	* 第五点不同是 const 定义的变量的引用不能被更改。

**但是值得注意的是：var, let/const 都有变量提升。**
```js
console.log(foo);      // Uncaught ReferenceError: Cannot access 'foo' before initialization
let foo = 123;
```
发生了引用错误，但是这是因为let定义的变量不存在提升导致的么？

作为对照，我们直接运行下面的代码，看看会出现什么错误：
```js
console.log(foo);      //  Uncaught ReferenceError: foo is not defined
```
错误原因：foo没有定义。

如果说let foo不存在变量提升，那么在运行
```js
console.log(foo);
let foo = 123;
```
也应该报出foo没有定义这个错误的，但是错误却是因为foo没有被初始化，所以不能使用（也就是所谓的暂时死区，也正是由于存在tdz死区的限制，所以在块内使用let const声明前访问，会报错）。


**其实 let 和 const 定义的变量都会被提升，但是不会被初始化，不能被引用**，不会像var定义的变量那样，初始值为undefined。

为什么let和const定义的变量不会被初始化呢？主要是因为const。const，顾名思义：常量，const的引用不应被改变。如果编译器把const初始化为undefined，之后，又让它等于我们定义的那个值，就改变了const的引用。因此，委员会决定let和const虽然也会发生变量提升，但是没有任何初始值。

对于以上变量提升的问题，如果还有疑问，可以看这篇[let/const 的变量提升与暂时性死区](https://blog.csdn.net/Napoleonxxx/article/details/104219598)，以及这篇[我用了两个月的时间才理解 let](https://zhuanlan.zhihu.com/p/28140450?utm_medium=social)

	
## 【简答题】五、请说出下列代码最终输出的结果，并解释为什么。
```js
var a = 10;
var obj = {
  a: 20,
  fn () {
    setTimeout(() => {
      console.log(this.a)
    })
  }
}
obj.fn()
```
运行结果：
```
20
```
原因：

这道题与this的指向问题有关，首先，通过obj.fn()调用，fn()函数内部的this指向为obj。而setTimeout函数中的箭头函数没有this指向，它会根据外部作用域而定，而这里的this就指向obj对象，因此obj.a的结果就为20。
## 【简答题】六、简述symbol类型的用途。
- Symbol的作用就是**表示一个独一无二的值**，我们通过Symbol创建的每一个值都是独一无二的，永远不会重复。

考虑到开发过程中的调试，**Symbol允许传入一个字符串作为这个值的描述文本**。它除了可以避免对象属性名重复产生的问题，我们还可以借助这种类型的特点模拟对象的私有成员。


- 补充
1. 通过Symbol创建的值一定是一个唯一的值，不管传入的描述文本是否相同。
2. 使用Symbol类型提供的静态方法for()在全局去复用一个相同的Symbol值。这个方法内部维护了一个全局的注册表，为字符串和Symbol值提供了一一对应的关系。如果传入的不是字符串，方法内部会将其自动转化为字符串。
3. 除了定义自己使用的Symbol值以外，ES2015还提供了11个内置Symbol值，指向语言内部使用的方法。
4. Object对象里面的getOwnPropertySymbols()方法可以获取到Symbol类型的属性名。

## 【简答题】七、说说什么是浅拷贝、什么是深拷贝？
- 浅拷贝
	* 浅拷贝只拷贝一层，更深层对象级别只拷贝引用（只是拷贝了地址）
	* 由于是浅复制，所以引用类型只是复制了内存地址，修改其中一个对象的子属性后，引用这个地址的值都会被修改
	* 对于浅拷贝的实现，最基础的循环赋值不再提，除此之外：
		+ **Object.assign(target,...sources) ES6新增方法实现的就是浅拷贝**
		+ **ES6扩展运算符 ... 的方式解构实现浅拷贝**
- 深拷贝
	* 深拷贝拷贝多层，每一级别的数据都会拷贝 (内部开辟了新的内存空间进行存储)
	* 其实深拷贝可以拆分成 2 步，浅拷贝 + 递归，所以循环赋值配合递归也能实现，除此之外：
		+ **For...in遍历并递归。**（注意：如果使用Symbol值作为对象的属性名，这个属性通过for...in是无法拿到的，而且通过Objec.keys()方法也是获取不到Symbol属性名的，如果通过JSON.stringfy()去序列化对象为一个JSON字符串的话，Symbol属性也会被忽略掉。）
		+ 因此我们还可以使用**解构配合Object对象里面getOwnPropertySymbols()方法或者ES6的Reflect.ownKeys(obj)递归**实现深拷贝。


## 【简答题】八、请简述TypeScript与JavaScript之间的关系。
1. TypeScript是JavaScript的一个超集，包含了JavaScript的所有元素，提供了类型系统和对ES6+的支持。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201008154915567.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

2. TypeScript 可以使用 JavaScript 中的所有代码和编码概念，TypeScript 是为了使 JavaScript 的开发变得更加容易而创建的。
3. TypeScript是JavaScript的类型超集，他可以编译成纯JavaScript。编译出来的JavaScript可以运行在任何浏览器上，TypeScript编译工具可以运行在任何服务器和任何系统上。

## 【简答题】九、请谈谈你所认为的TypeScript优缺点。
- 优点：

**1.TypeScript非常包容**
TypeScript是JavaScript的超集，.js文件直接重命名为.ts即可。即使不显式的定义类型也能够自动做出类型推断。可以定义从简单到复杂的几乎一切的类型。即使TypeScript编译报错，也可以生成JavaScript文件。TypeScript是开源的。

**2.更好的协作**
类型安全是一种在编码期间检测错误的功能，而不是在编译项目时检测错误，这为开发团队创建了一个更高效的编码和调试过程。

**3.更强的生产力**
干净的 ECMAScript 6 代码，自动完成和动态输入等因素有助于提高开发人员的工作效率。增强了编辑器和IDE的功能，包括代码补全、接口提示、跳转到定义、重构等。

- 缺点：

**1.增加学习成本**
语言本身多了很多概念，例如接口(Interfaces)、泛型(Generics)、类(Classer)、枚举类型(Enums)等非前端概念，学习成本增加。

**2.项目初期会增加一些成本**
毕竟要多写一些类型的定义，开发成本的增加是不可避免的。不过对于一些需要长期维护的项目，TypeScript能够减少其维护成本。

**3.可能和一些库结合的不是很完美**
在实际开发中需要使用到第三方npm模块，而这些模块不一定是通过TypeScript编写的，所以它提供的成员就不会有强类型体验。但是目前越来越多的模块已经在内部集成类型声明文件了。


## 【简答题】十、描述引用计数的工作原理和优缺点。
**引用计数算法的工作原理**

- 核心思想：设置引用数，判断当前引用数是否为0
- 引用计数器
- 引用关系改变时修改引用数字
- 引用数字为0时立即回收

**引用计数算法的优缺点**

- 引用计数算法优点
	* 发现垃圾时立即回收
	* 最大限度减少程序暂停
- 引用计数算法缺点
	* 无法回收循环引用的对象
	* 时间开销大（资源消耗较大）

## 【简答题】十一、描述标记整理算法的工作流程。

**标记整理算法的工作流程**

- 核心思想：分标记和清除两个阶段完成
- 遍历所有对象找标记活动对象（可达对象）
- 清除阶段会先执行整理，移动对象位置
- 遍历所有对象清除没有标记对象
- 回收相应的空间到空闲列表（连续）

## 【简答题】十二、描述V8中新生代存储区垃圾回收的流程。
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
## 【简答题】十三、描述增量标记算法在何时使用及工作原理。
**增量标记算法在何时使用**

- 由于 JavaScript 是运行在主线程之上的，一旦执行垃圾回收算法，都需要将正在执行的 JavaScript 脚本暂停下来，待垃圾回收完毕后再恢复脚本执行，称全停顿（Stop-The-World）
- 在 V8 新生代的垃圾回收中，因其空间较小，且存活对象较少，所以全停顿的影响不大
- 在 V8 老年代的垃圾回收中，为了降低老生代的垃圾回收而造成的卡顿，使用增量标记算法

**增量标记算法的工作原理**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201009162641520.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- V8 将标记过程分为一个个的子标记过程
- 让垃圾回收标记和 JavaScript 应用逻辑交替进行，直到标记阶段完成
- 这些小的垃圾回收任务执行时间比较短，可以最大限度减少程序暂停时间
- 标记完后执行清除，程序继续执行