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
