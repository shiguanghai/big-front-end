
# JavaScript 异步编程



## 2.1异步编程概述
- JavaScript采用单线程模式工作的原因

**设计初衷**：因为js最早就是运行在浏览器上的脚本语言，目的是为了**实现页面上的动态交互**，而实现页面交互的核心是DOM操作，这也就决定了**js必须使用单线程模型**，否则会出现复杂的线程同步问题：

假定我们在js项目中同时有多个线程进行工作，其中一个线程修改了某一个DOM元素而另外一个线程又删除了这个DOM元素，则浏览器就无法明确该以哪个线程的工作为准。

- 这里所说的单线程就是**JS执行环境中负责执行代码的线程只有一个**
- 优点：更**安全** 更**简单**
- 缺点：如果遇到一个特别耗时的任务，后面的任务就要去排队，等待这个任务的结束，导致整个程序执行被拖延，存在**假死**的情况
- 为了解决耗时任务阻塞执行的这种问题 JavaScript将任务的执行模式分成了两种
	* 同步模式(Synchronsous)
	* 异步模式(Asynchronous)

## 2.2同步模式/异步模式
### 同步模式
- 指代码中的任务依次执行 
- 后一个任务必须等待前一个任务结束才能够开始执行
- 执行顺序与代码编写顺序一致

```js
console.log('global begin')

function bar () {
  console.log('bar task')
}

function foo () {
  console.log('foo task')
  bar()
}

foo()

console.log('global end')
```
```
global begin
foo task  
bar task  
global end
```
### 异步模式
- 不会去等待这个任务的结束才开始下一个任务
- 对于耗时操作，开启过后就立即往后执行下一个任务
- 后续逻辑一般会通过回调函数的方式定义
- 在内部，耗时任务完成过后就会自动执行回调函数
- 没有这种模式，单线程的JavaScript语言就无法同时处理大量耗时任务
- 难点：代码执行顺序混乱

```js
console.log('global begin')

setTimeout(function timer1 () {
  console.log('timer1 invoke')
}, 1800)

setTimeout(function timer2 () {
  console.log('timer2 invoke')

  setTimeout(function inner () {
    console.log('inner invoke')
  }, 1000)
}, 1000)

console.log('global end')
```
```
global begin
global end
timer2 invoke
timer1 invoke
inner invoke
```
在这里我们特别需要去注意的一点是：JavaScript它确实是单线程的，而我们的浏览器它并不是单线程的。

更具体一点来说，我们通过JavaScript去调用的某项内部的API它并不单线程的。例如我们使用到的倒计时器，它内部会有一个单独的线程去负责倒数，在时间到了之后我将回调放入到消息队列。

同步模式/异步模式并不是指写代码的方式，而是运行环境提供的API是同步或异步模式的方式工作。
 - **注意：所谓的同步或是异步其实是运行环境提供的API是以同步或异步模式的方式工作的**

## 2.3回调函数
- 由调用者定义，交给执行者执行的函数就是回调函数
- 回调函数是所有异步编程方案的根基

```js
// 回调函数
function foo (callback) {
  setTimeout(function () {
    callback()
  }, 3000)
}

foo(function () {
  console.log('这就是一个回调函数')
  console.log('调用者定义这个函数，执行者执行这个函数')
  console.log('其实就是调用者告诉执行者异步任务结束后应该做什么')
})
```
除了传递回调函数这种形式以外，还有几种常见异步实现方式，例如：**事件机制**、**发布/订阅**

## 2.4Promise (一种更优的异步编程统一方案)
### Promise概述
前面提到回调函数的重要性，但是直接使用传统回调方式去完成复杂的异步流程就无法避免大量的回调函数嵌套，就会导致**回调地狱**问题。
```js
// 回调地狱，只是示例，不能运行
$.get('/url1', function (data1) {
  $.get('/url2', data1, function (data2) {
    $.get('/url3', data2, function (data3) {
      $.get('/url4', data3, function (data4) {
        $.get('/url5', data4, function (data5) {
          $.get('/url6', data5, function (data6) {
            $.get('/url7', data6, function (data7) {
              // 略微夸张了一点点
            })
          })
        })
      })
    })
  })
})
```
为了避免此问题，CommonJS社区提出了Promise的规范，目的就是为异步编程去提供一种更合理，更强大的统一解决方案，在ES2015被标准化，成为语言规范Promise，实际上就是一个对象，用来表示一个异步任务，最终结束过后究竟是成功或是失败。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200926145059755.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
```js
// Promise 基本示例

const promise = new Promise(function (resolve, reject) {
  // 这里用于“兑现”承诺

  // resolve(100) // 承诺达成

  reject(new Error('promise rejected')) // 承诺失败
})

promise.then(function (value) { // onFulfilled
  // 即便没有异步操作，then 方法中传入的回调仍然会被放入队列，等待下一轮执行
  console.log('resolved', value)
}, function (error) { //onRejected
  console.log('rejected', error)
})

console.log('end') // 先打印
```
需要注意的是：即便Promise当中没有任何的异步操作，then方法中指明的回调函数仍然会回到任务队列中排队，必须要等待同步代码全部执行完了才会执行。
### Promise常见误区
```js
// Promise 方式的 AJAX

function ajax (url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'json'
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response)
      } else {
        reject(new Error(this.statusText))
      }
    }
    xhr.send()
  })
}
```
```js
ajax('/api/foo.json').then(function (res) {
  console.log(res)
}, function (error) {
  console.log(error)
})
```
通过案例，我们发现Promise的本质也是使用回调函数，定义的异步任务结束后所需要执行的任务。

回调函数通过**then**方法传递**Promise**将回调分为成功**onFulfilled**、失败**onRejected**。

对于某些例子，还会出现**then**嵌套，这种嵌套使用的方式是使用**Promise**最常见的错误。
```js
// 嵌套使用 Promise 是最常见的误区
ajax('/api/urls.json').then(function (urls) {
  ajax(urls.users).then(function (users) {
    ajax(urls.users).then(function (users) {
      ajax(urls.users).then(function (users) {
        ajax(urls.users).then(function (users) {

        })
      })
    })
  })
})
```
正确做法：借助于**Promise**的**then**方法链式调用的特点，尽可能保证异步任务的**扁平化**。
### Promise链式调用
```js
 promise.then(
	function onFulfilled (value) {
	    console.log('onFulfilled', value)
	},
	function onRejected (error) {
	    console.log('onRejected', error)
	}
}
```
- 其中onRejected其实是可以省略掉的。

then方法最大的特点是：内部也会返回一个**Promise对象**，但他们并不是同一个，所以并不是在方法内部通过this返回的链式调用。

这里的then方法返回的是一个全新的**Promise对象**，为了实现**Promise链**，每一个承诺都可以负责一个异步任务，相互之间没有什么影响，这样就可以避免不必要的**回调嵌套**，从而保证代码的**扁平化**。
```js
 ajax('/api/users.json')
  .then(function (value) {
    console.log(1111)
    return ajax('/api/urls.json')
  }) // => Promise
  .then(function (value) {
    console.log(2222)
    console.log(value)
    return ajax('/api/urls.json')
  }) // => Promise
  .then(function (value) {
    console.log(3333)
    return ajax('/api/urls.json')
  }) // => Promise
  .then(function (value) {
    console.log(4444)
    return 'foo'
  }) // => Promise
  .then(function (value) {
    console.log(5555)
    console.log(value)
  })
```
 - 总结：
 1.  Promise对象的then方法会返回一个全新的Promise对象，所以就可以使用链式调用的方式去添加then方法。
 2. 后面的then方法就是在为上一个then返回的Promise注册回调。
 3. 前面then方法中回调函数的返回值会作为后面then方法回调的参数。
 4. 如果回调中返回的是Promise，那后面then方法的回调会等待他的结束  
### Promise异常处理 
- 使用Promise实例的catch方法去注册onRejected回调
- 其实**catch方法**是**then方法**的一个别名
- catch更适合**链式调用**
- 使用onRejected只能捕获到当前promise的异常
```js
// 使用 catch 注册失败回调是更常见的

ajax('/api/users11.json')
  .then(function onFulfilled (value) {
    console.log('onFulfilled', value)
  })
  .catch(function onRejected (error) {
    console.log('onRejected', error)
  })

// then(onRejected) 实际上就相当于 then(undefined, onRejected)

ajax('/api/users11.json')
  .then(function onFulfilled (value) {
    console.log('onFulfilled', value)
  })
  .then(undefined, function onRejected (error) {
    console.log('onRejected', error)
  })

// 同时注册的 onRejected 只是给当前 Promise 对象注册的失败回调
// 它只能捕获到当前 Promise 对象的异常

ajax('/api/users.json')
  .then(function onFulfilled (value) {
    console.log('onFulfilled', value)
    return ajax('/error-url')
  }, function onRejected (error) {
    console.log('onRejected', error)
  })

// 因为 Promise 链条上的任何一个异常都会被一直向后传递，直至被捕获
// 分开注册的 onRejected 相当于给整个 Promise 链条注册失败回调

ajax('/api/users.json')
  .then(function onFulfilled (value) {
    console.log('onFulfilled', value)
    return ajax('/error-url')
  }) // => Promise {}
  // .catch(function onRejected (error) {
  //   console.log('onRejected', error)
  // })
```
- 如果在then方法中返回了第二个Promise，且这个Promise在执行过程中异常，那我们使用第二个参数去注册的失败回调是捕获不到第二个函数的异常的，因为它只是给第一个Promise注册的失败回调。
```js
// 全局捕获 Promise 异常，类似于 window.onerror
window.addEventListener('unhandledrejection', event => {
  const { reason, promise } = event

  console.log(reason, promise)
  // reason => Promise 失败原因，一般是一个错误对象
  // promise => 出现异常的 Promise 对象

  event.preventDefault()
}, false)
```
- 可以在全局对象注册**unhandledrejection事件**去处理代码中没有被捕获到的**Promise异常**
	* 不推荐，更合适的做法是在代码中明确捕获每一个可能的异常，而不是丢给全局统一处理。

### 静态方法 Promise.resoler()
- 快速的把一个值转换为一个Promise对象
```js
Promise.resolve('foo')
  .then(function (value) {
    console.log(value)
  })

new Promise(function (resolve, reject) {
  resolve('foo')
})
```
```js
// 如果传入的是一个 Promise 对象，Promise.resolve 方法原样返回

var promise = ajax('/api/users.json')
var promise2 = Promise.resolve(promise)
console.log(promise === promise2)
```
```js
// 如果传入的是带有一个跟 Promise 一样的 then 方法的对象，
// Promise.resolve 会将这个对象作为 Promise 执行

Promise.resolve({
  then: function (onFulfilled, onRejected) {
    onFulfilled('foo')
  }
})
.then(function (value) {
  console.log(value)
})
```
### 静态方法 Promise.reject()
- 快速创建一个失败的Promise对象
```js
// Promise.reject 传入任何值，都会作为这个 Promise 失败的理由

Promise.reject(new Error('rejected'))
  .catch(function (error) {
    console.log(error)
  })

Promise.reject('anything')
  .catch(function (error) {
    console.log(error)
  })
```
### 并行执行 Promise.all()
```js
var promise = Promise.all([
  ajax('/api/users.json'),
  ajax('/api/posts.json')
])

promise.then(function (values) {
  console.log(values)
}).catch(function (error) {
  console.log(error)
})
```
1. 接收的是一个数组，数组中的每一个元素都是一个Promise对象，可以把这些promise看作一个个异步任务，这个方法会返回一个全新的Promise对象。
2. 当内部所有的Promise都完成过后，返回的这个全新的Promise才会完成。
3. 拿到的是一个数组，包含每一个异步执行的结果，均成功才成功。

这里我们综合使用一下串联和并行执行的这两种方式：
```js
ajax('/api/urls.json')
  .then(value => { // 我们先通过ajax请求url地址
    const urls = Object.values(value) // 获取这个对象中所有的属性也就是url地址组成的数组
    const tasks = urls.map(url => ajax(url)) // 将字符串数组转换成包含所有请求任务的Promise数组
    return Promise.all(tasks) //组合为一个新的Promsie
  })
  .then(values => {
    console.log(values)
  })
```
### 并行执行 Promise.race()
- 可以把多个Promise对象组合成一个全新的Promise对象
```js
// Promise.race 实现超时控制

const request = ajax('/api/posts.json')
const timeout = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('timeout')), 500)
})

Promise.race([
  request,
  timeout
])
.then(value => {
  console.log(value)
})
.catch(error => {
  console.log(error)
})
```
- 与Promise.all()不同
	*  Promise.all()等待所有任务成功结束才会成功完成
	* Promise.race()只会等待第一个结束的任务,只要有任何一个任务完成,返回的这个新的Promise对象也就会完成
### Promise执行时序
#### Promise异步执行顺序的特殊处
```js
// 微任务

console.log('global start')

// setTimeout 的回调是 宏任务，进入回调队列排队
setTimeout(() => {
  console.log('setTimeout')
}, 0)

// Promise 的回调是 微任务，本轮调用末尾直接执行
Promise.resolve()
  .then(() => {
    console.log('promise')
  })
  .then(() => {
    console.log('promise 2')
  })
  .then(() => {
    console.log('promise 3')
  })

console.log('global end')
```
```
global start
global end
promise
promise 2
promise 3
setTimeout
```
- 宏任务/微任务
	* 回调队列中的任务称之为**宏任务**执行过程中可以临时加上一些额外需求，对于这些需求，可以选择作为一个新的宏任务进到队列中排队。例如：**setTimeout**
	* 也可以做为当前任务的**微任务**直接在当前任务执行过后立即执行，而不是到整个队伍的末尾去重新排队。例如：**Promise**
#### 微任务的目的
- 提高整体的响应能力
	* **Promise** & **MutationObserver** & node中的**process.nextTick**

## 2.5Generator异步方案
- ES2015提供的Generator生成器函数
### 为什么要引入Generator
- 传统的JavaScript异步的实现是通过回调函数来实现的，但是这种方式有两个明显的缺陷：
1. **缺乏可信任性**：例如我们发起ajax请求的时候是把回调函数交给第三方进行处理，期待它能执行我们的回调函数，实现正确的功能。
2. **缺乏顺序性**：众多回调函数嵌套使用，执行的顺序不符合我们大脑常规的思维逻辑，回调逻辑嵌套比较深的话，调试代码时可能会难以定位。

Promise恢复了异步回调的可信任性，而Generator正是以一种看似顺序、同步的方式实现了异步控制流程，增强了代码可读性。
### Generator概念
1. Generator(生成器)是一类特殊的函数，跟普通函数声明时的区别是加了一个*号。
```js
function *main() {
    // do something……
}
```
2. Iterator(迭代器)：当我们实例化一个生成器函数之后，这个实例就是一个迭代器。可以通过next()方法去启动生成器以及控制生成器的是否往下执行。
3. yield/next：用来控制代码的执行顺序。通过yield语句可以在生成器函数内部暂停代码的执行使其挂起，此时生成器函数仍然是运行并且是活跃的，其内部资源都会保留下来，只不过是处在暂停状态。
4. 在迭代器上调用next()方法可以使代码从暂停的位置开始继续往下执行。
```js
// Generator 配合 Promise 的异步方案

function * main () {
  try {
    const users = yield ajax('/api/users.json')
    console.log(users)

    const posts = yield ajax('/api/posts.json')
    console.log(posts)

    const urls = yield ajax('/api/urls11.json')
    console.log(urls)
  } catch (e) {
    console.log(e)
  }
}
```
```js
const result = g.next()

result.value.then(data => {
  const result2 = g.next(data)

  if (result2.done) return // 生成器结束

  result2.value.then(data => {
    const result3 = g.next(data)

    if (result3.done) return

    result3.value.then(data => {
      g.next(data)
    })
  })
})
```
我们可以优化封装一下
```js
function co (generator) {
  const g = generator()

  function handleResult (result) {
    if (result.done) return // 生成器函数结束
    result.value.then(data => {
      handleResult(g.next(data))
    }, error => {
      g.throw(error)
    })
  }

  handleResult(g.next())
}

co(main)
```
像这样的生成器函数在社区中早就有一个更完善的库，就叫做co

## 2.6Async/Await语法糖
1. 相比于Generator最大的好处它不需要再配合一个类似co这样的执行器，因为他是语言层面的标准异步编程语法。
```js
async function main () {
  try {
    const users = await ajax('/api/users.json')
    console.log(users)

    const posts = await ajax('/api/posts.json')
    console.log(posts)

    const urls = await ajax('/api/urls.json')
    console.log(urls)
  } catch (e) {
    console.log(e)
  }
}

const promise = main()

promise.then(() => {
  console.log('all completed')
})
```
2. 其次 Async函数可以给我们返回一个Promise对象，这样更利于我们对整体代码进行控制。
3. 除此之外，还有一个点需要注意：async中使用的await关键词，只能出现在async函数内部，它不能直接在外部也就是最顶层作用于使用。