
> 用户拥有**菜单管理**和**资源管理**两种权限，我们先来实现这两个模块才能实现用户相关的逻辑

## 21.10 菜单管理

### 添加菜单 - Card 卡片

参考 [Element - Card 卡片](https://element.eleme.cn/#/zh-CN/component/card#card-qia-pian)

![image-20210509103150971](https://public.shiguanghai.top/blog_img/image-20210509103150971By5XFf.png)

```vue
<el-card class="box-card">
  <div slot="header" class="clearfix">
    <span>卡片名称</span>
    <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
  </div>
  <div v-for="o in 4" :key="o" class="text item">
    {{'列表内容 ' + o }}
  </div>
</el-card>
```

`views/menu/index.vue`

```vue
<template>
  <div class="menu">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-button @click="$router.push({ name: 'menu-create' })">添加菜单</el-button>
      </div>
      <div v-for="o in 4" :key="o" class="text item">
        {{'列表内容 ' + o }}
      </div>
    </el-card>
  </div>
</template>
```

![image-20210509155807156](https://public.shiguanghai.top/blog_img/image-20210509155807156096hvt.png)

创建 `menu-create` 组件，参考 [页面布局 - Form 表单](https://shiguanghai.top/blogs/%E5%A4%A7%E5%89%8D%E7%AB%AF/Vue.js%20%E6%A1%86%E6%9E%B6%E6%BA%90%E7%A0%81%E4%B8%8E%E8%BF%9B%E9%98%B6/edu-boss-fed-%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95.html#%E9%A1%B5%E9%9D%A2%E5%B8%83%E5%B1%80-form-%E8%A1%A8%E5%8D%95)：`views/menu/create.vue`

```vue
<template>
  <div class="menu-create">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>添加菜单</span>
      </div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="菜单名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-select v-model="form.region" placeholder="请选择上级菜单">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="前端图标">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.resource">
            <el-radio label="是"></el-radio>
            <el-radio label="否"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.num" :min="1" label="描述文字"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuCreate',
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

<style lang='scss' scoped></style>
```

配置路由：`router/index.ts`

```typescript
{
  path: '/menu/create',
    name: 'menu-create',
    component: () => import(/* webpackChunkName: 'menu-create' */ '@/views/menu/create.vue')
}
```

![image-20210509160745763](https://public.shiguanghai.top/blog_img/image-20210509160745763NeeYxM.png)

### 添加菜单 - 数据绑定

[edu-boss-boot - 保存或新增菜单](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/saveOrUpdateUsingPOST_1)

根据文档提示在 Postman 中测试

![image-20210510191207521](https://public.shiguanghai.top/blog_img/image-202105101912075211jixLa.png)

![image-20210510192728340](https://public.shiguanghai.top/blog_img/image-20210510192728340UtrSmi.png)

`views/menu/create.vue`

```vue
<template>
  <div class="menu-create">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>添加菜单</span>
      </div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="菜单名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径">
          <el-input v-model="form.href"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-select v-model="form.region" placeholder="请选择上级菜单">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="前端图标">
          <el-input v-model="form.icon"></el-input>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.shown">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.orderNum" :min="1" label="描述文字"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuCreate',
  data () {
    return {
      form: {
        parentId: -1, // -1 表示没有上级菜单
        name: '123',
        href: '123',
        icon: '123',
        orderNum: 0,
        description: '123',
        shown: false
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

<style lang='scss' scoped></style>
```

![image-20210509164521174](https://public.shiguanghai.top/blog_img/image-202105091645211748b0MOT.png)

### 添加菜单 - 提交表单

封装请求方法 `services/menu.ts`

```typescript
/**
 * 菜单管理相关请求模块
 */

import request from '@/utils/request'

export const createOrUpdateMenu = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/menu/saveOrUpdate',
    data
  })
}
```

加载请求 `views/menu/create.vue`

```vue
<template>
  <div class="menu-create">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>添加菜单</span>
      </div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="菜单名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径">
          <el-input v-model="form.href"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-select v-model="form.region" placeholder="请选择上级菜单">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="前端图标">
          <el-input v-model="form.icon"></el-input>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.shown">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.orderNum" :min="1" label="描述文字"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { createOrUpdateMenu } from '@/services/menu'

export default Vue.extend({
  name: 'MenuCreate',
  data () {
    return {
      form: {
        parentId: -1, // -1 表示没有上级菜单
        name: '123',
        href: '123',
        icon: '123',
        orderNum: 0,
        description: '123',
        shown: false
      }
    }
  },
  methods: {
    async onSubmit () {
      // 1. 表单验证
      // 2. 验证通过，提交表单
      const { data } = await createOrUpdateMenu(this.form)
      console.log(data)
    }
  }
})
</script>

<style lang='scss' scoped></style>
```

![image-20210509171056973](https://public.shiguanghai.top/blog_img/image-202105091710569730kXudG.png)

```typescript
// 2. 验证通过，提交表单
const { data } = await createOrUpdateMenu(this.form)
if (data.code === '000000') {
  this.$message.success('提交成功')
  this.$router.back()
}
```

![image-20210509171409724](https://public.shiguanghai.top/blog_img/image-20210509171409724clCBA3.png)

### 添加菜单 - 处理上级菜单

[edu-boss-boot - 获取编辑菜单页面信息](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/getEditMenuInfoUsingGET)

根据文档提示在 Postman 中测试

![image-20210510192125847](https://public.shiguanghai.top/blog_img/image-20210510192125847xCiYHv.png)

封装请求方法 `services/menu.ts`

```typescript
export const getEditMenuInfo = (id = -1) => {
  return request({
    method: 'GET',
    url: '/boss/menu/getEditMenuInfo',
    params: {
      id
    }
  })
}
```

加载请求 `views/menu/create.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import {
  createOrUpdateMenu,
  getEditMenuInfo
} from '@/services/menu'

export default Vue.extend({
  name: 'MenuCreate',
  ...
  created () {
    this.loadMenuInfo()
  },
  methods: {
    async loadMenuInfo () {
      const { data } = await getEditMenuInfo()
      console.log(data)
    },
    ...
  }
})
</script>
```

![image-20210509174105746](https://public.shiguanghai.top/blog_img/image-20210509174105746nYzGKx.png)

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'MenuCreate',
  data () {
    return {
      ...
      parentMenuList: [] // 父级菜单列表
    }
  },
  ...
  methods: {
    async loadMenuInfo () {
      const { data } = await getEditMenuInfo()
      if (data.code === '000000') {
        this.parentMenuList = data.data.parentMenuList
      }
    },
    ...
  }
})
</script>
```

![image-20210509174711728](https://public.shiguanghai.top/blog_img/image-20210509174711728tS4SVP.png)

绑定数据

```vue
<el-form-item label="上级菜单">
  <el-select v-model="form.parentId" placeholder="请选择上级菜单">
    <el-option :value="-1" label="无上级菜单"></el-option>
    <el-option
      :label="item.name"
      :value="item.id"
      v-for="item in parentMenuList"
      :key="item.id"
      ></el-option>
  </el-select>
</el-form-item>
```

![image-20210509175451172](https://public.shiguanghai.top/blog_img/image-20210509175451172yGSY91.png)

### 展示菜单列表 - Table 表格

参考 [Element - Table 表格](https://element.eleme.cn/#/zh-CN/component/table#table-biao-ge)

![image-20210509180410673](https://public.shiguanghai.top/blog_img/image-20210509180410673gmQbJx.png)

```vue
<template>
  <el-table
    :data="tableData"
    style="width: 100%">
    <el-table-column
      prop="date"
      label="日期"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="姓名"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="地址">
    </el-table-column>
  </el-table>
</template>

<script>
  export default {
    data() {
      return {
        tableData: [{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1517 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1519 弄'
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1516 弄'
        }]
      }
    }
  }
</script>
```

`views/menu/index.vue`

```vue
<template>
  <div class="menu">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-button @click="$router.push({ name: 'menu-create' })">添加菜单</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
          label="编号"
          min-width="150"
          type="index">
        </el-table-column>
        <el-table-column
          prop="name"
          label="菜单名称"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="菜单级数"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="前端图标"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="排序"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="name"
          label="操作"
          min-width="150">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuIndex',
  data () {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

![image-20210509182238807](https://public.shiguanghai.top/blog_img/image-20210509182238807uix34E.png)

### 展示菜单列表 - 数据绑定

[edu-boss-boot - 获取所有菜单](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/getAllUsingGET)

根据文档提示在 Postman 中测试

![image-20210510192229372](https://public.shiguanghai.top/blog_img/image-202105101922293727SaYc9.png)

封装请求方法 `services/menu.ts`

```typescript
export const getAllMenus = () => {
  return request({
    method: 'GET',
    url: '/boss/menu/getAll'
  })
}
```

加载请求 `views/menu/index.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import { getAllMenus } from '@/services/menu'

export default Vue.extend({
  name: 'MenuIndex',
  data () {
    return {
      tableData: [
        ...
      ]
    }
  },
  created () {
    this.loadAllMenus()
  },
  methods: {
    async loadAllMenus () {
      const { data } = await getAllMenus()
      console.log(data)
    }
  }
})
</script>
```

![image-20210510193714091](https://public.shiguanghai.top/blog_img/image-20210510193714091iJPXli.png)

```vue
<template>
  <div class="menu">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-button @click="$router.push({ name: 'menu-create' })">添加菜单</el-button>
      </div>
      <el-table
        :data="menus"
        style="width: 100%">
        <el-table-column
          label="编号"
          min-width="150"
          type="index">
        </el-table-column>
        <el-table-column
          prop="name"
          label="菜单名称"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="level"
          label="菜单级数"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="icon"
          label="前端图标"
          min-width="150">
        </el-table-column>
        <el-table-column
          prop="orderNum"
          label="排序"
          min-width="150">
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="150">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { 
  getAllMenus
} from '@/services/menu'

export default Vue.extend({
  name: 'MenuIndex',
  data () {
    return {
      menus: [] // 菜单列表
    }
  },
  created () {
    this.loadAllMenus()
  },
  methods: {
    async loadAllMenus () {
      const { data } = await getAllMenus()
      if (data.code === '000000') {
        this.menus = data.data
      }
    },
    handleEdit () {
      console.log('handleEdit')
    },
    handleDelete () {
      console.log('handleDelete')
    }
  }
})
</script>
```

![image-20210510195616029](https://public.shiguanghai.top/blog_img/image-20210510195616029G0NG5U.png)

![image-20210510195434335](https://public.shiguanghai.top/blog_img/image-20210510195434335wtNCpz.png)

### 删除菜单

 `views/menu/index.vue`

```vue
<el-button
  size="mini"
  type="danger"
  @click="handleDelete(scope.$index, scope.row)"
>删除</el-button>
```

```typescript
handleDelete (index: number, item: any) { // 遍历项索引，当前元素
  console.log('handleDelete: ', index, item)
}
```

![image-20210510200115507](https://public.shiguanghai.top/blog_img/image-20210510200115507Bv4p0y.png)

```typescript
handleDelete (item: any) { // 遍历项索引，当前元素
  console.log('handleDelete: ', item)
  this.$confirm('确认删除吗?', '删除提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 请求删除操作
  }).catch(() => {
    this.$message({
      type: 'info',
      message: '已取消删除'
    })
  })
}
```

[edu-boss-boot - 删除菜单](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/deleteUsingDELETE)

封装请求 `services/menu.ts`

```typescript
export const deleteMenu = (id: number) => {
  return request({
    method: 'DELETE',
    url: `/boss/menu/${id}`
  })
}
```

`views/menu/index.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import {
  getAllMenus,
  deleteMenu
} from '@/services/menu'

export default Vue.extend({
  name: 'MenuIndex',
  ...
  methods: {
    ...
    handleDelete (item: any) { // $index 遍历项索引，item 当前元素
      console.log('handleDelete: ', item)
      this.$confirm('确认删除吗?', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 请求删除操作
        const { data } = await deleteMenu(item.id)
        if (data.code === '000000') {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.loadAllMenus() // 更新数据列表
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
})
</script>
```

![image-20210510202131989](https://public.shiguanghai.top/blog_img/image-20210510202131989vEou8x.png)

### 编辑菜单 - 提取组件

我们的编辑菜单页和添加菜单页功能一样，我们可以提取出来便我们重用

公共组件 `views/menu/components/CreateOrEdit.vue`

```vue
<template>
  <div class="menu-create">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '编辑菜单' : '添加菜单' }}</span>
      </div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="菜单名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单路径">
          <el-input v-model="form.href"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-select v-model="form.parentId" placeholder="请选择上级菜单">
            <el-option :value="-1" label="无上级菜单"></el-option>
            <el-option
              :label="item.name"
              :value="item.id"
              v-for="item in parentMenuList"
              :key="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item label="前端图标">
          <el-input v-model="form.icon"></el-input>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="form.shown">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.orderNum" :min="1" label="描述文字"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  createOrUpdateMenu,
  getEditMenuInfo
} from '@/services/menu'

export default Vue.extend({
  name: 'MenuCreate',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: {
        parentId: -1, // -1 表示没有上级菜单
        name: '123',
        href: '123',
        icon: '123',
        orderNum: 0,
        description: '123',
        shown: false
      },
      parentMenuList: [] // 父级菜单列表
    }
  },
  created () {
    this.loadMenuInfo()
  },
  methods: {
    async loadMenuInfo () {
      const { data } = await getEditMenuInfo()
      if (data.code === '000000') {
        this.parentMenuList = data.data.parentMenuList
      }
    },
    async onSubmit () {
      // 1. 表单验证
      // 2. 验证通过，提交表单
      const { data } = await createOrUpdateMenu(this.form)
      if (data.code === '000000') {
        this.$message.success('提交成功')
        this.$router.back()
      }
    }
  }
})
</script>

<style lang='scss' scoped></style>
```

编辑菜单 `views/menu/create.vue`

```vue
<template>
  <div class="menu-create">
    <create-or-edit />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CreateOrEdit from './components/CreateOrEdit.vue'

export default Vue.extend({
  name: 'MenuCreate',
  components: {
    CreateOrEdit
  },
  data () {
    return {}
  }
})
</script>

<style lang='scss' scoped></style>
```

添加菜单 `views/menu/edit.vue`

```vue
<template>
  <div class="menu-edit">
    <create-or-edit :is-edit="true" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CreateOrEdit from './components/CreateOrEdit.vue'

export default Vue.extend({
  name: 'MenuEdit',
  components: {
    CreateOrEdit
  },
  data () {
    return {}
  }
})
</script>

<style lang='scss' scoped></style>
```

为编辑菜单 `MenuEdit` 配置动态路由 `router/index.ts`

```typescript
{
  path: '/menu/:id/edit',
  name: 'menu-edit',
  component: () => import(/* webpackChunkName: 'menu-edit' */ '@/views/menu/edit.vue')
}
```

将添加菜单和编辑菜单走一个`Chunk`

```typescript
{
  path: '/menu/create',
  name: 'menu-create',
  component: () => import(/* webpackChunkName: 'menu-create-edit' */ '@/views/menu/create.vue')
},
{
  path: '/menu/:id/edit',
  name: 'menu-edit',
  component: () => import(/* webpackChunkName: 'menu-create-edit' */ '@/views/menu/edit.vue')
}
```

编辑菜单方法 `views/menu/index.vue`

```typescript
handleEdit (item: any) {
  // console.log('handleEdit')
  this.$router.push({
    name: 'menu-edit',
    params: {
      id: item.id
    }
  })
}
```

![image-20210510204749523](https://public.shiguanghai.top/blog_img/image-20210510204749523EocIJz.png)

### 编辑菜单 - 逻辑处理

- 编辑时不显示重置按钮
- 编辑时展示菜单信息 `getEditMenuInfo`

给`getEditMenuInfo` 添加联合类型 `services/menu.ts`

```typescript
export const getEditMenuInfo = (id: string | number = -1) => {
  return request({
    method: 'GET',
    url: '/boss/menu/getEditMenuInfo',
    params: {
      id
    }
  })
}
```

`views/menu/components/CreateOrEdit.vue`

```vue
<el-form-item>
  <el-button type="primary" @click="onSubmit">提交</el-button>
  <el-button
    v-if="!isEdit"
  >重置</el-button>
</el-form-item>

<script lang="ts">
...

export default Vue.extend({
  name: 'MenuCreate',
  ...
  methods: {
    async loadMenuInfo () {
      const { data } = await getEditMenuInfo(this.$route.params.id || -1)
      // console.log(data)
      if (data.data.menuInfo) {
        this.form = data.data.menuInfo
      }
      if (data.code === '000000') {
        this.parentMenuList = data.data.parentMenuList
      }
    },
    ...
  }
})
</script>
```

![image-20210510205632589](https://public.shiguanghai.top/blog_img/image-20210510205632589LPt77U.png)

![image-20210510210050318](https://public.shiguanghai.top/blog_img/image-20210510210050318lWlKXp.png)

处理提交按钮不需要额外修改，因为接口会根据是否传参 `id` 决定

![image-20210510210250726](https://public.shiguanghai.top/blog_img/image-20210510210250726jBW8r6.png)

![image-20210510210454537](https://public.shiguanghai.top/blog_img/image-20210510210454537iiyzko.png)

## 21.11 资源管理

> 资源管理内的的增删改与菜单管理类似，此处不再赘述。不同的是资源列表新增了查询及分页功能，这里会着重介绍资源列表内部
>
> 除了上述操作，还有资源分类，内部逻辑也是增删改查，同样不再赘述

### 布局

提取列表资源组件 `views/resource/components/List.vue`

```vue
<template>
  <div class="resource-list">资源列表</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ResourceList'
})
</script>

<style lang='scss' scoped></style>
```

在资源管理加载资源列表 `views/resource/index.vue`

```vue
<template>
  <div class="resource">
    <resource-list />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ResourceList from './components/List.vue'

export default Vue.extend({
  name: 'ResourceIndex',
  components: {
    ResourceList
  }
})
</script>

<style lang="scss" scoped></style>
```

处理资源列表，利用 Element 的 [Card 卡片](https://element.eleme.cn/#/zh-CN/component/card#card-qia-pian) 和 [Table 表格](https://element.eleme.cn/#/zh-CN/component/table#table-biao-ge) 搭建基础架子 `views/resource/components/List.vue`

```vue
<template>
  <div class="resource-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>资源管理</span>
        <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ResourceList',
  data () {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  }
})
</script>
```

![image-20210511193602596](https://public.shiguanghai.top/blog_img/image-20210511193602596zxjTVj.png)

将头部替换为一个 [表单 Form](https://element.eleme.io/#/zh-CN/component/form#form-biao-dan) 行内表单 供资源查询

![image-20210511194026387](https://public.shiguanghai.top/blog_img/image-202105111940263870dogie.png)

```js
<el-form :inline="true" :model="formInline" class="demo-form-inline">
  <el-form-item label="审批人">
    <el-input v-model="formInline.user" placeholder="审批人"></el-input>
  </el-form-item>
  <el-form-item label="活动区域">
    <el-select v-model="formInline.region" placeholder="活动区域">
      <el-option label="区域一" value="shanghai"></el-option>
      <el-option label="区域二" value="beijing"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">查询</el-button>
  </el-form-item>
</el-form>
<script>
  export default {
    data() {
      return {
        formInline: {
          user: '',
          region: ''
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

`views/resource/components/List.vue`

```vue
<template>
  <div class="resource-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="审批人">
            <el-input v-model="formInline.user" placeholder="审批人"></el-input>
          </el-form-item>
          <el-form-item label="活动区域">
            <el-select v-model="formInline.region" placeholder="活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ResourceList',
  data () {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }],
      formInline: {
        user: '',
        region: ''
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

![image-20210511194659328](https://public.shiguanghai.top/blog_img/image-20210511194659328nQobe6.png)

### 展示资源列表

接下来是资源列表的展示，我们暂时不考虑分页功能。[edu-boss-boot - 按条件分页查询资源](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86/getResourcePagesUsingPOST)

根据文档提示在 Postman 中测试

![image-20210511210734531](https://public.shiguanghai.top/blog_img/image-20210511210734531KJc3Nn.png)

接口不传参数默认获取列表，可以通过传参（模糊、联合）查询特定条件

封装接口 `services/resource.ts`

```typescript
/**
 * 资源管理相关请求模块
 */

import request from '@/utils/request'

export const getResourcePages = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/resource/getResourcePages',
    data
  })
}
```

加载请求 `views/resource/components/List.vue`

```typescript
import { getResourcePages } from '@/services/resource'

methods: {
  async loadResources () {
    const { data } = await getResourcePages({
      // 查询条件
    })
    console.log(data)
  },
  onSubmit () {
    console.log('submit!')
  }
}
```

![image-20210511204158037](https://public.shiguanghai.top/blog_img/image-20210511204158037xxSykT.png)

绑定数据

```typescript
data () {
  return {
    resources: [], // 资源列表
    ..
  }
},
...
methods: {
  async loadResources () {
    const { data } = await getResourcePages({
      // 查询条件
    })
    this.resources = data.data.records
  },
  handleEdit (item: any) {
    console.log('handleEdit', item)
  },
  handleDelete (item: any) {
    console.log('handleDelete', item)
  },
  ...
}
```

```vue
<el-table
  :data="resources"
  style="width: 100%">
  <el-table-column
    type="index"
    label="编号"
    width="100">
  </el-table-column>
  <el-table-column
    prop="name"
    label="资源名称"
    width="180">
  </el-table-column>
  <el-table-column
    prop="url"
    width="180"
    label="资源路径">
  </el-table-column>
  <el-table-column
    prop="description"
    width="180"
    label="描述">
  </el-table-column>
  <el-table-column
    width="180"
    prop="createdTime"
    label="添加时间">
  </el-table-column>
  <el-table-column
    width="180"
    label="操作">
    <template slot-scope="scope">
      <el-button
        size="mini"
        @click="handleEdit(scope.row)">编辑</el-button>
      <el-button
        size="mini"
        type="danger"
        @click="handleDelete(scope.row)">删除</el-button>
    </template>
  </el-table-column>
</el-table>
```

![image-20210511213425412](https://public.shiguanghai.top/blog_img/image-202105112134254125JuNZU.png)

### 资源列表分页处理 -  Pagination 分页

接下来给列表加上分页功能，参考 [Element -  Pagination 分页](https://element.eleme.io/#/zh-CN/component/pagination#pagination-fen-ye)

![image-20210511211019068](https://public.shiguanghai.top/blog_img/image-20210511211019068qbjZx8.png)

```vue
<span class="demonstration">完整功能</span>
<el-pagination
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
  :current-page="currentPage4"
  :page-sizes="[100, 200, 300, 400]"
  :page-size="100"
  layout="total, sizes, prev, pager, next, jumper"
  :total="400">
</el-pagination>
<script>
  export default {
    methods: {
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
      }
    },
    data() {
      return {
        currentPage1: 5,
        currentPage2: 5,
        currentPage3: 5,
        currentPage4: 4
      };
    }
  }
</script>
```

`views/resource/components/List.vue`

```vue
<template>
  <div class="resource-list">
    <el-card class="box-card">
      ...
      <!--
        total：总记录数
        page-size：每页大小
        分页组件会根据 total 和 page-size 计算一共分多少页
       -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="form.current"
        :page-sizes="[5, 10, 20]"
        :page-size="form.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount">
      </el-pagination>
    </el-card>
  </div>
</template>

<script lang="ts">
...

export default Vue.extend({
  name: 'ResourceList',
  data () {
    return {
      resources: [], // 资源列表
      form: {
        current: 1, // 默认查询第1页数据
        size: 5 // 每页大小
      },
      totalCount: 0
    }
  },
  ...
  methods: {
    async loadResources () {
      const { data } = await getResourcePages({
        // 查询条件
        current: this.form.current, // 分页页码
        size: this.form.size // 每页大小
      })
      this.resources = data.data.records
      this.totalCount = data.data.total
    },
    ...
    handleSizeChange (val: number) {
      // 每页大小发生改变
      // console.log(`每页 ${val} 条`)
      this.form.size = val
      this.form.current = 1 // 每页大小改变，重新查询第1页数据
      this.loadResources()
    },
    handleCurrentChange (val: number) {
      // 页码发生改变
      // console.log(`当前页: ${val}`)
      // 请求获取对应页码的数据
      this.form.current = val // 修改要查询的页码
      this.loadResources() // 重绘列表数据
    }
  }
})
</script>
```

![image-20210511214925279](https://public.shiguanghai.top/blog_img/image-20210511214925279RPzCdP.png)

### 列表数据筛选

首先获取资源分类，[edu-boss-boot - 查询资源分类列表](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86/getCategoriesUsingGET)

根据文档提示在 Postman 中测试

![image-20210511223623322](https://public.shiguanghai.top/blog_img/image-202105112236233225w0urI.png)

封装请求 `services/resource-category.ts`

```typescript
/**
 * 资源分类相关请求模块
 */

import request from '@/utils/request'

export const getResourceCategories = () => {
  return request({
    method: 'GET',
    url: '/boss/resource/category/getAll'
  })
}
```

加载请求 `views/resource/components/List.vue`

```typescript
import { getResourceCategories } from '@/services/resource-category'

created () {
  ...
  this.loadResourceCategories()
},
methods: {
  async loadResourceCategories () {
    const { data } = await getResourceCategories()
    console.log(data)
  },
  ...
}
```

![image-20210511222250222](https://public.shiguanghai.top/blog_img/image-20210511222250222hoXFMT.png)

绑定数据

```typescript
data () {
  return {
    ...
    form: {
      ...
      name: '',
      url: '',
      categoryId: null // 资源分类，null查询所有
    },
    ...
    resourceCategories: [] // 资源分类列表
  }
},
methods: {
  async loadResourceCategories () {
    const { data } = await getResourceCategories()
    this.resourceCategories = data.data
  }
  async loadResources () {
    const { data } = await getResourcePages(this.form)
    ...
  },
  ...
  onSubmit () {
    this.form.current = 1 // 筛选查询从第1页开始
    this.loadResources()
  },
  ...
},
```

```vue
<el-form :inline="true" :model="form" label-width="80px">
  <el-form-item label="资源名称">
    <el-input v-model="form.name" placeholder="资源名称"></el-input>
  </el-form-item>
  <el-form-item label="资源路径">
    <el-input v-model="form.url" placeholder="资源路径"></el-input>
  </el-form-item>
  <el-form-item label="资源分类">
    <el-select
      v-model="form.categoryId"
      placeholder="全部"
      clearable
    >
      <el-option
        v-for="item in resourceCategories"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">查询搜索</el-button>
  </el-form-item>
</el-form>
```

![image-20210511222840263](https://public.shiguanghai.top/blog_img/image-20210511222840263oDMwj7.png)

![image-20210511230521768](https://public.shiguanghai.top/blog_img/image-20210511230521768kctHv8.png)

### 重置数据筛选

```vue
<el-form ref="form" :model="form" label-width="80px">
  <el-form-item prop="name" label="资源名称">
    <el-input v-model="form.name" placeholder="资源名称"></el-input>
  </el-form-item>
  <el-form-item prop="url" label="资源路径">
    <el-input v-model="form.url" placeholder="资源路径"></el-input>
  </el-form-item>
  <el-form-item prop="categoryId" label="资源分类">
    <el-select
      v-model="form.categoryId"
      placeholder="全部"
      clearable
    >
      <el-option
        v-for="item in resourceCategories"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">查询搜索</el-button>
    <el-button @click="onReset">重置</el-button>
  </el-form-item>
</el-form>
<script lang="ts">
  ...
  methods: {
    onReset () {
      (this.$refs.form as Form).resetFields()
      this.form.current = 1 // 重置回到第1页
      this.loadResources()
    }
  }
</script>
```

### 加载中 loading 和按钮禁用

当我们点击分页、查询或者重置时要去发请求，如果网络过慢会出现多次请求的问题，我以我们要做一个 loading 加载和请求期间按钮禁用

```typescript
async loadResources () {
  this.isLoading = true // 展示加载中状态
  const { data } = await getResourcePages(this.form)
  this.resources = data.data.records
  this.totalCount = data.data.total
  this.isLoading = false // 关闭加载中状态
}
```

按钮 和 分页 可以通过添加 `:disabled="isLoading"` 来解决。表格可以通过 `v-loading="isLoading"` 来解决