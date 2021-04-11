# Vue3.0 Composition API

## 15.1 Composition API 简介

这里先来演示 [上一章](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/Vue3.0%E4%BB%8B%E7%BB%8D.html#_15-3-composition-api) 获取鼠标位置的案例，[案例代码](https://github.com/shiguanghai/big-front-end/tree/master/fed-e-task-03-05/code/03-composition-api)

- createApp

```html
 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app">
    x: {{ position.x }} <br>
    y: {{ position.y }}
  </div>
  <script type="module">
    import { createApp } from './node_modules/vue/dist/vue.esm-browser.js'

    const app = createApp({
      data () {
        return {
          position: {
            x: 0,
            y: 0
          }
        }
      }
    })
    console.log(app)

    app.mount('#app')

  </script>
</body>
</html>
```

这里我们将项目跑起来，把 Vue 对象展开，这里的成员比 Vue2 的成员要少很多，且这些成员都没有使用 `$` 开头，说明未来我们基本不用给这个对象上新增成员

![image-20210324215622747](https://public.shiguanghai.top/blog_img/image-20210324215622747.png)

这里我们可以看到 `component`、`directive`、`mixin`还有`use`，和以前的使用方式都是一样的。`$mount -> mount`、`$destroy -> unmount`

接下来来看 Composition API 的使用，我们会用到一个新的选项`setup()`，它是 Composition API 的入口

- 第一个参数 props 用来接收外部传入的参数，props 是一个响应式的对象，不能被解构

- 第二个参数 context对象，attrs、emit、slots

- setup() 需要返回对象，使用在模板、methods、computed以及生命周期的钩子函数中

- 执行时机：props被解析执行完毕，组件实例被创建之前执行的

- setup() 内部无法通过 this 获取到组件的实例（未被创建）， 因此也无法访问到 data、computed、methods。setup() 内部的 this 此时指向 undefined

```js
const app = createApp({
  setup () {
    // 第一个参数 props
    // 第二个参数 context对象，attrs、emit、slots
    const position = {
      x: 0,
      y: 0
    }

    return {
      position
    }
  },
  mounted () { // 修改 position 的值证明其不是响应式
    this.position.x = 100
  }
})
```

运行后发现并没有重新渲染，说明 position 此时不是响应式的，接下来我们将其修改为响应式对象，最终我们要实现的效果是鼠标的位置改变展示的数据随之改变

过去我们在`data`选项中设置响应式的数据，此处还可以这么做，但是为了让某一个逻辑的所有代码都能够被封装到一个函数中，Vue3 中提供了一个新的 API 让我们创建响应式对象 - `reactive`

`reactive`函数的作用是把一个对象转换成响应式对象，并且该对象的嵌套属性也都会转换为响应式对象，它返回的是是一个`Proxy`对象，也就是代理对象

```html
<script type="module">
  import { createApp, reactive } from './node_modules/vue/dist/vue.esm-browser.js'

  const app = createApp({
    setup () {
      // 第一个参数 props
      // 第二个参数 context对象，attrs、emit、slots
      const position = reactive({
        x: 0,
        y: 0
      })

      return {
        position
      }
    },
    mounted () { // 修改 position 的值证明其不是响应式
      this.position.x = 100
    }
  })
  console.log(app)

  app.mount('#app')

</script>
```

此时的 `position`已经是响应式对象

![image-20210324223256335](https://public.shiguanghai.top/blog_img/image-20210324223256335.png)

## 15.2 生命周期钩子函数

接下来我们要注册鼠标移动的事件，当鼠标移动的时候显示当前鼠标的位置。当组件被卸载的时候，鼠标移动的事件也要被移除

注册 `mousemove` 事件可以在 `mounted`中实现，但是我们最终的目标是让获取鼠标位置的逻辑封装到一个函数中让任何组件都可以重用，此时使用`mounted`选项就不再合适了。

我们在 `setup()` 中也可以使用组件生命周期的钩子函数，但是需要在生命周期钩子函数前面加上`on`然后首字母大写

![image-20210325214246421](https://public.shiguanghai.top/blog_img/image-20210325214246421.png)

另外`setup()`是在组件初始化之前执行的，是在`beforeCreate`和`created`之间执行的，所以在二者之间的代码都可以放在`setup()`函数中，二者不需要在`setup()`有对应的实现

我们需要在`setup()`中使用`onMounted`钩子函数注册鼠标移动的事件，还需要在`onUnmounted`中移除鼠标移动的事件

```html
<script type="module">
  import { createApp, reactive, onMounted, onUnmounted } from './node_modules/vue/dist/vue.esm-browser.js'

  const app = createApp({
    setup () {
      // 第一个参数 props
      // 第二个参数 context对象，attrs、emit、slots
      const position = reactive({
        x: 0,
        y: 0
      })

      // 定义事件处理函数
      const update = e => {
        position.x = e.pageX
        position.y = e.pageY
      }

      onMounted(() => {
        window.addEventListener('mousemove', update)
      })

      onUnmounted(() => {
        window.removeEventListener('mousemove', update)
      })

      return {
        position
      }
    }
  })
  
  app.mount('#app')

</script>
```

最后我们来重构代码，因为我们最终的目标是把获取鼠标位置这个功能封装到一个函数中。

```html
<script type="module">
  import { createApp, reactive, onMounted, onUnmounted } from './node_modules/vue/dist/vue.esm-browser.js'

  function useMousePosition () {
    // 第一个参数 props
    // 第二个参数 context对象，attrs、emit、slots
    const position = reactive({
      x: 0,
      y: 0
    })

    // 定义事件处理函数
    const update = e => {
      position.x = e.pageX
      position.y = e.pageY
    }

    onMounted(() => {
      window.addEventListener('mousemove', update)
    })

    onUnmounted(() => {
      window.removeEventListener('mousemove', update)
    })

    return position
  }

  const app = createApp({
    setup () {
      const position = useMousePosition()
      return {
        position
      }
    }
  })

  app.mount('#app')

</script>
```

![image-20210325221528455](https://public.shiguanghai.top/blog_img/image-20210325221528455.png)

同时我们思考一个问题：如果我们使用 Options API 来实现这个功能的话我们需要把`position`数据定义在 `data` 中，把处理的方法 `update` 定义在 `methods` 中，生命周期的钩子函数还需要在一个单独的位置书写，这样我们找同一个逻辑的代码就会很麻烦

而现在所有跟这个逻辑相关的代码都在这个函数中，而且当前这个函数可以放到一个模块中，将来在任何组件中都可以使用

## 15.3 reactive、toRefs、ref

接下来介绍 Composition API 中的三个函数：`reactive`、`toRefs` 和 `ref`，这三个函数都是构建响应式数据的

- `reactive`：**把 一个对象 转换成 响应式/代理对象**
- `toRefs`：**把 一个响应式/代理对象的所有属性 都转换成 响应式对象**
- `ref`：**把 普通数据 转换成 响应式数据**

> `toRefs` 在处理对象属性时类似 `ref`，通过 `toRefs` 处理 `reactive` 返回的代理对象可以进行解构操作

### reactive

前面我们提到 `reactive` 函数的作用是**把一个对象转换成响应式对象**，并且该对象的嵌套属性也都会转换为响应式对象，它返回的是是一个`Proxy`对象，也就是**代理对象**

我们先从一个问题出发：我们在刚刚案例中的`setup()`调用了 `useMousePosition()` 返回了一个响应式对象，又把它返回给当前的组件使用

```js
setup () {
  const position = useMousePosition()
  return {
    position
  }
}
```

在模板中我们需要通过 `position.x positon.y` 来获取相应的坐标，模板中这样写闲得很麻烦，我们期望简写为 `x y`，此时 `setup()` 也需要返回 `x y`，我们在调用 `useMousePositon` 时可以直接把返回的对象进行解构，因为它返回的对象就有 `x y` 两个属性

```html
<body>
  <div id="app">
    x: {{ x }} <br>
    y: {{ y }}
  </div>
  <script type="module">
    import { createApp, reactive, onMounted, onUnmounted } from './node_modules/vue/dist/vue.esm-browser.js'

    function useMousePosition () {
      // 第一个参数 props
      // 第二个参数 context对象，attrs、emit、slots
      const position = reactive({
        x: 0,
        y: 0
      })

      // 定义事件处理函数
      const update = e => {
        position.x = e.pageX
        position.y = e.pageY
      }

      onMounted(() => {
        window.addEventListener('mousemove', update)
      })

      onUnmounted(() => {
        window.removeEventListener('mousemove', update)
      })

      return position
    }

    const app = createApp({
      setup () {
        // const position = useMousePosition()
        const { x, y } = useMousePosition()
        return {
          x,
          y
        }
      }
    })

    app.mount('#app')

  </script>
</body>
```

此时我们无法获取鼠标的位置，说明我们此时的`x y`不是响应式数据

![image-20210325224818184](https://public.shiguanghai.top/blog_img/image-20210325224818184.png)

```js
const position = useMousePosition()
```

其原因是由于：`position`是响应式对象，在`useMousePositon()`中调用了`reactive`函数，把传入的对象包装成了`Proxy`对象，此处的`position`是`proxy`对象

将来访问`position`的`x y`时会调用代理对象中的`getter`拦截收集依赖，当`x y`变化会调用代理对象中的`setter`拦截触发更新

```js
const { x, y } = useMousePosition()
```

当我们把代理对象解构时，就相当于定义了`x y`两个变量来接受`position.x position.y`，而基本类型的赋值就是把值在内存中复制一份，所以此处的`x y`就是两个基本类型的变量，跟代理对象无关

当重新给`x y`赋值时也不会调用代理对象的`setter`，无法触发更新操作，所以不能对当前的响应式对象进行解构

我们可以查看一下`babel`把解构的语法降级处理的代码

![image-20210326212222354](https://public.shiguanghai.top/blog_img/image-20210326212222354.png)

这是`babel`的 repl，左边是解构的代码，右边是降级的代码。我们可以看到，解构的代码在降级之后其实就是定义了两个变量用来接收`position.x position.y`，所以当前拿到的`x y`就是两个变量

### toRefs

`toRefs` 可以**把一个代理对象的所有属性都转换成响应式对象**

```js
    function useMousePosition () {
      // 第一个参数 props
      // 第二个参数 context对象，attrs、emit、slots
      const position = reactive({
        x: 0,
        y: 0
      })

      // 定义事件处理函数
      const update = e => {
        position.x = e.pageX
        position.y = e.pageY
      }

      onMounted(() => {
        window.addEventListener('mousemove', update)
      })

      onUnmounted(() => {
        window.removeEventListener('mousemove', update)
      })

      return toRefs(position)
    }
```

`toRefs` 要求我们传入的参数必须是一个代理对象，当前的 `position` 就是 `reactive` 返回的一个代理对象

其内部会创建一个新的代理对象，然后遍历传入对象的所有属性，将所有属性的值均转换为响应式对象（即为其创建一个具有`value`属性的对象，`value`属性具有`setter`和`setter`，模板中可省略），再挂载到新创建的代理对象上并返回。

其实 `toRefs` 的作用就是把对象的每一个属性都转换成响应式数据，所以可以解构 `toRefs` 返回的对象，解构的每一个属性也都是响应式的

### ref

`ref` 是一个函数，其作用是**把普通数据转换成响应式数据**，和 `reactive` 不同的是，`reactive` 是把一个对象转换成响应式数据，而 `ref` 可以把一个基础数据包装成响应式对象

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app">
    <button @click="increase">按钮</button>
    <span>{{ count }}</span>
  </div>
  <script type="module">
    import { createApp, ref } from './node_modules/vue/dist/vue.esm-browser.js'
    
    function useCount () {
      const count = ref(0) // value
      return {
        count,
        increase: () => {
          count.value++
        }
      }
    }

    createApp({
      setup () {
        return {
          ...useCount()
        }        
      }
    }).mount('#app')
  </script>
</body>
</html>
```

首先，基本数据类型存储的是值，它不可能是响应式数据，我们知道响应式数据要通过`getter`收集依赖，通过`setter`触发更新

`ref`的参数如果是对象的话内部会调用`reactive`返回一个代理对象；如果是基本类型的值内部会创建一个只有`value`属性的对象，该对象的`value`属性具有`getter`和`setter`

## 15.4 computed

计算属性的作用是简化模板中的代码，可以缓存计算的结果，当数据变化后才会重新计算

我们依然可以像 Vue 2.x 在创建组件时传入 `Computed` 选项来创建计算属性，在 Vue 3 中也可以在 `setup()` 中通过 `computed()` 来创建计算属性，`computed()` 有两种用法

- 第一种用法：传入一个获取值的函数，函数内部依赖响应式的数据，但当依赖的数据发生变化后会重新执行该函数获取数据。`computed()`返回一个不可变的响应式对象，类似使用`ref`创建的对象，只有一个`value`属性，获取计算属性的值要通过`value`属性获取，模板中使用计算属性可以省略`value`

  - `watch(() => count.value + 1)`

- 第二种用法：传入一个对象，这个对象具有`getter`和`setter`，返回一个不可变的响应式对象

  ```js
  const count = ref(1)
  const plusOne = computed({
    get: () => count.value + 1
  	set: val => {
    	count.value = val - 1
  	}
  })
  ```

案例：


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app">
    <button @click="push">按钮</button>
    未完成：{{ activeCount }}
  </div>
  <script type="module">
    import { createApp, reactive, computed } from './node_modules/vue/dist/vue.esm-browser.js'
    const data = [
      { text: '看书', completed: false },
      { text: '敲代码', completed: false },
      { text: '约会', completed: true }
    ]

    createApp({
      setup () {
        const todos = reactive(data)

        const activeCount = computed(() => {
          return todos.filter(item => !item.completed).length
        })

        return {
          activeCount,
          push: () => {
            todos.push({
              text: '开会',
              completed: false
            })
          }
        }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

![image-20210328193145684](https://public.shiguanghai.top/blog_img/image-20210328193145684.png)

![image-20210328193257206](https://public.shiguanghai.top/blog_img/image-20210328193257206.png)

`computed()` 可以让我们创建一个响应式的数据，这个响应式的数据依赖其他响应式数据，当依赖的数据发生变化后会重新计算属性传入的函数

## 15.5 watch

`watch` 侦听器和 `computed` 类似，它的使用方式和之前使用 `this.$watch` 或者选项中的 `watch` 作用是一样的，即监听响应式数据的变化然后执行一个相应的回调函数，可以获取到监听数据的新值和旧值

- Watch 的三个参数
  - 第一个参数：要监听的数据（可以是获取值的函数、`ref`、`reactive`返回的对象、数组），注意 Vue 2.x 第一个参数是字符串
  - 第二个参数：监听到数据变化后执行的函数，这个函数有两个参数分别是新值和旧值
  - 第三个参数：选项对象，`deep`（深度监听） 和 `immediate`（立即执行）
- Watch 的返回值
  - 取消监听的函数

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app">
    <p>
      请问一个 yes/no 的问题:
      <input v-model="question">
    </p>
    <p>{{ answer }}</p>
  </div>

  <script type="module">
    // https://www.yesno.wtf/api
    import { createApp, ref, watch } from './node_modules/vue/dist/vue.esm-browser.js'

    createApp({
      setup () {
        const question = ref('')
        const answer = ref('')

        watch(question, async (newValue, oldValue) => {
          // fetch 返回的是 promise 对象
          const response = await fetch('https://www.yesno.wtf/api')
          // 接口返回的是 json 类型的数据 ，json 返回的也是 promise 对象
          const data = await response.json()
          answer.value = data.answer
        })

        return {
          question,
          answer
        }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

![image-20210328195320381](https://public.shiguanghai.top/blog_img/image-20210328195320381.png)

## 15.6 watchEffect

这是 Vue 3 提供的一个新的函数

- 是 `watch` 函数的简化版本，也用来监视数据的变化。内部实现是和 `watch` 调用的同一个函数 `dowatch` ，不同的是，`watchEffect` 没有第二个回调函数的参数
- 接收一个函数作为参数，监听函数内部使用的响应式数据的变化，会立即执行一次这个函数，当数据变化会重新运行该函数，它也返回一个取消监听的函数

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <div id="app">
    <button @click="increase">increase</button>
    <button @click="stop">stop</button>
    <br>
    {{ count }}
  </div>

  <script type="module">
    import { createApp, ref, watchEffect } from './node_modules/vue/dist/vue.esm-browser.js'

    createApp({
      setup () {
        const count = ref(0)
        const stop = watchEffect(() => {
          console.log(count.value)
        })

        return {
          count,
          stop,
          increase: () => {
            count.value++
          }
        }
      }
    }).mount('#app')
  </script>
</body>
</html>
```

![image-20210328211456240](https://public.shiguanghai.top/blog_img/image-20210328211456240.png)

![image-20210328211511656](https://public.shiguanghai.top/blog_img/image-20210328211511656.png)

点击 stop 后 `count` 值变化时 `watchEffect` 中的函数不会再次被调用

![image-20210328211538637](https://public.shiguanghai.top/blog_img/image-20210328211538637.png)

