// 强类型的优势

// 1. 强类型代码错误更早暴露

// 2. 强类型代码更智能，编码更准确

function render (element) {
  //编译器无提示
  element.className = 'container'
  element.innerHtml = 'hello world'
}

// =================================

// 3. 重构更可靠

const util = {
  aaa: () => { // 不敢轻易修改属性名
    console.log('util func')
  }
}

// =================================

// 4. 减少了代码层面的不必要的类型判断

function sum (a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('arguments must be a number')
  }

  return a + b
}
