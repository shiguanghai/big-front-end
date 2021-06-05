## 21.7 用户登录

接下来我们从登录页面开始做起。因为只有有了登录、有了用户的身份Token以后，我们才能进行例如角色管理、菜单管理、资源管理等操作

### 页面布局 - Form 表单

参考 [Element - Form 表单](https://element.eleme.io/#/zh-CN/component/form#form-biao-dan)

![image-20210501165419681](https://public.shiguanghai.top/blog_img/image-20210501165419681kOazav.png)

```vue
<el-form ref="form" :model="form" label-width="80px">
  <el-form-item label="活动名称">
    <el-input v-model="form.name"></el-input>
  </el-form-item>
  <el-form-item label="活动区域">
    <el-select v-model="form.region" placeholder="请选择活动区域">
      <el-option label="区域一" value="shanghai"></el-option>
      <el-option label="区域二" value="beijing"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="活动时间">
    <el-col :span="11">
      <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
    </el-col>
    <el-col class="line" :span="2">-</el-col>
    <el-col :span="11">
      <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
    </el-col>
  </el-form-item>
  <el-form-item label="即时配送">
    <el-switch v-model="form.delivery"></el-switch>
  </el-form-item>
  <el-form-item label="活动性质">
    <el-checkbox-group v-model="form.type">
      <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
      <el-checkbox label="地推活动" name="type"></el-checkbox>
      <el-checkbox label="线下主题活动" name="type"></el-checkbox>
      <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="特殊资源">
    <el-radio-group v-model="form.resource">
      <el-radio label="线上品牌商赞助"></el-radio>
      <el-radio label="线下场地免费"></el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item label="活动形式">
    <el-input type="textarea" v-model="form.desc"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">立即创建</el-button>
    <el-button>取消</el-button>
  </el-form-item>
</el-form>
<script>
  export default {
    data() {
      return {
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        }
      }
    },
    methods: {
      onSubmit() {
        console.log('submit!');
      }
    }
  }
</script>
```

`views/login/index.vue`

```vue
<template>
  <div class="login">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="活动名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="活动区域">
        <el-select v-model="form.region" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="即时配送">
        <el-switch v-model="form.delivery"></el-switch>
      </el-form-item>
      <el-form-item label="活动性质">
        <el-checkbox-group v-model="form.type">
          <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
          <el-checkbox label="地推活动" name="type"></el-checkbox>
          <el-checkbox label="线下主题活动" name="type"></el-checkbox>
          <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="特殊资源">
        <el-radio-group v-model="form.resource">
          <el-radio label="线上品牌商赞助"></el-radio>
          <el-radio label="线下场地免费"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动形式">
        <el-input type="textarea" v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即创建</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },

  methods: {
    onSubmit () {
      console.log('submit!')
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

![image-20210501170239638](https://public.shiguanghai.top/blog_img/image-20210501170239638kmcPsR.png)

自定义登录组件

```vue
<template>
  <div class="login">
    <el-form
      class="login-form"
      label-position="top"
      ref="form"
      :model="form"
      label-width="80px"
    >
      <el-form-item label="手机号">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          class="login-btn"
          type="primary"
          @click="onSubmit"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },

  methods: {
    onSubmit () {
      console.log('submit!')
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-form {
    width: 300px;
    background: #fff;
    padding: 20px;
    border-radius: 5px;
  }
  .login-btn {
    width: 100%;
  }
}
</style>
```

![image-20210501171254597](https://public.shiguanghai.top/blog_img/image-20210501171254597xxltua.png)

### Postman 接口测试

接下来我们来处理登录的业务功能

[edu-front-boot - 用户登录](http://edufront.lagou.com/front/doc.html#/edu-front-boot/%E7%94%A8%E6%88%B7%E6%8E%A5%E5%8F%A3/loginUsingPOST)

![image-20210501185341107](https://public.shiguanghai.top/blog_img/image-20210501185341107RWWstr.png)

![image-20210501185422675](https://public.shiguanghai.top/blog_img/image-20210501185422675bSB6WH.png)

新建一个 Collections，将测试接口保存进去，并设置 Variables

![image-20210501191028207](https://public.shiguanghai.top/blog_img/image-20210501191028207TeJYm7.png)

![image-20210501191209125](https://public.shiguanghai.top/blog_img/image-20210501191209125gpXPwE.png)

之后就可以把测试的接口都通过这种方式来管理和维护

### 请求登录

我们先根据接口把数据绑定到表单当中，通过这个表单处理获得我们要提交给接口的参数

`views/login/index.vue`

```vue
<el-form-item label="手机号">
  <el-input v-model="form.phone"></el-input>
</el-form-item>
<el-form-item label="密码">
  <el-input v-model="form.password"></el-input>
</el-form-item>
```

```vue
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    onSubmit () {
      console.log('submit!')
    }
  }
})
</script>
```

测试

![image-20210501192313854](https://public.shiguanghai.top/blog_img/image-202105011923138540A4Hy5.png)

![image-20210501192407286](https://public.shiguanghai.top/blog_img/image-20210501192407286zI2RWP.png)

提交表单我们需要发送请求

```vue
<script lang="ts">
import Vue from 'vue'
import request from '@/utils/request'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        phone: '',
        password: ''
      }
    }
  },
  methods: {
    async onSubmit () {
      // 1. 表单验证
      // 2. 验证通过 -> 提交表单
      const { data } = await request({
        method: 'POST',
        url: '/front/user/login',
        data: this.form
      })

      console.log(data)
      // 3. 处理请求结果
      //      成功 -> 跳转到首页
      //      失败 -> 给出提示
    }
  }
})
</script>
```

测试

![image-20210501194747735](https://public.shiguanghai.top/blog_img/image-20210501194747735sIiYvW.png)

![image-20210501194957080](https://public.shiguanghai.top/blog_img/image-20210501194957080rAR0hR.png)

错误的原因是因为 axios 默认发送的是 application/json 格式的数据，而我们需要的是 x-www-form-urlencoded 类型。因此我们需要对数据类型进行转换

axios 官方解决方案：[https://github.com/axios/axios#using-applicationx-www-form-urlencoded-format](https://github.com/axios/axios#using-applicationx-www-form-urlencoded-format)

这里我们使用 [qs](https://github.com/ljharb/qs) 库对数据进行编码

```js
import qs from 'qs';
const data = { 'bar': 123 };
const options = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  data: qs.stringify(data),
  url,
};
axios(options);
```

```shell
# 安装 qs 库
npm install qs
```

使用 `views/login/index.vue`

```vue
<script lang="ts">
...
import qs from 'qs'

export default Vue.extend({
    ...
    methods: {
    async onSubmit () {
      // 1. 表单验证
      // 2. 验证通过 -> 提交表单
      const { data } = await request({
        method: 'POST',
        url: '/front/user/login',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(this.form)
      })

      console.log(data)
      // 3. 处理请求结果
      //      成功 -> 跳转到首页
      //      失败 -> 给出提示
    }
  }
})
</script>
```

测试

![image-20210501200419687](https://public.shiguanghai.top/blog_img/image-20210501200419687e006cy.png)

![image-20210501200502001](https://public.shiguanghai.top/blog_img/image-20210501200502001DyBp5y.png)

### 处理请求结果 - Message 消息提示

![image-20210501201738024](https://public.shiguanghai.top/blog_img/image-20210501201738024dGBp7n.png)

参考 [Element - Message 消息提示](https://element.eleme.io/#/zh-CN/component/message#fang-fa)

![image-20210501202309555](https://public.shiguanghai.top/blog_img/image-202105012023095556KyRBd.png)

```vue
<script>
  export default {
    methods: {
      open1() {
        this.$message('这是一条消息提示');
      },
      open2() {
        this.$message({
          message: '恭喜你，这是一条成功消息',
          type: 'success'
        });
      }
    }
  }
</script>
```

`views/login/index.vue`

```typescript
  methods: {
    async onSubmit () {
      ...
      // 3. 处理请求结果
      //      失败 -> 给出提示
      if (data.state !== 1) {
        return this.$message.error(data.message)
      }
      //      成功 -> 跳转到首页
      this.$router.push({
        name: 'home'
      })
      this.$message.success('登录成功')
    }
  }
```

测试

![image-20210501202823376](https://public.shiguanghai.top/blog_img/image-20210501202823376Or7rww.png)

![image-20210501202843647](https://public.shiguanghai.top/blog_img/image-20210501202843647OoXpLr.png)

### 表单验证

在防止用户犯错的前提下，尽可能让用户更早地发现并纠正错误。Element 表单组件支持验证的功能，参考 [Element - 表单验证](https://element.eleme.io/#/zh-CN/component/form#biao-dan-yan-zheng)

只需要通过 `rules` 属性传入约定的验证规则，并将 Form-Item 的 `prop` 属性设置为需校验的字段名即可

```vue
<template>
  <div class="login">
    <el-form
      class="login-form"
      label-position="top"
      ref="form"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          class="login-btn"
          type="primary"
          @click="onSubmit"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

验规则参见 [async-validator](https://github.com/yiminghe/async-validator)

```typescript
rules: {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
    ]
}
```

![image-20210501212502260](https://public.shiguanghai.top/blog_img/image-20210501212502260bBLIMO.png)

接下来我们通过 js 拿到验证的结果再去决定是否提交表单

![image-20210501213203171](https://public.shiguanghai.top/blog_img/image-20210501213203171rEUpvFirp34A.png)

```typescript
methods: {
  async onSubmit () {
    try {
      // 1. 表单验证
      await (this.$refs.form as Form).validate()
      ...
    } catch (error) {
      console.log('登录失败', error)
    }
  }
}
```

### 请求期间禁用按钮点击 - Button 按钮

[Element - Button 按钮](https://element.eleme.io/#/zh-CN/component/button#attributes)

![image-20210501203320105](https://public.shiguanghai.top/blog_img/image-20210501203320105hiCN8j.png)

```vue
<el-button type="primary" :loading="true">加载中</el-button>
```

`views/login/index.vue`

```vue
<el-button
  class="login-btn"
  type="primary"
  :loading="isLoginLoading"
  @click="onSubmit"
>
  登录
</el-button>
```

```typescript
methods: {
  async onSubmit () {
    try {
      // 1. 表单验证
      await (this.$refs.form as Form).validate()

      // 登录按钮 loading
      this.isLoginLoading = true

      // 2. 验证通过 -> 提交表单
      const { data } = await login(this.form)
      // 3. 处理请求结果
      //      失败 -> 给出提示
      if (data.state !== 1) {
        this.$message.error(data.message)
      } else {
        //      成功 -> 跳转到首页
        this.$router.push({
          name: 'home'
        })
        this.$message.success('登录成功')
      }
    } catch (error) {
      console.log('登录失败', error)
    }
    // 结束登录按钮的 loading
    this.isLoginLoading = false
  }
}
```

测试

![image-20210501215842431](https://public.shiguanghai.top/blog_img/image-202105012158424316Y2Liy.png)

### 封装请求方法

到此，登录页面的业务逻辑基本就差不多了，接下来我们做一些优化：

我们把请求封装成一个方法，直接调用。方便接口统一的管理和维护 `services/user.ts`

```typescript
/**
 * 用户相关请求模块
 */

import request from '@/utils/request'
import qs from 'qs'

interface User {
  phone: string
  password: string
}

export const login = (data: User):any => {
  return request({
    method: 'POST',
    url: '/front/user/login',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data)
  })
}
```

`views/login/index.vue` 引入

```vue
<script lang="ts">
import Vue from 'vue'
import { Form } from 'element-ui'
import { login } from '@/services/user'

export default Vue.extend({
  ...
  methods: {
    async onSubmit () {
      ...
      // 2. 验证通过 -> 提交表单
      const { data } = await login(this.form)
      ...
    }
  }
})
</script>
```

### 关于请求体 data 和 ContentType 的问题

`services/user.ts`

```typescript
export const login = (data: User):any => {
  return request({
    method: 'POST',
    url: '/front/user/login',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data)
  })
}
```

对于我们通过 `qs.stringify()` 转换之后的 `data`，axios 会自动把 ContentType 设置为 `application/x-www-form-urlencoded`，我们不再需要手动添加

```typescript
export const login = (data: User):any => {
  return request({
    method: 'POST',
    url: '/front/user/login',
    // headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data)
  })
}
```

- 如果 data 是普通对象，则 ContentType 是 `application/json`
- 如果 data 是 `qs.stringify()` 转换之后的数据，则 ContentType 会被设置为 `application/x-www-form-urlencoded`
- 如果 data 是 FormData 对象，则 ContenType 是 `multipart/form-data`