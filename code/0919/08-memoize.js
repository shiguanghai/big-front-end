// 记忆函数
const _ = require('lodash')

function getArea (r) {
  console.log(r)
  return Math.PI * r * r
}

// let getAreaWithMemory = _.memoize(getArea) 
// console.log(getAreaWithMemory(4))
// console.log(getAreaWithMemory(4))
// console.log(getAreaWithMemory(4))
// console.log(getAreaWithMemory(5))
// console.log(getAreaWithMemory(5))


// 模拟 memoize 方法的实现

function memoize (f) {
  let cache = {}
  return function () {
    let key = JSON.stringify(arguments)
    // console.log(key)
    cache[key] = cache[key] || f.apply(f, arguments)
    // console.log(cache[key]+"--")
    return cache[key]
  }
}

let getAreaWithMemory = memoize(getArea)
console.log(getAreaWithMemory(4))
console.log(getAreaWithMemory(4))
console.log(getAreaWithMemory(4))