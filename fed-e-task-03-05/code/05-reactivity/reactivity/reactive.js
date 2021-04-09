// 辅助函数 判断一个变量是否为对象
const isObject = val => val !== null && typeof val === 'object'
// 辅助函数 判断是对象继续处理
const convert = target => isObject(target) ? reactive(target) : target
// 辅助函数 判断某个对象本身是否有指定属性
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive (target) {
  // 判断 target 是否是对象 不是则返回
  if (!isObject(target)) return target

  // 把 targer 转换为代理对象
  const handler = {
    get (target, key ,receiver) {
      // 收集依赖
      // console.log('get', key)
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      return convert(result)
    },
    set (target, key, value, receiver) {
      // 获取 key 属性的值
      const oldValue = Reflect.get(target, key, receiver)
      // 最终返回的值 默认为 true
      let result = true
      // 判断传入新值 与 oldValue 是否相等
      if (oldValue !== value) {
        result = Reflect.set(target, key, value, receiver)
        // 触发更新
        // console.log('set', key, value)
        trigger(target, key)
      }
      return result
    },
    deleteProperty (target, key) {
      // 判断 target 中是否有自己的 key 属性
      const hasKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hasKey && result) {
        // 触发更新
        // console.log('delete', key)
        trigger(target, key)
      }
      return result
    }
  }

  return new Proxy(target, handler)
}

let activeEffect = null
export function effect (callback) {
  // 把 callback 存储起来
  activeEffect = callback
  // 首先执行一次 callback，访问响应式对象属性 去收集依赖
  callback()
  activeEffect = null
}

let targetMap = new WeakMap()
export function track (target, key) {
  // 判断 activeEffect 是否为空，因为最终要保存它
  if(!activeEffect) return
  // 去 targetMap 根据当前的 target 找 depsMap，当前的 target 就是 targetMap 中的键
  let depsMap = targetMap.get(target)
  // 判断是否找到 depsMap 未找到则为当前的对象创建一个 depsMap 并添加到 targetMap
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }
  // 根据属性查找对应的 dep 里面存储的是 effect 函数
  let dep = depsMap.get(key)
  // 判断 dep 是否存在 未找到则为当前属性创建对应的 dep 并存储到 depsMap
  if(!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  // 把 effect 函数添加到 dep 集合
  dep.add(activeEffect)
}

export function trigger (target, key) {
  // 根据 target 去 targetMap 中找到 depsMap
  const depsMap = targetMap.get(target)
  // 未找到 depsMap 返回
  if(!depsMap) return
  // 根据 key 找对应的 dep 集合
  const dep = depsMap.get(key)
  // 找到 dep 执行 effect 函数
  if(dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}

export function ref (raw) {
  // 判断 raw 是否是使用 ref 创建的对象 如果是的话直接返回
  if (isObject(raw) && raw.__v_isRef) {
    return
  }
  // 判断 raw 是否是对象 是的话调用 reactive 创建响应式对象 否则返回原始值
  let value = convert(raw)
  // 创建一个只有 value 属性的对象，value 属性具有getter setter
  const r = {
    __v_isRef: true,
    get value () {
      // 收集依赖
      track(r, 'value')
      return value
    },
    set value (newValue) {
      // 判断新旧值是否相等
      if (newValue !== value) {
        raw = newValue
        // value 依旧是响应式的
        value = convert(raw)
        // 触发更新
        trigger(r, 'value')
      }
    }
  }
  return r
}

export function toRefs (proxy) {
  // 判断函数参数是否是 reactive 创建的对象 如果不是发送警告
  // reactive 中没有做标识的属性 跳过

  // 判断传过来的参数 是否为数组 否则返回一个空对象
  const ret = proxy instanceof Array ? new Array(proxy.length) : {}
  // 遍历 prxoy 对象的所有属性 如果是数组遍历索引
  for (const key in proxy) {
    ret[key] = toProxyRef(proxy, key)
  }
  return ret
}

// 辅助函数 把每一个属性都转换成类似 ref 返回的对象
function toProxyRef (proxy, key) {
  const r = {
    __v_isRef: true,
    get value () {
      // 不需要收集依赖 此处访问的是响应式对象 当访问其属性时 内部getter会收集依赖
      return proxy[key]
    },
    set value (newValue) {
      proxy[key] = newValue
    }
  }
  return r
}

export function computed (getter) {
  // 最终返回一个 ref 创建的具有 value 属性的对象
  // 不传参 默认传入 undefined 所以返回的 value 的值是 undefined
  const result = ref()
  // 调用 effect 直接调用其 getter 函数 把其结果存储到 result.value 中
  effect(() => (result.value = getter()))
  
  return result
}