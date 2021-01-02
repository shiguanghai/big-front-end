# 【大前端01-01】函数式编程与JS异步编程、手写Promise

- 本阶段主要围绕 JavaScript 语言本身以及它的周边语言进行深度介绍，让你从深度和广度两方面更深入掌握 JavaScript 这门语言以及相关编程范式，夯实前端开发基础，从而应对大型复杂应用开发，同时也为后期的高阶内容打下坚实的基础。


	* 大多数框架和应用为了彻底解决代码重用问题都选择拥抱函数式编程，本模块将带你学习函数式编程的思想以及一些常见的函数式编程库的使用和原理；JavaScript 异步编程课程将带你理解 JS 内部运行机制，以及如何更好的解决 Callback Hell；最后还会带你手写实现一个自己的 Promise。

## 【简答题】一、谈谈你是如何理解JS异步编程的，EventLoop、消息队列都是做什么的，什么是宏任务、什么是微任务？
---
### 如何理解JS异步编程
众所周知JavaScript语言执行环境是“单线程”（单线程，就是指一次只能完成一件任务，如果有多个任务就必须排队等候，前面一个任务完成，再执行后面一个任务）。这种“单线程”模式执行效率较低，任务耗时长。
  为了解决这个问题，提出了“异步模式”(异步模式，是指后一个任务不等前一个任务执行完就执行，每个任务有一个或多个回调函数)。
  异步模式使得JavaScript在处理事务时非常高效，但也带来很多问题，如异常处理困难、嵌套过深。

### EventLoop是做什么的
- event loop是一个执行模型，在不同的地方有不同的实现。浏览器和NodeJS基于不同的技术实现了各自的Event Loop。
	* 浏览器的Event Loop是在html5的规范中明确定义。
	* NodeJS的Event Loop是基于libuv实现的。
	* libuv已经对Event Loop做出了实现，而HTML5规范中只是定义了浏览器中Event Loop的模型，具体的实现留给了浏览器厂商。

#### 浏览器的Event Loop
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200924112721752.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

这张图将浏览器的Event Loop完整的描述了出来，我来讲执行一个JavaScript代码的具体流程：
1. 执行全局Script同步代码，这些同步代码有一些是同步语句，有一些是异步语句（比如setTimeout等）；
2. 全局Script代码执行完毕后，调用栈Stack会清空；
3. 从微队列microtask queue中取出位于队首的回调任务，放入调用栈Stack中执行，执行完后microtask queue长度减1；
4. 继续取出位于队首的任务，放入调用栈Stack中执行，以此类推，直到直到把microtask queue中的所有任务都执行完毕。**注意，如果在执行microtask的过程中，又产生了microtask，那么会加入到队列的末尾，也会在这个周期被调用执行；**
5. microtask queue中的所有任务都执行完毕，此时microtask queue为空队列，调用栈Stack也为空；
6. 取出宏队列macrotask queue中位于队首的任务，放入Stack中执行；
7. 执行完毕后，调用栈Stack为空；
8. 重复第3-7个步骤；
9. ......

 **可以看到，这就是浏览器的事件循环Event Loop**
 
这里归纳3个重点：
1. 宏队列macrotask一次只从队列中取一个任务执行，执行完后就去执行微任务队列中的任务；
2. 微任务队列中所有的任务都会被依次取出来执行，直到microtask queue为空；
3. 图中没有画UI rendering的节点，因为这个是由浏览器自行判断决定的，但是只要执行UI rendering，它的节点是在执行完所有的microtask之后，下一个macrotask之前，紧跟着执行UI render。

**在执行微队列microtask queue中任务的时候，如果又产生了microtask，那么会继续添加到队列的末尾，也会在这个周期执行，直到microtask queue为空停止。**

注：当然如果你在microtask中不断的产生microtask，那么其他宏任务macrotask就无法执行了，但是这个操作也不是无限的，拿NodeJS中的微任务process.nextTick()来说，它的上限是1000个，这里不再详细讲。

- 总结：

1. 浏览器的Event Loop和NodeJS的Event Loop是不同的，实现机制也不一样，不要混为一谈，今天我们只介绍浏览器里面的Event Loop。
2. 浏览器可以理解成只有1个宏任务队列和1个微任务队列，先执行全局Script代码，执行完同步代码调用栈清空后，从微任务队列中依次取出所有的任务放入调用栈执行，微任务队列清空后，从宏任务队列中只取位于队首的任务放入调用栈执行，注意这里和Node的区别，只取一个，然后继续执行微队列中的所有任务，再去宏队列取一个，以此构成事件循环。

### 消息队列是做什么的
**消息队列**：也称为任务队列，是一个先进先出的队列，它里面存放着各种消息，即异步操作的回调函数，异步操作会将相关回调添加到任务队列中，而不同的异步操作添加到任务队列的时机也不同，如onclick，setTimeout，ajax处理的方式都不同，这些异步操作都是由浏览器内核的不同模块来执行的：

1. onclick由浏览器内核的DOM Binding模块来处理，当事件触发的时候，回调函数会立即添加到任务队列中；
2. setTimeout会由浏览器内核的timer模块来进行延时处理，当时间到达的时候，才会将回调函数添加到任务队列中；
3. ajax会由浏览器内核的network模块来处理，在网络请求完成返回之后，才将回调添加到任务队列中；

### 什么是宏任务
- **宏任务/宏队列，macrotask，也叫tasks。** 一些异步任务的回调会依次进入macro task queue，等待后续被调用，这些异步任务包括：
	* setTimeout
	* setInterval
	* setImmediate (Node独有)
	* requestAnimationFrame (浏览器独有)
	* I/O
	* UI rendering (浏览器独有)
### 什么是微任务
- **微任务/微队列，microtask，也叫jobs。** 另一些异步任务的回调会依次进入micro task queue，等待后续被调用，这些异步任务包括：
	* process.nextTick (Node独有)
	* Promise
	* Object.observe
	* MutationObserver
	* queueMicroTask

### 宏任务与微任务的区别
这个就像去银行办业务一样，先要取号进行排号。
一般上边都会印着类似：“您的号码为XX，前边还有XX人。”之类的字样。

因为柜员同时只能处理一个来办理业务的客户，这时每一个来办理业务的人就可以认为是银行柜员的一个**宏任务**来存在的，当柜员处理完当前客户的问题以后，选择接待下一位，广播报号，也就是下一个宏任务的开始。
  所以多个宏任务合在一起就可以认为说有一个任务队列在这，里边是当前银行中所有排号的客户。
  **任务队列中的都是已经完成的异步操作，而不是说注册一个异步任务就会被放在这个任务队列中，就像在银行中排号，如果叫到你的时候你不在，那么你当前的号牌就作废了，柜员会选择直接跳过进行下一个客户的业务处理，等你回来以后还需要重新取号。**

而且一个宏任务在执行的过程中，是可以添加一些微任务的，就像在柜台办理业务，你前边的一位老大爷可能在存款，在存款这个业务办理完以后，柜员会问老大爷还有没有其他需要办理的业务，这时老大爷想了一下：“最近P2P爆雷有点儿多，是不是要选择稳一些的理财呢”，然后告诉柜员说，要办一些理财的业务，这时候柜员肯定不能告诉老大爷说：“您再上后边取个号去，重新排队”。
  所以本来快轮到你来办理业务，会因为老大爷临时添加的“**理财业务**”而往后推。
也许老大爷在办完理财以后还想 **再办一个信用卡？**或者 **再买点儿纪念币**？
  无论是什么需求，只要是柜员能够帮她办理的，都会在处理你的业务之前来做这些事情，这些都可以认为是微任务。

**在当前的微任务没有执行完成时，是不会执行下一个宏任务的。**

## 【代码题】一、将下面异步代码使用Promise的方式改进
```js
setTimeout(function(){
	var a = 'hello'
	setTimeout(function(){
		var b = 'lagou'
		setTimeout(function(){
			var c = 'I ❤ U'
			console.log(a + b + c)
		},10)
	},10)
},10)
```
解答：
```js
function fn(parp) {
    const promise = new Promise((resolved, rejected) => {
       setTimeout(()=>resolved(parp), 10)
    });
    return promise;
 }
 
 fn()
    .then(() => fn("hello"))
    .then(value => fn(value+"lagou"))
    .then(value => fn(value+"I ❤ U"))
    .then(value => console.log(value))
```
## 【代码题】二、基于以下代码完成下面的四个练习
```js
const fp = require('lodash/fp')
// 数据
// horsepower 马力, dollar_value 价格, in_stock 库存
const cars = [
    { name: 'Ferrari FF', horsepower: 660,
    dollar_value: 700000, in_stock: true },
    { name: 'Spyker C12 Zagato', horsepower: 650,
    dollar_value: 648000, in_stock: false },
    { name: 'Jaguar XKR-S', horsepower: 550,
    dollar_value: 132000, in_stock: false },
    { name: 'Audi R8', horsepower: 525,
    dollar_value: 114200, in_stock: false },
    { name: 'Aston Martin One-77', horsepower: 750,
    dollar_value: 1850000, in_stock: true },
    { name: 'Pagani Huayra', horsepower: 700,
    dollar_value: 1300000, in_stock: false },
]
```
### 练习1：使用函数组合fp.flowRight()重新实现下面这个函数
```js
let isLastInStock = function (cars) {
    // 获取最后一条数据
    let last_car = fp.last(cars)
    // 获取最后一条数据的 in_stock 属性值
    return fp.prop('in_stock', last_car)
}
```
解答：
```js
let isLastInStock = fp.flowRight(fp.prop('in_stock'), fp.last)
//fp.prop可以替换为fp.get

console.log(isLastInStock(cars))
```
### 练习2：使用fp.flowRight()、fp.prop()和fp.first()获取第一个car的name
解答：
```js
let isFirstCarName = fp.flowRight(fp.prop('name'), fp.first)
//fp.first可替换为fp.head

console.log(isFirstCarName(cars))
```
### 练习3：使用帮助函数_average重构averageDollarValue，使用组合函数的方式实现
```js
let _average = function (xs) {
    return fp.reduce(fp.add, 0, xs)/xs.length
}// <-无须改动
let averageDollarValue = function (cars){
    let dollar_values = fp.map(function(car){
        return car.dollar_value
    }, cars)
    return _average(dollar_values)
}
```
解答：
```js
//第一种
let averageDollarValue = fp.flowRight(_average, fp.map(car=>car.dollar_value))
//第二种
let averageDollorValue = fp.flowRight(_average, fp.map(fp.curry(fp.prop)('dollar_value')))
```
### 练习4：使用flowRight写一个sanitizeNames()函数
**返回一个下划线连接的小写字符串，把数组中的name转换为这种形式：例如：sanitizeNames(["Hello World"])=>["hello_world"]**
```js
let _underscore = fp.replace(/\w+/g, '_') // <-- 无须改动，并在 sanitizeNames中使用它
```
解答：
```js
//let _underscore = fp.replace(/\w+/g, '_') // 不符合题意 应该为\s
let _underscore = fp.replace(/\s+/g, '_')
//答案
let sanitizeNames = fp.flowRight(fp.map(_underscore), fp.map(fp.toLower), fp.map(car => car.name))
```
## 【代码题】三、基于下面提供的代码，完成后续的四个练习
```js
// support.js
class Container {
    static of(value) {
        return new Container(value)
    }
    constructor(value) {
        this.value = value
    }
    map(fn) {
        return Container.of(fn(this.value))
    }
}
class Maybe {
    static of(x) {
        return new Maybe(x)
    }
    isNothing() {
        return this._value === null || this._value === undefined
    }
    constructor(x) {
        this._value = x
    }
    map(fn) {
        return this.isNothing() ? this : Maybe.of(fn(this._value))
    }
}
module.exports = { Maybe, Container }
```
### 练习1：使用fp.add(x,y)和fp.map(f,x)创建一个能让functor里的值增加的函数ex1
```js
// app.js
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')
let maybe = Maybe.of([5, 6, 1])
let ex1 = () => {
    // 你需要实现的函数。。。
}
```
解答：
```js
return maybe.map(function(arr){
    return fp.map(function(v){
        return fp.add(v,1) // 数组每一项加1
    },arr)
})
//ES6
return maybe.map(arr => fp.map(v => fp.add(v, 1), arr))
```
### 练习2：实现一个函数ex2，能够使用fp.first获取列表的第一个元素
```js
// app.js
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')
let xs = Container.of(['do', 'ray',
'me', 'fa', 'so', 'la', 'ti', 'do'])
let ex2 = () => {
    // 你需要实现的函数。。。
}
```
解答：
```js
return xs.map(fp.first).value
```
### 练习3：实现一个函数ex3，使用safeProp和fp.first找到user的名字的首字母
```js
// app.js
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')
let safeProp = fp.curry(function (x, o){
    return Maybe.of(o[x])
})
let user = { id:2, name: 'Albert' }
let ex3 = () => {
    // 你需要实现的函数。。。
}
```
解答：
```js
return safeProp('name', user).map(fp.first)._value
```
### 练习4：使用Maybe重写ex4，不要有if语句
```js
// app.js
const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')
let ex4 = function (n) {
    if(n) {
        return parseInt(n)
    }
}
```
解答：
```js
let ex4 = n => Maybe.of(n).map(parseInt)._value;
```
## 【代码题】四、手写实现MyPromise源码
**要求：尽可能还原Promise中的每一个API，并通过注释的方式描述思路和原理**

解答：
```js
/*
  1. Promise 就是一个类 在执行这个类的时候 需要传递一个执行器进去 执行器会立即执行
  2. Promise 中有三种状态 分别为 成功 fulfilled 失败 rejected 等待 pending
    pending -> fulfilled
    pending -> rejected
    一旦状态确定就不可更改
  3. resolve和reject函数是用来更改状态的
    resolve: fulfilled
    reject: rejected
  4. then方法内部做的事情就判断状态 如果状态是成功 调用成功的回调函数 如果状态是失败 调用失败回调函数 then方法是被定义在原型对象中的
  5. then成功回调有一个参数 表示成功之后的值 then失败回调有一个参数 表示失败后的原因
  6. 同一个promise对象下面的then方法是可以被调用多次的
  7. then方法是可以被链式调用的, 后面then方法的回调函数拿到值的是上一个then方法的回调函数的返回值
*/

//我们将状态定义为常量，因为我们需要频繁使用它
//当我们去使用这个常量的时候，编辑器是有代码提示的
const PENDING = 'pending'; // 等待
const FULFILLED = 'fulfilled'; // 成功
const REJECTED = 'rejected'; // 失败

class MyPromise {
  constructor (executor) { // 代表执行器
    try { // 捕获执行器的错误 executor error
      // 这个执行器executor是立即执行的
      //当前我们在一个类的里面，我们需要通过this访问
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e);
    }
  }
  // promsie 状态  默认为 等待
  status = PENDING;
  // 成功之后的值
  value = undefined;
  // 失败后的原因
  reason = undefined;
  // 成功回调 数组的原因是同一个promise对象下面的then方法是可以被多次调用的 为了同时存储多个回调函数
  successCallback = [];
  // 失败回调 数组的原因是同一个promise对象下面的then方法是可以被多次调用的 为了同时存储多个回调函数
  failCallback = []; 

  // 这里的resolve和reject之所以使用箭头函数是因为this指向的问题
  // 我们希望this指向promise对象而不是window
  resolve = value => {
    // 如果状态不是等待 阻止程序向下执行
    if (this.status !== PENDING) return;
    // 将状态更改为成功
    this.status = FULFILLED;
    // 保存成功之后的值
    this.value = value;
    // 判断成功回调是否存在 如果存在 调用
    // this.successCallback && this.successCallback(this.value); //处理异步情况 由于回调为数组 故失效
    while(this.successCallback.length) this.successCallback.shift()() //从前往后执行 弹出回调函数
  }
  reject = reason => {
    // 如果状态不是等待 阻止程序向下执行
    if (this.status !== PENDING) return;
    // 将状态更改为失败
    this.status = REJECTED;
    // 保存失败后的原因
    this.reason = reason;
    // 判断失败回调是否存在 如果存在 调用
    // this.failCallback && this.failCallback(this.reason); //处理异步情况
    while(this.failCallback.length) this.failCallback.shift()() //从前往后执行 弹出回调函数
  }
  
  then (successCallback, failCallback) {
  	//then()方法可以不传递参数
    // 参数可选
    successCallback = successCallback ? successCallback : value => value;
    // 参数可选
    failCallback = failCallback ? failCallback: reason => { throw reason };
    
    // 为了能够被链式调用 then方法必须返回一个promise对象
    let promsie2 = new MyPromise((resolve, reject) => { //立即执行 resolve和reject是为了传递给下一个then方法的回调函数
      // 判断状态 
      if (this.status === FULFILLED) { // 成功
        setTimeout(() => { // 正常来讲内部无法直接获取到 promise2 因为其本身还未执行 所以将其变为异步代码
          try { // then回调函数错误 并在下一次promise的下一次错误处理函数中输出
          	// 方便then的链式调用 我们需要获取到then的返回值 以便传递给下一个then的成功回调函数
            let x = successCallback(this.value);
            // 判断 x 的值是普通值还是promise对象
            // 如果是普通值 直接调用resolve 
            // 如果是promise对象 查看promsie对象返回的结果 
            // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
            resolvePromise(promsie2, x, resolve, reject) // 调用 解析promise
          }catch (e) {
            reject(e);
          }
        }, 0)
      }else if (this.status === REJECTED) { // 失败
        setTimeout(() => { // 正常来讲内部无法直接获取到 promise2 因为其本身还未执行 所以将其变为异步代码
          try { // then回调函数错误 并在下一个promise的错误处理函数中输出
          	// 方便then的链式调用 我们需要获取到then的返回值 以便传递给下一个then的失败回调函数
            let x = failCallback(this.reason);
            // 判断 x 的值是普通值还是promise对象
            // 如果是普通值 直接调用resolve 
            // 如果是promise对象 查看promsie对象返回的结果 
            // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
            resolvePromise(promsie2, x, resolve, reject) // 调用 解析promise
          }catch (e) {
            reject(e);
          }
        }, 0)
      } else { // 等待
        // 将成功回调和失败回调存储起来
        this.successCallback.push(() => { // 存储成功回调到数组
          setTimeout(() => {
            try {
              let x = successCallback(this.value);
              // 判断 x 的值是普通值还是promise对象
              // 如果是普通值 直接调用resolve 
              // 如果是promise对象 查看promsie对象返回的结果 
              // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
              resolvePromise(promsie2, x, resolve, reject)
            }catch (e) {
              reject(e);
            }
          }, 0)
        });
        this.failCallback.push(() => { // 存储失败回调到数组
          setTimeout(() => {
            try {
              let x = failCallback(this.reason);
              // 判断 x 的值是普通值还是promise对象
              // 如果是普通值 直接调用resolve 
              // 如果是promise对象 查看promsie对象返回的结果 
              // 再根据promise对象返回的结果 决定调用resolve 还是调用reject
              resolvePromise(promsie2, x, resolve, reject)
            }catch (e) {
              reject(e);
            }
          }, 0)
        });
      }
    });
    return promsie2;
  }
  
  finally (callback) { // 接收一个回调函数 可以返回一个函数
    return this.then(value => { //通过then得到当前promise的状态 并返回以便再次调用
      return MyPromise.resolve(callback()).then(() => value);
    }, reason => {
      return MyPromise.resolve(callback()).then(() => { throw reason })
    })
  }
  
  catch (failCallback) {
    return this.then(undefined, failCallback)
  }
  
  static all (array) { // 接收数组 参数顺序一定为结果顺序 也是一个promise对象 Promise.all 故为静态方法
    let result = []; // 结果数组
    let index = 0; // 解决for循环的异步操作问题
    return new MyPromise((resolve, reject) => {
      function addData (key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < array.length; i++) { // 执行for循环的过程中可能有异步操作
        let current = array[i]; // 当前值
        if (current instanceof MyPromise) {
          // promise 对象
          current.then(value => addData(i, value), reason => reject(reason))
        }else {
          // 普通值
          addData(i, array[i]);
        }
      }
    })
  }
  
  static resolve (value) { // 判断给定的是不是promise 是 直接返回； 不是 创建promise 并返回
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }
}

function resolvePromise (promsie2, x, resolve, reject) { 
  // 解析promise 判断then回调的返回值的类型 为promise对象还是普通值
  if (promsie2 === x) { // 判断 then是否被循环调用 并阻止其运行
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if (x instanceof MyPromise) {
    // promise 对象
    // x.then(value => resolve(value), reason => reject(reason));
    // 简化为 ↓
    x.then(resolve, reject);
  } else {
    // 普通值
    resolve(x);
  }
}

module.exports = MyPromise;
```
        