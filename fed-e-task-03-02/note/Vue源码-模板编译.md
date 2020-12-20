

## 6.1 模板编译
### 模板编译简介

- 模板编译的主要目的是将模板 (template) 转换为渲染函数 (render)

```js
<div>
  <h1 @click="handler">title</h1>
  <p>some content</p>
</div>
```

- 渲染函数 render

```js
render (h) {
  return h('div', [
    h('h1', { on: { click: this.handler} }, 'title'),
    h('p', 'some content')
  ])
}
```

- 模板编译的作用
	* Vue 2.x 使用 VNode 描述视图以及各种交互，用户自己编写 VNode 比较复杂
	* 用户只需要编写类似 HTML 的代码 - Vue 模板，通过编译器将模板转换为返回 VNode 的 render 函数
	* .vue 文件会被 webpack 在构建的过程中转换成 render 函数

### 模板编译结果
- [代码](https://github.com/shiguanghai/vue/blob/dev/examples/12-compile/index.html)
- 带编译器版本的 Vue.js 中，使用 template 或 el 的方式设置模板

```js
<div id="app">
  <h1>Vue<span>模板编译过程</span></h1>
  <p>{{ msg }}</p>
  <comp @myclick="handler"></comp>
</div>
<script src="../../dist/vue.js"></script>
<script>
  Vue.component('comp', {
    template: '<div>I am a comp</div>'
  })
  const vm = new Vue({
    el: '#app',
    data: {
      msg: 'Hello compiler'
    },
    methods: {
      handler () {
        console.log('test')
      }
    }
  })
  console.log(vm.$options.render)
</script>
```

- 编译后 render 输出的结果
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201217162003708.png)
- 整理格式后
```js
(function anonymous() {
  with (this) {
    return _c(
      "div",
      { attrs: { id: "app" } },
      [
        _m(0),
        _v(" "),
        _c("p", [_v(_s(msg))]),
        _v(" "),
        _c("comp", { on: { myclick: handler } }),
      ],
      1
    );
  }
});
```

> 我们想要分析这段代码，就要找到 _开头 方法的定义

**编译生成的函数的位置**

- _c()
	* _c就是createElement() 方法
	* [src/core/instance/render.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/render.js)
- _m() / _v() / _s()
	* 相关的渲染函数(_开头的方法定义)
	* [src/core/instance/render-helpers/index.js](https://github.com/shiguanghai/vue/blob/dev/src/core/instance/render-helpers/index.js)

```js
// instance/render-helps/index.js
target._v = createTextVNode
target._s = toString
target._m = renderStatic

// core/vdom/vnode.js
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// shared/util
// 将一个值转换为实际渲染的字符串
export function toString (val: any): string {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

// 在 instance/render-helps/render-static.js
// 用于渲染静态树的运行时帮助程序。
export function renderStatic (
  index: number,
  isInFor: boolean
): VNode | Array<VNode> {
  const cached = this._staticTrees || (this._staticTrees = [])
  let tree = cached[index]
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  // 如果已经渲染了静态树，并且不在v-for里面，我们可以重用同样的树。
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  // 如果没有，从staticRenderFns这个数组中获取静态根节点对应的render函数调用
  // 此时就生成vnode节点，把结果缓存
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  )
  // 把当前返回的vnode节点标记为静态的
  // 将来调用patch函数的时候，内部会判断如果当前vnode为静态，则不再对比节点差异
  markStatic(tree, `__static__${index}`, false)
  return tree
}
```

- 我们再来看这段代码

```js
<div id="app">
  <h1>Vue<span>模板编译过程</span></h1>
  <p>{{ msg }}</p>
  <comp @myclick="handler"></comp>
</div>
```
```js
(function anonymous() {
  // 匿名函数调用with 代码块使用this对象的成员可省略this
  with (this) {
    return _c(
      "div", // tag标签，对应<div>
      { attrs: { id: "app" } }, // data描述tag，对应id="app"
      [ // children设置tag子节点
        _m(0), // 处理静态内容做优化处理，对应<h1>
        _v(" "), // 创建空白的文本节点，对应<h1>和<p>之间的空白位置(换行)
        // 创建<p>对应的vnode 第二个位置(数组包裹的文本的vnode节点)
        _c("p", [_v(_s(msg))]), // 把用户输入数据转化为字符串(_s)
        _v(" "),
        _c("comp", { on: { myclick: handler } }), // 创建自定义组件对应的vnode
      ],
      1 // 后续如何对children处理，将children拍平为一维数组
    );
  }
});
```

### Vue Template Explorer
```js
<div id="app">
  <select>
    <option>
      {{ msg  }}
    </option>
  </select>
  <div>
    hello
  </div>
</div>
```
- [vue-template-explorer](http://suo.im/6agQFQ)
	* Vue 2.6 把模板编译成 render 函数的工具
```js
function render() {
  with(this) {
    return _c('div', {
      attrs: {
        "id": "app"
      }
    }, [_c('select', [_c('option', [_v("\n      " + _s(msg) + "\n    ")])]),
      _c('div', [_v("\n    hello\n  ")])
    ])
  }
}
```
- [vue-next-template-explorer](http://suo.im/5VeqVC)
	* Vue 3.0 beta 把模板编译成 render 函数的工具
```js
import { toDisplayString as _toDisplayString, createVNode as _createVNode, openBlock as _openBlock, createBlock as _createBlock } from "vue"

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createBlock("div", { id: "app" }, [
    _createVNode("select", null, [
      _createVNode("option", null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
    ]),
    _createVNode("div", null, " hello ")
  ]))
}

// Check the console for the AST
```
- 通过观察编译生成的render函数，总结
	* 在使用vue2.x的模板时，标签内的文本内容尽量不要添加多余的空白
	* vue3编译后的render函数已经去除了标签内多余的空白

### 模板编译的入口

**编译入口**

- [src/platforms/web/entry-runtime-with-compiler.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/entry-runtime-with-compiler.js)

```js
Vue.prototype.$mount = function (
  ...
  // 把 template 转换成 render 函数
  const { render, staticRenderFns } = compileToFunctions(template, {
    outputSourceRange: process.env.NODE_ENV !== 'production',
    shouldDecodeNewlines,
    shouldDecodeNewlinesForHref,
    delimiters: options.delimiters,
    comments: options.comments
  }, this)
  options.render = render
  options.staticRenderFns = staticRenderFns
  ...
)
```
- [src/platforms/web/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/platforms/web/compiler/index.js)
```js
import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
```
- [src/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/index.js)
	* baseCompile(template.trim(), finalOptions)
```js
// `createCompilerCreator`允许创建使用替代解析器/优化器/代码生成的编译器，
// 例如SSR优化编译器。在这里，我们只是使用默认的部分导出一个默认的编译器。
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  ...
})
```
- [src/compiler/create-compiler.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/create-compiler.js)
	* complie(template, options)
	* 内部把 createCompiler() 中和平台相关的选项参数和用户传入的参数进行合并
	* 调用 baseCompile 把合并后的选项参数传递给它
```js
export function createCompilerCreator (baseCompile: Function): Function {
  // baseOptions 平台相关的options
  // src\platforms\web\compiler\options.js 中定义
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      ...
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

- [src/compiler/to-function.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/to-function.js)
	* compileToFunctions
```js
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    ...
  }
}
```

- 调试 `compileToFunctions()` 执行过程，生成渲染函数的过程
	* compileToFunctions: [src/compiler/to-function.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/to-function.js)
	* complie(template, options)：[src/compiler/create-compiler.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/create-compiler.js)
	* baseCompile(template.trim(), finalOptions)：[src/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/index.js)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201216220254762.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
**模板编译过程**

- 解析、优化、生成

## 6.2 模板编译过程
### compileToFunctions
- [src/compiler/to-function.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/to-function.js)

```js
export function createCompileToFunctionFn (compile: Function): Function {
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    // 防止污染 vue 的options 故克隆一份
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn
    ...

    // check cache
    // 1. 读取缓存中的 CompiledFunctionResult 对象，如果有直接返回
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    // 2. 把模板编译为编译对象(render, staticRenderFns)，字符串形式的js代码
    const compiled = compile(template, options)
    ...

    // 3. 把字符串形式的js代码转换成js方法
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })
    ...
    
    // 4. 缓存并返回res对象(render, staticRenderFns方法)
    return (cache[key] = res)
  }
}
```
### compile
- [src/compiler/create-compiler.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/create-compiler.js)

```js
export function createCompilerCreator (baseCompile: Function): Function {
  // baseOptions 平台相关的options
  // src\platforms\web\compiler\options.js 中定义
  return function createCompiler (baseOptions: CompilerOptions) {
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // 合并 baseOptions 和 complice函数传递过来的options
      const finalOptions = Object.create(baseOptions)
      // 处理编译过程中出现的错误和信息
      const errors = []
      const tips = []

      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        ...
      }

      finalOptions.warn = warn

      // 通过 baseCompile 把模板编译成 render函数
      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
```

### baseCompile
- [src/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/index.js)
```js
// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// `createCompilerCreator`允许创建使用替代解析器/优化器/代码生成的编译器，
// 例如SSR优化编译器。在这里，我们只是使用默认的部分导出一个默认的编译器。
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 把模板转换成 ast 抽象语法树
  // 抽象语法树，用来以树形的方式描述代码结构
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 优化抽象语法树
    optimize(ast, options)
  }
  // 把抽象语法树生成字符串形式的 js 代码
  const code = generate(ast, options)
  return {
    ast,
    // 渲染函数
    render: code.render,
    // 静态渲染函数，生成静态 VNode 树
    staticRenderFns: code.staticRenderFns
  }
})
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121622092287.png)
整个过程分为三个阶段：

1. parse，将templat模板字符串转成AST抽象语法树
2. optimize，标注静态节点，优化抽象语法树
3. generate，把抽象语法树转换成字符串形式的js代码，生成render表达式
### baseCompile-AST
**什么是抽象语法树**

- 抽象语法树简称 AST (Abstract Syntax Tree)
- 使用对象的形式描述树形的代码结构
- 此处的抽象语法树是用来描述树形结构的 HTML 字符串

**为什么要使用抽象语法树**

- 模板字符串转换成 AST 后，可以通过 AST 对模板做优化处理
- 标记模板中的静态内容，在 patch 的时候直接跳过静态内容
- 在 patch 的过程中静态内容不需要对比和重新渲染

**获取 AST**

- 查看得到的 AST tree
	* [astexplorer](https://astexplorer.net/#/gist/30f2bd28c9bbe0d37c2408e87cabdfcc/1cd0d49beed22d3fc8e2ade0177bb22bbe4b907c)
### baseCompile-parse
- 解析器将templat模板解析为抽象语树 AST，只有将模板解析成 AST 后，才能基于它做优化或者生成代码字符串
- [src/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/index.js)
```js
// 把模板转换成 ast 抽象语法树
// 抽象语法树，用来以树形的方式描述代码结构
const ast = parse(template.trim(), options)
```
- [src/compiler/parser/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/parser/index.js)
```js
export function parse (
  template: string,
  options: CompilerOptions
): ASTElement | void {
  // 1. 解析 options
  ...

  // 2. 对模板解析
  parseHTML(template, {
    // 解析过程中的回调函数，生成 AST
    // start end chars comment
    ...
  })
  // 存储的就是解析好的AST对象
  return root
}
```

- [src/compiler/parser/html-parser.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/parser/html-parser.js)

```js
/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */
// HTML解析器 作者：John Resig (ejohn.org) 修改：Juriy "kangax" Zaytsev 原代码：Erik Arvidsson (MPL-1.1 OR Apache-2.0 OR GPL-2.0-or-later)
// 借鉴一个开源库 simplehtmlparser
// 文件中定义了很多正则表达式
// 作用是来匹配 HTML 字符串模板中的内容

...
export function parseHTML (html, options) {
  ...
  // 遍历html模板字符串
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<')
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              // 如果当前找到注释标签 并且调用 options.comment方法后
  			  // 会把处理完的文本截取掉 继续去处理剩余的部分
 			  // 这个 comment 是调用 parseHTML 的时候传递进来的方法
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3)
            }
            advance(commentEnd + 3)
            continue
          }
        }
        
        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 通过正则表达式来匹配是否是条件注释
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:
        const doctypeMatch = html.match(doctype)
        // 通过正则表达式来匹配是否是文档声明
        if (doctypeMatch) {
          ...
        }

        // End tag:
        const endTagMatch = html.match(endTag)
        // 通过正则表达式来匹配是否是结束标签
        if (endTagMatch) {
          ...
        }

        // Start tag:
        const startTagMatch = parseStartTag()
        // 通过正则表达式来匹配是否是开始标签
        if (startTagMatch) {
          // 函数内最终调用了 options.start()
          handleStartTag(startTagMatch)
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1)
          }
          continue
        }
      }
      ...
    }    
  }
}
```
> **这里仅来演示 start 方法，其他几个方法类似**，当 parseHTML 处理完毕就把 模板字符串 转化成了 AST对象 最后返回

- options.start是在调用parseHTML的时候传递进来的
	* **start** end chars comment 都是处理完对应的内容之后调用的
- **start** 方法是在解析到 **开始标签** 的时候调用的

1. 方法中首先调用了createASTElement `let element: ASTElement = createASTElement(tag, attrs, currentParent)`
```js
export function createASTElement (
  tag: string,
  attrs: Array<ASTAttr>,
  parent: ASTElement | void
): ASTElement {
  return {
    type: 1,
    tag,
    attrsList: attrs, // 标签的属性数值
    attrsMap: makeAttrsMap(attrs), // 转化为对象
    rawAttrsMap: {},
    parent,
    children: []
  }
}
```
> 这个函数就是返回了一个AST对象

2. 当生成 ASTElement 之后开始给AST的各种属性赋值
3. 开始处理指令 `processPre(element)` 用来处理 v-pre 指令
```js
function processPre (el) {
  // 调用getAndRemoveAttr获取v-pre指令 再从AST移除对应属性
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    // 如果有v-pre 记录属性
    el.pre = true
  }
}
```
4. 处理结构化指令 v-for v-if v-once
```js
processFor(element)
processIf(element)
processOnce(element)
```

> parse 函数内部处理过程中会依次去遍历html模板字符串，把其转换成AST对象，html中的属性和指令都会记录在AST对象的相应属性上
### baseCompile-optimize
- 优化抽象语法树，检测子节点中是否是纯静态节点
- 一旦检测到纯静态节点（对应的DOM子树永远不会发生变化）
	* 提升为常量，重新渲染的时候不在重新创建节点
	* 在 patch 的时候直接跳过静态子树
- [src/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/index.js)
```js
if (options.optimize !== false) {
  // 优化抽象语法树
  optimize(ast, options)
}
```
- [src/compiler/optimizer.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/optimizer.js)
```js
/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
// 优化的目的：标记抽象语法树的静态节点，即DOM中永远不需要改变的部分
// 当标记完静态子树后，将来就不需要进行渲染，在patch的时候直接跳过静态子树
// 一旦我们检测到这些子树，我们就可以做到： 
// 1. 将它们提升为常量，这样我们就不再需要在每次重新渲染时为它们创建新的节点；
// 2. 在修补过程中完全跳过它们。
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  // 判断root，是否传递 AST 对象
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 标记静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 标记静态根节点
  markStaticRoots(root, false)
}
```

- markStatic
```js
function markStatic (node: ASTNode) {
  // 判断当前 astNode 是否是静态的
  node.static = isStatic(node)
  // 元素节点
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    // 不要把组件槽的内容做成静态的，这样就避免了
    // 1.组件无法突变槽节点
    // 2.静态槽内容热重装失败。
    // 是组件，不是slot，没有inline-template
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 遍历 children
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      // 标记静态
      markStatic(child)
      if (!child.static) {
        // 如果有一个 child 不是 static，当前 node 不是static
        node.static = false
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}
```
- markStaticRoots
```js
function markStaticRoots (node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 如果一个元素内只有文本节点，此时这个元素不是静态的Root
    // Vue 认为这种优化会带来负面的影响
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    // 检测当前节点的子节点中是否有静态的Root
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}
```
### baseCompile-generate
- 把抽象语法树转换成字符串形式的js代码，生成render表达式
- [src/compiler/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/index.js)

```js
// 把抽象语法树生成字符串形式的 js 代码
const code = generate(ast, options)
```
- [src/compiler/codegen/index.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/codegen/index.js)
```js
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  // 代码生成过程中使用到的状态对象
  const state = new CodegenState(options)
  // AST存在，调用genElement生成代码
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}
```
- CodegenState
```js
export class CodegenState {
  options: CompilerOptions;
  warn: Function;
  transforms: Array<TransformFunction>;
  dataGenFns: Array<DataGenFunction>;
  directives: { [key: string]: DirectiveFunction };
  maybeComponent: (el: ASTElement) => boolean;
  onceId: number;
  staticRenderFns: Array<string>;
  pre: boolean;

  constructor (options: CompilerOptions) {
    this.options = options
    this.warn = options.warn || baseWarn
    this.transforms = pluckModuleFunction(options.modules, 'transformCode')
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    this.directives = extend(extend({}, baseDirectives), options.directives)
    const isReservedTag = options.isReservedTag || no
    this.maybeComponent = (el: ASTElement) => !!el.component || !isReservedTag(el.tag)
    this.onceId = 0
    this.staticRenderFns = [] // 存储静态根节点生成的代码
    this.pre = false // 记录当前处理的节点是否是用v-pre标记的
  }
}
```
- genElement
```js
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre
  }

  // 处理静态根节点，如果已经被处理过则不再处理
  // staticProcessed 标记当前节点是否已经处理，genElement会被递归调用，防止重复处理节点
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) { // 处理 v-once指令
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) { // 处理 v-for指令
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) { // 处理 v-if指令
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) { // 不是静态
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') { // 处理 slot标签
    return genSlot(el, state)
  } else {
    // component or element
    let code
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      let data
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        // 生成元素的属性/指令/事件等
        // 处理各种指令，包括 genDirectives（model/text/html）
        data = genData(el, state)
      }
      // 处理子节点 把el中的子节点转换成creatElement中需要的数组形式
      // 把数组中的每一个AST对象通过调用genNode生成对应的代码形式
      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code)
    }
    return code
  }
}
```
- genChildren
```js
// 首先会判断AST对象是否有子节点

// 核心代码
const gen = altGenNode || genNode
// 调用数组的每一个元素，使用获取到的gen()对每一个元素处理并返回
// map中最终把所有的子节点转换成了相应的代码
// 通过join把数组中的元素使用'，'分割返回一个字符串
return `[${children.map(c => gen(c, state)).join(',')}]${
  normalizationType ? `,${normalizationType}` : ''
}`
```
- genNode
```js
function genNode (node: ASTNode, state: CodegenState): string {
  // 判断当前AST对象类型
  if (node.type === 1) { // 标签
    return genElement(node, state)
  } else if (node.type === 3 && node.isComment) { // 注释节点
    // 生成_e，创建一个被标识为comment的vnode节点
    return genComment(node)
  } else { // 文本节点
    return genText(node)
  }
}
```

> 到此时，我们还没有看到静态根节点是如何处理的，generate最后返回`render`和
    `staticRenderFns`，render是对应的AST对象生成的VNode代码的字符串形式，但是staticRenderFns这个数组到目前为止还是空的

**接下来来看`staticRenderFns`是在什么位置添加元素的，以及添加的元素是什么**

- 在 genElement 中，如果el是静态根节点且没有被处理过的话，调用了genStatic
```js
// 处理静态根节点，如果已经被处理过则不再处理
// staticProcessed 标记当前节点是否已经处理，genElement会被递归调用，防止重复处理节点
if (el.staticRoot && !el.staticProcessed) {
  return genStatic(el, state)
}
```
- genStatic
```js
// hoist static sub-trees out
function genStatic (el: ASTElement, state: CodegenState): string {
  el.staticProcessed = true
  // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.
  // 有些元素（模板）需要在v-pre节点里面有不同的表现
  // 所有的pre节点都是静态的根节点，所以我们可以用这个位置来包裹状态变化，并在退出预节点时将其重置。
  const originalPreState = state.pre
  if (el.pre) {
    state.pre = el.pre
  }
  // 给 staticRenderFns 添加元素
  // 把静态根节点转换成生成Vnode的对应js代码
  // 此处调用了genElement，再次处理el的时候，此时el的staticProcessed已经被标记为了true
  // 静态根节点不再满足genElement前面的判断直接进入else生成对应的代码
  // （使用数组是因为一个模板中可能有多个静态子节点，
  // 这里是先把每一个静态子树对应的代码进行存储，
  // 最后返回的是当前节点对应的代码）
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
  // 当处理完当前节点后，再把原始状态的 state还原
  state.pre = originalPreState
  // 返回了_m的调用，传入的是当前节点在staticRenderFns数组中对应的索引（也就是把刚刚生成的代码传递进来）
  // 注意：这里最终实际传入的是函数的形式（最终这些字符串形式的代码都会被转换为函数）
  return `_m(${
    state.staticRenderFns.length - 1
  }${
    el.staticInFor ? ',true' : ''
  })`
}
```
- _m:（renderStatic）部分回顾
```js
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  // 如果已经渲染了静态树，并且不在v-for里面，我们可以重用同样的树。
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  // 如果没有，从staticRenderFns这个数组中获取静态根节点对应的render函数调用
  // 此时就生成vnode节点，把结果缓存
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  )
  // 把当前返回的vnode节点标记为静态的
  // 将来调用patch函数的时候，内部会判断如果当前vnode为静态，则不再对比节点差异
  markStatic(tree, `__static__${index}`, false)
  return tree
```

> 到这里，静态根节点的处理过程就解释完毕。但是我们只看到了把静态根节点转换成字符串形式的代码，接下来我们再来看一下把字符串转换成函数的过程

- [src/compiler/to-function.js](https://github.com/shiguanghai/vue/blob/dev/src/compiler/to-function.js)
```js
// 3. 把字符串形式的js代码转换成js方法
res.render = createFunction(compiled.render, fnGenErrors)
res.staticRenderFns = compiled.staticRenderFns.map(code => {
  return createFunction(code, fnGenErrors)
})
```
```js
function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}
```

## 6.3 模板编译过程调试
- [调试代码](https://github.com/shiguanghai/vue/blob/dev/examples/13-ast/index.html)
```js
<div id="app">
  <h1>Vue<span>模板编译过程</span></h1>
  <div>{{ msg }}<p>hello</p></div>
  <div>是否显示</div>
</div>
<script src="../../dist/vue.js"></script>
<script>
  const vm = new Vue({
    el: '#app',
    data: {
      msg: 'Hello compiler',
      isShow: false
    },
    methods: {
      handler () {
        console.log('test')
      }
    }
  })
</script>
```
- 设置断点
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218224529632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 刷新并F11进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218224749518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 使用模板字符串作为key来缓存中查找是否有编译好的渲染函数，如果有直接返回，否则继续往下执行
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218224852864.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 首次执行还没有缓存渲染函数，继续执行，调用compile函数开始编译模板，F11进入compile函数。这个函数中首先合并options选项
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218225141491.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 往下找到调用baseCompile的位置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218225251374.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 进入baseCompile，这是模板编译的核心位置，做了三件事：1.把模板转换成AST对象，2.优化AST对象，3.把优化后的AST对象转换成字符串形式的代码
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218225340155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- F10跳过函数的运行看ast对象结果：最外层type是1、tag是div、还有一些attrs记录标签的属性，以及children和parent。当前的parent是undefined，展开children
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218225623820.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 里面第一个节点是h1，展开后也有与上层相同的属性，parent是外层div，但是此时没有看到static相关的属性
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218225853146.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 接着执行完优化的函数，再来看ast对象，此时的div中有static属性，它不是静态的，而此时children中的h1的static和staticRoot都是true，是静态根节点，而最后的div，它的static是true而staticRoot是false，是静态节点而不是静态根节点，这个div中只有文本内容没有子标签
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218231135298.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218231621787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 继续往下执行，执行完generate后，生成了对应的字符串形式的代码，code中可以看到：render是整个模板生成的对应的代码，staticRenderFns是静态根节点对应的代码。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218232118749.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 再来看ast对象，找到children中的h1，里面多了一个staticProcessed被标记为处理完毕
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218232433296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 到现在，字符串形式的代码都生成了，继续往下执行，找到把字符串形式的代码转换成函数的位置，baseCompile执行完毕后会返回相应的结果，回到compile函数中，继续往下执行，记录编译过程中的错误，返回编译好的对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218232915958.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 回到调用的位置，也就是模板编译的入口函数compileToFunctions
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218233029475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 跳转到createFunction这里，F11进入
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020121823313540.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 这里把字符串形式的代码通过new Function转换为了一个匿名函数，把结果记录到res.render
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218233202704.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 此时的render就是渲染函数（是刚刚生成的匿名函数），再往后把staticRenderFns数组中的字符串都调用createFunction转换成匿名函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218233639518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 往后执行，最终把生成的结果缓存，然后返回
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218233705464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
- 现在compileToFunctions执行完毕，把函数执行的结果解构出来，分别挂载到Vue实例选项的render和staticRenderFns
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218233942153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)

> 到此，整个模板编译的过程就调试完了

## 6.4 模板编译过程总结
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218234256724.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70)
