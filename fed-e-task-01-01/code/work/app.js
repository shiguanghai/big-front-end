const fp = require('lodash/fp')
const { Maybe, Container } = require('./support')
// let ex4 = function (n) {
//     if(n) {
//         return parseInt(n)
//     }
// }
// console.log(ex4('100'))
let ex4 = n => Maybe.of(n).map(parseInt)._value;
console.log(ex4('100'))