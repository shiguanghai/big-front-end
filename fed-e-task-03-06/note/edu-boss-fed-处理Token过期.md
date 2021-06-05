## 21.9 处理 Token 过期

### 概念介绍

在用户登录成功以后，我们收到一个带有 `access_token` 的数据对象，我们使用 `access_token` 去请求需要授权的接口，才能拿到对应的数据，它就表示用户的身份

这个身份是有过期时间的（后端设置，前端无法决定），Token过期以后就无法请求获取数据，会收到 401 的响应

![image-20210505204611731](https://public.shiguanghai.top/blog_img/image-20210505204611731exKpnF.png)

**为什么 access_token 过期需要有过期时间以及为什么比较短？**

- 为了安全
  - 它代表用户的身份，一旦用户的身份标识遭到了泄露，别人就可以拿着 Token 冒充用户身份进行一些操作

- 降低风险

对于比较短的过期时间，用户就需要去重新登录，频繁的重新登录用户体验就很不好。有没有办法在用户不去重新登录的情况下也能够去解决 Token 过期的问题呢？

![image-20210505205108762](https://public.shiguanghai.top/blog_img/image-20210505205108762M2ceBx.png)

- access_token
  - 作用：获取需要授权的接口数据
- expires_in
  - 作用：access_token 过期时间
- refresh_token
  - 作用：刷新获取新的 access_token

方法一：

在请求发起前拦截每个请求（拦截器），判断 Token 的有效时间是否已经过期（expires_in），若已过期，则将请求挂起，先刷新 Token （refresh_token）后继续请求。

- 优点：在请求前拦截，能节省请求，省流量
- 缺点：需要后端额外提供一个 Token 过期时间的字段（expires_in）；使用了本地时间判断，若本地时间被篡改，特别是本地时间比服务器时间慢时，拦截会失败

方法二：

不在请求前拦截，而是拦截返回后的数据。先发起请求，接口返回过期后（过期会收到 401），先刷新 Token（refresh_token）再进行一次重试。

- 优点：不需要额外的 Token 过期字段，不需要判断时间
- 缺点：会消耗多一次请求，耗流量

综上，方法一和方法二优缺点是互补的，方法一有校验失败的风险（本地时间被篡改时），方法二更简单粗暴，等服务器已经过期了再重试一次，只是会耗多一个请求

这里我们使用**方式二**来处理刷新 Token 的操作

### 分析 axios 响应拦截器

由于每一个需要授权的接口都可能返回 401 Token 过期，这里我们使用拦截器来进行统一的处理，参照 [axios - Interceptors](https://github.com/axios/axios#interceptors)

![image-20210503213439493](https://public.shiguanghai.top/blog_img/image-20210503213439493RQ3pRgfRBM7X.png)

```js
// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });
```

`utils/request.ts`

```typescript
// 响应拦截器
// 收到响应会优先进入到相应拦截器，再走到真正发请求的响应里面
request.interceptors.response.use(function (response) {
  // 当状态码为 2xx 都会进入这里
  console.log('请求响应成功了 =>', response)
  
  // 如果是自定义错误状态码，错误处理就写到这里

  return response
}, function (error) {
  // 所有超出 2xx 范围的状态码都执行这里
  console.log('请求响应失败了 =>', error)

  // 如果是使用 HTTP 状态码，错误处理就写到这里

  console.dir(error)

  return Promise.reject(error)
})
```

测试

![image-20210505213000266](https://public.shiguanghai.top/blog_img/image-20210505213000266YP6nfr.png)

![image-20210505213431169](https://public.shiguanghai.top/blog_img/image-20210505213431169Cv4rgf.png)

通过测试，此项目使用的接口用的是 HTTP 状态码，因此错误处理写到第二个回调中

### axios 错误处理

参考 [axios - Handling Errors](https://github.com/axios/axios#handling-errors)

![image-20210505215345328](https://public.shiguanghai.top/blog_img/image-20210505215345328EblAq1.png)

```js
axios.get('/user/12345')
  .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
```

`utils/request.ts`

```typescript
// 响应拦截器
// 收到响应会优先进入到相应拦截器，再走到真正发请求的响应里面
request.interceptors.response.use(function (response) {
  // 当状态码为 2xx 都会进入这里
  console.log('请求响应成功了 =>', response)
  
  // 如果是自定义错误状态码，错误处理就写到这里

  return response
}, function (error) {
  // 所有超出 2xx 范围的状态码都执行这里
  // console.log('请求响应失败了 =>', error)
  // 如果是使用 HTTP 状态码，错误处理就写到这里

  if (error.response) { // 请求发出去，收到响应了。状态码超出了 2xx 范围

  } else if (error.request) { // 请求发出去，没有收到响应。请求超时，网络断开

  } else { // 在设置请求时发生了一些事情，触发了一个错误

  }
  // 把请求失败的错误对象继续抛出，扔给上一个调用者
  return Promise.reject(error)
})
```

### 错误信息提示

我们现在给错误做一些提示，让用户知道当前的状态，防止错误时没有任何反应。我们会用到 Element Message 消息提示组件

`utils/request.ts`

```typescript
...
import { Message } from 'element-ui'
...

// 响应拦截器
// 收到响应会优先进入到相应拦截器，再走到真正发请求的响应里面
request.interceptors.response.use(function (response) {
  // 当状态码为 2xx 都会进入这里
  console.log('请求响应成功了 =>', response)
  
  // 如果是自定义错误状态码，错误处理就写到这里

  return response
}, function (error) {
  // 所有超出 2xx 范围的状态码都执行这里
  // console.log('请求响应失败了 =>', error)
  // 如果是使用 HTTP 状态码，错误处理就写到这里

  if (error.response) { // 请求发出去，收到响应了。状态码超出了 2xx 范围
    const { status } = error.response
    if (status === 400) {
      Message.error('请求参数错误')
    } else if (status === 401) {
      // Token 无效（没有提供Token、Token是无效的、Token过期了）
    } else if (status === 403) {
      Message.error('没有权限，请联系管理员')
    } else if (status === 404) {
      Message.error('请求资源不存在')
    } else if (status >= 500) {
      Message.error('服务端错误，请联系管理员')
    }
  } else if (error.request) { // 请求发出去，没有收到响应。请求超时，网络断开
    Message.error('请求超时，请刷新重试')
  } else { // 在设置请求时发生了一些事情，触发了一个错误
    Message.error(`请求失败：${error.message}`)
  }
  // 把请求失败的错误对象继续抛出，扔给上一个调用者
  return Promise.reject(error)
})
```

### 实现基本流程逻辑

接下来我们单独针对 401 来进行处理

```typescript
...
import router from '@/router'
import qs from 'qs'

...

function redirectlogin () {
  router.push({
    name: 'login',
    query: { // 通过 url 传递查询字符串参数
      redirect: router.currentRoute.fullPath // 把登录成功需要返回的页面告诉登录页
    }
  })
}

...

// 响应拦截器
// 收到响应会优先进入到相应拦截器，再走到真正发请求的响应里面
request.interceptors.response.use(function (response) {
  // 当状态码为 2xx 都会进入这里
  // console.log('请求响应成功了 =>', response)
  // 如果是自定义错误状态码，错误处理就写到这里
  return response
}, async function (error) {
  // 所有超出 2xx 范围的状态码都执行这里
  // console.log('请求响应失败了 =>', error)
  // 如果是使用 HTTP 状态码，错误处理就写到这里
  if (error.response) { // 请求发出去，收到响应了。状态码超出了 2xx 范围
    const { status } = error.response
    if (status === 400) {
      Message.error('请求参数错误')
    } else if (status === 401) {
      // Token 无效（没有提供Token、Token是无效的、Token过期了）
      // 如果有 refresh_token 则尝试使用 refresh_token 获取新的 access_token
      if (!store.state.user) {
        redirectlogin()
        return Promise.reject(error)
      }
      // 尝试刷新获取新的 token
      try {
        // 不使用 request 防止嵌套死循环
        const { data } = await axios.create()({
          method: 'POST',
          url: '/front/user/refresh_token',
          data: qs.stringify({
            refreshtoken: store.state.user.refresh_token
          })
        })
        // 成功 -> 把本次失败的请求重新发出去
        // 把刷新拿到的新的 access_token 更新到容器和本地存储中
        store.commit('setUser', data.content)
        // 把本次失败的请求重新发出去
        // console.log(error.config) // 失败请求的配置信息
        return request(error.config) // 返回 Promise （request({})需要 methods、url、data等方法）
      } catch (error) {
        // 把当前登录用户状态清除
        store.commit('setUser', null)
        // 失败 -> 跳转登录页重新登录获取新的 token
        redirectlogin()
        return Promise.reject(error)
      }
      // 如果没有，则直接跳转登录页
    }

    ...
  }

  ...
})

export default request
```

### 关于多次请求的问题

现在处理 Token 刷新过期看起来是可以用的，但是实际里面还有一些问题。我们现在针对一个请求是没有问题的，但假如说同一时间有多个请求都 401，就会出现请求多次刷新 Token 的问题

模拟多个请求问题 `layout/components/app-header.vue`

```typescript
export default Vue.extend({
  ...
  created () {
    this.loadUserInfo()
    this.loadUserInfo()
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo () {
      ...
      console.log('loadUserInfo')
    }
})
```

我们看到跳转到了登录页。当我们出现多次刷新 Token 的问题时，会有多个401，refresh_token 只能使用一次，后面是获取不到的

![image-20210507215322873](https://public.shiguanghai.top/blog_img/image-20210507215322873rc6EdW.png)

因此重新发出请求时，虽然第一次成功了，但是后面的请求还是获取不到因此最终就获取失败跳转到了登录页

![image-20210507215534750](https://public.shiguanghai.top/blog_img/image-20210507215534750zJCbam.png)

### 解决多次请求刷新 Token

我们发现接口使用的不是 HTTP 的状态错误，而是自定义状态码

![image-20210507215819982](https://public.shiguanghai.top/blog_img/image-20210507215819982V36C5v.png)

![image-20210507215322873](https://public.shiguanghai.top/blog_img/image-20210507215322873rc6EdW7fmnFo.png)

因此我们来改造一下之前的代码，对接口进行一个单独的判断 `utils/request.ts`

修改前

```typescript
      // 尝试刷新获取新的 token
      try {
        // 不使用 request 防止嵌套死循环
        const { data } = await axios.create()({
          method: 'POST',
          url: '/front/user/refresh_token',
          data: qs.stringify({
            refreshtoken: store.state.user.refresh_token
          })
        })
        // 成功 -> 把本次失败的请求重新发出去
        // 把刷新拿到的新的 access_token 更新到容器和本地存储中
        store.commit('setUser', data.content)
        // 把本次失败的请求重新发出去
        // console.log(error.config) // 失败请求的配置信息
        return request(error.config) // 返回 Promise （request({})需要 methods、url、data等方法）
      } catch (error) {
        // 把当前登录用户状态清除
        store.commit('setUser', null)
        // 失败 -> 跳转登录页重新登录获取新的 token
        redirectlogin()
        return Promise.reject(error)
      }
```

修改后

```typescript
function refreshToken () {
  return axios.create()({
    method: 'POST',
    url: '/front/user/refresh_token',
    data: qs.stringify({
      refreshtoken: store.state.user.refresh_token
    })
  })
}
```

```typescript
      // 尝试刷新获取新的 token
      return refreshToken().then(res => {
        if (!res.data.success) { // 失败
          throw new Error('刷新 Token 失败')
        }
        // 成功 -> 把本次失败的请求重新发出去
        // 把刷新拿到的新的 access_token 更新到容器和本地存储中
        store.commit('setUser', res.data.content)
        // 把本次失败的请求重新发出去
        // console.log(error.config) // 失败请求的配置信息
        return request(error.config) // 返回 Promise （request({})需要 methods、url、data等方法）
      }).catch(err => {
        console.log(err)
        // 把当前登录用户状态清除
        store.commit('setUser', null)
        // 失败 -> 跳转登录页重新登录获取新的 token
        redirectlogin()
        return Promise.reject(error)
      })
```

**然后我们来处理多次请求刷新 Token 的问题：**

```typescript
// 响应拦截器
// 收到响应会优先进入到相应拦截器，再走到真正发请求的响应里面
let isRfreshing = false // 控制刷新 Token 的状态
request.interceptors.response.use(function (response) {
  ...
}, async function (error) {
  ...
  // 401 处理内部

  // Token 无效（没有提供Token、Token是无效的、Token过期了）
  // 如果有 refresh_token 则尝试使用 refresh_token 获取新的 access_token
  // 如果没有，则直接跳转登录页
  if (!store.state.user) {
    redirectlogin()
    return Promise.reject(error)
  }

  if (!isRfreshing) { // 此时不在刷新
    isRfreshing = true // 开启刷新状态
    // 尝试刷新获取新的 token
    return refreshToken().then(res => {
      ...
    }).catch(err => {
      ...
    }).finally(() => {
      isRfreshing = false // 重置刷新状态
    })
  }
  return
}
```

经过测试我们发现：我们有三次请求，但是我们只把失败的一次重新发出去了，我们需要把漏掉的失败请求重新发出去

![image-20210507223158203](https://public.shiguanghai.top/blog_img/image-20210507223158203Ng6EC9.png)

### 解决多次请求其它接口重试的问题

```typescript
// 响应拦截器
// 收到响应会优先进入到相应拦截器，再走到真正发请求的响应里面
...
let requests: any[] = [] // 存储刷新 Token 期间过来的 401 请求
request.interceptors.response.use(function (response) {
  ...
}, async function (error) {
  ...
  // 刷新 Token
  if (!isRfreshing) { // 此时不在刷新
    ...
    // 尝试刷新获取新的 token
    return refreshToken().then(res => {
      ...
      // 成功 -> 把本次失败的请求重新发出去
      // 把刷新拿到的新的 access_token 更新到容器和本地存储中
      ...
      // 把 requests 队列中的请求重新发出去
      requests.forEach(cb => cb())
      // 重置 requests 数组
      requests = []
      // 把本次失败的请求重新发出去
      ...
    }).catch(err => {
      ...
    }).finally(() => {
      ...
    })
  }

  // 刷新状态下，把请求挂起放到 requests 数组中
  // 返回一个不执行 resolve 的 Promise（不resolve就不会结束，而是等待）
  return new Promise(resolve => {
    requests.push(() => {
      // 重新发送错误的请求
      resolve(request(error.config))
    })
  })
}
```

**关闭禁止使用 `any` 类型的警告**：

在`.eslintrc.js`的`rules`添加`'@typescript-eslint/no-explicit-any': 'off'`，重启服务。详见[@typescript-eslint/no-explicit-any](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md)

![image-20210507225231309](https://public.shiguanghai.top/blog_img/image-20210507225231309ia5nV2.png)