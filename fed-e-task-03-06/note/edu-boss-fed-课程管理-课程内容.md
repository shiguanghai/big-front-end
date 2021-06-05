## 21.14 课程管理

### 课程内容 - 准备

新建课程内容页面 `views/course/section.vue`

```vue
<template>
  <div class="course-section">课程内容</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseSection',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    }
  }
})
</script>

<style lang='scss' scoped></style>
```

配置路由 `router/index.ts`

```typescript
{
  path: '/course/:courseId/section',
  name: 'course-section',
  component: () => import(/* webpackChunkName: 'course-section' */ '@/views/course/section.vue'),
  props: true // 将路由路径参数映射到组件的 props 数据中
}
```

注册事件 `views/course/components/CourseList.vue`

```vue
<el-button
  @click="$router.push({
    name: 'course-section',
    params: {
      courseId: scope.row.id
    }
  })"
>内容管理</el-button>
```

![image-20210523221113525](https://public.shiguanghai.top/blog_img/image-20210523221113525IwMZDh.png)

### 课程内容 - 章节列表 - Tree 树形控件

参考 [Element - Tree 树形控件-可拖拽节点](https://element.eleme.cn/#/zh-CN/component/tree#ke-tuo-zhuai-jie-dian)

> 通过 draggable 属性可让节点变为可拖拽。

封装请求 `services/course-section.ts`

[edu-boss-boot - getSectionAndLesson](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E7%AB%A0%E8%8A%82%E5%86%85%E5%AE%B9/getSectionAndLessonUsingGET)

```typescript
/**
 * 课程章节相关请求模块
 */

import request from '@/utils/request'

export const getSectionAndLesson = (courseId: string | number) => {
  return request({
    method: 'GET',
    url: '/boss/course/section/getSectionAndLesson',
    params: {
      courseId
    }
  })
}
```

加载请求 `views/course/section.vue`

```vue
<template>
  <div class="course-section">
    <el-card class="box-card">
      <div slot="header">
        <span>课程名称</span>
      </div>
      <el-tree
        :data="sections"
        :props="defaultProps"
        draggable
      ></el-tree>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getSectionAndLesson } from '@/services/course-section'

export default Vue.extend({
  name: 'CourseSection',
  ...
  data () {
    return {
      sections: [],
      defaultProps: {
        children: 'lessonDTOS',
        label (data: any) {
          return data.sectionName || data.theme
        }
      }
    }
  },
  created () {
    this.loadSections()
  },
  methods: {
    async loadSections () {
      const { data } = await getSectionAndLesson(this.courseId)
      this.sections = data.data
    }
  }
})
</script>
```

![image-20210525204941753](https://public.shiguanghai.top/blog_img/image-20210525204941753WdkDxx.png)

### 课程内容 - 章节列表 - 自定义树组件节点内容

Tree 树形控件 默认只能展示文本，如果你想要定制它里面的内容就要用到它的 [插槽](https://element.eleme.cn/#/zh-CN/component/tree#scoped-slot)

```vue
<template>
  <div class="course-section">
    <el-card class="box-card">
      <div slot="header">
        <span>课程名称</span>
      </div>
      <el-tree
        :data="sections"
        :props="defaultProps"
        draggable
      >
        <div class="inner" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <!-- section -->
          <span v-if="data.sectionName" class="actions">
            <el-button>编辑</el-button>
            <el-button>添加课时</el-button>
            <el-button>状态</el-button>
          </span>
          <!-- lession -->
          <span v-else class="actions">
            <el-button>编辑</el-button>
            <el-button>上传视频</el-button>
            <el-button>状态</el-button>
          </span>
        </div>
      </el-tree>
    </el-card>
  </div>
</template>

<style lang='scss' scoped>
.inner {
  flex: 1;
  display: flex;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}
::v-deep .el-tree-node__content {
  height: auto;
}
</style>
```

![image-20210525210912370](https://public.shiguanghai.top/blog_img/image-20210525210912370a3dMay.png)

### 课程内容 - 阶段列表 - 添加/编辑阶段

封装请求 `services/course-section.ts`

[edu-boss-boot - saveOrUpdateSection](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E7%AB%A0%E8%8A%82%E5%86%85%E5%AE%B9/saveOrUpdateSectionUsingPOST)

[edu-boss-boot - getSectionById](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E7%AB%A0%E8%8A%82%E5%86%85%E5%AE%B9/getBySectionIdUsingGET)

```typescript
export const saveOrUpdateSection = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/course/section/saveOrUpdateSection',
    data
  })
}

export const getSectionById = (sectionId: string | number) => {
  return request({
    method: 'GET',
    url: '/boss/course/section/getBySectionId',
    params: {
      sectionId
    }
  })
}
```

加载请求 `views/course/section.vue`

- 添加阶段

```vue
<template>
  <div class="course-section">
    <!-- 阶段列表 -->
    <el-card class="box-card">
      <div class="card-header" slot="header">
        {{ course.courseName }}
        <el-button
          type="primary"
          @click="handleShowAddSection"
        >添加阶段</el-button>
      </div>
      ....
    </el-card>
    <!-- /阶段列表 -->

    <!-- 添加阶段 -->
    <el-dialog
      title="添加课程阶段"
      :visible.sync="isAddSectionShow"
    >
      <el-form ref="section-form" :model="section" label-width="70px">
        <el-form-item label="课程名称">
          <el-input
            :value="course.courseName"
            autocomplete="off"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="章节名称">
          <el-input v-model="section.sectionName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="章节描述">
          <el-input v-model="section.description" type="textarea" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="章节排序">
          <el-input-number v-model="section.orderNum"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isAddSectionShow = false">取 消</el-button>
        <el-button type="primary" @click="handleAddSection">确 定</el-button>
      </div>
    </el-dialog>
    <!-- /添加阶段 -->

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  ...
  saveOrUpdateSection
} from '@/services/course-section'
import { getCourseById } from '@/services/course'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'CourseSection',
  ...
  data () {
    const defaultProps = {
      children: 'lessonDTOS',
      label (data: any) {
        return data.sectionName || data.theme
      }
    }
    const section = {
      courseId: this.courseId,
      sectionName: '',
      description: '',
      orderNum: 0,
      status: 0
    }

    return {
      course: {},
      sections: [],
      defaultProps,
      isAddSectionShow: false,
      section
    }
  },
  created () {
    this.loadSections()
    this.loadCourse()
  },
  methods: {
    async loadCourse () {
      const { data } = await getCourseById(this.courseId)
      this.course = data.data
    },
    async loadSections () {
      const { data } = await getSectionAndLesson(this.courseId)
      this.sections = data.data
    },
    handleShowAddSection () {
      this.section = { // 防止数据还是编辑时获取的数据
        courseId: this.courseId,
        sectionName: '',
        description: '',
        orderNum: 0,
        status: 0
      }
      this.isAddSectionShow = true
    },
    async handleAddSection () {
      await saveOrUpdateSection(this.section)
      this.loadSections()
      this.isAddSectionShow = false
      ;(this.$refs['section-form'] as Form).resetFields() // 表单重置
      this.$message.success('操作成功')
    }
  }
})
</script>

<style lang='scss' scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
...
</style>
```

![image-20210525221734359](https://public.shiguanghai.top/blog_img/image-20210525221734359ICsqFy.png)

![image-20210525221759632](https://public.shiguanghai.top/blog_img/image-20210525221759632i9AFy3.png)

- 编辑阶段

```vue
<span v-if="data.sectionName" class="actions">
  <el-button @click.stop="handleShowEditSection(data)">编辑</el-button>
  <el-button>添加课时</el-button>
  <el-button>状态</el-button>
</span>

<!-- 添加阶段 -->
<el-dialog
  :title="isEditSection ? '编辑课程阶段' : '添加课程阶段'"
  :visible.sync="isAddSectionShow"
>
  ...
</el-dialog>
<!-- /添加阶段 -->

<script lang="ts">
import Vue from 'vue'
import {
  ...
  getSectionById
} from '@/services/course-section'
import { getCourseById } from '@/services/course'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'CourseSection',
  ...
  data () {
    ...
    return {
      ...
      isEditSection: false
    }
  },
  created () {
    this.loadSections()
    this.loadCourse()
  },
  methods: {
    ...
    handleShowAddSection () {
      ...
      this.isEditSection = false
      this.isAddSectionShow = true
    },
    ...
    async handleShowEditSection (section: any) {
      const { data } = await getSectionById(section.id)
      this.section = data.data
      this.isEditSection = true
      this.isAddSectionShow = true
    }
  }
})
</script>
```

![image-20210525223703143](https://public.shiguanghai.top/blog_img/image-20210525223703143tuSfXo.png)

![image-20210525223734582](https://public.shiguanghai.top/blog_img/image-20210525223734582U7Vy3b.png)

### 课程内容 - 课时列表 - 添加/编辑课时

课时的添加与编辑和阶段类似

封装请求 `services/course-lesson.ts`

[edu-boss-boot - 保存或更新课时](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E6%97%B6%E5%86%85%E5%AE%B9/saveOrUpdateUsingPOST)

```typescript
/**
 * 课程课时相关请求模块
 */

import request from '@/utils/request'

export const saveOrUpdateLesson = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/course/lesson/saveOrUpdate',
    data
  })
}
```

加载请求 `views/course/section.vue`

```vue
<el-tree
  :data="sections"
  :props="defaultProps"
  draggable
>
  <div class="inner" slot-scope="{ node, data }">
    <span>{{ node.label }}</span>
    <!-- section -->
    <span v-if="data.sectionName" class="actions">
      <el-button @click.stop="handleShowEditSection(data)">编辑</el-button>
      <el-button
        type="primary"
        @click.stop="handleShowAddLesson(data)"
      >添加课时</el-button>
      <el-button>状态</el-button>
    </span>
    <!-- lession -->
    <span v-else class="actions">
      <el-button @click="handleShowEditLesson(data, node.parent.data)">编辑</el-button>
      <el-button>上传视频</el-button>
      <el-button>状态</el-button>
    </span>
  </div>
</el-tree>

<!-- 添加课时 -->
<el-dialog
  :title="isEditLesson ? '编辑课时' : '添加课时'"
  :visible.sync="isAddLessonShow"
>
  <el-form ref="lesson-form" :model="lesson" label-width="100px">
    <el-form-item label="课程名称">
      <el-input
        :value="course.courseName"
        autocomplete="off"
        disabled
      ></el-input>
    </el-form-item>
    <el-form-item label="章节名称">
      <el-input :value="lesson.sectionName" disabled autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="课时名称">
      <el-input v-model="lesson.theme" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="时长">
      <el-input v-model.number="lesson.duration" type="number" autocomplete="off">
        <template slot="append">分钟</template>
      </el-input>
    </el-form-item>
    <el-form-item label="是否开放试听">
      <el-switch v-model="lesson.isFree"></el-switch>
    </el-form-item>
    <el-form-item label="课时排序" prop="description">
      <el-input-number v-model="lesson.orderNum"></el-input-number>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="isAddLessonShow = false">取 消</el-button>
    <el-button type="primary" @click="handleAddLesson">确 定</el-button>
  </div>
</el-dialog>
<!-- /添加课时 -->

<script lang="ts">
...
import { saveOrUpdateLesson } from '@/services/course-lesson'

export default Vue.extend({
  name: 'CourseSection',
  ...
  data () {
    ...
    const lesson = {
      courseId: this.courseId,
      sectionId: undefined,
      sectionName: '',
      theme: '',
      duration: 0,
      isFree: false,
      orderNum: 0,
      status: 0
    }

    return {
      ...
      lesson,
      isAddLessonShow: false,
      isEditLesson: false
    }
  },
  ...
  methods: {
    ...
    handleShowAddLesson (data: any) {
      this.lesson = {
        sectionName: data.sectionName,
        sectionId: data.id,
        courseId: this.courseId,
        theme: '',
        duration: 0,
        isFree: false,
        orderNum: 0,
        status: 0
      }
      this.isEditLesson = false
      this.isAddLessonShow = true
    },
    async handleAddLesson () {
      await saveOrUpdateLesson(this.lesson)
      this.$message.success('操作成功')
      this.loadSections()
      this.isAddLessonShow = false
    },
    handleShowEditLesson (lesson: any, section: any) {
      this.lesson = lesson
      this.lesson.sectionName = section.sectionName
      this.isEditLesson = true
      this.isAddLessonShow = true
    }
  }
})
</script>
```

![image-20210527141145998](https://public.shiguanghai.top/blog_img/image-20210527141145998pe1JXj.png)

![image-20210527141107566](https://public.shiguanghai.top/blog_img/image-20210527141107566TCFrdw.png)

### 课程内容 - 章节列表 - 状态处理

```vue
<!-- section -->
<span v-if="data.sectionName" class="actions">
  <el-button @click.stop="handleShowEditSection(data)">编辑</el-button>
  <el-button
    type="primary"
    @click.stop="handleShowAddLesson(data)"
  >添加课时</el-button>
  <el-select
    class="select-status"
    v-model="data.status"
    placeholder="请选择"
    @change="handleSectionStatusChange(data)"
  >
    <el-option label="已隐藏" :value="0" />
    <el-option label="待更新" :value="1" />
    <el-option label="已更新" :value="2" />
  </el-select>
</span>
<!-- lession -->
<span v-else class="actions">
  <el-button @click="handleShowEditLesson(data, node.parent.data)">编辑</el-button>
  <el-button type="success">上传视频</el-button>
  <el-select
    class="select-status"
    v-model="data.status"
    placeholder="请选择"
    @change="handleLessonStatusChange(data)"
  >
    <el-option label="已隐藏" :value="0" />
    <el-option label="待更新" :value="1" />
    <el-option label="已更新" :value="2" />
  </el-select>
</span>

<script lang="ts">
...

export default Vue.extend({
  name: 'CourseSection',
  ...
  methods: {
    ...
    async handleSectionStatusChange (section: any) {
      await saveOrUpdateSection(section)
      this.$message.success('操作成功')
    },
    async handleLessonStatusChange (lesson: any) {
      await saveOrUpdateLesson(lesson)
      this.$message.success('操作成功')
    }
  }
})
</script>

<style lang='scss' scoped>
...
.select-status {
  max-width: 100px;
  margin-left: 8px;
}
</style>
```

![image-20210527214252164](https://public.shiguanghai.top/blog_img/image-20210527214252164B7aPql.png)

![image-20210527214504523](https://public.shiguanghai.top/blog_img/image-202105272145045233wg9CP.png)

### 课程内容 - 处理节点拖动的逻辑

我们希望 阶段列表 可以通过拖拽的方式来进行排序。目前 `tree` 组件的拖动是可以任意级别来实现的

![image-20210527215015082](https://public.shiguanghai.top/blog_img/image-20210527215015082ysaeX6.png)

- 这样相当于在一个阶段里面又包含了一个阶段作为了它的课时，这是不允许的
- 另外我们也不希望阶段内部的课时随意拖动（把一个阶段的课时拖动到另一个阶段内部）
- 同样不允许将一个阶段的课时作为其另一个课时的子节点

参考 [Tree -  Attributes](https://element.eleme.cn/#/zh-CN/component/tree#attributes)

| 参数       | 说明                                                         | 类型                                   |
| ---------- | ------------------------------------------------------------ | -------------------------------------- |
| allow-drop | 拖拽时判定目标节点能否被放置。`type` 参数有三种情况：'prev'、'inner' 和 'next'，分别表示放置在目标节点前、插入至目标节点和放置在目标节点后 | Function(draggingNode, dropNode, type) |

- 我们不希望有 `inner` 插入节点的情况
- 同一个阶段内的所有课时的`sectionId`都是一样的
  - 条件：拖动节点的`sectionId`等于目标节点的`sectionId`
  - 拖动阶段到其他阶段内课时前后：阶段没有 `sectionId`，为 `false`
  - 拖动阶段内课时到其他阶段内课时前后：`sectionId` 不同，为 `false`
  - 拖动阶段内课时到其他阶段前后：阶段没有 `sectionId`，为 `false`

```vue
<el-tree
  :data="sections"
  :props="defaultProps"
  draggable
  :allow-drop="handleAllowDrop"
>
  ...
</el-tree>

<script lang="ts">
...

export default Vue.extend({
  name: 'CourseSection',
  ...
  methods: {
    ...
    handleAllowDrop (draggingNode: any, dropNode: any, type: any) {
      // draggingNode 拖动的节点
      // dropNode 放置的目标节点
      // type: prev、inner 和 next，分别表示放置在目标节点前、插入至目标节点和放置在目标节点后
      return draggingNode.data.sectionId === dropNode.data.sectionId && type !== 'inner'
    }
  }
})
</script>
```

### 课程内容 - 处理节点拖动排序数据更新

我们希望有一个接口把排序后的列表的`Id`以及它对应的排序序号发送给后台把数据进行更新来完成排序工作，但是我们这里并没有提供这样一个接口

我们这里只有更新某一个阶段或者课时的接口。我们目前可以在拖动后通过遍历整个列表把每一个阶段或者每一个课时的序号做一个整体的更新

- 完成拖拽的时机：参考 [Tree - Events](https://element.eleme.cn/#/zh-CN/component/tree#events)

  | 事件名称  | 说明                     | 回调参数                                                     |
  | :-------- | :----------------------- | :----------------------------------------------------------- |
  | node-drop | 拖拽成功完成时触发的事件 | 共四个参数，依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点、被拖拽节点的放置位置（before、after、inner）、event |

- 拖拽的类型

  - 阶段之间的拖拽：阶段节点具有 `lessonDTOS` 字段
  - 课时之间的拖拽：否则就是课时节点

- 遍历的方法

  - 阶段之间的拖拽：`this.sections` 或 `dropNode.parent.childNodes`
  - 课时之间的拖拽：对应阶段的 `lessonDTOS` 或 `dropNode.parent.childNodes`

```vue
<el-tree
  :data="sections"
  :props="defaultProps"
  draggable
  :allow-drop="handleAllowDrop"
  @node-drop="handleSort"
>
  ...
</el-tree>

<script lang="ts">
...

export default Vue.extend({
  name: 'CourseSection',
  ...
  methods: {
    ...
    async handleSort (dragNode: any, dropNode: any, type: any, event: any) {
      // console.log(dropNode.parent.childNodes)
      try {
        await Promise.all(dropNode.parent.childNodes.map((item: any, index: number) => {
          if (dragNode.data.lessonDTOS) {
            // 阶段
            return saveOrUpdateSection({
              id: item.data.id,
              orderNum: index + 1
            })
          } else {
            // 课时
            return saveOrUpdateLesson({
              id: item.data.id,
              orderNum: index + 1
            })
          }
        }))
        this.$message.success('排序成功')
      } catch (error) {
        this.$message.error('排序失败')
      }
    }
  }
})
</script>
```

### 上传课时视频 - 准备

新建视频组件 `views/course/video.vue`

```vue
<template>
  <div class="course-video">课程视频</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseVideo'
})
</script>

<style lang='scss' scoped></style>
```

配置路由 `router/index.ts`

```typescript
{
  path: '/course/:courseId/video',
  name: 'course-video',
  component: () => import(/* webpackChunkName: 'course-video' */ '@/views/course/video.vue'),
  props: true // 将路由路径参数映射到组件的 props 数据中
}
```

注册事件 `views/course/section.vue`

```vue
<el-button
  type="success"
  @click="$router.push({
    name: 'course-video',
    params: {
      courseId
    }
  })"
>上传视频</el-button>
```

![image-20210528162704581](https://public.shiguanghai.top/blog_img/image-20210528162704581JiZctG.png)

`views/course/video.vue`

```vue
<template>
  <div class="container">
    <el-card>
      <div slot="header">
        <div>课程：xxx</div>
        <div>阶段：xxx</div>
        <div>课时：xxx</div>
      </div>
      <el-form label-width="80px">
        <el-form-item label="视频上传">
          <input
            type="file"
          >
        </el-form-item>
        <el-form-item label="封面上传">
          <input
            type="file"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
          >开始上传</el-button>
          <el-button
            @click="$router.back()"
          >返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
```

![image-20210528163147821](https://public.shiguanghai.top/blog_img/image-20210528163147821FSMRz3.png)

### 上传课时视频 - 阿里云视频点播服务介绍

本项目不使用自己的后台上传，而是使用第三方平台的视频服务

> 阿里云视频点播（ApsaraVideo VoD）是集音视频采集、编辑、上传、自动化转码处理、媒体资源管理、高效云剪辑处理、分发加速、视频播放于一体的一站式音视频点播解决方案。

这种东西如果从零到一去开发的话成本是极大的，无论是人力还是财力都是一方面。所以这种第三方的方案相对来讲要更成熟，所以我们的系统选的也是阿里云视频点播服务

![image-20210528164254583](https://public.shiguanghai.top/blog_img/image-20210528164254583wRegG2.png)

- **开发者** 充当的是后端开发者的角色即 **服务端开发人员**
- **内容提供方** 可以看做上传视频内容的人员即 **我们**
- **存储** 即最终 **存储视频的地方**

开发流程：**后台的开发者**开发一个 **授权的 API**，请求阿里云的后台 **访问控制** 拿到可以上传视频的 **凭证**。然后把这个内容发送给视频上传的前端即 **普通用户**，去请求阿里云后台上传内容

从前端的角度出发：上传视频前发送请求到自己的后台，自己的后台在去请求阿里云访问的控制来得到一个上传视频的Token，后台拿到凭证把这个数据给到我们，我们拿到这个Token再去请求阿里云上传

- 得到上传视频的授权(Token)：[使用JavaScript上传SDK](https://help.aliyun.com/document_detail/52204.html?spm=a2c4g.11186623.6.1016.16143ed89XRQXY)

- 首先下载 [Web端SDK](https://alivc-demo-cms.alicdn.com/versionProduct/sourceCode/upload/JS/aliyun-upload-sdk-1.5.2demo.zip?spm=a2c4g.11186623.2.34.371279dddMvdzL&file=aliyun-upload-sdk-1.5.2demo.zip)

  - 解压打开 `vue-demo/lib`，拿到 `alyun-upload-sdk` 文件夹放到项目的 `public` 文件夹下

- 在项目中引入

  - 这个文件未兼容 JS模块化，因此我们需要全局引入（不受 Webpack 打包影响）
  - `public/index.html`

  ```html
  <!DOCTYPE html>
  <html lang="">
    <body>
      ...
      <noscript>
        <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
      </noscript>
      <div id="app"></div>
      <script src="/aliyun-upload-sdk/lib/es6-promise.min.js"></script>
      <script src="/aliyun-upload-sdk/lib/aliyun-oss-sdk-6.13.0.min.js"></script>
      <script src="/aliyun-upload-sdk/aliyun-upload-sdk-1.5.2.min.js"></script>
      <!-- built files will be auto injected -->
    </body>
  </html>
  ```

- 在 `views/course/video.vue` 中使用

### 上传课时视频 - 阿里云视频上传 - 体验官方demo

打开下载的 `vue-demo/src` 文件夹，提供两种上传方式

- STSToken.vue
- UploadAuth.vue

这里我们使用 `UploadAuth.vue` 提供的方式，将其内容复制到 `views/course/video-demo.vue`

配置路由到 `video-demo` 来体验官方demo：`router/index.ts`

```typescript
{
  path: '/course/:courseId/video',
  name: 'course-video',
  component: () => import(/* webpackChunkName: 'course-video' */ '@/views/course/video-demo.vue'),
  props: true // 将路由路径参数映射到组件的 props 数据中
}
```

禁用 `vue-demo` 中的 `ES6` 校验：在 `<script></script>` 首行添加 `/* eslint-disable */`

![image-20210528172327937](https://public.shiguanghai.top/blog_img/image-20210528172327937F367Nh.png)

![image-20210528211723014](https://public.shiguanghai.top/blog_img/image-20210528211723014MqeAB8.png)

### 上传课时视频 - 初始化阿里云上传

修改路由回 `video.vue`

- 1.请求上传地址和凭证

  - 上传视频：客户端向AppServer发送请求，AppServer通过OpenAPI向阿里云视频点播服务发送`CreateUploadVideo`请求。请求成功将返回上传地址、上传凭证以及VideoId，AppServer将结果返回给客户端
  - 上传图片：客户端向AppServer发送请求，AppServer通过OpenAPI向阿里云视频点播服务发送`CreateUploadImage`请求。请求成功将返回上传地址、上传凭证以及ImageURL，AppServer将结果返回给客户端

- 2.初始化上传实例

  - i.声明`AliyunUpload.Vod`初始化回调

    - ```js
      var uploader = new AliyunUpload.Vod({
             //阿里账号ID，必须有值
             userId:"122",
           //上传到视频点播的地域，默认值为'cn-shanghai'，//eu-central-1，ap-southeast-1
           region:"",
             //分片大小默认1 MB，不能小于100 KB
             partSize: 1048576,
           //并行上传分片个数，默认5
             parallel: 5,
           //网络原因失败时，重新上传次数，默认为3
           retryCount: 3,
           //网络原因失败时，重新上传间隔时间，默认为2秒
           retryDuration: 2,
            //开始上传
            'onUploadstarted': function (uploadInfo) {
            },
            //文件上传成功
            'onUploadSucceed': function (uploadInfo) {
            },
            //文件上传失败
            'onUploadFailed': function (uploadInfo, code, message) {
            },
            //文件上传进度，单位：字节
            'onUploadProgress': function (uploadInfo, totalSize, loadedPercent) {
            },
            //上传凭证或STS token超时
            'onUploadTokenExpired': function (uploadInfo) {
            },
          //全部文件上传结束
          'onUploadEnd':function(uploadInfo){
             }
        });
      ```

  - ii.根据实际情况，选择初始化上传实例的方法

    - 上传地址和凭证方式：在上传开始后触发的`onUploadStarted`回调中调用`setUploadAuthAndAddress(uploadFileInfo, uploadAuth, uploadAddress,videoId)`方法进行设置

- 3.列表管理

  - 获取到用户选择的文件后，添加到上传列表中 `uploader.addFile(event.target.files[i], null, null, null, paramData);`
    - 是否启用水印和优先级，paramData是一个json对象字符串，第一级的Vod是必须的，Vod下面添加属性
    - 接口示例 `var paramData = '{"Vod":{"Title":"test","CateId":"234"}"}';`

- 4.上传控制

  - 开始上传 `uploader.startUpload();`

配置 AliyunUpload 的 TS `shims-vue.d.ts`

```typescript
...
interface Window {
  AliyunUpload: any
}
```

处理上传实例 `views/course/video.vue`

```vue
<el-form label-width="80px">
  <el-form-item label="视频上传">
    <input ref="video-file" type="file" />
  </el-form-item>
  <el-form-item label="封面上传">
    <input ref="image-file" type="file" />
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="handleUpload">开始上传</el-button>
    <el-button @click="$router.back()">返回</el-button>
  </el-form-item>
</el-form>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseVideo',
  data () {
    return {
      uploader: null
    }
  },
  computed: {
    video () {
      return this.$refs['video-file']
    },
    image () {
      return this.$refs['image-file']
    }
  },
  created () {
    this.initUploader()
  },
  methods: {
    initUploader () {
      this.uploader = new window.AliyunUpload.Vod({
        // 阿里账号ID，必须有值
        userId: '1618139964448548',
        // 上传到视频点播的地域，默认值为'cn-shanghai'，//eu-central-1，ap-southeast-1
        region: '',
        // 分片大小默认1 MB，不能小于100 KB
        partSize: 1048576,
        // 并行上传分片个数，默认5
        parallel: 5,
        // 网络原因失败时，重新上传次数，默认为3
        retryCount: 3,
        // 网络原因失败时，重新上传间隔时间，默认为2秒
        retryDuration: 2,
        // 开始上传
        onUploadstarted: function (uploadInfo: any) {
          console.log('onUploadstarted', uploadInfo)
        },
        // 文件上传成功
        onUploadSucceed: function (uploadInfo: any) {
          console.log('onUploadSucceed', uploadInfo)
        },
        // 文件上传失败
        onUploadFailed: function (uploadInfo: any, code: any, message: any) {
          console.log('onUploadFailed', uploadInfo, code, message)
        },
        // 文件上传进度，单位：字节
        onUploadProgress: function (
          uploadInfo: any,
          totalSize: any,
          loadedPercent: any
        ) {
          console.log('onUploadProgress', uploadInfo, totalSize, loadedPercent)
        },
        // 上传凭证或STS token超时
        onUploadTokenExpired: function (uploadInfo: any) {
          console.log('onUploadTokenExpired', uploadInfo)
        },
        // 全部文件上传结束
        onUploadEnd: function (uploadInfo: any) {
          console.log('onUploadEnd', uploadInfo)
        }
      })
    },
    handleUpload () {
      // 获取上传的文件
      const videoFile = (this.video as any).files[0]
      const imageFile = (this.image as any).files[0]
      console.log(videoFile, imageFile)
    }
  }
})
</script>
```

![image-20210528221559138](https://public.shiguanghai.top/blog_img/image-20210528221559138FnzWKF.png)

将用户所选的文件添加到上传列表中并上传

```vue
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CourseVideo',
  ...
  methods: {
    ...
    handleUpload () {
      // 获取上传的文件
      const imageFile = (this.image as any).files[0]
      const videoFile = (this.video as any).files[0]
      const uploader = this.uploader as any

      // 将用户所选的文件添加到上传列表中
      // 一旦开始上传，它就会按照列表中添加的顺序开始上传
      uploader.addFile(imageFile, null, null, null, '{"Vod":{}}')
      uploader.addFile(videoFile, null, null, null, '{"Vod":{}}')

      // 开始上传，触发 onUploadstarted 事件
      uploader.startUpload()
    }
  }
})
</script>
```

初始化上传实例的方法 `onUploadstarted`

```typescript
onUploadstarted: function (uploadInfo: any) {
  console.log('onUploadstarted', uploadInfo)

  // 1. 通过我们的后端获取上传凭证
  // 2. 调用 uploader.setUploadAuthAndAddress 设置上传凭证
  // 3. 设置好上传凭证确认没有问题，上传进度开始
  
  // setUploadAuthAndAddress(uploadFileInfo, uploadAuth, uploadAddress,videoId)
}
```

### 上传课时视频 - 封装上传相关接口

封装请求 `services/aliyun-upload.ts`

[edu-boss-boot - 获取阿里云视频上传凭证](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E9%98%BF%E9%87%8C%E4%B8%8A%E4%BC%A0/aliyunVideoUploadAddressAdnAuthUsingGET)

[edu-boss-boot - 获取阿里云图片上传凭证](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E9%98%BF%E9%87%8C%E4%B8%8A%E4%BC%A0/generateAliyunImagUploadAddressAdnAuthUsingGET)

[edu-boss-boot - 阿里云转码请求](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E9%98%BF%E9%87%8C%E4%B8%8A%E4%BC%A0/aliyunTransCodeUsingPOST)

[edu-boss-boot - 阿里云转码进度](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E9%98%BF%E9%87%8C%E4%B8%8A%E4%BC%A0/aliyunTransCodePercentUsingGET)

```typescript
/**
 * 阿里云上传相关请求模块
 */

import request from '@/utils/request'

export const getAliyunVideoUploadAddressAdnAuth = (params: any) => {
  return request({
    method: 'GET',
    url: '/boss/course/upload/aliyunVideoUploadAddressAdnAuth.json',
    params
  })
}

export const getAliyunImagUploadAddressAdnAuth = () => {
  return request({
    method: 'GET',
    url: '/boss/course/upload/aliyunImagUploadAddressAdnAuth.json'
  })
}

export const aliyunTransCode = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/course/upload/aliyunTransCode.json',
    data
  })
}

export const getAliyunTransCodePercent = (lessonId: any) => {
  return request({
    method: 'GET',
    url: '/boss/course/upload/aliyunTransCodePercent.json',
    params: {
      lessonId
    }
  })
}
```

### 上传课时视频 - 上传文件

`views/course/video.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import {
  getAliyunVideoUploadAddressAdnAuth,
  getAliyunImagUploadAddressAdnAuth
} from '@/services/aliyun-upload'

export default Vue.extend({
  name: 'CourseVideo',
  data () {
    return {
      uploader: null,
      imageURL: ''
    }
  },
  ...
  methods: {
    initUploader () {
      this.uploader = new window.AliyunUpload.Vod({
        ...
        // 开始上传
        onUploadstarted: async (uploadInfo: any) => {
          console.log('onUploadstarted', uploadInfo)
          // 1. 通过我们的后端获取上传凭证
          let uploadAddressAndAuth
          if (uploadInfo.isImage) {
            // 获取图片上传凭证
            const { data } = await getAliyunImagUploadAddressAdnAuth()
            uploadAddressAndAuth = data.data
            this.imageURL = uploadAddressAndAuth.imageURL
          } else {
            // 获取视频上传凭证
            const { data } = await getAliyunVideoUploadAddressAdnAuth({
              fileName: uploadInfo.file.name,
              imageUrl: this.imageURL // 请确保一定是先上传图片
            })
            uploadAddressAndAuth = data.data
          }
          // 2. 调用 uploader.setUploadAuthAndAddress 设置上传凭证
          (this.uploader as any).setUploadAuthAndAddress(
            uploadInfo,
            uploadAddressAndAuth.uploadAuth,
            uploadAddressAndAuth.uploadAddress,
            uploadAddressAndAuth.imageId || uploadAddressAndAuth.videoId
          )
          // 3. 设置好上传凭证确认没有问题，上传进度开始
          // setUploadAuthAndAddress(uploadFileInfo, uploadAuth, uploadAddress, videoId)
        },
        ...
      })
    },
    ...
  }
})
</script>
```

![image-20210529124327561](https://public.shiguanghai.top/blog_img/image-20210529124327561sGeJie.png)

### 上传课时视频 - 处理转码

现在我们只是把文件上传到了阿里云，怎么样让它和课时对应起来，我们还要进行转码操作

`views/course/video.vue`

```typescript
import {
  ...
  aliyunTransCode,
  getAliyunTransCodePercent
} from '@/services/aliyun-upload'

// 全部文件上传结束
onUploadEnd: function (uploadInfo: any) {
  console.log('onUploadEnd', uploadInfo)
  // 请求转码
  aliyunTransCode({
    // lessonId ,
    // coverImageUrl ,
    // fileName ,
    // fileId
  })
  // 获取转码进度
  getAliyunTransCodePercent(lessonId)
}
```

获取 `lessonId`：`views/course/section.vue`

```vue
<el-button
  type="success"
  @click="$router.push({
    name: 'course-video',
    params: {
      courseId
    },
    query: {
      lessonId: data.id
    }
  })"
>上传视频</el-button>
```

`views/course/video.vue`

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'CourseVideo',
  data () {
    return {
      ...
      videoId: null
    }
  },
  ...
  methods: {
    initUploader () {
      this.uploader = new window.AliyunUpload.Vod({
        ...
        // 开始上传
        onUploadstarted: async (uploadInfo: any) => {
          // 1. 通过我们的后端获取上传凭证
          if (uploadInfo.isImage) {
            ...
          } else {
            // 获取视频上传凭证
            ...
            this.videoId = uploadAddressAndAuth.videoId
          }
          ...
        },
        ...
        // 全部文件上传结束
        onUploadEnd: async (uploadInfo: any) => {
          console.log('onUploadEnd', uploadInfo)
          // 请求转码
          const { data } = await aliyunTransCode({
            lessonId: this.$route.query.lessonId,
            coverImageUrl: this.imageURL,
            fileName: (this.video as any).files[0].name, // 文件名
            fileId: this.videoId // 视频Id
          })
          console.log(data)
          // 轮询查询转码进度
          const timer = setInterval(async () => {
            const { data } = await getAliyunTransCodePercent(this.$route.query.lessonId)
            console.log(data.data)
            if (data.data === 100) {
              window.clearInterval(timer)
              console.log('转码成功')
            }
          }, 3000)
        }
      })
    },
    ...
  }
})
</script>
```

![image-20210529133132303](https://public.shiguanghai.top/blog_img/image-20210529133132303Ulzxvi.png)

![image-20210529133413353](https://public.shiguanghai.top/blog_img/image-20210529133413353sxk9RH.png)

![image-20210529133434068](https://public.shiguanghai.top/blog_img/image-20210529133434068GHuXce.png)

### 上传课时视频 - 进度提示

接下来我们给上传按钮添加 loading 提示及其他文字性提示

```vue
<el-form-item>
  <p>视频上传中：{{ uploadPercent }}%</p>
  <p
    v-if="isUploadSuccess"
  >视频转码中：{{ isTransCodeSuccess ? '完成' : '正在处理，请稍后'}}</p>
</el-form-item>

<script lang="ts">
export default Vue.extend({
  name: 'CourseVideo',
  data () {
    return {
      ...
      uploadPercent: 0,
      isUploadSuccess: false,
      isTransCodeSuccess: false
    }
  },
  ...
  methods: {
    async loadLesson () {
      const { data } = await getLessonById(this.$route.query.lessonId)
      this.lesson = data.data
    },
    initUploader () {
      this.uploader = new window.AliyunUpload.Vod({
        ...
        // 文件上传进度，单位：字节
        onUploadProgress: (
          uploadInfo: any,
          totalSize: any,
          loadedPercent: any
        ) => {
          console.log('onUploadProgress', uploadInfo, totalSize, loadedPercent)
          if (!uploadInfo.isImage) {
            this.uploadPercent = Math.floor(loadedPercent * 100)
          }
        },
        ...
        // 全部文件上传结束
        onUploadEnd: async (uploadInfo: any) => {
          this.isUploadSuccess = true
          // 请求转码
          ...
          // 轮询查询转码进度
          const timer = setInterval(async () => {
            ...
            if (data.data === 100) {
              this.isTransCodeSuccess = true
              ...
            }
          }, 3000)
        }
      })
    },
    handleUpload () {
      // 初始化上传状态
      this.isUploadSuccess = false
      this.isTransCodeSuccess = false
      this.uploadPercent = 0
      ...
    }
  }
})
</script>
```

- 处理 `header` 信息

封装请求 `services/course-lesson.ts`

[edu-boss-boot - 通过Id获取课时](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%AF%BE%E6%97%B6%E5%86%85%E5%AE%B9/getByIdUsingGET)

```typescript
export const getLessonById = (lessonId: any) => {
  return request({
    method: 'GET',
    url: '/boss/course/lesson/getById',
    params: {
      lessonId
    }
  })
}
```

加载请求 `views/course/video.vue`

```vue
<div slot="header">
  <div>课程：{{ courseName }}</div>
  <div>阶段：{{ sectionName }}</div>
  <div>课时：{{ lessonName }}</div>
</div>

<script lang="ts">
...
import { getLessonById } from '@/services/course-lesson'
import { getSectionById } from '@/services/course-section'
import { getCourseById } from '@/services/course'

export default Vue.extend({
  name: 'CourseVideo',
  data () {
    return {
      ...
      lessonName: null,
      sectionName: null,
      courseName: null
    }
  },
  computed: {
    video () {
      return this.$refs['video-file']
    },
    image () {
      return this.$refs['image-file']
    }
  },
  created () {
    this.initUploader()
    this.loadHeadTitle()
  },
  methods: {
    async loadHeadTitle () {
      const { data } = await getLessonById(this.$route.query.lessonId)
      this.lessonName = data.data.theme
      const section = await getSectionById(data.data.sectionId)
      this.sectionName = section.data.data.sectionName
      const course = await getCourseById(data.data.courseId)
      this.courseName = course.data.data.courseName
    },
    ...
  }
})
</script>
```

![image-20210529145737727](https://public.shiguanghai.top/blog_img/image-20210529145737727RFLwWI.png)

> 到此，课程管理所有内容均已处理完毕。项目也接近尾声，剩余的一些细节这里不再赘述，可以自行完善