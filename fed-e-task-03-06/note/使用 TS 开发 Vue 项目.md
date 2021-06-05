# 使用 TypeScript 开发 Vue 项目

## 19.1 环境说明

### Vue 项目中启用 TypeScript 支持

**使用 Vue CLI 脚手架工具创建 Vue 项目：**

对于全新项目，可以使用 Vue CLI 脚手架工具创建 Vue 项目

![iShot2021-04-21 19.21.58](https://public.shiguanghai.top/blog_img/iShot2021-04-21%2019.21.58.png)

**添加 Vue 官方配置的 TS 适配插件：**

对于已有项目，可以添加 Vue 官方配置的 TypeScript 适配插件

使用 `@vue/cli` 安装 TypeScript 插件：

```shell
vue add @vue/typescript
```

### 关于编辑器

要使用 TypeScript 开发 Vue 应用程序，强烈建议使用 Visual Studio Code，它为 TypeScript 提供了极好的“开箱即用”支持。如果你正在使用 单文件组件 SFC，可以安装提供 SFC 支持以及其他更多实用功能的 Vetur 插件

WebStorm 同样为 TypeScript 和 Vue 提供了“开箱即用”的支持

## 19.2 TypeScript 相关配置介绍

（1）安装了 TypeScript 相关的依赖项

dependencies 依赖：

| 依赖项                 | 说明                                      |
| :--------------------- | ----------------------------------------- |
| vue-class-component    | 提供使用 Class 语法写 Vue 组件            |
| vue-property-decorator | 在 Class 语法基础之上提供了一些辅助装饰器 |

devDependencies 依赖：

| 依赖项                           | 说明                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| @typescript-eslint/eslint-plugin | 使用 ESLint 校验 TypeScript 代码                             |
| @typescript-eslint/parser        | 将 TypeScript 转换为 AST 供 ESLint 校验使用                  |
| @vue/cli-plugin-typescript       | 使用 TypeScript + ts-loader + fork-ts-checker-webpack-plugin 进行更快的类型检查 |
| @vue/eslint-config-typescript    | 兼容 ESLint 的 typeScript 的校验规则                         |
| typescript                       | TypeScript 编译器，提供类型校验和转换 JavaScript 功能        |

（2）TypeScript 配置文件 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "strict": true,
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "types": [
      "webpack-env"
    ],
    "paths": {
      "@/*": [
        "src/*"
      ]
    },
    "lib": [
      "esnext",
      "dom",
      "dom.iterable",
      "scripthost"
    ]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

（3）shims-vue.d.ts 文件的作用

```typescript
// import xxx from 'xxx.vue'
// ts 默认无法识别 .vue 结尾的模块

// 主要用于 TypeScript 识别 .vue 文件模块
// TypeScript 默认不支持导入 .vue 模块，这个文件告诉 TypeScript 导入 .vue 文件模块都按
// VueConstructor<Vue> 类型识别处理
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
```

（4）shims-tsx.d.ts 文件的作用

```typescript
// 为 jsx 组件莫模板补充类型声明
import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
```

（5）TypeScript 模块都使用 `.ts` 后缀

## 19.3 使用 OptionsAPI 定义 Vue 组件

以往的写法：编译器类型提示不够严谨，且没有 TypeScript 编译期间的类型验证

```typescript
<script>
export default{
  data () {
    return { a : 1 }
  },
  methods: {
    test () {
      console.log(this.a)
    }
  }
}
</script>
```

**使用 OptionsAPI：**

- 组件仍然可以使用以前的方式定义（导出组件选项对象，或者使用Vue.extend()）
- 但是当我们导出一个普通的对象，此时 TypeScript 无法推断出对应的类型
- 至于 VSCode 可以推断出类型成员的原因是因为我们使用了 Vue 插件
- 这个插件明确知道我们这里导出一个 Vue 对象
- 所以我们必须使用 `Vue.extend()` 方法确保 TypeScript 能够有正常的类型推断

```typescript
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data () {
    return { a : 1 }
  },
  methods: {
    test () {
      console.log(this.a)
    }
  }
})
</script>
```

## 19.4 使用 ClassAPIs 定义 Vue 组件

**使用 Class APIs：**

在 TypeScript 下，Vue 的组件可以使用一个继承自 Vue 类型的子类表示，这种类型需要使用 Component 装饰器去修饰

装饰器函数接收的参数就是以前的组件选项对象（data、props、methods之类）

```typescript
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class App extends Vue {
  a = 1
  test () {
    console.log(this.a)
  }
}
</script>
```

类的语法只是改变了一种类的书写方式，其内部做了一层转换，会把类里面的实例成员放到了 Vue 实例的 data 内部，方法作为了类的实例成员方法

需要注意的是，由于生命周期函数的使用与方法使用类似，会优先把其当做生命周期函数对待

如果我们注册子组件只需要`components: {OtherComponent}`

使用`props` 数据：需要先用 `Vue.extend`创建一个组件，里面再声明`props`得到一个返回值，再去定义一个类来继承它

```typescript
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

// Define the props by using Vue's canonical way.
const GreetingProps = Vue.extend({
  props: {
    name: String
  }
})

// Use defined props by extending GreetingProps.
@Component
export default class Greeting extends GreetingProps {
  get message(): string {
    // this.name will be typed
    return 'Hello, ' + this.name
  }
}
</script>
```

更多详细用法可以参考 [class-component.vuejs.org](https://class-component.vuejs.org/)

## 19.5 Decorator 装饰器语法

在使用类的语法定义组件的时候，我们发现类的前面有 `@Component` 这行代码，它是干什么的呢？

这其实是一种装饰器语法，装饰器是 ES 草案中的一种新特性，不过这个草案最近可能发生重大调整，所以不建议在生产环境中使用

类的装饰器：

```js
function testable (target) {
  target.isTestable = true
}

@testable
class MyTestableClass {
  // ...
}

console.log(MyTestableClass.isTestable) // true
```

当我们定义好类并使用`@ + function`以后，回去自动调用这个 function，把这个类传递给这个函数。此时 target 就是 MyTestableClass，内部给 target 添加了一个 isTestable 的成员，因此 MyTestableClass 类就拥有了静态属性

装饰器的作用实际上就是去扩展类的属性里面的功能，具体可以参考 [ECMAScript 6入门](https://es6.ruanyifeng.com/#docs/decorator) 

## 19.6 使用 VuePropertyDecorator 创建 Vue 组件

在前面我们使用官方提供的 VueClassComponent，它的一些功能写法可能不太好，比如 props，写起来比普通写法更麻烦

所以社区中出现 [VuePropertyDecorator](https://github.com/kaorun343/vue-property-decorator)，它利用装饰器的特点做了一些简化的写法。在 VueClassComponent 基础上做了一些扩展，提供了一些快捷的装饰器

## 19.7 使用建议

个人建议：No Class APIs，只用 Options APIs

> Class 语法仅仅是一种写法而已，最终还是要转换为普通的组件数据结构
>
> 装饰器语法还没有正式定稿发布，建议了解即可，正式发布以后再选择使用也可以

使用 Options APIs 最好是使用 `export default Vue.extend({ ... })` 而不是 `export default { ... }`

