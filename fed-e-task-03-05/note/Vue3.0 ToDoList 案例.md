# Vue3.0 ToDoList 案例

## 16.1 功能汇总

todolist 是代办事件清单，它是一个非常经典的案例，我们以此来巩固 Composition API 的知识

**ToDoList 功能列表：**

- 添加待办事项
- 删除待办事项
- 编辑待办事项
- 切换待办事项
- 存储待办事项

## 16.2 项目结构

```shell
vue create todolist
```

![image-20210328214435141](https://public.shiguanghai.top/blog_img/image-20210328214435141.png)

模板：`src/App.vue`

```vue
<template>
  <section id="app" class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        placeholder="What needs to be done?"
        autocomplete="off"
        autofocus
        >
    </header>
    <section class="main">
      <input id="toggle-all" class="toggle-all" type="checkbox">
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li>
          <div class="view">
            <input class="toggle" type="checkbox">
            <label >测试数据</label>
            <button class="destroy"></button>
          </div>
          <input class="edit" type="text">
        </li>
        <li>
          <div class="view">
            <input class="toggle" type="checkbox">
            <label >测试数据</label>
            <button class="destroy"></button>
          </div>
          <input class="edit" type="text">
        </li>
      </ul>
    </section>
    <footer class="footer">
      <span class="todo-count">
        <strong>1</strong> item left
      </span>
      <ul class="filters">
        <li><a href="#/all">All</a></li>
        <li><a href="#/active">Active</a></li>
        <li><a href="#/completed">Completed</a></li>
      </ul>
      <button class="clear-completed">
        Clear completed
      </button>
    </footer>
  </section>
  <footer class="info">
    <p>Double-click to edit a todo</p>
    <!-- Remove the below line ↓ -->
    <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
    <!-- Change this out with your name and url ↓ -->
    <p>Created by <a href="https://shiguanghai.top">shiguanghai</a></p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
  </footer>
</template>

<script>
import './assets/index.css'

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
</style>
```

样式：[`src/assets/index.css`](https://github.com/shiguanghai/ToDoList/blob/main/src/assets/index.css)

```shell
npm run serve
```

![image-20210329213426536](https://public.shiguanghai.top/blog_img/image-20210329213426536.png)

- All：查看所有的待办事项
- Active：查看未完成的待办事项
- Completed：查看已经完成的待办事项
- Clear completed：清除所有已经完成的待办事项

## 16.3 添加待办事项

```js
<input
  class="new-todo"
  placeholder="What needs to be done?"
  autocomplete="off"
  autofocus
  v-model="input"
  @keyup.enter="addTodo"
>
```

将不同的逻辑分拆到不同的函数方便以后对代码的维护

```js
import { ref } from '@vue/reactivity'

// 1. 添加待办事项
const useAdd = todos => {
  const input = ref('')
  const addTodo = () => {
    const text = input.value  && input.value.trim()
    if (text.length === 0) return
    // 把输入的内容添加到 todos 数组
    todos.value.unshift({
      text,
      completed: false
    })
  }
  return {
    input,
    addTodo
  }
}

export default {
  name: 'App',
  setup () {
    const todos = ref([])

    return {
      ...useAdd(todos),
      todos
    }
  }
}
```

模板中使用`todos`

```js
<ul class="todo-list">
  <li
  v-for="todo in todos"
  :key="todo.text"
  >
    <div class="view">
      <input class="toggle" type="checkbox">
      <label >{{ todo.text }}</label>
      <button class="destroy"></button>
  	</div>
		<input class="edit" type="text">
  </li>
</ul>
```

![image-20210329220358618](https://public.shiguanghai.top/blog_img/image-20210329220358618.png)

## 16.4 删除待办事项

```js
<ul class="todo-list">
  <li
  v-for="todo in todos"
  :key="todo.text"
  >
    <div class="view">
      <input class="toggle" type="checkbox">
      <label >{{ todo.text }}</label>
      <button class="destroy" @click="remove(todo)"></button>
  	</div>
		<input class="edit" type="text">
  </li>
</ul>
```

```js
// 2. 删除待办事项
const useRemove = todos => {
  const remove = todo => {
    const index = todos.value.indexOf(todo)
    todos.value.splice(index, 1)
  }

  return {
    remove
  }
}

export default {
  name: 'App',
  setup () {
		...
    return {
      ...
      ...useRemove(todos)
    }
  }
}
```

## 16.5 编辑待办事项

- 双击待办事项，展示文本框
- 按回车或者编辑文本框失去焦点，修改数据
- 按 Esc 取消编辑
- 把编辑文本框清空按回车，删除这一项
- 显示编辑文本框的时候获取焦点

```js
// 3. 编辑待办事项
const useEdit = remove => {
  // 记录文本框初始内容
  let beforeEditingText = ''
  // 当前编辑状态 响应式
  const editingTodo = ref(null)

  // 编辑
  const editTodo = todo => {
    beforeEditingText = todo.text
    editingTodo.value = todo
  }
  // 按下回车或者文本框失去焦点
  const doneEdit = todo => {
    if (!editingTodo.value) return
    todo.text = todo.text.trim()
    todo.text || remove(todo)
    editingTodo.value = null
  }
  // 取消编辑
  const cancelEdit = todo => {
    editingTodo.value = null
    todo.text = beforeEditingText
  }
  return {
    editingTodo,
    editTodo,
    doneEdit,
    cancelEdit
  }
}

export default {
  name: 'App',
  setup () {
    const todos = ref([])

    const { remove } = useRemove(todos)

    return {
      todos,
      remove,
      ...useAdd(todos),
      ...useEdit(remove)
    }
  }
}
```

```js
<li
  v-for="todo in todos"
  :key="todo"
  :class="{ editing: todo === editingTodo }"
>
  <div class="view">
    <input class="toggle" type="checkbox">
    <label @dblclick="editTodo(todo)" >{{ todo.text }}</label>
    <button class="destroy" @click="remove(todo)"></button>
  </div>
  <input
    class="edit"
    type="text"
    v-model="todo.text"
    @keyup.enter="doneEdit(todo)"
    @blur="doneEdit(todo)"
    @keyup.esc="cancelEdit(todo)"
  >
</li>
```



### 编辑文本框获取焦点

这里需要用到自定义指令，Vue3 自定义指令的使用方式与 Vue2 稍有不同

- Vue 2.x

  ![image-20210407204552918](https://public.shiguanghai.top/blog_img/image-20210407204552918.png)

- Vue 3.0                                                                                                                                                                                                                                             

  ![image-20210407204614555](https://public.shiguanghai.top/blog_img/image-20210407204614555.png)

其二者的差别主要是自定义指令的钩子函数未重命名，Vue3 把钩子函数的名称和组件中钩子函数的名称保持一致，这样很容易理解，但是自定义指令的钩子函数和组件钩子函数的执行方式是不一样的

Vue3 中钩子函数的名称有三组：`mounted`、`updated`、`unmounted`，分别是在自定义指令修饰的元素被挂载到DOM树、更新还有卸载的时候执行。

这是自定义指令的第一种用法，在创建自定义指令的时候还可以传函数，这种用法比较简洁，更常用一些

- Vue 2.x

  ![image-20210407213507407](https://public.shiguanghai.top/blog_img/image-20210407213507407.png)

- Vue 3.0

  ![image-20210407213520545](https://public.shiguanghai.top/blog_img/image-20210407213520545.png)

第二个参数是函数的时候，Vue3 和 Vue2 的用法是一样的，指令名称后面的函数在 Vue3 的时候是在 `mounted`和`updated`时执行，与 Vue2 的执行时机一样，Vue2 是在 `bind` 和 `update` 时执行。`el` 参数是指令绑定的元素，`binding` 可以获取到指令对应的值

```js
<input
  class="edit"
  type="text"
  v-editing-focus="todo === editingTodo"
  v-model="todo.text"
  ...
>
```

```js
export default {
  name: 'App',
  ...
  directives: {
    editingFocus: (el, binding) => {
      binding.value && el.focus()
    }
  }
}
```

## 16.6 切换待办事项

- 点击 checkbox，改变所有待办项状态
- All/Activi/Completed
- 其他
  - 显示未完成待办项个数
  - 移除所有完成的项目
  - 如果没有待办项，隐藏 main 和 footer

### 改变待办事项完成状态

```js
<section class="main">
  <input id="toggle-all" class="toggle-all" v-model="allDone" type="checkbox">
  <label for="toggle-all">Mark all as complete</label>
  <ul class="todo-list">
    <li
      v-for="todo in todos"
      :key="todo"
      :class="{ editing: todo === editingTodo, completed: todo.completed }"
    >
      <div class="view">
        <input class="toggle" type="checkbox" v-model="todo.completed">
      </div>
			...
    </li>
  </ul>
</section>
```

```js
import { computed, ref } from 'vue'

// 4. 切换待办项完成状态
const useFilter = todos => {
  const allDone = computed({
    get () {
      // 返回 !(未完成待办事项的个数)
      return !todos.value.filter(todo => !todo.completed).length
    },
    set (value) {
      todos.value.forEach(todo => {
        todo.completed = value
      })
    }
  })
  
  return {
    allDone
  }
}

export default {
  name: 'App',
  setup () {
		...
    return {
      ...
      ...useFilter(todos)
    }
  }
}
```

![image-20210407222943344](https://public.shiguanghai.top/blog_img/image-20210407222943344.png)

### 切换状态

```js
// 4. 切换待办项完成状态
const useFilter = todos => {
  ...

  const filter = {
    all: list => list,
    active: list => list.filter(todo => !todo.completed),
    completed: list => list.filter(todo => todo.completed)
  }
  const type = ref('all')
  const filteredTodos = computed(() => filter[type.value](todos.value))
  
  const onHashChange = () => {
    const hash = window.location.hash.replace('#/', '')
    if (filter[hash]) {
      type.value =hash
    } else {
      type.value = 'all'
      window.location.hash = ''
    }    
  }

  onMounted(() => {
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  })

  return {
    allDone,
    filteredTodos
  }
}
```

```js
<li
  v-for="todo in filteredTodos"
  :key="todo"
  :class="{ editing: todo === editingTodo, completed: todo.completed }"
>
    ...
</li>
```

当我们点击超链接会触发`hashchange`事件，触发后会调用`onHashChange`函数，首先获取地址中的`hash`值，把`#/`去掉，然后使用`hash`值去`filter`中找对应的过滤方法。

如果找到就把`hash`值直接赋值给`type`，`type`是响应式数据，当它的值发生变化后会重新渲染模板，重新渲染的时候执行到`v-for`时会调用计算属性`filteredTodos`，计算属性中`type`值是响应式数据，它的值发生了变化会重新执行，此时会去`filter`中找到对应的过滤方法调用这个方法把`todos`传入进来；

如果没有找到`hash`值对应的方法，此时可能是页面首次加载，也可能是`hash`值输入的不正确找不到对应的方法，此时就将`type`的值更改为`all`，默认去加载所有的待办事项列表并且把地址中的`hash`值清空

![image-20210408210444371](https://public.shiguanghai.top/blog_img/image-20210408210444371.png)

![image-20210408210507061](https://public.shiguanghai.top/blog_img/image-20210408210507061.png)

![image-20210408210532927](https://public.shiguanghai.top/blog_img/image-20210408210532927.png)

### 其他

- 显示未完成待办项个数

```js
<span class="todo-count">
  <strong>{{ remainingCount }}</strong> {{ remainingCount > 1 ? 'items' : 'item' }} left
</span>
```

```js
const remainingCount = computed(() => filter.active(todos.value).length)
```

![image-20210408211709876](https://public.shiguanghai.top/blog_img/image-20210408211709876.png)

```js
<button class="clear-completed" @click="removeCompleted">
  Clear completed
</button>
```

- 移除所有完成的项目

```js
// 2. 删除待办事项
const useRemove = todos => {
  ...
  const removeCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
  }
  return {
    ...
    removeCompleted
  }
}

export default {
  name: 'App',
  setup () {
    ...

    const { remove, removeCompleted } = useRemove(todos)

    return {
      ...
      remove,
      removeCompleted,
      ...
    }
  },
  ...
}
```

- 如果没有待办项，隐藏 main 和 footer

```js
<section class="main" v-show="count">...</section>

<footer class="footer" v-show="count">
  ...
  <button class="clear-completed" @click="removeCompleted" v-show="count > remainingCount">
    Clear completed
  </button>  
</footer>
```

总个数大于未完成待办事项个数说明有已完成待办事项，此时显示按钮

```js
const count = computed(() => todos.value.length)
```

## 16.7 存储待办事项

当数据修改，把数据存储到`localStorage`，下次加载再从本地存储中把数据还原

将操作本地存储封装到一个模块方便复用 `src/utils/useLocalStorage`

把对象或者数组存储到本地存储需要把对象或者数组通过`JSON.stringify`转换成字符串，从本地存储中加载数据时需要把字符串通过`JSON.parse`转换成对象

```js
function parse (str) {
  let value
  try {
    value = JSON.parse(str)
  } catch {
    value = null    
  }
  return value
}

function stringify (obj) {
  let value
  try {
    value = JSON.stringify(obj)
  } catch {
    value = null
  }
  return value
}

export default function useLocalStorage () {
  function serItem (key, value) {
    value = stringify(value)
    window.localStorage.setItem(key, value)
  }
  
  function getItem (key) {
    let value = window.localStorage.getItem(key)
    if (value) {
      value = parse(value)
    }
    return value
  }

  return {
    serItem,
    getItem
  }
}
```

```js
import useLocalStorage from './utils/useLocalStorage'

const storage = useLocalStorage()

...

// 5. 存储待办事项
const useStorage = () => {
  const KEY = 'TODOKEYS'
  const todos = ref(storage.getItem(KEY) || [])
  watchEffect(() => {
    storage.serItem(KEY, todos.value)
  })
  return todos
}

export default {
  name: 'App',
  setup () {
    const todos = useStorage()
    ...
  }
}
```

## 16.8 总结

![image-20210408215755678](https://public.shiguanghai.top/blog_img/image-20210408215755678.png)

我们把不同的功能分别放在不同的函数中实现，逻辑更清晰，我们把`useLocalStorage`函数封装到了单独的模块中，将来在其他组件中还可以重用，我们可以想一下之前看到的`options API`和`Composition API`的对比图，如果使用`options API`来实现这个案例的话，不同逻辑的代码会拆分到不同的位置，如果代码比较多的话还需要不停地上下拖动滚动条来找到想要的代码，通过`Composition API`来实现这个案例，我们把不同的逻辑代码拆分到不同的`use`函数中，同一功能的代码只存在一个函数中，而且更方便组件之间重用代码

到此，ToDoList案例就演示完了，通过这个案例我们可以更好的去体会`Composition API`的使用

[项目代码](https://github.com/shiguanghai/ToDoList)

