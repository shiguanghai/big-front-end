
# TypeScropt 语言




## 4.1类型系统
### 强类型与弱类型
- 类型安全角度

**强类型**：语言层面限制函数的实参类型必须与形参类型相同。

**弱类型**：语言层面不会限制实参的类型。

这种强弱类型之分根本不是某一个权威机构的定义，但是公认的理解为：**强类型有更强的类型约束，而弱类型中几乎没有什么约束**。

- 强类型语言中不允许任意的隐式类型转换，而弱类型语言则允许任意的数据隐式类型转换。

我们这里所说的**强类型是从语言的语法层面就限制了不允许传入不同类型的值**。如果传入的是不同类型的值，在编译阶段就会报出错误，而不是等到运行阶段再通过逻辑判断去限制。**在JavaScript当中所有报出的类型错误都是在代码层面运行时通过逻辑判断手动抛出的**。

而在JS代码当中，变量类型允许随意改变的特点，不是强弱类型的差异。就拿Python来说，它是一门强类型语言，但它的变量仍然是可以随时改变类型的。

### 静态类型与动态类型
- 类型检查角度

**静态类型**：一个变量声明时它的类型就是明确的，声明过后，它的类型就不允许再修改。
**动态类型**：运行阶段才能够明确变量类型，而且变量的类型随时可以改变。

- 动态类型语言中的变量没有类型，而变量中存放的值是有类型的。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201007214405501.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### JavaScript类型系统特征
- 弱类型 且 动态类型
- 灵活且多变
- 丢失了类型系统的可靠性
- 没有编译环节

**大规模应用下，JavaScript早期的优势就变成了短板**

### 弱类型的问题
1. 程序中的类型异常需要等到运行时才能发现

```js
// 1. 异常需要等到运行时才能发现

const obj = {}

// obj.foo()

setTimeout(() => {
  obj.foo()
}, 1000000)
```
2. 类型不明确，就会造成函数功能有可能发生改变

```js
// 2. 函数功能可能发生改变

function sum (a, b) {
  return a + b
}

console.log(sum(100, 100))
console.log(sum(100, '100'))
```
3. 出现对对象索引器的错误用法

```js
// 3. 对象索引器的错误用法

const obj = {}

obj[true] = 100 // 属性名会自动转换为字符串

console.log(obj['true'])

```

综上，弱类型语言的弊端是十分明显的，只是在代码量小的情况下这些问题都可以通过约定的方式去规避，而对于一些开发周期特别长的大规模项目，这种‘君子约定’的方式仍然存在一定隐患，只有在语法层面的强制要求下才能提供更可靠的保证。

### 强类型的优势
1. 错误更早暴露
2. 代码更智能，编码更准确

```js
// 2. 强类型代码更智能，编码更准确

function render (element) {
  //编译器无提示
  element.className = 'container'
  element.innerHtml = 'hello world'
}
```
3. 重构更牢靠
```js
// 3. 重构更可靠

const util = {
  aaa: () => { // 不敢轻易修改属性名
    console.log('util func')
  }
}
```

4. 减少不要的类型判断

```js
// 4. 减少了代码层面的不必要的类型判断

function sum (a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('arguments must be a number')
  }

  return a + b
}
```

## 4.2静态类型检查器 Flow
### Flow概述
- 可以弥补JavaScript弱类型所带来的弊端，为JavaScript提供了更完善的类型系统

让我们在代码中通过添加类型注解的方式去标记代码中的变量以及参数的类型，根据这些类型注解检查代码中是否存在类型使用异常，从而实现开发阶段对类型异常的检查，避免了直到运行阶段才发现类型使用的错误。
```js
function sum (a: number, b: number) { // 类型注解
  return a + b
}
```

对于代码中额外的类型注解，可以在运行之前通过Babel或者Flow官方提供的模块自动去除。

### Flow快速上手
- 值得注意的是：Flow的安装路径不允许出现中文，否则会报错。

 1. 初始化package.json管理项目依赖
```
yarn init --yes
```
2. 通过yarn安装Flow
```
yarn add flow-bin --dev  // 作为项目的开发依赖安装
```
3. 使用flow之前通过注释的方式在项目代码开始的位置添加
```
// @flow
```
4. 关闭编译器自带的语法校验
```
拿VSCode举例，打开配置选项，搜索 javascript validate 
```
5. 使用yarn flow init 初始化 .flowconfig 配置文件
```
yarn flow init
```
6. 使用yarn flow可自动找到node_modules下的.bin中找到flow命令
```
yarn flow
```
7. 完成过后可以通过yarn flow stop 命令结束服务
```
yarn flow stop
```
### Flow编译移除注释
类型注解并不是JavaScript的标准语法，当我们添加类型注解过后，代码是无法正常运行的。我们可以使用工具在完成编码过后自动移除掉我们所添加的类型注解。
1. 使用官方提供的flow-remove-types移除
```
1）yarn add flow-remove-types --dev
```
```
2) yarn flow-remove-types [] -d [] //第一个参数为源代码所在目录 第二个参数为输出目录
```
2. 使用Babel配合插件移除
```
1) yarn add @babel/core @babel/cli @babel/preset-flow --dev
```
```
2) 手动在项目中添加babel配置文件 .babelrc 并在其中输入
{
  "presets": ["@babel/preset-flow"]
}
```
```
3) yarn babel [] -d [] //第一个参数为源代码所在目录 第二个参数为输出目录
```

### Flow开发工具插件
目前这种方式下，Flow检测到的代码中的问题都是输出到控制台当中的，这种体验并不直观，更好的方式是在开发工具中直接显示出类型问题。

打开VSCode的插件面板搜索flow，安装一个叫做**Flow Language Support** 的插件，这是Flow官方所提供的。

安装过后，VSCode的状态栏就会显示Flow的工作状态，而且代码中的异常也可以直接标记为红色波浪线，默认情况下只有在修改完代码过后保存才会生效，对于其他编辑器：[Flow官网给出的对所有编辑器插件的支持 ](https://flow.org/en/docs/editors/)
### Flow类型推断
根据代码使用情况，Flow可自动推断出变量的类型。
```js
/**
 * 类型推断
 *
 * @flow
 */

function square (n) {
  return n * n
}

// square('100')

square(100)
```
### Flow类型注解
- 添加类型注解可以更明确地限制类型
```js
/**
 * 类型注解
 *
 * @flow
 */

function square (n: number) { // 标记函数参数
  return n * n
}

let num: number = 100 // 标记变量

// num = 'string' // error

function foo (): number { // 标记函数返回值
  return 100 // ok
  // return 'string' // error
}

function bar (): void { // 无返回值标记为void
  // return undefined
}
```
- Flow原始类型
```js
/**
 * 原始类型
 *
 * @flow
 */

const a: string = 'foobar'

const b: number = Infinity // NaN // 100

const c: boolean = false // true

const d: null = null

const e: void = undefined

const f: symbol = Symbol()
```
- Flow数组类型
```js
/**
 * 数组类型
 *
 * @flow
 */

const arr1: Array<number> = [1, 2, 3]

const arr2: number[] = [1, 2, 3]

// 元组
const foo: [string, number] = ['foo', 100]
```
- Flow对象类型
```js
/**
 * 对象类型
 *
 * @flow
 */

const obj1: { foo: string, bar: number } = { foo: 'string', bar: 100 }

const obj2: { foo?: string, bar: number } = { bar: 100 }

const obj3: { [string]: string } = {}

obj3.key1 = 'value1'
obj3.key2 = 'value2'
```
- Flow函数类型
```js
/**
 * 函数类型
 *
 * @flow
 */

function foo (callback: (string, number) => void) {
  callback('string', 100)
}

foo(function (str, n) {
  // str => string
  // n => number
})
```
- Flow特殊类型
```js
/**
 * 特殊类型
 *
 * @flow
 */

// 字面量类型

const a: 'foo' = 'foo'

const type: 'success' | 'warning' | 'danger' = 'success'

// ------------------------

// 声明类型

type StringOrNumber = string | number

const b: StringOrNumber = 'string' // 100

// ------------------------

// Maybe 类型

const gender: ?number = undefined
// 相当于
// const gender: number | null | void = undefined
```
- Flow Mixed与Any
```js
/**
 * Mixed Any
 *
 * @flow
 */

// string | number | boolean | ....
function passMixed (value: mixed) {  // 强类型
  if (typeof value === 'string') {
    value.substr(1)
  }

  if (typeof value === 'number') {  // 明确类型
    value * value
  }
}

passMixed('string')

passMixed(100)

// ---------------------------------

function passAny (value: any) {  // 弱类型
  value.substr(1)

  value * value
}

passAny('string')

passAny(100)
```
### Flow运行环境API

```js
/**
 * 运行环境 API
 *
 * @flow
 */

// 浏览器所内置的一些API所对应的一些类型限制
const element: HTMLElement | null = document.getElementById('app')
```

## 4.3TypeScript（JavaScript的超集）
### TypeScript 概述
- 拥有更强大的类型系统
- 支持ES6+新特性
- 可编译(低至ES3，兼容性好)
- 任何一种 JavaScript 运行环境都支持
- 相比Flow，功能更强大，生态也更健全、更完善
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201008154915567.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
- 语言本身多了很多概念，学习成本增加（但TypeScript属于渐进式）
- 项目初期，TypeScript会增加一些成本（针对小项目）

### TypeScript 快速上手
 1. 初始化package.json管理项目依赖
```
yarn init --yes
```
2. 通过yarn安装TypeScript
```
yarn add typescript --dev  // 作为项目的开发依赖安装
```
3. 文件默认后缀名.ts 
4. 使用yarn tsc --init 初始化 tsconfig.json 配置文件
```
yarn tsc --init
```
5. 配置文件内"complierOptions"属性就是TypeScript编译器所对应的配置选项 
```
target：设置编译后的JavaScrpit采用的ECMAScript标准
outDir：设置编译后的输出文件目录
rootDir：设置源代码文件目录位置
strict：严格模式
...
```
6. 使用yarn tsc可自动找到node_modules下的.bin中找到tsc命令
```
yarn tsc
```
7. 如果需要中文错误消息提示
```
yarn tsc --local zh-CN
```
### TypeScript 原始类型(Primitive Types)
```js
const a: string = 'foobar'

const b: number = 100 // NaN Infinity

const c: boolean = true // false
```
在非严格模式下，string, number, boolean 都可以为空。可以在配置文件修改strictNullChecks去仅对null进行限制。
```js
const d: string = null
const d: number = null
const d: boolean = null
```
```js
const e: void = undefined

const f: null = null

const g: undefined = undefined
```
### TypeScript 标准库声明

Symbol 是 ES2015 标准中定义的成员，使用它的前提是必须确保有对应的 ES2015 标准库引用。也可以改变配置文件的target为es2015，但如果要求编译后为es5以下，则可以通过修改tsconfig.json中的 lib 选项，使其包含 ES2015标准库文件。但与此同时要加上dom标准库（dom和bom合并为dom标准库）以防止其他报错。
```js
const h: symbol = Symbol()
```
### TypeScript 作用域问题
- 默认文件中的成员会作为全局成员
- 多个文件中有相同成员就会出现冲突

解决办法1: IIFE 提供独立作用域
```js
(function () {
  const a = 123
})()
```
解决办法2: 在当前文件使用 export，也就是把当前文件变成一个模块，模块有单独的作用域
```js
const a = 123

export {}
```
### TypeScript Object类型(Object Types)
- Object类型泛指所有的非原始类型（对象、数组、函数）
```js
// object 类型是指除了原始类型以外的其它类型
const foo: object = function () {} // [] // {}
```
如果我们需要普通的对象类型，我们需要去使用类似字面量的语法，但是更专业的方式是使用接口：
```js
// 如果需要明确限制对象类型，则应该使用这种类型对象字面量的语法，或者是「接口」
const obj: { foo: number, bar: string } = { foo: 123, bar: 'string' }

// 接口的概念后续介绍
```
### TypeScript 数组类型(Array Types)
- 使用Array泛型

数组类型的两种表示方式
```js
const arr1: Array<number> = [1, 2, 3] // 纯数字组成的数组

const arr2: number[] = [1, 2, 3]
```

```js
// 如果是 JS，需要判断是不是每个成员都是数字 ->typeof
// 使用 TS，类型有保障，不用添加类型判断 ->类型注解
function sum (...args: number[]) {
  // reduce计算所有成员的总和 参数1：上次计算的结果 参数2：本次循环的当前值
  return args.reduce((prev, current) => prev + current, 0)
}
```

### TypeScript 元组类型(Tuple Types)
```js
const tuple: [number, string] = [18, 'zce'] // 元组类型 只能存对应属性

// const age = tuple[0]
// const name = tuple[1]

const [age, name] = tuple // 使用ES2015解构提取
```
```js
const entries: [string, number][] = Object.entries({ // ES2017获取对象中所有的键值数组
  foo: 123,
  bar: 456
})

const [key, value] = entries[0]
// key => foo, value => 123
```
### TypeScript 枚举类型(Enum Types)
- 枚举类型可以给一组数值取更好理解的名字
- 一个枚举中只会存在几个固定的值，不会出现超出范围的可能性
```js
const post = {
  title: 'Hello TypeScript',
  content: 'TypeScript is a typed superset of JavaScript.',
  status: 3// 3 // 1 // 0
}
```
JavaScript中并没有枚举这种数据结构，大部分场景我们可以使用对象去模拟
```js
// 用对象模拟枚举
const PostStatus = {
  Draft: 0,
  Unpublished: 1,
  Published: 2
}

const post = {
  title: 'Hello TypeScript',
  content: 'TypeScript is a typed superset of JavaScript.',
  status: PostStatus.Draft // 3 // 1 // 0
}
```
在TypeScript有专门的enum枚举类型
```js
// 标准的数字枚举
enum PostStatus {
  Draft = 0, // 使用等号
  Unpublished = 1,
  Published = 2
}
```
使用方式与对象相同PostStatus.Draft。如果不指定等号后面的值，默认枚举中的值从0累加。
```js
// 字符串枚举
enum PostStatus { // 无法自增长 必须给定值
  Draft = 'aaa',
  Unpublished = 'bbb',
  Published = 'ccc'
}
```

- 枚举类型会入侵到运行时的代码（会影响编译后的结果）

枚举类型最终会编译为一个双向的键值对对象（可以通过键获取值，并通过值获取键）。好处是可以动态的根据枚举值获取枚举名称。
```js
var PostStatus;
(function (PostStatus) {
    PostStatus[PostStatus["Draft"] = 0] = "Draft";
    PostStatus[PostStatus["Unpublished"] = 1] = "Unpublished";
    PostStatus[PostStatus["Published"] = 2] = "Published";
})(PostStatus || (PostStatus = {}));
```
```
PostStatus[0] // => Draft
```
如果代码中不会使用索引器的方式去访问枚举，则建议使用常量枚举
```js
// 常量枚举，不会侵入编译结果
const enum PostStatus {
  Draft,
  Unpublished,
  Published
}
```
```js
Object.defineProperty(exports, "__esModule", { value: true });
var post = {
    title: 'Hello TypeScript',
    content: 'TypeScript is a typed superset of JavaScript.',
    status: 0 /* Draft */ // 3 // 1 // 0
};
```

### TypeScript 函数类型(Function Types)
- 函数声明
	* 对输入输出进行约束
	* 参数个数需要完全相同（形参与实参保证完全一致）
	* 如果需要参数可选，可以在参数名称后添加'?'或者使用ES6参数默认值的特性（值得注意的是，可选参数或者默认值参数要出现在参数列表最后）
	* 接收任意个数参数可以使用ES6的...rest操作符
```js
function func1 (a: number, b: number = 10, ...rest: number[]): string {
  return 'func1'
}

func1(100, 200)

func1(100)

func1(100, 200, 300)
```
- 函数表达式
	* 接收函数的变量也有类型
	* TypeScript可以根据函数表达式推断出变量的类型
	* 如果把函数作为参数传递（回调函数），必须要约束形参的类型。可以使用类似箭头函数的方式表示参数可接受什么样的函数

```js
const func2: (a: number, b: number) => string = function (a: number, b: number): string {
  return 'func2'
}
```

### TypeScript 任意类型(Any Types)
- any是动态类型，可以接收任意参数
- TypeScript不会对any类型做类型检查，any 类型是不安全的

```js
function stringify (value: any) { // any 动态类型
  return JSON.stringify(value) // 接收任意类型参数 
}

stringify('string')

stringify(100)

stringify(true)

let foo: any = 'string'

foo = 100

// 由于可以存放任意类型的值，所以TypeScript不会对any类型做类型检查
foo.bar() //语法上不会报错
```
### TypeScript 隐式类型推断(Type Inference)
在TypeScript当中，如果没有通过类型注解去标记一个变量的类型，TypeScript会根据变量的使用情况去推断这个变量的类型，这种特性叫做隐式类型推断。
```js
let age = 18 // age 被推断为 number

age = 'string' // age类型错误
```
如果TypeScript无法推断一个变量具体的类型，这个时候会将其类型标记为any
```js
let foo // any类型

foo = 100 

foo = 'string'
```
虽然TypeScript支持隐式类型推断，而且这种隐式类型推断可以简化代码，但是仍然建议为每个变量添加明确的类型标注，便于后期理解代码。

### TypeScript 类型断言(Type assertions)
在一些特殊情况下，TypeScript无法推断一个变量的具体类型。而作为为开发者，我们根据代码的使用情况是可以明确知道代码的类型的
```js
// 假定这个 nums 来自一个明确的接口
const nums = [110, 120, 119, 112]

const res = nums.find(i => i > 0) // 返回值一定是一个数字

// 但是对于TypeScipt推断出来的类型为number|undefined
// 此时就无法将返回值直接当作数字使用
// const square = res * res

// 此时我们可以断言res为number类型
// 1.使用as关键词断言
const num1 = res as number // 推荐
// 2.在变量前面使用尖括号断言
const num2 = <number>res // 问题：JSX 下不能使用
```
- 辅助TypeScript更加明确代码当中每一个成员的类型
- 类型断言并不是类型转换（类型转换是代码运行时的概念，类型断言只是编译过程的概念）

### TypeScript 接口(Interfaces)
- 可以理解为一种规范，或者一种契约
- 一种抽象的概念，可以用来约定对象的结构
- 使用一个接口，就必须要遵循这个接口全部的约定

TypeScript 接口 最直观的体现：约定对象当中应该有哪些成员，成员的类型是什么样的
```js
interface Post {
  title: string 
  // 可以使用','分割，但更标准的语法使用';'分割，也可以省略
  content: string
}

function printPost (post: Post) {
  console.log(post.title)
  console.log(post.content)
}

printPost({
  title: 'Hello TypeScript',
  content: 'A javascript superset'
})
```
- TypeScript中的接口只是为有结构的数据做类型约束的，实际运行阶段并没有意义

- 可选成员、只读成员、动态成员
```js
interface Post {
  title: string
  content: string
  subtitle?: string  // 可选成员 '？'
  readonly summary: string // 只读成员 'readonly'
}
```
```js
interface Cache {
  [prop: string]: string // 动态成员 'prop非固定' 第一个string键的类型
}

const cache: Cache = {}

cache.foo = 'value1' // string类型键值
cache.bar = 'value2'
```

### TypeScript 类(Classes)
- 描述一类具体事物的抽象特征
- 类比到程序的角度：描述一类具体对象的抽象成员

ES6以前，JavaScript通过函数配合原型的模式模拟实现类，ES6开始，JavaScript中有了专门的class。在TypeScript中，除了可以使用所有ECMAScript中所有类的功能还添加了一些额外的功能和用法。

- TypeScript增强了class的相关语法
	* 类的属性在使用之前必须在类型当中声明（为了给属性做类型标注）

```js
class Person { // 在TypeScript中需要明确在类型中声明所拥有的一些属性
  name: string // = 'init name'
  age: number
  //在TypeScript中，类的属性必须有初始值，可以在等号后面赋值或者在构造函数中初始化
	
  constructor (name: string, age: number) {
    this.name = name // 直接通过this访问当前类的属性会报错
    this.age = age
  }

  sayHi (msg: string): void { // ES6的语法为类型声明方法
    console.log(`I am ${this.name}, ${msg}`)
  }
}
```

### TypeScript 类的访问修饰符
- private：私有属性（只能在类的内部访问）
- public：共有属性（默认）
- protected：受保护的属性（与private相似，不同的是protected子类也可访问）

### TypeScript 类的只读属性(readonly)
- 如果已经存在访问修饰符，只读属性跟在修饰符之后
- 对于只读属性，可以选择类型声明直接通过等号初始化或者在构造函数中初始化，二者选其一
- 初始化过后不允许被修改（无论内部还是外部）

### TypeScript 类与接口(interface)
- 不同的类与类之间可能有共同的特征，对于公共特征一般使用接口去抽象
- C## 以及 Java 建议接口的定义尽可能简单和细化
```js
interface Eat {
  eat (food: string): void
}

interface Run {
  run (distance: number): void
}

class Person implements Eat, Run {
  eat (food: string): void {
    console.log(`优雅的进餐: ${food}`)
  }

  run (distance: number) {
    console.log(`直立行走: ${distance}`)
  }
}

class Animal implements Eat, Run {
  eat (food: string): void {
    console.log(`呼噜呼噜的吃: ${food}`)
  }

  run (distance: number) {
    console.log(`爬行: ${distance}`)
  }
}
```

### TypeScript 抽象类(abstract)
- 与接口类似，可以用来去约束子类当中必须要有某一个成员
- 不同的是，抽象类可以包含一些具体的实现，而接口只能是成员的抽象，不包含具体的实现
- 被定义为抽象类之后就只能被继承，不能再使用new的方式去创建对应的实例对象

```js
abstract class Animal {
  eat (food: string): void {
    console.log(`呼噜呼噜的吃: ${food}`)
  }

  abstract run (distance: number): void
}

class Dog extends Animal {
  run(distance: number): void {
    console.log('四脚爬行', distance)
  }

}

const d = new Dog()
d.eat('嗯西马')
d.run(100)
```

### TypeScript 泛型(Generics)
- 指在定义函数、接口或者类时，没有去指定具体的类型，等到使用时候再去指定的特征

以函数中为例，泛型就是在声明函数时，不去制定具体类型，等到调用的时候再去传递一个具体类型，其目的是为了极大程度的复用代码。
```js
function createNumberArray (length: number, value: number): number[] {
  // Array默认any类型 使用泛型参数传递类型 这里的Array就是一个泛型类
  // 在TypeScript内部去定义Array类型的时候并不知道我们使用其存放什么样的数据
  // 使用泛型参数 在我们调用时再去传递一个具体的类型
  const arr = Array<number>(length).fill(value) // ES6 fill()填充
  return arr
}

const res = createNumberArray(3, 100)
// res => [100, 100, 100]
```
- 使用泛型把类型变成参数，在我们调用的时候再去传递这个类型
```js
function createArray<T> (length: number, value: T): T[] {
  const arr = Array<T>(length).fill(value)
  return arr
}
const res = createArray<string>(3, 'foo')
```
- 泛型就是把我们定义时不能确定的类型变成一个参数，让我们去使用时再去传递类型参数

### TypeScript 类型声明(Type Declaration)
- 在实际开发中需要使用到第三方npm模块，而这些模块不一定是通过TypeScript编写的，所以它提供的成员就不会有强类型体验

拿lodash举例
```js
//把字符串转化为驼峰格式 参数和返回值为string
import { camelCase } from 'lodash'
```
当我们直接去调用函数的时候发现并没有看到任何类型提示
```js
const res = camelCase('hello typed')
```
这种情况下需要单独的类型声明
```js
declare function camelCase (input: string): string
```
有了这样一个声明过后再去使用这个函数时就会有对应的类型限制

- 目前绝大多数哦npm模块都已经提供了对应的声明，只需要安装对应的声明模块即可

拿lodash举例，我们import时报错会发现，会建议我们去安装一个@type/lodash的模块，这个就是lodash对应的类型声明模块，需要注意的是：类型声明模块应该是一个开发模块，它里面不会提供任何的具体的代码，只是对一个模块做对应的类型声明。

- 目前越来越多的模块已经在内部集成了这种类型声明文件 
