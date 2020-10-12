

// setTimeout(function(){
// 	var a = 'hello'
// 	setTimeout(function(){
// 		var b = 'lagou'
// 		setTimeout(function(){
// 			var c = 'I ❤ U'
// 			console.log(a + b + c)
// 		},10)
// 	},10)
// },10)

// function fn(parp) {
//     const promise = new Promise((resolved, rejected) => {
//        setTimeout(()=>resolved(parp), 10)
//     });
//     return promise;
//  }
 
//  fn()
//     .then(() => fn("hello"))
//     .then(value => fn(value+"lagou"))
//     .then(value => fn(value+"I ❤ U"))
//     .then(value => console.log(value))

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

// let isLastInStock = function (cars) {
//     // 获取最后一条数据
//     let last_car = fp.last(cars)
//     // 获取最后一条数据的 in_stock 属性值
//     return fp.prop('in_stock', last_car)
// }

// let isLastInStock = fp.flowRight(fp.prop('in_stock'), fp.last)

// console.log(isLastInStock(cars))

// let isFirstCarName = fp.flowRight(fp.prop('name'), fp.head)
// //fp.first可替换为fp.head

// console.log(isFirstCarName(cars))

// let _average = function (xs) {
//     return fp.reduce(fp.add, 0, xs)/xs.length
// }// <-无须改动

// let averageDollarValue = function (cars){
//     let dollar_values = fp.map(function(car){
//         return car.dollar_value
//     }, cars)
//     return _average(dollar_values)
// }

// // let averageDollarValue = fp.flowRight(_average,fp.map(car=>car.dollar_value))
// console.log(averageDollarValue(cars))

// let averageDollorValue = fp.flowRight(_average, fp.map(fp.curry(fp.prop)('dollar_value')))
// console.log(averageDollorValue(cars))

// console.log(_average([1,2,3,4,6]))
// console.log(averageDollarValue(cars))

let _underscore = fp.replace(/\s+/g, '_') // <-- 无须改动，并在 sanitizeNames中使用它

// console.log(fp.flowRight(fp.toLower, _underscore)(["Hello World"]))

// let sanitizeNames = fp.flowRight(fp.map(fp.flowRight(fp.toLower, _underscore)))
let sanitizeNames = fp.flowRight(fp.map(_underscore), fp.map(fp.toLower), fp.map(car => car.name))
console.log(sanitizeNames(cars))


// support.js
// class Container {
//     static of(value) {
//         return new Container(value)
//     }
//     constructor(value) {
//         this.value = value
//     }
//     map(fn) {
//         return Container.of(fn(this.value))
//     }
// }
// class Maybe {
//     static of(x) {
//         return new Maybe()
//     }
//     isNothing() {
//         return this._value === null ||
//         this._value === undefined
//     }
//     constructor(x) {
//         this._value = x
//     }
//     map(fn) {
//         return this.isNothing() ? this :
//         Maybe.of(fn(this._value))
//     }
// }
// module.exports = { Mayde, Container }

// // app.js
// const fp = require('lodash/fp')
// const { Mayde, Container } = require('./support')
// let Maybe = Maybe.of([5, 6, 1])
// let ex1 = () => {
//     // 你需要实现的函数。。。
// }

// // app.js
// const fp = require('lodash/fp')
// const { Mayde, Container } = require('./support')
// let xs = Container.of(['do', 'ray',
// 'me', 'fa', 'so', 'la', 'ti', 'do'])
// let ex2 = () => {
//     // 你需要实现的函数。。。
// }

// // app.js
// const fp = require('lodash/fp')
// const { Mayde, Container } = require('./support')
// let safeProp = fp.curry(function (x, o){
//     return Maybe.of(o[x])
// })
// let user = { id:2, name: 'Albert' }
// let ex3 = () => {
//     // 你需要实现的函数。。。
// }

// // app.js
// const fp = require('lodash/fp')
// const { Mayde, Container } = require('./support')
// let ex4 = function (n) {
//     if(n) {
//         return parseInt(n)
//     }
// }