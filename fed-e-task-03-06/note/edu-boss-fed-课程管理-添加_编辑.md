## 21.14 课程管理

### 布局

封装请求 `services/course.ts`

[edu-boss-boot - 分页查询课程信息](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E7%A8%8B/getQueryCoursesUsingPOST)

```typescript
/**
 * 课程相关请求模块
 */

import request from '@/utils/request'

export const getQueryCourses = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/course/getQueryCourses',
    data
  })
}
```

封装列表资源组件 `views/course/components/CourseList.vue`

```vue
<template>
  <div class="course-list">
    <el-card class="box-card">
      <div slot="header">
        <span>数据筛选</span>
      </div>
      <el-form
        ref="form"
        label-width="80px"
        label-position="left"
        :model="filterParams"
      >
        <el-form-item label="课程名称" prop="courseName">
          <el-input
            v-model="filterParams.courseName"
            placeholder="课程名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="filterParams.status">
            <el-option label="全部" value=""></el-option>
            <el-option label="上架" value="1"></el-option>
            <el-option label="下架" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="loading"
            @click="handleReset"
          >重置</el-button>
          <el-button
            type="primary"
            :disabled="loading"
            @click="handleFilter"
          >查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <div slot="header">
        <span>查询结果：</span>
        <el-button
          style="float: right; margin-top: -10px"
          type="primary"
        >添加课程</el-button>
      </div>
      <el-table
        :data="courses"
        v-loading="loading"
        style="width: 100%; margin-bottom: 20px"
      >
        <el-table-column
          prop="id"
          label="ID"
          min-width="50">
        </el-table-column>
        <el-table-column
          prop="courseName"
          label="课程名称"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          min-width="100">
        </el-table-column>
        <el-table-column
          prop="sortNum"
          label="排序"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="status"
          label="上架状态"
          min-width="120">
          123
        </el-table-column>
        <el-table-column
          prop="price"
          label="操作"
          min-width="200"
          align="center"
        >
          <template>
            <el-button>编辑</el-button>
            <el-button>内容管理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalCount"
        :disabled="loading"
        :current-page.sync="filterParams.currentPage"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getQueryCourses } from '@/services/course'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'CourseList',
  data () {
    return {
      filterParams: {
        currentPage: 1,
        pageSize: 10,
        courseName: '',
        status: ''
      },
      courses: [],
      totalCount: 0,
      loading: true
    }
  },

  created () {
    this.loadCourses()
  },

  methods: {
    async loadCourses () {
      this.loading = true
      const { data } = await getQueryCourses(this.filterParams)
      this.courses = data.data.records
      this.totalCount = data.data.total
      this.loading = false
    },

    handleCurrentChange (page: number) {
      this.filterParams.currentPage = page
      this.loadCourses()
    },

    handleFilter () {
      this.filterParams.currentPage = 1
      this.loadCourses()
    },

    handleReset () {
      (this.$refs.form as Form).resetFields()
      this.filterParams.currentPage = 1
      this.loadCourses()
    }
  }
})
</script>

<style lang="scss" scoped>
.el-card {
  margin-bottom: 20px;
}
</style>
```

加载资源列表 `views/course/index.vue`

```vue
<template>
  <div class="course">
    <course-list />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CourseList from './components/CourseList.vue'

export default Vue.extend({
  name: 'CourseIndex',
  components: {
    CourseList
  }
})
</script>

<style lang="scss" scoped></style>
```

![image-20210518202750524](https://public.shiguanghai.top/blog_img/image-20210518202750524egRc3o.png)

![image-20210518202809673](https://public.shiguanghai.top/blog_img/image-202105182028096733ERzOR.png)

### 上架状态 - 展示

参考 [Element - Switch 开关](https://element.eleme.cn/#/zh-CN/component/switch#switch-kai-guan)

`views/course/components/CourseList.vue`

```vue
<el-table-column
  prop="status"
  label="上架状态"
  min-width="120">
  <template slot-scope="scope">
    <el-switch
      v-model="scope.row.status"
      active-color="#13ce66"
      inactive-color="#ff4949"
      :active-value="1"
      :inactive-value="0"
    />
  </template>
</el-table-column>
```

![image-20210518203635018](https://public.shiguanghai.top/blog_img/image-20210518203635018Xm3Z60.png)

### 上架状态 - 处理课程上下架

封装请求 `services/course.ts`

[edu-boss-boot - 课程上下架](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E7%A8%8B/changeStateUsingGET)

```typescript
export const changeState = (params: any) => {
  return request({
    method: 'GET',
    url: '/boss/course/changeState',
    params
  })
}
```

加载请求 `views/course/components/CourseList.vue`

```vue
<el-table-column
  prop="status"
  label="上架状态"
  min-width="120">
  <template slot-scope="scope">
    <el-switch
      ...
      :disabled="scope.row.isStatusLoading"
      @change="onStateChange(scope.row)"
    />
  </template>
</el-table-column>

<script lang="ts">
import Vue from 'vue'
import {
  getQueryCourses,
  changeState
} from '@/services/course'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'CourseList',
  ...
  methods: {
    async loadCourses () {
      this.loading = true
      const { data } = await getQueryCourses(this.filterParams)
      data.data.records.forEach((item: any) => {
        item.isStatusLoading = false
      })
      ...
    },
    ...
    async onStateChange (course: any) {
      course.isStatusLoading = true
      const { data } = await changeState({
        courseId: course.id,
        status: course.status
      })
      this.$message.success(`${course.status === 0 ? '下架' : '上架'}成功`)
      course.isStatusLoading = false
    }
  }
})
</script>
```

![image-20210518205443033](https://public.shiguanghai.top/blog_img/image-20210518205443033qL4x5I.png)

### 添加课程 - Steps 步骤条

封装添加课程组件 `views/course/create.vue`

```vue
<template>
  <div class="course-create">
    添加课程
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseCreate'
})
</script>

<style lang="scss" scoped></style>

```

配置路由：`router/index.ts`

```typescript
{
  path: '/course/create',
  name: 'course-create',
  component: () => import(/* webpackChunkName: 'course-create' */ '@/views/course/create.vue')
}
```

为 添加课程 按钮注册点击事件 `views/course/components/CourseList.vue`

```vue
<div slot="header">
  <span>查询结果：</span>
  <el-button
    style="float: right; margin-top: -10px"
    type="primary"
    @click="$router.push({
      name: 'course-create'
    })"
  >添加课程</el-button>
</div>
```

![image-20210518212106392](https://public.shiguanghai.top/blog_img/image-20210518212106392oEECih.png)

参考 [Element - Steps 步骤条](https://element.eleme.cn/#/zh-CN/component/steps#steps-bu-zou-tiao)

![image-20210518212456538](https://public.shiguanghai.top/blog_img/image-2021051821245653862T8p6.png)

```vue
<el-steps :active="1" simple>
  <el-step title="步骤 1" icon="el-icon-edit"></el-step>
  <el-step title="步骤 2" icon="el-icon-upload"></el-step>
  <el-step title="步骤 3" icon="el-icon-picture"></el-step>
</el-steps>

<el-steps :active="1" finish-status="success" simple style="margin-top: 20px">
  <el-step title="步骤 1" ></el-step>
  <el-step title="步骤 2" ></el-step>
  <el-step title="步骤 3" ></el-step>
</el-steps>
```

`views/course/create.vue`

```vue
<template>
  <div class="course-create">
    <el-card class="box-card">
      <div slot="header">
        <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
          <el-step title="基本信息"></el-step>
          <el-step title="课程封面"></el-step>
          <el-step title="销售信息"></el-step>
          <el-step title="秒杀活动"></el-step>
          <el-step title="课程详情"></el-step>
        </el-steps>
      </div>
      <el-form>
        <div v-show="activeStep === 0">
          基本信息
        </div>
        <div v-show="activeStep === 1">
          课程封面
        </div>
        <div v-show="activeStep === 2">
          销售信息
        </div>
        <div v-show="activeStep === 3">
          秒杀活动
        </div>
        <div v-show="activeStep === 4">
          课程详情
          <el-form-item>
            <el-button type="primary">保存</el-button>
          </el-form-item>
        </div>
        <el-form-item v-if="activeStep >= 0 && activeStep < 4">
          <el-button @click="activeStep++">下一步</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseCreate',
  data () {
    return {
      activeStep: 0
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

![image-20210518213714907](https://public.shiguanghai.top/blog_img/image-20210518213714907WSeKpV.png)

实现点击步骤条可以去到对应步骤页

```vue
<div slot="header">
  <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
    <el-step
      :title="item.title"
      v-for="(item, index) in steps"
      :key="index"
      @click.native="activeStep = index"
    ></el-step>
  </el-steps>
</div>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseCreate',
  data () {
    return {
      activeStep: 0,
      steps: [
        { title: '基本信息' },
        { title: '课程封面' },
        { title: '销售信息' },
        { title: '秒杀活动' },
        { title: '课程详情' }
      ]
    }
  }
})
</script>

<style lang="scss" scoped>
.el-step {
  cursor: pointer;
}
</style>
```

### 添加课程 - 搭建表单结构

`views/course/create.vue`

#### 基本信息 - InputNumber 计数器

参考 [Element - InputNumber 计数器](https://element.eleme.cn/#/zh-CN/component/input-number#inputnumber-ji-shu-qi)

![image-20210520222305927](https://public.shiguanghai.top/blog_img/image-20210520222305927D6M1ot.png)

```vue
<div v-show="activeStep === 0">
  <el-form-item label="课程名称">
    <el-input></el-input>
  </el-form-item>
  <el-form-item label="课程简介">
    <el-input></el-input>
  </el-form-item>
  <el-form-item label="课程概述">
    <el-input type="textarea" ></el-input>
  </el-form-item>
  <el-form-item label="讲师姓名">
    <el-input></el-input>
  </el-form-item>
  <el-form-item label="讲师简介">
    <el-input></el-input>
  </el-form-item>
  <el-form-item label="课程排序">
    <el-input-number label="描述文字"></el-input-number>
  </el-form-item>
</div>
```

![image-20210518215817134](https://public.shiguanghai.top/blog_img/image-202105182158171348Ov5RK.png)

#### 课程封面 -  Upload 上传

参考 [Element -  Upload 上传](https://element.eleme.cn/#/zh-CN/component/upload#upload-shang-chuan)

![image-20210520222235153](https://public.shiguanghai.top/blog_img/image-20210520222235153TmqNxu.png)

Element 的 `el-upload` 样式并不能完全满足我们的需求，我们需要去修改它的样式，你会发现你修改不了，因为我们加了 `scoped`，它只作用于当前组件中的元素

在有作用域的样式中，默认样式只能作用到子组件的根节点，父组件的样式将不会渗透到子组件中。当我们想通过类名作用于其内部的某个元素，需要使用到深度作用操作符

参考 [Vue Loader - Scoped CSS - 深度作用选择器](https://vue-loader.vuejs.org/zh/guide/scoped-css.html#%E6%B7%B1%E5%BA%A6%E4%BD%9C%E7%94%A8%E9%80%89%E6%8B%A9%E5%99%A8)

> 如果你希望 `scoped` 样式中的一个选择器能够作用得“更深”，例如影响子组件，你可以使用 `>>>` 操作符
>
> ```html
> <style scoped>
> .a >>> .b { /* ... */ }
> </style>
> ```
>
> 上述代码将会编译成：
>
> ```css
> .a[data-v-f3f3eg9] .b { /* ... */ }
> ```
>
> 有些像 Sass 之类的预处理器无法正确解析 `>>>`。这种情况下你可以使用 `/deep/` 或 `::v-deep` 操作符取而代之——两者都是 `>>>` 的别名，同样可以正常工作

```vue
<div v-show="activeStep === 1">
  <el-form-item label="课程封面">
    <el-upload
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </el-form-item>
  <el-form-item label="解锁封面">
    <el-upload
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </el-form-item>
</div>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseCreate',
  data () {
    return {
      ...
      imageUrl: '' // 预览图片地址
    }
  },
  methods: {
    handleAvatarSuccess (res: any, file: any) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload (file: any) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
})
</script>

<style lang="scss" scoped>
...
::v-deep .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
::v-deep .avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
```

![image-20210518223247252](https://public.shiguanghai.top/blog_img/image-20210518223247252M98K0N.png)

![image-20210518223434676](https://public.shiguanghai.top/blog_img/image-20210518223434676ly2IDi.png)

#### 销售信息 - Input 复合型输入框

参考 [Element - Input 复合型输入框](https://element.eleme.cn/#/zh-CN/component/input#fu-he-xing-shu-ru-kuang)

![image-20210520222337246](https://public.shiguanghai.top/blog_img/image-20210520222337246Zl0A2j.png)

```vue
<div v-show="activeStep === 2">
  <el-form-item label="售卖价格">
    <el-input type="number">
      <template slot="append">元</template>
    </el-input>
  </el-form-item>
  <el-form-item label="商品原价">
    <el-input type="number">
      <template slot="append">元</template>
    </el-input>
  </el-form-item>
  <el-form-item label="销量">
    <el-input type="number">
      <template slot="append">单</template>
    </el-input>
  </el-form-item>
  <el-form-item label="活动标签">
    <el-input></el-input>
  </el-form-item>
</div>
```

![image-20210520195950583](https://public.shiguanghai.top/blog_img/image-20210520195950583CdwOqD.png)

#### 秒杀活动 - DatePicker 日期选择器

参考 [Element - DatePicker 日期选择器](https://element.eleme.cn/#/zh-CN/component/date-picker#datepicker-ri-qi-xuan-ze-qi)

![image-20210520222512730](https://public.shiguanghai.top/blog_img/image-202105202225127305xd8f7.png)

```vue
<div v-show="activeStep === 3">
  <el-form-item label="限时秒杀">
    <el-switch
      v-model="isSeckill"
      active-color="#13ce66"
      inactive-color="#ff4949"
    >
    </el-switch>
  </el-form-item>
  <template v-if="isSeckill">
    <el-form-item label="开始时间">
      <el-date-picker
        type="date"
        placeholder="选择日期时间"
        value-format="yyyy-MM-dd"
      />
    </el-form-item>
    <el-form-item label="结束时间">
      <el-date-picker
        type="date"
        placeholder="选择日期时间"
        value-format="yyyy-MM-dd"
      />
    </el-form-item>
    <el-form-item label="秒杀价">
      <el-input type="number">
        <template slot="append">元</template>
      </el-input>
    </el-form-item>
    <el-form-item label="秒杀库存">
      <el-input type="number">
        <template slot="append">个</template>
      </el-input>
    </el-form-item>
  </template>
</div>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseCreate',
  data () {
    return {
      ...
      isSeckill: false // 是否开启秒杀
    }
  }
})
</script>
```

![image-20210520201145316](https://public.shiguanghai.top/blog_img/image-20210520201145316UdUC9R.png)

#### 课程详情

```vue
<div v-show="activeStep === 4">
<el-form-item label="课程详情">
  <el-input type="textarea"></el-input>
</el-form-item>
  <el-form-item>
    <el-button type="primary">保存</el-button>
  </el-form-item>
</div>
```

![image-20210520201513397](https://public.shiguanghai.top/blog_img/image-20210520201513397IAQJsP.png)

### 添加课程 - 基本信息数据绑定

封装请求 `services/course.ts`

[edu-boss-boot - 保存或者更新课程信息](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E7%A8%8B/saveOrUpdateCourseUsingPOST)

```typescript
export const saveOrUpdateCourse = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/course/saveOrUpdateCourse',
    data
  })
}
```

加载请求 `views/course/create.vue`

```vue
<div v-show="activeStep === 0">
  <el-form-item label="课程名称">
    <el-input v-model="course.courseName"></el-input>
  </el-form-item>
  <el-form-item label="课程简介">
    <el-input v-model="course.brief"></el-input>
  </el-form-item>
  <el-form-item label="课程概述">
    <el-input
      style="margin-bottom: 10px"
      v-model="course.previewFirstField"
      type="textarea"
      placeholder="概述1"
    ></el-input>
    <el-input
      v-model="course.previewSecondField"
      type="textarea"
      placeholder="概述2"
    ></el-input>
  </el-form-item>
  <el-form-item label="讲师姓名">
    <el-input v-model="course.teacherDTO.teacherName"></el-input>
  </el-form-item>
  <el-form-item label="讲师简介">
    <el-input v-model="course.teacherDTO.description"></el-input>
  </el-form-item>
  <el-form-item label="课程排序">
    <el-input-number
      label="描述文字"
      v-model="course.sortNum"
    ></el-input-number>
  </el-form-item>
</div>

<script lang="ts">
import Vue from 'vue'
import {
  saveOrUpdateCourse
} from '@/services/course'

export default Vue.extend({
  name: 'CourseCreate',
  data () {
    return {
      ...
      course: {
        // id: 0,
        courseName: '',
        brief: '',
        teacherDTO: {
          // id: 0,
          // courseId: 0,
          teacherName: '',
          teacherHeadPicUrl: '',
          position: '',
          description: ''
        },
        courseDescriptionMarkDown: '',
        price: 0,
        discounts: 0,
        priceTag: '',
        discountsTag: '',
        isNew: true,
        isNewDes: '',
        courseListImg: '',
        courseImgUrl: '',
        sortNum: 0,
        previewFirstField: '',
        previewSecondField: '',
        status: 0, // 0：未发布，1：已发布
        sales: 0,
        activityCourse: false, // 是否开启活动秒杀
        activityCourseDTO: {
          // id: 0,
          // courseId: 0,
          beginTime: '',
          endTime: '',
          amount: 0,
          stock: 0
        },
        autoOnlineTime: ''
      }
    }
  }
})
</script>
```

### 添加课程 - 上传课程封面 - Upload 上传

通过 Upload 上传组件 上传图片到服务端，拿到服务端返回的图片地址

参考 [Element -  Upload 上传](https://element.eleme.cn/#/zh-CN/component/upload#upload-shang-chuan)

- Upload 上传文件组件，支持自动上传，只需要把上传需要参数配置一下就可以了

  - 参数参考 [Upload - Attribute](https://element.eleme.cn/#/zh-CN/component/upload#attribute)

  - | 参数    | 说明                 |
    | ------- | -------------------- |
    | action  | 必选参数，上传的地址 |
    | headers | 设置上传的请求头部   |

  - 由于 Upload组件 内部的轻请求行为用的不是 Axios，它不会走我们之前设置的自动添加 Token 的 axios拦截器。如果要使用 Upload组件 自带的上传行为则还需要单独配置 `headers`

- 自己写代码上传文件发请求

  - | 参数         | 说明                               |
    | ------------ | ---------------------------------- |
    | http-request | 覆盖默认的上传行为，可以自定义上传 |

封装请求 `services/course.ts`

[edu-boss-boot - 上传图片](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E7%A8%8B/uploadUsingPOST)

```typescript
export const uploadCourseImage = (data: any) => {
  // 该接口要求的请求数据类型是：multipart/form-data
  // 所以需要提交 FormData 数据对象，ContenType 会被自动转换
  return request({
    method: 'POST',
    url: '/boss/course/upload',
    data
  })
}
```

加载请求 `views/course/create.vue`

```vue
<el-form-item label="课程封面">
<!--
  upload 上传文件组件，它支持自动上传，你只需要把上传需要参数配置一下就可以了
  -->
  <el-upload
    class="avatar-uploader"
    action="https://jsonplaceholder.typicode.com/posts/"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload"
    :http-request="handleUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
  </el-upload>
</el-form-item>

<script lang="ts">
import Vue from 'vue'
import {
  ...
  uploadCourseImage
} from '@/services/course'

export default Vue.extend({
  name: 'CourseCreate',
  ...
  methods: {
    ...
    async handleUpload (options: any) {
      const fd = new FormData()
      fd.append('file', options.file)
      const { data } = await uploadCourseImage(fd)
      console.log(data)
    }
  }
})
</script>
```

![image-20210520211219087](https://public.shiguanghai.top/blog_img/image-202105202112190878ZdrmO.png)

```vue
<el-form-item label="课程封面">
  <el-upload
    class="avatar-uploader"
    action="https://jsonplaceholder.typicode.com/posts/"
    :show-file-list="false"
    :before-upload="beforeAvatarUpload"
    :http-request="handleUpload"
  >
    <img
      v-if="course.courseListImg"
      :src="course.courseListImg"
      class="avatar"
    >
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
  </el-upload>
</el-form-item>

<script lang="ts">
...

export default Vue.extend({
  name: 'CourseCreate',
  ...
  methods: {
    ...
    async handleUpload (options: any) {
      ...
      this.course.courseListImg = data.data.name
    }
  }
})
</script>
```

![image-20210520212437503](https://public.shiguanghai.top/blog_img/image-202105202124375036Gqiyo.png)

### 添加课程 - 上传课程封面 - 封装上传组件

课程封面 和 介绍封面 作用一样，因此对上传组件进行封装方便重用和维护

1. 组件需要根据绑定的数据进行图片预览
2. 组件需要把上传成功的图片地址同步到绑定的数据中

我们期望的形式：

```vue
<course-image v-model="course.courseListImg" />
```

`v-model` 的本质还是父子组件通信

1. 它会给子组件传递一个名字叫 value 的数据（Props）
2. 默认监听($emit) input 事件，修改绑定的数据（自定义事件）

> 由于 v-model 只是语法糖，`<input v-model="message">` 与下面的两行代码是一致的：
>
> `<input v-bind:value="message" v-on:input="message = $event.target.value" />`
> `<input :value="message" @input="message = $event.target.value" />`

封装组件 `views/course/components/CourseImage.vue`

```vue
<template>
  <div class="course-image">
    <el-upload
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      :http-request="handleUpload"
    >
      <img
        v-if="value"
        :src="value"
        class="avatar"
      >
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  uploadCourseImage
} from '@/services/course'

export default Vue.extend({
  name: 'CourseImage',
  props: {
    value: {
      type: String
    }
  },
  methods: {
    beforeAvatarUpload (file: any) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    async handleUpload (options: any) {
      const fd = new FormData()
      fd.append('file', options.file)
      const { data } = await uploadCourseImage(fd)
      this.$emit('input', data.data.name)
    }
  }
})
</script>

<style lang='scss' scoped>
::v-deep .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
::v-deep .avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
```

注册组件 `views/course/create.vue`

```vue
<div v-show="activeStep === 1">
  <el-form-item label="课程封面">
  <!--
    upload 上传文件组件，它支持自动上传，你只需要把上传需要参数配置一下就可以了
    -->
  <!--
    1. 组件需要根据绑定的数据进行图片预览
    2. 组件需要把上传成功的图片地址同步到绑定的数据中
    v-model 的本质还是父子组件通信
      1. 它会给子组件传递一个名字叫 value 的数据（Props）
      2. 默认监听 input 事件，修改绑定的数据（自定义事件）
    -->
    <course-image v-model="course.courseListImg" />
  </el-form-item>
  <el-form-item label="介绍封面">
    <course-image v-model="course.courseImgUrl" />
  </el-form-item>
</div>

<script lang="ts">
import Vue from 'vue'
import {
  saveOrUpdateCourse
} from '@/services/course'
import CourseImage from './components/CourseImage.vue'

export default Vue.extend({
  name: 'CourseCreate',
  components: {
    CourseImage
  },
  ...
  methods: {}
})
</script>

<style lang="scss" scoped>
.el-step {
  cursor: pointer;
}
</style>
```

![image-20210520215830847](https://public.shiguanghai.top/blog_img/image-20210520215830847RQBYkT.png)

更加个性化的定制 `views/course/components/CourseImage.vue`

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'CourseImage',
  props: {
    ...
    limit: {
      type: Number,
      default: 2
    }
  },
  methods: {
    beforeAvatarUpload (file: any) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < this.limit

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error(`上传头像图片大小不能超过 ${this.limit}MB!`)
      }
      return isJPG && isLt2M
    },
    ...
  }
})
</script>
```

```vue
<course-image
  v-model="course.courseImgUrl"
  :limit="5"
/>
```

### 添加课程 - 上传进度提示 - Progress 进度条

接下来分享一个小功能：给上传图片加上自定义进度条提示。Upload 上传 本身就支持上传的进度条提示，但是是在展示上传文件列表的前提下实现的，所以也就看不到进度提示

参考 [Element - Progress 进度条](https://element.eleme.cn/#/zh-CN/component/progress#progress-jin-du-tiao)

![image-20210520222204364](https://public.shiguanghai.top/blog_img/image-202105202222043641wunO8.png)

```vue
<el-progress type="circle" :percentage="0"></el-progress>
<el-progress type="circle" :percentage="25"></el-progress>
<el-progress type="circle" :percentage="100" status="success"></el-progress>
<el-progress type="circle" :percentage="70" status="warning"></el-progress>
<el-progress type="circle" :percentage="50" status="exception"></el-progress>
```

 `views/course/components/CourseImage.vue`

```vue
<template>
  <div class="course-image">
    <el-progress
      v-if="isUploading"
      type="circle"
      :percentage="percentage"
      :width="178"
    />
    <el-upload
      v-else
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      :http-request="handleUpload"
    >
      <img
        v-if="value"
        :src="value"
        class="avatar"
      >
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  uploadCourseImage
} from '@/services/course'

export default Vue.extend({
  name: 'CourseImage',
  ...
  data () {
    return {
      isUploading: false,
      percentage: 0
    }
  },
  methods: {
    ...
    async handleUpload (options: any) {
      this.isUploading = true
      const fd = new FormData()
      fd.append('file', options.file)
      const { data } = await uploadCourseImage(fd)
      this.isUploading = false
      this.$emit('input', data.data.name)
    }
  }
})
</script>
```

处理进度条的进度变化

`services/course.ts`

```typescript
export const uploadCourseImage = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/course/upload',
    data,
    // HTML5 新增的上传响应时间：progress（原生）
    onUploadProgress (e) {
      console.log(e.loaded) // 已上传的数据大小
      console.log(e.total) // 上传文件的总大小
    }
  })
}
```

通过 `Math.floor(e.loaded / e.total * 100)` 来获取进度

```typescript
export const uploadCourseImage = (data: any,
  onUploadProgress?: (progressEvent: ProgressEvent) => void) => {
  return request({
    method: 'POST',
    url: '/boss/course/upload',
    data,
    onUploadProgress
  })
}
```

 `views/course/components/CourseImage.vue`

```vue
<el-progress
  v-if="isUploading"
  type="circle"
  :percentage="percentage"
  :width="178"
  :status="percentage === 100 ? 'success' : undefined"
/>

<script lang="ts">
...

export default Vue.extend({
  name: 'CourseImage',
  ...
  methods: {
    ...
    async handleUpload (options: any) {
      this.isUploading = true
      const fd = new FormData()
      fd.append('file', options.file)
      const { data } = await uploadCourseImage(fd, e => {
        this.percentage = Math.floor(e.loaded / e.total * 100)
      })
      this.isUploading = false
      this.percentage = 0
      this.$emit('input', data.data.name)
    }
  }
})
</script>
```

![image-20210522143939938](https://public.shiguanghai.top/blog_img/image-20210522143939938QS1DSt.png)

![image-20210522144012393](https://public.shiguanghai.top/blog_img/image-202105221440123935XQYUH.png)

### 添加课程 - 剩余数据绑定及发布

`views/course/create.vue`

```vue
<template>
  <div class="course-create">
    <el-card class="box-card">
      <div slot="header">
        <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
          <el-step
            :title="item.title"
            v-for="(item, index) in steps"
            :key="index"
            @click.native="activeStep = index"
          ></el-step>
        </el-steps>
      </div>
      <el-form label-width="80px" label-position="left">
        ...
        <div v-show="activeStep === 2">
          <el-form-item label="售卖价格">
            <el-input v-model.number="course.discounts" type="number">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="商品原价">
            <el-input v-model.number="course.price" type="number">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="销量">
            <el-input v-model.number="course.sales" type="number">
              <template slot="append">单</template>
            </el-input>
          </el-form-item>
          <el-form-item label="活动标签">
            <el-input v-model="course.discountsTag"></el-input>
          </el-form-item>
        </div>
        <div v-show="activeStep === 3">
          <el-form-item label="限时秒杀">
            <el-switch
              v-model="isSeckill"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
          <template v-if="isSeckill">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="course.activityCourseDTO.beginTime"
                type="date"
                placeholder="选择日期时间"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="course.activityCourseDTO.endTime"
                type="date"
                placeholder="选择日期时间"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item label="秒杀价">
              <el-input v-model.number="course.activityCourseDTO.amount" type="number">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="秒杀库存">
              <el-input v-model.number="course.activityCourseDTO.stock" type="number">
                <template slot="append">个</template>
              </el-input>
            </el-form-item>
          </template>
        </div>
        <div v-show="activeStep === 4">
        <el-form-item label="课程详情">
          <el-input v-model="course.courseDescriptionMarkDown" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="是否发布">
          <el-switch
            v-model="course.status"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSave"
          >保存</el-button>
        </el-form-item>
        </div>
        <el-form-item v-if="activeStep >= 0 && activeStep < 4">
          <el-button @click="activeStep++">下一步</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
...

export default Vue.extend({
  name: 'CourseCreate',
  ...
  methods: {
    async handleSave () {
      const { data } = await saveOrUpdateCourse(this.course)
      if (data.code === '000000') {
        this.$message.success('保存成功')
        this.$router.push('/course')
      } else {
        this.$message.error('保存失败')
      }
    }
  }
})
</script>
```

### 添加课程 - 富文本编辑器介绍

- [ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5)：一个非常老牌的富文本编辑器，其功能、稳定性各方面都很不错。内置许多插件，易于扩展
- [quilljs/quill](https://github.com/quilljs/quill)：近几年才出来的产品，用户群体庞大。扩展性和功能性也都很不错
- [yabwe/medium-editor](https://github.com/yabwe/medium-editor)：也是比较老牌的编辑器，近几年更新程度一般。但是功能还是很强大的
- [wangeditor-team/wangEditor](https://github.com/wangeditor-team/wangEditor)：国人开发的一款编辑器。功能和易用性很不错
- [fex-team/ueditor](https://github.com/fex-team/ueditor)：百度推出的富文本编辑器，功能非常强大，和百度自身的业务集成非常便利。虽然已不再维护但是还是可用的
- [tinymce/tinymce](https://github.com/tinymce/tinymce)：功能和拓展性优秀的编辑器，可以尝试

这些富文本编辑器各有优缺点，没有一定的好坏，尽量在满足自己的功能需求的前提下选择，已经不再维护的项目就不建议再使用了

本项目将采用 `wangEditor` 这款国人开发的编辑器

### 添加课程 - 封装使用富文本编辑器组件

参考 [wangEditor](https://www.wangeditor.com)

```shell
# 安装 wangeditor

npm i wangeditor --save
```

封装富文本编辑器组件 `components/TextEditor/index.vue`

```vue
<template>
  <div ref="editor" class="text-editor"></div>
</template>

<script lang="ts">
import Vue from 'vue'
import E from 'wangeditor'

export default Vue.extend({
  name: 'TextEditor',
  // 组件已经渲染好，可以初始化操作 DOM 了
  mounted () {
    const editor = new E(this.$refs.editor as any)
    editor.create()
  }
})
</script>

<style lang='scss' scoped></style>
```

注册组件 `views/course/create.vue`

```vue
<el-form-item label="课程详情">
  <text-editor />
  <!-- <el-input v-model="course.courseDescriptionMarkDown" type="textarea"></el-input> -->
</el-form-item>

<script lang="ts">
...
import TextEditor from '@/components/TextEditor/index.vue'

export default Vue.extend({
  name: 'CourseCreate',
  components: {
    ...
    TextEditor
  },
  ...
})
</script>
```

![image-20210522161515523](https://public.shiguanghai.top/blog_img/image-202105221615155238UmSYN.png)

绑定数据 `<text-editor v-model="course.courseDescriptionMarkDown" />`

前面提到 `v-model` 的本质还是父子组件通信，因此我们来组件中声明接收 `views/course/create.vue`

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'TextEditor',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  // 组件已经渲染好，可以初始化操作 DOM 了
  mounted () {
    this.initEditor()
  },
  methods: {
    initEditor () {
      const editor = new E(this.$refs.editor as any)
      // 事件监听 必须在 create 之前
      editor.config.onchange = (value: string) => {
        this.$emit('input', value)
      }

      editor.create()

      // 设置初始值 必须在 create 之后
      editor.txt.html(this.value)
    }
  }
})
</script>
```

![image-20210522162938347](https://public.shiguanghai.top/blog_img/image-20210522162938347kql2ut.png)

### 添加课程 - 富文本编辑器 - 图片上传

这个富文本编辑器默认只能插入网络图片。这里我们还希望上传本地图片，参考 [上传图片](https://www.wangeditor.com/doc/pages/07-%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87/)

`components/TextEditor/index.vue`

```vue
<script lang="ts">
...
import { uploadCourseImage } from '@/services/course'

export default Vue.extend({
  name: 'TextEditor',
  ...
  methods: {
    initEditor () {
      ...

      // 上传图片
      editor.config.customUploadImg =
      async function (resultFiles: any, insertImgFn: any) {
        // resultFiles 是 input 中选中的文件列表
        // insertImgFn 是获取图片 url 后，插入到编辑器的方法

        // 1. 把用户选择的 resultFiles 上传到服务器
        const fd = new FormData()
        fd.append('file', resultFiles[0])
        const { data } = await uploadCourseImage(fd)
        // 2. 上传图片，返回结果，将图片插入到编辑器中
        insertImgFn(data.data.name)
      }
    }
  }
})
</script>
```

![image-20210522171450927](https://public.shiguanghai.top/blog_img/image-20210522171450927ryHeKr.png)

### 编辑课程

我们希望点击**编辑**按钮来到和**添加课程**一样的界面，把要编辑课程的数据展示到表单页面。点击保存时把编辑的课程内容更新一下就可以了

封装组件 `views/course/components/CreateOrUpdate.vue`

```vue
<template>
  <el-card class="box-card">
    <div slot="header">
      <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 20px">
        <el-step
          :title="item.title"
          v-for="(item, index) in steps"
          :key="index"
          @click.native="activeStep = index"
        ></el-step>
      </el-steps>
    </div>
    <el-form label-width="80px" label-position="left">
      <div v-show="activeStep === 0">
        <el-form-item label="课程名称">
          <el-input v-model="course.courseName"></el-input>
        </el-form-item>
        <el-form-item label="课程简介">
          <el-input v-model="course.brief"></el-input>
        </el-form-item>
        <el-form-item label="课程概述">
          <el-input
            style="margin-bottom: 10px"
            v-model="course.previewFirstField"
            type="textarea"
            placeholder="概述1"
          ></el-input>
          <el-input
            v-model="course.previewSecondField"
            type="textarea"
            placeholder="概述2"
          ></el-input>
        </el-form-item>
        <el-form-item label="讲师姓名">
          <el-input v-model="course.teacherDTO.teacherName"></el-input>
        </el-form-item>
        <el-form-item label="讲师简介">
          <el-input v-model="course.teacherDTO.description"></el-input>
        </el-form-item>
        <el-form-item label="课程排序">
          <el-input-number
            label="描述文字"
            v-model="course.sortNum"
          ></el-input-number>
        </el-form-item>
      </div>
      <div v-show="activeStep === 1">
        <el-form-item label="课程封面">
        <!--
          upload 上传文件组件，它支持自动上传，你只需要把上传需要参数配置一下就可以了
          -->
        <!--
          1. 组件需要根据绑定的数据进行图片预览
          2. 组件需要把上传成功的图片地址同步到绑定的数据中
          v-model 的本质还是父子组件通信
            1. 它会给子组件传递一个名字叫 value 的数据（Props）
            2. 默认监听 input 事件，修改绑定的数据（自定义事件）
          -->
          <course-image v-model="course.courseListImg" />
        </el-form-item>
        <el-form-item label="介绍封面">
          <course-image
            v-model="course.courseImgUrl"
            :limit="5"
          />
        </el-form-item>
      </div>
      <div v-show="activeStep === 2">
        <el-form-item label="售卖价格">
          <el-input v-model.number="course.discounts" type="number">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="商品原价">
          <el-input v-model.number="course.price" type="number">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="销量">
          <el-input v-model.number="course.sales" type="number">
            <template slot="append">单</template>
          </el-input>
        </el-form-item>
        <el-form-item label="活动标签">
          <el-input v-model="course.discountsTag"></el-input>
        </el-form-item>
      </div>
      <div v-show="activeStep === 3">
        <el-form-item label="限时秒杀">
          <el-switch
            v-model="course.activityCourse"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
        </el-form-item>
        <template v-if="course.activityCourse">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="course.activityCourseDTO.beginTime"
              type="date"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="course.activityCourseDTO.endTime"
              type="date"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="秒杀价">
            <el-input v-model.number="course.activityCourseDTO.amount" type="number">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="秒杀库存">
            <el-input v-model.number="course.activityCourseDTO.stock" type="number">
              <template slot="append">个</template>
            </el-input>
          </el-form-item>
        </template>
      </div>
      <div v-show="activeStep === 4">
      <el-form-item label="课程详情">
        <text-editor v-model="course.courseDescriptionMarkDown" />
        <!-- <el-input v-model="course.courseDescriptionMarkDown" type="textarea"></el-input> -->
      </el-form-item>
      <el-form-item label="是否发布">
        <el-switch
          v-model="course.status"
          :active-value="1"
          :inactive-value="0"
          active-color="#13ce66"
          inactive-color="#ff4949"
        >
        </el-switch>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="handleSave"
        >保存</el-button>
      </el-form-item>
      </div>
      <el-form-item v-if="activeStep >= 0 && activeStep < 4">
        <el-button @click="activeStep++">下一步</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  saveOrUpdateCourse
} from '@/services/course'
import CourseImage from './CourseImage.vue'
import TextEditor from '@/components/TextEditor/index.vue'

export default Vue.extend({
  name: 'CreateOrUpdateCourse',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CourseImage,
    TextEditor
  },
  data () {
    return {
      activeStep: 0,
      steps: [
        { title: '基本信息' },
        { title: '课程封面' },
        { title: '销售信息' },
        { title: '秒杀活动' },
        { title: '课程详情' }
      ],
      // imageUrl: '', // 预览图片地址
      isSeckill: false, // 是否开启秒杀
      course: {
        // id: 0,
        courseName: '',
        brief: '',
        teacherDTO: {
          // id: 0,
          // courseId: 0,
          teacherName: '',
          teacherHeadPicUrl: '',
          position: '',
          description: ''
        },
        courseDescriptionMarkDown: '',
        price: 0,
        discounts: 0,
        priceTag: '',
        discountsTag: '',
        isNew: true,
        isNewDes: '',
        courseListImg: '',
        courseImgUrl: '',
        sortNum: 0,
        previewFirstField: '',
        previewSecondField: '',
        status: 0, // 0：未发布，1：已发布
        sales: 0,
        activityCourse: false, // 是否开启活动秒杀
        activityCourseDTO: {
          // id: 0,
          // courseId: 0,
          beginTime: '',
          endTime: '',
          amount: 0,
          stock: 0
        },
        autoOnlineTime: ''
      }
    }
  },
  methods: {
    async handleSave () {
      const { data } = await saveOrUpdateCourse(this.course)
      if (data.code === '000000') {
        this.$message.success('保存成功')
        this.$router.push('/course')
      } else {
        this.$message.error('保存失败')
      }
    }
  }
})
</script>

<style lang='scss' scoped>
.el-step {
  cursor: pointer;
}
</style>
```

注册组件 `views/course/create.vue`

```vue
<template>
  <div class="course-create">
    <create-or-update />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CreateOrUpdate from './components/CreateOrUpdate.vue'

export default Vue.extend({
  name: 'CourseCreate',
  components: {
    CreateOrUpdate
  }
})
</script>

<style lang="scss" scoped></style>
```

编辑组件 `views/course/edit.vue`

```vue
<template>
  <div class="course-edit">
    <create-or-update is-edit />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CreateOrUpdate from './components/CreateOrUpdate.vue'

export default Vue.extend({
  name: 'CourseEdit',
  components: {
    CreateOrUpdate
  }
})
</script>

<style lang="scss" scoped></style>
```

为编辑页配置路由 `router/index.ts`

```typescript
{
  path: '/course/:courseId/edit',
  name: 'course-edit',
  component: () => import(/* webpackChunkName: 'course-edit' */ '@/views/course/edit.vue'),
  props: true // 将路由路径参数映射到组件的 props 数据中
}
```

`views/course/edit.vue`

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'CourseEdit',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    }
  },
  ...
})
</script>
```

注册编辑事件 `views/course/components/CourseList.vue`

```vue
<template slot-scope="scope">
  <el-button
    @click="$router.push({
      name: 'course-edit',
      params: {
        courseId: scope.row.id
      }
    })"
  >编辑</el-button>
  <el-button>内容管理</el-button>
</template>
```

把课程Id传递给封装的组件，以便其根据Id加载要编辑的课程数据 `views/course/edit.vue`

```vue
<template>
  <div class="course-edit">
    <create-or-update
      is-edit
      :course-id="courseId"
    />
  </div>
</template>
```

`views/course/components/CreateOrUpdate.vue`

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'CreateOrUpdateCourse',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    courseId: {
      type: [String, Number]
    }
  }
  ...
  created () {
    if (this.isEdit) {
      this.loadCourse()
    }
  },
  ...
})
</script>
```

封装请求 `services/course.ts`

[edu-boss-boot - 通过课程Id获取课程信息](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E7%A8%8B/getCourseByIdUsingGET)

```typescript
export const getCourseById = (courseId: string | number) => {
  return request({
    method: 'GET',
    url: '/boss/course/getCourseById',
    // url: `/boss/course/getCourseById?courseId=${courseId}`,
    params: {
      courseId
    }
  })
}
```

加载请求 `views/course/components/CreateOrUpdate.vue`

```vue
<script lang="ts">
...
import {
  ...
  getCourseById
} from '@/services/course'
...

export default Vue.extend({
  name: 'CreateOrUpdateCourse',
  ...
  methods: {
    async loadCourse () {
      const { data } = await getCourseById(this.courseId)
      this.course = data.data
    },
    ...
  },
  ...
})
</script>
```

```shell
# JS 中一个用来处理时间的类库 moment
npm i moment
```

```vue
<script lang="ts">
...
import moment from 'moment'

export default Vue.extend({
  name: 'CreateOrUpdateCourse',
  ...
  methods: {
    async loadCourse () {
      const { data } = await getCourseById(this.courseId)
      const { activityCourseDTO } = data.data
      if (activityCourseDTO) {
        activityCourseDTO.beginTime = moment(activityCourseDTO.beginTime).format('YYYY-MM-DD')
        activityCourseDTO.endTime = moment(activityCourseDTO.endTime).format('YYYY-MM-DD')
        this.course = data.data
      } else { // 接口中 课程未开启秒杀 字段可能为 null
        this.course = data.data
        this.course.activityCourseDTO = {
          beginTime: '',
          endTime: '',
          amount: 0,
          stock: 0
        }
      }
    },
    ...
  },
  ...
})
</script>
```

到此，添加/编辑课程就完成了