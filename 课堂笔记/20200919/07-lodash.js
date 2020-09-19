// 演示 lodash
// first / last / toUpper / reverse / each / includes / find / findIndex
const _ = require('lodash')//引用

const array = ['jack', 'tom', 'lucy', 'kate']

console.log(_.first(array))
console.log(_.last(array))

console.log(_.toUpper(_.first(array)))//大写JACK

console.log(_.reverse(array))//颠倒数组中的元素

const r = _.each(array, (item, index) => {//farEach
  console.log(item, index)
})

console.log(r)

// _.find
