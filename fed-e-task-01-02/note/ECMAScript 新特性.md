
# ECMAScript 新特性



## 3.1ECMAScript与javaScript

- 实际上javaScript是ECMAScript的扩展语言
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200928195859226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200928195922185.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
- ECMAScript只提供了最基本的语法
- 解决原有语法上的一些问题或者不足
- 对原有语法进行增强
- 全新的对象、全新的方法、全新的功能
- 全新的数据类型和数据结构

## 3.2ECMAScript2015新特性
### let 与块级作用域
作用域——某个成员能够起作用的范围， 在ES6之前之前有**全局作用域**和**函数作用域**两种作用域，ECMAScript2015新增了块级作用域，块指的是{}包裹的内容，以前块是没有单独的作用域的，就导致块中定义的成员外部也可以访问到
```js
if (true) {
  // var foo = 'zce'
  let foo = 'zce'
  console.log(foo)
}
```
let关键词可以解决循环嵌套当中计数器重名导致的问题
```js
// let 在 for 循环中的表现
for (var i = 0; i < 3; i++) {
  for (var i = 0; i < 3; i++) {
    console.log(i)
  }
  console.log('内层结束 i = ' + i)
}

for (var i = 0; i < 3; i++) {
  for (let i = 0; i < 3; i++) {
    console.log(i)
  }
  console.log('内层结束 i = ' + i)
}
```
除此之外还有一个典型的应用场景，就是循环注册事件时
```js
// let 应用场景：循环绑定事件，事件处理函数中获取正确索引
var elements = [{}, {}, {}]
for (var i = 0; i < elements.length; i++) {
  elements[i].onclick = function () {
    console.log(i)
  }
}
elements[2].onclick()
```
传统可以依赖闭包解决
```js
var elements = [{}, {}, {}]
for (var i = 0; i < elements.length; i++) {
  elements[i].onclick = (function (i) {
    return function () {
      console.log(i)
    }
  })(i)
}
elements[0].onclick()
```
但是现在
```js
var elements = [{}, {}, {}]
for (let i = 0; i < elements.length; i++) {
  elements[i].onclick = function () {
    console.log(i)
  }
}
elements[0].onclick()
```
最后let 在变量声明之前就访问变量的话，会直接提示 ReferenceError，而不像 var 那样使用默认值 undefined。
```js
console.log(foo)
var foo = 'zce'

console.log(foo)
let foo = 'zce'
```
### const
- 在let基础上新增了只读特性，变量被声明后不允许在被修改
```js
const name = 'zce'
// 恒量声明过后不允许重新赋值
name = 'jack'

// 恒量要求声明同时赋值
const name
name = 'zce'
```
既然const是衡量，也就是说const再被声明的同时就必须要去设置一个初始值，声明和赋值不能像var一样放到两个语句中，还有一个问题是const声明的成员不可被修改，只是说我们不允许在声明过后重新去指向一个新的内存地址，并不是我们不允许修改衡量中的属性成员，例如：
```js
// 恒量只是要求内层指向不允许被修改
const obj = {}
// 对于数据成员的修改是没有问题的
obj.name = 'zce'
```
这个时候并没有去修改obj指向的内存地址，只是修改了这块内存空间的数据，相反如果我们是将obj等于一个新的空对象，就会报错
```js
obj = {}
```
除此之外和let基本相同，不再赘述。

- 最佳实践：不用var，主用const，配合let

默认使用const的原因它可以让我们更明确代码中声明的这些成员会不会被修改

### 数组的解构
ECMAScript2015新增了从数组到或象中获取指定元素的一种快捷方式。
```js
const arr = [100, 200, 300]

const foo = arr[0]
const bar = arr[1]
const baz = arr[2]
console.log(foo, bar, baz)
```
```js
const [foo, bar, baz] = arr
console.log(foo, bar, baz)
```
如果只是想获取其中某个位置所对应的成员，比如只获取第三个成员：
```js
const [, , baz] = arr
console.log(baz)
```
除此之外还可以在解构位置的变量名之前去添加三个点表示提取从当前位置往后的所有成员，最终所有的结果会放到一个数组当中，注意：此用法只能在数组的最后一个位置使用
```js
const [foo, ...rest] = arr
console.log(rest)
```
如果解构位置的成员个数小于数组的长度，就会按照从前到后的顺序去提取，多出来的成员就不会被提取，反之如果大于，则提取到的就为undefined
```js
const [foo, bar, baz, more] = arr
console.log(more)
```
我们也可以在解构位置的后面跟上一个等号，在其后面写上一个默认值，这样如果没有提取到数组当中对应的成员，变量就会得到这个默认值。
```js
const [foo, bar, baz = 123, more = 'default value'] = arr
console.log(bar, more)
```
例如我们去拆分一个字符串，然后获取拆分后的指定位置，传统做法需要用到临时变量去作为中间的过渡，通过解构就可以大大简化这样的过程。
```js
const path = '/foo/bar/baz'
// const tmp = path.split('/')
// const rootdir = tmp[1]

const [, rootdir] = path.split('/')
console.log(rootdir)
```

### 对象的解构
除了数组可以被解构，对象同样可以被解构。不过对象的解构需要根据属性名去提取而不是位置，因为数组中的元素有下标，也就是说它是有顺序规则的，而对象里面的成员没有一个固定的次序，所以它不能按照位置去提取。
```js
const obj = { name: 'zce', age: 18 }

const { name } = obj
console.log(name)
```
结构对象的其他特点基本上跟解构数组是完全一致的，这些一样的特性不再赘述。但是有一种特殊的情况，因为解构的变量名同时也是要去匹配被解构对象的属性名的，所以当当前作用域有同名的成员就会产生冲突。
```js
const name = 'tom'
const { name } = obj
console.log(name)
```
这个时候我们可以采取重命名的方式解决，在成员名的后面加上：然后跟上一个新的名称。
```js
const name = 'tom'
const { name: objName } = obj
console.log(objName)
```
如果此时你还需要同时添加默认值，可以在：后的变量名后面继续跟上=去设置对应的默认值。
```js
const name = 'tom'
const { name: objName = 'jack' } = obj
console.log(objName)
```
假设代码中用到了大量的console.log我们就可以把它解构出来：
```js
const { log } = console
log('foo')
log('bar')
log('123')
```
### 模板字符串字面量
在ECMAScript中还增强了定义字符串的方式。传统定义字符串需要单引号或者双引号的方式，在新语法中，增加了一种模板字符串的方式，它需要使用反引号反引号去标识。
```js
const str = `hello es2015, this is a string`
```
直接使用和普通字符串也没有任何区别，如果内部需要反引号同样可以通过 \ 转义，相比于普通字符串，这种模板字符串的方式多了一些非常有用的新特性。
1. 传统字符串不支持换行，需要使用\n表示，而在最新的字符串中支持多行，可以直接输入换行符，这一点对于输出html字符串非常方便。
```js
// 允许换行
const str = `hello es2015,

this is a \`string\``

console.log(str)
```
2. 模板字符串还支持插值表达式的方式在字符串中嵌入所对应的数值。这种的方式相比字符串拼接的方式方便且直观，{}中就是标准的javaScript，不只可以嵌入变量，还可以嵌入任何标准JS语句。
```js
const name = 'tom'
// 可以通过 ${} 插入表达式，表达式的执行结果将会输出到对应位置
const msg = `hey, ${name} --- ${1 + 2} ---- ${Math.random()}`
console.log(msg)
```
### 模板字符串标签数组
在模板字符串之前添加一个标签，那这个标签实际上就是一个特殊的函数，添加这个标签就是调用这个函数
```js
const str = console.log`hello world`
```
```
[ 'hello world' ]
```
在这里为什么打印了一个数组呢？
```js
const name = 'tom'
const gender = true

function myTagFunc (strings) {
  console.log(strings)
}

const result = myTagFunc`hey, ${name} is a ${gender}.`
```
```
[ 'hey, ', ' is a ', '.' ]
```
我们发现，这个数组当中就是模板字符串的内容中分割过后的结果，这是因为在模板字符串中可能会有嵌入的表达式，所以这里的数组就是按照表达式分割过后静态的内容，所以它是一个数组。除了这个数组以外，这个函数还可以接收到所有在这个模板字符串中出现的表达式的返回值。
```js
const name = 'tom'
const gender = true

function myTagFunc (strings, name, gender) {
  console.log(strings, name, gender)
}

const result = myTagFunc`hey, ${name} is a ${gender}.`
```
```
[ 'hey, ', ' is a ', '.' ] tom true
```
```js
const name = 'tom'
const gender = true

function myTagFunc (strings, name, gender) {
  return '123'
}

const result = myTagFunc`hey, ${name} is a ${gender}.`
console.log(result)
```
```
123
```
```js
const name = 'tom'
const gender = true

function myTagFunc (strings, name, gender) {
  return strings[0] + name + strings[1] + gender + strings[2]
}

const result = myTagFunc`hey, ${name} is a ${gender}.`

console.log(result)
```
```
hey, tom is a true.
```
这种标签函数的作用实际就是对模板字符串进行加工，例如gender直接输出的结果时true或者false,我们可以对他进行加工，这样使它返回的结果更适合用户的阅读。
```js
const name = 'tom'
const gender = false

function myTagFunc (strings, name, gender) {
  const sex = gender ? 'man' : 'woman'
  return strings[0] + name + strings[1] + sex + strings[2]
}

const result = myTagFunc`hey, ${name} is a ${gender}.`

console.log(result)
```
```
hey, tom is a woman.
```
也可以使用标签函数的特性去实现例如文本的多语言化，比如翻译等，甚至可以通过这种特性去实现一个小型的模板引擎。

### 字符串的扩展方法
- includes()
- startWith()
- endsWith()

```js
const message = 'Error: foo is not defined.'

console.log(
  message.startsWith('Error')
  message.endsWith('.')
  message.includes('foo')
)
```
```
true
true
true
```

### 参数默认值
```js
function foo (enable) {
  // 短路运算很多情况下是不适合判断默认参数的，例如 0 '' false null
  // enable = enable || true
  enable = enable === undefined ? true : enable
  console.log('foo invoked - enable: ')
  console.log(enable)
}
```
```js
// 默认参数一定是在形参列表的最后
function foo (enable = true) {
  console.log('foo invoked - enable: ')
  console.log(enable)
}

foo(false)
```

### 剩余参数Rest
对于未知个数的参数，往往我们使用arguments对象接收，它是一个伪数组，在ECMAScript2015当中新增了一个...的操作符，这种操作符有两个作用，在这里我们用到Rest这个剩余作用：
```js
// function foo () {
//   console.log(arguments)
// }

function foo (first, ...args) {
  console.log(args)
}

foo(1, 2, 3, 4)
```
形参会以数组的形式接收从当前这个参数位置开始往后所有的实参，则可以取代arguments对象接收无限参数的方式。但要出现在形参的最后一位，而且只能使用一次。

### 展开数组Spread
除了以上讲到的Rest的用法还有一个Spread的用法，意思就是展开。我们先来了解与函数相关的数组参数展开：
```js
const arr = ['foo', 'bar', 'baz']

console.log(
  arr[0],
  arr[1],
  arr[2],
)
```
如果数组元素个数不固定就不能这样使用，以前我们可以通过apply来解决：
```js
console.log.apply(console, arr)
```
现在我们可以直接展开这个数组
```js
console.log(...arr)
```
### 箭头函数
```js
function inc (number) {
  return number + 1
}

// 最简方式
const inc = n => n + 1

// 完整参数列表，函数体多条语句，返回值仍需 return
const inc = (n, m) => {
  console.log('inc invoked')
  return n + 1
}

console.log(inc(100))
```
```js
const arr = [1, 2, 3, 4, 5, 6, 7]

// arr.filter(function (item) {
//   return item % 2
// })

// 常用场景，回调函数
arr.filter(i => i % 2)
```
相比于普通函数箭头函数不会改变this的指向
```js
const person = {
  name: 'tom',
  // 在普通函数当中 this始终指向调用这个函数的对象
  sayHi: function () {
    console.log(`hi, my name is ${this.name}`)
  }
```
```js
  // 箭头函数中没有this的机制，不会改变this的指向
  sayHi: () => {
    console.log(`hi, my name is ${this.name}`)
  }
}
```
```js
const person = {
  name: 'tom',
  sayHiAsync: function () {
    // const _this = this
    // setTimeout(function () {
    //   console.log(_this.name)
    // }, 1000)

    console.log(this)
    setTimeout(() => {
      // console.log(this.name)
      console.log(this)
    }, 1000)
  }
}

person.sayHiAsync()
```

### 对象字面量增强
```js
const bar = '345'

const obj = {
  foo: 123,
  bar: bar
}
```
属性名与变量名相同，可以省略 : bar
```js
const obj = {
  foo: 123,
  bar,
}
```
```js
const obj = {
  // method1: function () {
  //   console.log('method111')
  // }

  method1 () {
    console.log('method111')
    console.log(this) // this指向当前对象
  }
}
```
方法可以省略 : function，但是，这种方法就是普通的函数，同样影响 this 指向。
可以使用表达式的返回值作为对象的属性名：
```js
const obj = {
  Math.random(): 123 // 不允许
}
// 只能在对象声明过后通过索引器动态添加
// obj[Math.random()] = 123
```
计算属性名 在[ ]内可以使用任意的表达式，表达式的执行结果将会作为属性的属性名
```js
const obj = {
  // 通过 [] 让表达式的结果作为属性名
  [bar]: 123
}
```

### Object.assign
- 将多个源对象中的属性复制到一个目标对象中

用户后面对象的属性去覆盖第一个对象，返回值为第一个对象。
如果传入多个源对象，
```js
const source1 = {
  a: 123,
  b: 123
}

const source2 = {
  b: 789,
  d: 789
}

const target = {
  a: 456,
  c: 456
}

const result = Object.assign(target, source1, source2)

console.log(target)
console.log(result === target)
```
```
{ a: 123, c: 456, b: 789, d: 789 }
true
```
```js
function func (obj) {
  obj.name = 'func obj'
  console.log(obj)
}

const obj = { name: 'global obj' }

func(obj)
console.log(obj)
```
```
{ name: 'func obj' }
{ name: 'func obj' }
```
如果我们只是希望在函数的内部去修改这个对象，就可以使用Object.assign将其复制到一个全新的对象上。
```js
function func (obj) {

  const funcObj = Object.assign({}, obj)
  funcObj.name = 'func obj'
  console.log(funcObj)
}

const obj = { name: 'global obj' }

func(obj)
console.log(obj)
```
```
{ name: 'func obj' }
{ name: 'global obj' }
```
### Object.is
判断两个值是否相等
```js
// Object.is

console.log(
  // 0 == false              // => true
  // 0 === false             // => false
  // +0 === -0               // => true
  // NaN === NaN             // => false
  // Object.is(+0, -0)       // => false
  // Object.is(NaN, NaN)     // => true
)
```

### Proxy
- 代理对象

如果我们想要监视某个对象中的属性读写，我们可以使用ES5中提供的Object.defineProperty这样的方法来去为对象添加属性，这样就可以捕获到对象当中属性的读写过程。
在Vue3.0以前的版本就是使用这样一个方法**实现的数据响应，从而完成双向数据绑定**。
在ES2015当中全新设计了一个叫做**Proxy**的类型：它就是专门为了对象访问**代理器**的。
- 代理

如果你不理解**代理**，我们可以将其理解为门卫，也就是说不管你进去拿东西或是放东西，都需要经过这样一个**代理**，通过Proxy就可以轻松监视到对象的读写过程。
相比于defineProperty，Proxy的功能更加强大，使用起来也更加方便。
```js
const person = {
  name: 'zce',
  age: 20
}

//创建一个代理对象 第一个参数：需要代理的目标对象；
const personProxy = new Proxy(person, {
  // 监视属性读取
  get (target, property) { // 代理的目标对象 外部访问的属性名
    console.log(target, property)
    return 100
  },
  // 监视属性设置
  set () {}
})

console.log(personProxy.name)
```
```
{ name: 'zce', age: 20 } name
100
```
get方法内部的正常逻辑：先判断代理目标对象是否存在这样一个属性，如果存在就返回一个对应的值，反之如果不存在则返回undefined或者是一个默认值。
```js
const personProxy = new Proxy(person, {
  // 监视属性读取
  get (target, property) {
    return property in target ? target[property] : 'default'
  },
  // 监视属性设置
  set () {}
})

console.log(personProxy.name)
console.log(personProxy.xxx)
```
```
zce
default
```
我们再来看一下set对象：
```js
const personProxy = new Proxy(person, {
  // 监视属性读取
  get () {},
  // 监视属性设置
  set (target, property, value) { 代理的目标对象 写入的属性名 写入的属性值
    console.log(target, property, value)
  }
})

personProxy.gender = true
```
```
{ name: 'zce', age: 20 } gender true
```
set方法内部的正常逻辑：为代理目标设置指定的属性，这里我们可以先做一些数据校验，如果设置的是age，值就必须为数字，否则报错。完成以后尝试给代理对象age设置为一个字符串，此时就会报错，如果设置的是一个正常的数字，结果就可以设置到目标对象上。
```js
const personProxy = new Proxy(person, {
  // 监视属性读取
  get () {},
  // 监视属性设置
  set (target, property, value) { 代理的目标对象 写入的属性名 写入的属性值
    if (property === 'age') { // 如果设置的指为age 值就必须是数字
      if (!Number.isInteger(value)) { // 否则报错
        throw new TypeError(`${value} is not an int`)
      }
    }
    target[property] = value
  }
})

personProxy.age = 100 // 如果不为数字 则报错
personProxy.gender = true
```
以上就是Proxy的一些基本用法，以后Proxy会用的越来越多，Vue3.0开始就已经开始使用Proxy去实现内部的数据响应了。

### Proxy vs Object.defineProperty()

1. Proxy更为强大。

Object.defineProperty()只能监视属性的读写，Proxy能监视到更多对象操作。例如delate操作、对对象方法的调用。
```js
const person = {
  name: 'zce',
  age: 20
}

const personProxy = new Proxy(person, {
  deleteProperty (target, property) { // 代理目标对象 要删除的属性名称
    console.log('delete', property)
    delete target[property]
  }
})

delete personProxy.age
console.log(person)
```
```
delete age
{ name: 'zce' }
```
这也就表明Proxy确实能做到defineProperty做不到的事情，除了delete以外还有许多其他的对象操作都可以监视到。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930143424125.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
2. Proxy更好的支持数组对象的监视。

以往想通过Object.defineProperty()去监视数组的操作，最常见的一种方式就是通过重写数组的操作方法（Vue.js使用的方式），大体的思路就是通过自定义的方法去覆盖掉数组原先对象的push、shift等方法以此去劫持对应这个方法调用的过程。
如何使用Proxy对象监视数组：
```js
const list = []

const listProxy = new Proxy(list, {
  set (target, property, value) { // 监视数据写入
    console.log('set', property, value) // 得到的属性名 属性值
    target[property] = value // 设置目标对象当中所对应的属性
    return true // 表示设置成功
  }
})

listProxy.push(100)
listProxy.push(100)
```
```
set 0 100   
set length 1
set 1 100   
set length 2
```
这里的0实际上就是数组当中的下标，100就是0这个下标所对应的值。这也就表示Proxy内部会自动根据push操作去推算出来它应该所处的下标。数组的其他操作方式都是类似的。

3. Proxy是以非侵入的方式监管了对象的读写

也就是说一个已经定义好的对象，不需要对对象本身做任何操作就可以监视到内部成员的读写。而Object.defineProperty()就要求我们必须通过特定的方式单独定义对象中需要被监视的属性。
```js
const person = {}

Object.defineProperty(person, 'name', {
  get () {
    console.log('name 被访问')
    return person._name
  },
  set (value) {
    console.log('name 被设置')
    person._name = value
  }
})
Object.defineProperty(person, 'age', {
  get () {
    console.log('age 被访问')
    return person._age
  },
  set (value) {
    console.log('age 被设置')
    person._age = value
  }
})

person.name = 'jack'

console.log(person.name)
```
```
name 被设置
name 被访问
jack
```
```js
// Proxy 方式更为合理
const person2 = {
  name: 'zce',
  age: 20
}

const personProxy = new Proxy(person2, {
  get (target, property) {
    console.log('get', property)
    return target[property]
  },
  set (target, property, value) {
    console.log('set', property, value)
    target[property] = value
  }
})

personProxy.name = 'jack'

console.log(personProxy.name)
```
```
set name jack
get name
jack
```

### Reflect
- 统一的对象操作API

Reflect是ES2015提供的一个全新的内置对象。

- ~~new Reflect()~~
按照JAVA或者C##的说法，Reflect属于一个静态类，也就是说其不能通过new的方式去构建一个实例对象，只能调用这个静态类的静态方法Reflect.get()，例如Math对象。

- Reflect内部封装了一系列对对象的底层操作。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930155148884.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
Reflect成员方法就是Proxy处理对象的默认实现。
```js
const obj = {
  foo: '123',
  bar: '456'
}
```
```js
const proxy = new Proxy(obj, {
})
```
这里定义好了一个Proxy对象。只不过Proxy的处理对象当中没有添加任何的成员，我们可以在Proxy对象中去添加不同的方法成员来去监听对象所对应的操作。如果没有添加具体的处理方法，比如get、set，内部的get、set又是如何执行的呢？
其实Proxy处理对象内部默认实现的逻辑就是调用了Reflect对象中所对应的方法：
```js
const proxy = new Proxy(obj, {
  get (target, property) {
    return Reflect.get(target, property)
  }
})
```
这就也表明我们在去实现自定义的get或者set这样的逻辑时，更标准的做法是先去实现自己所需要的监视逻辑，再去返回通过Reflect中对应的方法的一个调用结果。

- Reflect提供了一套用于操作对象的API

在此之前我们在去操作对象时有可能使用Object对象上的一些方法，也有可能使用delete、in这样的操作符。这些对于新手入门较稳困难，无规律可循。Reflect就很好地解决了这样一个问题，其统一了对象的操作方式。
```js
const obj = {
  name: 'zce',
  age: 18
}
```
如果我们判断这个对象中是否存在某个属性就需要使用in操作符，需要去删除则需要使用delete语句，而如果要获取对象中所有的属性名就需要使用keys这样的方法。
```js
console.log('name' in obj)
console.log(delete obj['age'])
console.log(Object.keys(obj))
```
```js
console.log(Reflect.has(obj, 'name'))
console.log(Reflect.deleteProperty(obj, 'age'))
console.log(Reflect.ownKeys(obj))
```

### Promise
- 一种更优的异步编程解决方案

通过链式调用的方式解决了在传统JavaScript异步编程当中回调函数嵌套过深的问题。详细可见: [JavaScript 异步编程](http://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/JavaScript%20%E6%B7%B1%E5%BA%A6%E5%89%96%E6%9E%90/JavaScript%20%E5%BC%82%E6%AD%A5%E7%BC%96%E7%A8%8B.html)。

### class类
自从ECMAScript2015开始我们就可以使用一个class的关键词去声明一个类型。这种独立定义类型的语法相比之前函数的方式要更容易理解，结构更加清晰。
```js
function Person (name) {
  this.name = name
}

Person.prototype.say = function () {
  console.log(`hi, my name is ${this.name}`)
}
```
```js
class Person {
  constructor (name) {
    this.name = name
  }

  say () {
    console.log(`hi, my name is ${this.name}`)
  }
}

const p = new Person('tom')
p.say()
```
### static
在类型中的方法一般分为**实例方法**和**静态方法**。
**实例方法**就是需要通过这个类型构造的实例对象去调用；**静态方法**则是直接通过类型本身去调用。
以前实现静态方法就是直接在构造函数对象上挂载方法去实现，因为JS当中函数也是对象，也可以去添加一些方法成员。
ES2015新增添加静态成员的**static关键词**
```js
class Person {
  constructor (name) {
    this.name = name
  }

  say () {
    console.log(`hi, my name is ${this.name}`)
  }

  static create (name) {
    return new Person(name)
  }
}

const tom = Person.create('tom')
tom.say()
```
需要注意的是：由于静态方法是挂载到类型上的，所以在静态方法内部，this就不会指向某个实例对象，而是当前的类型。

### extends
在ES2015之前可以通过原型的方式去实现继承。而在ES2015中实现了一个专门用来类型继承的关键词extends
```js
class Person {
  constructor (name) {
    this.name = name
  }

  say () {
    console.log(`hi, my name is ${this.name}`)
  }
}

class Student extends Person {
  constructor (name, number) {
    super(name) // 父类构造函数
    this.number = number
  }

  hello () {
    super.say() // 调用父类成员
    console.log(`my school number is ${this.number}`)
  }
}

const s = new Student('jack', '100')
s.hello()
```
### Set数据结构
可以理解为集合，与传统的数组非常类似，但是set内部的成员不允许重复，也就是说每一个值在同一个set中都是唯一的。
```js
const s = new Set()

// add方法会返回集合对象本身 因此可以链式调用
s.add(1).add(2).add(3).add(4).add(2)
```
如果添加了之前存在的值，其会被忽略
```js
console.log(s)
```
```
Set(4) { 1, 2, 3, 4 }
```
想要遍历集合的数据可以使用forEach方法，传入一个回调函数
```js
s.forEach(i => console.log(i))
```
```
1
2
3
4
```
或者使用ES2015提供的for...of循环
```js
for (let i of s) {
  console.log(i)
}
```
```
1
2
3
4
```
可以通过size()属性获取集合长度，等价于数组的length。has()方法可以判断集合当中是否存在某一个特定的值。delete()方法用于删除集合当中某一个指定的值，返回值为布尔类型。clear()方法用于清除当前集合的全部内容。
set数据结构常见的应用场景是去为数组中的元素去重，同时我们可以通过使用ES2015新增的Array.from()方法去把它转化为数组；或者使用...这种展开操作符在一个空的数组当中去展开这个set，这样set的成员就可以作为空数组的成员了，这样也可以得到一个数组
```js
const arr = [1, 2, 1, 3, 4, 1]

// const result = Array.from(new Set(arr))
const result = [...new Set(arr)]

console.log(result)
```
```
[ 1, 2, 3, 4 ]
```
### Map数据结构
这种结构与ECMAScript中的对象非常类似，本质上它们都是键值对集合。但是这种对象结构的键只能是字符串类型，所以说我们去存放一些复杂结构的数据时，会有一些问题：
```js
const obj = {}
obj[true] = 'value'
obj[123] = 'value'
obj[{ a: 1 }] = 'value'

console.log(Object.keys(obj))
```
```
[ '123', 'true', '[object Object]' ]
```
原本我们设置的布尔值、数字、还有对象类型的键都被转化为了字符串。也就是说，如果给对象添加的键不是字符串，内部就会将这个数据toString的结果作为键。

ES2015的Map结构就是为了来解决这个问题的，Map才能算是严格意义上的键值对集合，用来去映射两个任意类型数据之间的对应关系。
```js
const m = new Map()

const tom = { name: 'tom' }

m.set(tom, 90)

console.log(m)
```
```
Map(1) { { name: 'tom' } => 90 }
```
如果我们需要去获取其中的数据，可以使用get()方法。除此之外可以使用has()方法判断某一个键是否存在，delete()方法去删除掉某一个键，clear()方法去清空所有的键值。如果需要遍历所有的键值可以使用实例对象的forEach(value,key)方法，第一个方法是遍历的值，第二个参数是被遍历的键。
```js
m.forEach((value, key) => {
  console.log(value, key)
})
```
```
90 { name: 'tom' }
```
- Map数据结构与对象最大的区别就是它可以用任意类型的数据来作为键，而对象实际上只能够使用字符串作为建

### Symbol
在ECMAScript2015之前，对象的属性名都是字符串，而字符串是有可能会重复的，如果重复就会产生冲突：
```js
// shared.js ====================================

const cache = {}

// a.js =========================================

cache['foo'] = Math.random()

// b.js =========================================

cache['foo'] = '123'

console.log(cache)
```
```
{ foo: '123' }
```
以前解决这种问题最好的方式就是**约定**，例如：
```js
// a.js =========================================

cache['a_foo'] = Math.random()

// b.js =========================================

cache['b_foo'] = '123'
```
```
{ a_foo: 0.3077064141387371, b_foo: '123' }
```
这样就不会产生冲突了，但是约定的方式只是规避了问题，并没有彻底解决。

ES2015为了解决这样一个问题，提供了一种全新的原始数据类型，叫做Symbol，作用就是表示一个独一无二的值。我们通过Symbol创建的每一个值都是独一无二的，永远不会重复。

考虑到开发过程中的调试，Symbol允许传入一个字符串作为这个值的描述文本。从ES2015开始，对象就可以直接使用Symbol类型的值作为属性名。
```js
// 使用 Symbol 为对象添加永不重复的键

const obj = {}
obj[Symbol()] = '123'
obj[Symbol()] = '456'
console.log(obj)

// 也可以在计算属性名中使用

const obj = {
  [Symbol()]: 123
}
console.log(obj)
```
Symbol除了可以避免对象属性名重复产生的问题，我们还可以借助这种类型的特点模拟对象的私有成员：
```js
// a.js ======================================

const name = Symbol()
const person = {
  [name]: 'zce',
  say () {
    console.log(this[name])
  }
}
// 只对外暴露 person

// b.js =======================================

// 由于无法创建出一样的 Symbol 值，
// 所以无法直接访问到 person 中的「私有」成员
// person[Symbol()]
person.say()
```
- 最主要的作用就是为对象添加独一无二的属性名

截止到ES2019标准，一共定义了6种原始数据类型Number、String、Boolean、undefined、Null、Symbol，加上Object一共是7种数据类型，在未来还会新增BigInt的原始数据类型用于去存放更长的数字，标准化过后就是8种数据类型了。

### Symbol补充
- 唯一性
```js
console.log(
  // 通过Symbol创建的值一定是一个唯一的值 不管传入的描述文本是否相同
  // Symbol() === Symbol()
  Symbol('foo') === Symbol('foo')
)
```
- Symbol 全局注册表

如果需要在全局去复用一个相同的Symbol值，可以使用全局变量的方法实现，或者使用Symbol类型提供的静态方法实现
```js
const s1 = Symbol.for('foo')
const s2 = Symbol.for('foo')
console.log(s1 === s2)
```
for()方法可以接收一个字符串作为参数，相同的字符串一定会返回相同的Symbol类型的值，这个方法内部维护了一个全局的注册表，为字符串和Symbol值提供了一一对应的关系。如果传入的不是字符串，方法内部会将其自动转化为字符串
```js
console.log(
  Symbol.for(true) === Symbol.for('true')
)
```
因此以上二者拿到的值是相同的，需要注意。

- 内置 Symbol 常量

用来作为内部方法的标识，这些标识符可以让自定义对象实现一些JS当中内置的接口
```js
// console.log(Symbol.iterator)
// console.log(Symbol.hasInstance)

const obj = {
  // 考虑到如果使用字符串添加标识符可能跟内部成员产生重复
  // ECMAScripts要求我们通过Symbol值实现这样一个接口
  [Symbol.toStringTag]: 'XObject'
}
console.log(obj.toString())
```
此时toString标签就是自定义的XObject，这里的toStringTag就是内置的一个Symbol常量。

- Symbol 属性名获取

使用Symbol值作为对象的属性名，这个属性通过for...in是无法拿到的，而且通过Objec.keys()方法也是获取不到Symbol属性名的，如果通过JSON.stringfy()去序列化对象为一个JSON字符串的话，Symbol属性也会被忽略掉。这些特性都使得Symbol类型的属性特别适合作为对象的私有属性。

我们可以使用Object对象里面的getOwnPropertySymbols()方法，其作用类似于Object.case()方法，不同的是后者只能获取到对象种所有的字符串属性名，而前者获取到的全是Symbol类型的属性名。

### for...of循环
- 遍历数据的方法
	* for：遍历普通数组
	* for...in：遍历键值对
	* forEach：函数式的遍历方法

这些遍历方法都有一定的局限性，ES2015借鉴其他语言引入了一种全新的遍历方式：for...of循环，以后会作为遍历所有数据结构的统一方式。
```js
const arr = [100, 200, 300, 400]

for (const item of arr) {
  console.log(item)
}
```
不同于传统的for...in循环，for...of循环拿到的就是数组的每一个元素，而不是对应的下标，这种方法就可以取代forEach，而且相比forEach，for...of能够使用break随时终止循环，forEach不能跳出循环，我们以往通常使用some()、every()终止遍历。

除了数组可以被for...of循环遍历，伪数组同样适用，例如函数中的arguments对象，或者是DOM操作时一些元素节点的列表，它们操作都和普通的数组没有任何区别。
遍历 Set 与遍历数组相同
```js
const s = new Set(['foo', 'bar'])

for (const item of s) {
  console.log(item)
}
```
遍历 Map 可以配合数组结构语法，直接获取键值
```js
const m = new Map()
m.set('foo', '123')
m.set('bar', '345')

for (const [key, value] of m) {
  console.log(key, value)
}
```
普通对象不能被直接 for...of 遍历
```js
const obj = { foo: 123, bar: 456 }

for (const item of obj) {
  console.log(item)
}
```
当我们执行了以上代码控制台会抛出：obj is not iterable 的错误，意思是说obj对象是不可被迭代的，而我们上面提到：for...of循环它可以作为遍历所有数据结构的统一方式，但是它连最基本的普通对象都没有办法遍历。

### 可迭代接口 Iterable
上节提到for...of循环是一种数据统一的遍历方式，但是经过尝试，它只能遍历数组之类的数据结构，对于普通的对象，如果直接去遍历就会报出错误，其实是这样的：

ES2015中能够表示有结构的数据类型越来越多，从数组到对象到现在的set、map，而且开发者还可以组合使用这些类型去定义一些符合自己业务需求的数据结构，为了给各种各样的数据结构提供统一的遍历方式，ES2015就提出了一个叫做**Iterable**的接口。

可迭代接口就是一种可以被for...of循环统一遍历访问的规格标准，也就是说能被for...of遍历的数据类型内部都已经实现了这个接口，并挂载了一个iterator()方法，这个方法需要返回一个带有next()方法的对象，我们不断调用这个next()方法就可以实现对内部所有数据类型的遍历。
```js
const set = new Set(['foo', 'bar', 'baz'])

const iterator = set[Symbol.iterator]()

console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
```
```
{ value: 'foo', done: false }   
{ value: 'bar', done: false }   
{ value: 'baz', done: false }   
{ value: undefined, done: true }
{ value: undefined, done: true }
```
```js
while (true) {
  const current = iterator.next()
  if (current.done) {
    break // 迭代已经结束了，没必要继续了
  }
  console.log(current.value)
}
```
```
foo
bar
baz
```
以上也就是for...of内部的工作原理：内部调用被遍历对象的iterator()方法得到一个迭代器从而去遍历内部所有的数据。这也就是Iterable接口所约定的内容。
### 实现可迭代接口
只要对象也实现了Iterable接口，是不是我们就可以实现使用for...of循环去遍历呢？
```js
const obj = { // 整个对象叫做 Iterable
  [Symbol.iterator]: function () {
    return { // 带有next()方法的对象叫做 Iterator
      next: function () {
        return { // IterationResult
          value: 'zce', // 当前被迭代到的数据
          done: true // 迭代有没有结束
        }
      }
    }
  }
}
```
我们来修改一下这个对象：
```js
const obj = {
  store: ['foo', 'bar', 'baz'], // 用于添加值得被遍历的数据

  [Symbol.iterator]: function () {
    let index = 0
    const self = this

    return {
      next: function () {
        const result = {
          value: self.store[index],
          done: index >= self.store.length
        }
        index++
        return result
      }
    }
  }
}
```
```
循环体 foo
循环体 bar
循环体 baz
```

### 迭代器模式
上节讲到如何让自定义对象去实现可迭代接口从而实现能够使用for...of循环去迭代对象。其实这就是设计模式中的迭代器模式。
我们通过一个案例理解这种模式的优势：
```js
// 场景：你我协同开发一个任务清单应用

// 我的代码 ===============================

const todos = {
  life: ['吃饭', '睡觉', '打豆豆'],
  learn: ['语文', '数学', '外语'],
  work: ['喝茶'], // 添加了全新的类目

// 你的代码 ===============================

for (const item of todos.life) {
  console.log(item)
}
for (const item of todos.learn) {
  console.log(item)
}
for (const item of todos.work) {  //也需要跟着变化
  console.log(item)
}

// 此时，如果我的数据结构能够对外提供一个统一的遍历接口，对于调用者而言
// 就不用关心我对象内部的结构是怎样的
// 更不用担心我的内部结构改变过后所产生的影响

// 在 我的代码 中增加each方法 ===============================
const todos = {
  life: ['吃饭', '睡觉', '打豆豆'],
  learn: ['语文', '数学', '外语'],
  work: ['喝茶'],

  // 提供统一遍历访问接口
  each: function (callback) {
    const all = [].concat(this.life, this.learn, this.work) // 将所有数组进行合并
    for (const item of all) {
      callback(item) //将每一个数据交给回调函数
    }
  }
}

// 你的代码 ===============================
todos.each(function (item) {
  console.log(item)
})
```
```
吃饭
睡觉
打豆豆
语文
数学
外语
喝茶
```
其实实现可迭代接口也是相同的道理，尝试使用迭代器的方法解决这个问题
```js
const todos = {
  life: ['吃饭', '睡觉', '打豆豆'],
  learn: ['语文', '数学', '外语'],
  work: ['喝茶'],

  // 提供迭代器（ES2015 统一遍历访问接口）
  [Symbol.iterator]: function () {
    const all = [...this.life, ...this.learn, ...this.work] // 展开
    let index = 0
    return {
      next: function () {
        return {
          value: all[index], // 整体这个数组的index
          done: index++ >= all.length
        }
      }
    }
  }
}

for (const item of todos) {
  console.log(item)
}
```
```
吃饭
睡觉
打豆豆
语文
数学
外语
喝茶
```
效果与each方法相同，这也就是我们实现迭代器的意义：迭代器这样一个模式它的核心就是对外提供统一遍历接口，让外部不用再去关心这个数据内部的结构是怎样的。

不同的是，这里使用each()方法只适用当前这个对象结构，而ES2015中的迭代器是语言层面实现的迭代器模式，所以它可以去适用于任何数据结构，只需要通过代码去实现interator()方法，实现它的迭代逻辑就可以了。

### 生成器 Generator
- 最大特点：惰性执行

避免异步编程中回调嵌套过深，提供更好的异步编程解决方案。
我们先来了解生成器函数的语法以及它的基本应用：
```js
function * foo () { // 定义生成器函数就是在function关键字后加*
  console.log('zce')
  return 100
}

const result = foo()
console.log(result.next()) // 调用生成器对象的next()方法
```
```
zce
{ value: 100, done: true }
```
next()方法的返回值与迭代器next()的返回值有相同的结构，我们函数的返回值被放到value中，这就是因为生成器对象其实也实现了iterator接口的协议。
生成器函数在实际使用的时候一定会配合yield关键词去使用，yield与return关键词非常类似，但是有有很大不同：
```js
function * foo () {
  console.log('1111')
  yield 100 // 并不会结束掉这个方法的执行
  console.log('2222')
  yield 200
  console.log('3333')
  yield 300
}

const generator = foo()

console.log(generator.next()) // 第一次调用，函数体开始执行，遇到第一个 yield 暂停
console.log(generator.next()) // 第二次调用，从暂停位置继续，直到遇到下一个 yield 再次暂停
console.log(generator.next()) // 。。。
console.log(generator.next()) // 第四次调用，已经没有需要执行的内容了，所以直接得到 undefined
```
```
1111
{ value: 100, done: false }
2222
{ value: 200, done: false }
3333
{ value: 300, done: false }
{ value: undefined, done: true }
```

#### 生成器应用
```js
// 案例1：发号器

function * createIdMaker () {
  let id = 1
  while (true) {
    yield id++
  }
}

const idMaker = createIdMaker()

console.log(idMaker.next().value)
console.log(idMaker.next().value)
console.log(idMaker.next().value)
console.log(idMaker.next().value)
```
```js
// 案例2：使用 Generator 函数实现 iterator 方法

const todos = {
  life: ['吃饭', '睡觉', '打豆豆'],
  learn: ['语文', '数学', '外语'],
  work: ['喝茶'],
  [Symbol.iterator]: function * () {
    const all = [...this.life, ...this.learn, ...this.work]
    for (const item of all) {
      yield item
    }
  }
}

for (const item of todos) {
  console.log(item)
}
```

## 3.3ECMAScript2016
与ES2015相比，ES2016只是一个小版本，仅包含两个小功能

###  Array.prototype.includes
首先就是数组实例对象的includes方法，这个方法让我们去检查数组当中是否包含指定元素变的更加简单。

在此之前，如果我们要检查数组当中是否存在某个指定元素就必须使用数组对象的indexOf()方法去实现，这个方法可以帮我们找到元素在数组当中所对应的下标，在没有找到指定元素的情况下会返回-1，但是这种方式去判断是否存在某一个元素也存在一个问题：

它不能去查找数组当中的NaN，现在有了includes方法之后我们就可以直接去判断数组当中是否存在某一个指定的元素了，includes()方法直接返回一个布尔值。
```js
const arr = ['foo', 1, NaN, false]

// 找到返回元素下标
console.log(arr.indexOf('foo'))
// 找不到返回 -1
console.log(arr.indexOf('bar'))
// 无法找到数组中的 NaN
console.log(arr.indexOf(NaN))

// 直接返回是否存在指定元素
console.log(arr.includes('foo'))
// 能够查找 NaN
console.log(arr.includes(NaN))
```
### 指数运算符
以前我们需要去进行指数运算需要借助Math对象当中的pow()方法去实现，而在ES2016中新增的指数运算符就是语言本身的运算符。
```js
// console.log(Math.pow(2, 10))

console.log(2 ** 10)
```

## 3.4ECMAScript2017
同样只是一个小版本，但它带来了非常有用的新功能

### Object.values
```js
const obj = {
  foo: 'value1',
  bar: 'value2'
}
```
与ES2015的keys()方法类似，keys()返回的是所有对象的键组成的数组，而values()返回的是所有对象的值所组成的数组。
```js
console.log(Object.values(obj))
```
```
[ 'value1', 'value2' ]
```

### Object.entries
entries()方法是以数组的形式返回对象当中所有的键值对。
```js
console.log(Object.entries(obj))
```
```
[ [ 'foo', 'value1' ], [ 'bar', 'value2' ] ]
```
这使得我们可以直接使用for...of循环遍历普通对象。
```js
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}
```
```
foo value1
bar value2
```
除此之外，因为Map的构造函数需要的就是这种格式的数组，所以我们可以借助entres()方法将一个对象对象转换成一个Map类型的对象。
```js
console.log(new Map(Object.entries(obj)))
```
```
Map(2) { 'foo' => 'value1', 'bar' => 'value2' }
```

### Object.getOwnPropertyDescriptors

这个方法是帮我们去获取对象当中属性的完整描述信息的。

自从ES5过后，我们就可以为对象去定义getter、setter属性，但它们是不能通过Object.assign()方法去完全复制的。
```js
const p1 = {
  firstName: 'Lei',
  lastName: 'Wang',
  get fullName () {
    return this.firstName + ' ' + this.lastName
  }
}

console.log(p1.fullName)

const p2 = Object.assign({}, p1)
p2.firstName = 'zce'
console.log(p2)
```
```
Lei Wang
{ firstName: 'zce', lastName: 'Wang', fullName: 'Lei Wang' }
```
这是由于Object.assign()在复制时只是把fullName当作一个普通的属性去复制。这种情况我们就可以使用getOwnPropertyDescriptors()方法去获取对象当中的完整描述信息，再使用Object.defineProperties()方法将这个描述信息定义到一个新的对象当中。这样我们对于getter、setter类型的属性就可以进行复制。
```js
const descriptors = Object.getOwnPropertyDescriptors(p1)
const p2 = Object.defineProperties({}, descriptors)
p2.firstName = 'zce'
console.log(p2.fullName)
```
```
zce Wang
```

### 新增字符串填充方法String.prototype.padStart / padEnd
```js
// 对齐输出的字符串长度
const books = {
  html: 5,
  css: 16,
  javascript: 128
}

for (const [name, count] of Object.entries(books)) {
  console.log(name, count)
}
```
```
html 5
css 16
javascript 128
```
```js
for (const [name, count] of Object.entries(books)) {
  console.log(`${name.padEnd(16, '-')}|${count.toString().padStart(3, '0')}`)
}
```
```
html------------|005
css-------------|016
javascript------|128
```

### 允许在函数参数中添加尾逗号
可以让源代码管理工具更精确地定位到代码当中实际发生变化的位置，也可以方便开发者调试代码。

### Async/Await
彻底解决了异步编程中回调函数嵌套过深所产生的问题，使代码更加简洁易读。本质就是使用Promise地一种语法糖，详细可见我的**异步编程**部分内容。
