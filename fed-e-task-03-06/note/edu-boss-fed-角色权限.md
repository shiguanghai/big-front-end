
> 不同的角色拥有**不同的菜单**和**不同的资源**管理权限，先完成角色管理模块。再把这些角色分配给不同的用户，这些用户就拥有了对应的**菜单管理**权限和**资源管理**权限

## 21.12 角色管理

### 角色管理 - 布局

对于角色管理，这里已经处理好了列表的数据展示，可以参考菜单、资源管理，所以不再赘述。此外，列表内容的搜索、重置以及删除功能已经实现，也不再赘述

封装请求 `services/role.ts`

[edu-boss-boot - 按条件查询角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/getRolePagesUsingPOST)

[edu-boss-boot - 删除角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/deleteUsingDELETE_2)

```typescript
/**
 * 角色相关请求模块
 */

import request from '@/utils/request'

export const getRoles = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/role/getRolePages',
    data
  })
}

export const deleteRole = (id: string | number) => {
  return request({
    method: 'DELETE',
    url: `/boss/role/${id}`
  })
}
```

封装列表资源组件 `views/role/components/List.vue`

```vue
<template>
  <div class="role-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <!-- <span>筛选搜索</span> -->
        <el-form ref="form" :model="form">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="onSubmit"
              :disabled="loading"
            >查询搜索</el-button>
            <el-button
              :disabled="loading"
              @click="onReset"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-button @click="dialogFormVisible = true">添加角色</el-button>
      <el-table
        :data="roles"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column
          prop="id"
          label="编号"
        />
        <el-table-column
          prop="name"
          label="角色名称"
        />
        <el-table-column
          prop="description"
          label="描述"
        />
        <el-table-column
          prop="createdTime"
          label="添加时间"
        />
        <el-table-column
          label="操作"
          align="center"
          width="150px"
        >
          <template slot-scope="scope">
            <div>
              <el-button type="text">分配菜单</el-button>
              <el-button type="text">分配资源</el-button>
            </div>
            <div>
              <el-button
                type="text"
                @click="handleEdit(scope.row)"
              >编辑</el-button>
              <el-button
                size="mini"
                type="text"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getRoles, deleteRole } from '@/services/role'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'RoleList',
  data () {
    return {
      roles: [], // 角色列表
      form: {
        current: 1,
        size: 50,
        name: ''
      }, // 查询条件
      loading: false
    }
  },

  created () {
    this.loadRoles()
  },

  methods: {
    async loadRoles () {
      this.loading = true
      const { data } = await getRoles(this.form)
      this.roles = data.data.records
      this.loading = false
    },
    onSubmit () {
      this.loadRoles()
    },
    handleEdit (role: any) {
      console.log(role)
    },
    async handleDelete (role: any) {
      try {
        await this.$confirm(`确认删除角色：${role.name}？`, '删除提示')
        await deleteRole(role.id)
        this.$message.success('删除成功')
        this.loadRoles()
      } catch (err) {
        if (err && err.response) {
          this.$message.error('删除失败，请重试')
        } else {
          this.$message.info('取消删除')
        }
      }
    },
    onReset () {
      (this.$refs.form as Form).resetFields()
      this.loadRoles()
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

加载资源列表 `views/role/index.vue`

```vue
<template>
  <div class="role">
    <role-list />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import RoleList from './components/List.vue'

export default Vue.extend({
  name: 'LoginIndex',
  components: {
    RoleList
  }
})
</script>

<style lang="scss" scoped></style>
```

![image-20210512211936677](https://public.shiguanghai.top/blog_img/image-20210512211936677rd6pYu.png)

接下来我们来着重演示菜单管理的添加角色、编辑角色、分配菜单以及分配资源的功能

### 添加角色 - Dialog 对话框

参考 [Element - Dialog 对话框](https://element.eleme.cn/#/zh-CN/component/dialog#dialog-dui-hua-kuang)

![image-20210512203512871](https://public.shiguanghai.top/blog_img/image-20210512203512871O6lc4o.png)

```js
<el-button type="text" @click="dialogVisible = true">点击打开 Dialog</el-button>

<el-dialog
  title="提示"
  :visible.sync="dialogVisible"
  width="30%"
  :before-close="handleClose">
  <span>这是一段信息</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
</el-dialog>

<script>
  export default {
    data() {
      return {
        dialogVisible: false
      };
    },
    methods: {
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      }
    }
  };
</script>
```

`views/role/components/List.vue`

```vue
<!-- Dialog 需要设置visible属性，它接收Boolean，当为true时显示 Dialog -->
<el-dialog
  title="添加角色"
  :visible.sync="dialogVisible"
  width="30%"
>
  <span>这是一段信息</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
<script lang="ts">
export default Vue.extend({
  data () {
    return {
      ...
      dialogVisible: true // 控制添加或者编辑角色的对话框显示或隐藏
    }
  }
})
</script>
```

![image-20210512214138173](https://public.shiguanghai.top/blog_img/image-2021051221413817394IDDh.png)

不建议把表单直接写到 Dialog 对话框中，我们可以把它封装为一个组件在 Dialog 中进行调用，通过组建通信完成这个功能：`views/role/components/CreateOrEdit.vue`

```vue
<template>
  <div>添加角色</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CreateOrEditRole'
})
</script>

<style lang='scss' scoped></style>
```

加载组建 `views/role/components/List.vue`

```vue
<!-- Dialog 需要设置visible属性，它接收Boolean，当为true时显示 Dialog -->
<el-dialog
  title="添加角色"
  :visible.sync="dialogVisible"
  width="30%"
>
  <create-or-edit />
</el-dialog>
<script lang="ts">
...
import CreateOrEdit from './CreateOrEdit.vue'

export default Vue.extend({
  components: {
    CreateOrEdit
  }
})
</script>
```

![image-20210512215038555](https://public.shiguanghai.top/blog_img/image-20210512215038555fEbYPA.png)

在组件中处理一下表单 `views/role/components/CreateOrEdit.vue`

```vue
<template>
  <div>
    <el-form>
      <el-form-item label="角色名称">
        <el-input></el-input>
      </el-form-item>
      <el-form-item label="角色编码">
        <el-input></el-input>
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input type="textarea"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button>取消</el-button>
        <el-button type="primary">确认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'CreateOrEditRole'
})
</script>

<style lang="scss" scoped></style>
```

![image-20210512220015658](https://public.shiguanghai.top/blog_img/image-20210512220015658WKFnMx.png)

### 添加角色 - 保存角色信息

[edu-boss-boot - 保存或者更新角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/saveOrUpdateUsingPOST_3)

封装请求 `services/role.ts`

```typescript
export const createOrUpdate = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/role/saveOrUpdate',
    data
  })
}
```

加载请求  `views/role/components/CreateOrEdit.vue`

```vue
<template>
  <div>
    <el-form>
      <el-form-item label="角色名称">
        <el-input v-model="role.name"></el-input>
      </el-form-item>
      <el-form-item label="角色编码">
        <el-input v-model="role.code"></el-input>
      </el-form-item>
      <el-form-item label="角色描述">
        <el-input type="textarea" v-model="role.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button>取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { createOrUpdate } from '@/services/role'

export default Vue.extend({
  name: 'CreateOrEditRole',
  data () {
    return {
      role: {
        code: '',
        name: '',
        description: ''
      }
    }
  },
  methods: {
    async onSubmit () {
      await createOrUpdate(this.role)
      this.$message.success('操作成功')
    }
  }
})
</script>
```

给 **添加角色** 按钮绑定方法 `views/role/components/List.vue`

```vue
<el-button @click="dialogVisible = true">添加角色</el-button>
```

利用 **父子组件通信** 处理添加角色成功后对话框的关闭和数据刷新（默认当前创建/编辑组件无法操作父组件中的对话框，且无法调用父组件重新获取列表数据的方法）

子组件 `views/role/components/CreateOrEdit.vue`

```vue
<el-form-item>
  <el-button @click="$emit('cancel')">取消</el-button>
  <el-button type="primary" @click="onSubmit">确认</el-button>
</el-form-item>
```

```typescript
async onSubmit () {
  ...
  this.$emit('success')
}
```

父组件 `views/role/components/List.vue`

```vue
<!-- Dialog 需要设置visible属性，它接收Boolean，当为true时显示 Dialog -->
<el-dialog
  title="添加角色"
  :visible.sync="dialogVisible"
  width="50%"
 >
  <create-or-edit
    @success="onSuccess"
    @cancel="dialogVisible = false"
  />
</el-dialog>
<script lang="ts">
export default Vue.extend({
  name: 'CreateOrEditRole',
  ...
  methods: {
    onSuccess () {
      this.dialogVisible = false // 关闭对话框
      this.loadRoles() // 重新加载数据列表
    }
  }
})
</script>
```

![image-20210512222822592](https://public.shiguanghai.top/blog_img/image-20210512222822592PF8dOD.png)

![image-20210512222837800](https://public.shiguanghai.top/blog_img/image-202105122228378008UCTyO.png)

### 编辑角色 - 复用添加角色处理

编辑角色类似添加角色，也是一个弹出层，它里面有所点击角色的信息

`views/role/components/List.vue`

```vue
<el-button @click="handleAdd">添加角色</el-button>
...
<!-- Dialog 需要设置visible属性，它接收Boolean，当为true时显示 Dialog -->
<el-dialog
  title="添加角色"
  :visible.sync="dialogVisible"
  width="50%"
>
  <create-or-edit
    :role-id="roleId"
    :isEdit="isEdit"
    ...
  />
</el-dialog>

<script lang="ts">
...

export default Vue.extend({
  name: 'RoleList',
  data () {
    return {
      ...
      roleId: null, // 编辑角色的 ID
      isEdit: false
    }
  },
  ...
  methods: {
    ..
    handleEdit (role: any) {
      this.dialogVisible = true
      this.roleId = role.id
      this.isEdit = true
    },
    ...
    handleAdd () {
      this.isEdit = false
      this.dialogVisible = true
    }
  }
})
</script>
```

在组件中获取角色ID  `views/role/components/CreateOrEdit.vue`

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'CreateOrEditRole',
  props: {
    roleId: {
      type: [String, Number]
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  }
  ...
})
</script>
```

![image-20210514222307458](https://public.shiguanghai.top/blog_img/image-202105142223074585SiFvN.png)

在组件被渲染出来以后根据 角色ID 获取角色信息展示到表单内容当中

```vue
<script lang="ts">
...

export default Vue.extend({
  name: 'CreateOrEditRole',
  ...
  created () {
    // 如果是编辑操作，则根据角色ID加载展示角色信息
    if (this.isEdit) {
      console.log('这是编辑操作')
    }
  },
  ...
})
</script>
```

我们会发现，当多次点击编辑按钮时，都只输出了一次 `这是编辑操作`。即弹出层只有在第一次的时候会把里面的内容渲染出来，一旦渲染完成，之后把弹出层关闭，弹出层组件并没有被销毁，只是一个隐藏和显示的切换，所以组件内部的生命周期也就不会去重新执行

我们希望每一次 关闭-打开 里面的组件重新渲染，重新执行生命周期才能拿到对应的数据

找到使用组件的位置 `views/role/components/List.vue`

```vue
<!-- Dialog 需要设置visible属性，它接收Boolean，当为true时显示 Dialog -->
<el-dialog
  title="添加角色"
  :visible.sync="dialogVisible"
  width="50%"
>
  <create-or-edit
    v-if="dialogVisible"
    ...
  />
</el-dialog>
```

![image-20210514223206821](https://public.shiguanghai.top/blog_img/image-202105142232068216Il6QW.png)

### 编辑角色 - 展示更新角色信息

[edu-boss-boot - 获取角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/getByIdUsingGET_3)

封装请求 `services/role.ts`

```typescript
export const getRoleById = (id: string | number) => {
  return request({
    method: 'GET',
    url: `/boss/role/${id}`
  })
}
```

加载请求  `views/role/components/CreateOrEdit.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import {
  createOrUpdate,
  getRoleById
} from '@/services/role'

export default Vue.extend({
  name: 'CreateOrEditRole',
  ...
  created () {
    // 如果是编辑操作，则根据角色ID加载展示角色信息
    if (this.isEdit) {
      this.loadRole()
    }
  },
  methods: {
    async loadRole () {
      const { data } = await getRoleById(this.roleId)
      console.log(data)
    },
    ...
  }
})
</script>
```

![image-20210514224104404](https://public.shiguanghai.top/blog_img/image-202105142241044040Mhh3Q.png)

```typescript
async loadRole () {
  const { data } = await getRoleById(this.roleId)
  this.role = data.data
}
```

![image-20210514224354759](https://public.shiguanghai.top/blog_img/image-20210514224354759OwwyUY.png)

此时数据就加载进来了，而我们点击确定对应的接口就是**保存或者更新角色**，如果提交时提供了`id`就是更新操作

最后我们来修改弹出层展示的标题 `views/role/components/List.vue`

```vue
<!-- Dialog 需要设置visible属性，它接收Boolean，当为true时显示 Dialog -->
<el-dialog
  :title="isEdit ? '编辑角色' : '添加角色'"
  :visible.sync="dialogVisible"
  width="50%"
>
  ...
</el-dialog>
```

![image-20210514225101125](https://public.shiguanghai.top/blog_img/image-20210514225101125hC07as.png)

![image-20210514225115066](https://public.shiguanghai.top/blog_img/image-202105142251150665XPezk.png)

### 分配菜单 - 路由参数解耦

封装分配菜单组件 `views/role/alloc-menu.vue`

```vue
<template>
  <div class="alloc-menu">分配菜单</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AllocMenu'
})
</script>

<style lang='scss' scoped></style>
```

配置路由：`router/index.ts`

```typescript
{
  path: '/role/:roleId/alloc-menu',
  name: 'alloc-menu',
  component: () => import(/* webpackChunkName: 'alloc-menu' */ '@/views/role/alloc-menu.vue')
}
```

为 分配菜单 按钮注册点击事件 `views/role/components/List.vue`

```vue
<el-button
  type="text"
  @click="$router.push({
    name: 'alloc-menu',
    params: {
      roleId: scope.row.id
    }
  })"
>分配菜单</el-button>
```

![image-20210515194559002](https://public.shiguanghai.top/blog_img/image-20210515194559002lyhqpe.png)

在 分配菜单 页面当中需要使用到 角色ID 来获取到角色对应的菜单列表进行展示。因为它是一个动态的路由参数

![image-20210515194912578](https://public.shiguanghai.top/blog_img/image-20210515194912578ePMnWB.png)

现在这个组件是作为一个路由组件来使用的，当前依赖路由参数 `roleId`。如果我们希望这个组件不作为路由组件去使用该怎么做呢？

如果不作为路由组件，就不能保证路径中有 `roleId`，我们有一种更好的方式能让数据和路由解耦：我们可以把它作为 `props` 参数由父组件传给子组件 的这种通信方式

`views/role/alloc-menu.vue`

```vue
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AllocMenu',
  props: {
    roleId: {
      type: [String, Number],
      required: true
    }
  }
})
</script>
```

路由组件怎么去传递参数呢？

`router/index.ts`

```typescript
{
  path: '/role/:roleId/alloc-menu',
  name: 'alloc-menu',
  component: () => import(/* webpackChunkName: 'alloc-menu' */ '@/views/role/alloc-menu.vue'),
  props: true // 将路由路径参数映射到组件的 props 数据中
}
```

![image-20210515195939451](https://public.shiguanghai.top/blog_img/image-20210515195939451LKuFTJ.png)

此时，这个组件和这个路由就解耦了，它不仅仅可以作为路由组件来使用，把它作为普通组件来使用也是可以的，其使用方式就可以变得更加灵活

### 分配菜单 - 展示菜单列表 - Tree 树形控件

参考 [Element - Tree 树形控件](https://element.eleme.cn/#/zh-CN/component/tree#tree-shu-xing-kong-jian)

![image-20210515200731522](https://public.shiguanghai.top/blog_img/image-20210515200731522lK2jp5.png)

```vue
<el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick"></el-tree>

<script>
  export default {
    data() {
      return {
        data: [{
          label: '一级 1',
          children: [{
            label: '二级 1-1',
            children: [{
              label: '三级 1-1-1'
            }]
          }]
        }, {
          label: '一级 2',
          children: [{
            label: '二级 2-1',
            children: [{
              label: '三级 2-1-1'
            }]
          }, {
            label: '二级 2-2',
            children: [{
              label: '三级 2-2-1'
            }]
          }]
        }, {
          label: '一级 3',
          children: [{
            label: '二级 3-1',
            children: [{
              label: '三级 3-1-1'
            }]
          }, {
            label: '二级 3-2',
            children: [{
              label: '三级 3-2-1'
            }]
          }]
        }],
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      };
    },
    methods: {
      handleNodeClick(data) {
        console.log(data);
      }
    }
  };
</script>
```

`views/role/alloc-menu.vue`

```vue
<template>
  <div class="alloc-menu">
    <el-tree
      :data="menus"
      :props="defaultProps"
      show-checkbox
      default-expand-all
    ></el-tree>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'AllocMenu',
  props: {
    roleId: {
      type: [String, Number],
      required: true
    }
  },
  data () {
    return {
      menus: [{
        label: '一级 1',
        children: [{
          label: '二级 1-1',
          children: [{
            label: '三级 1-1-1'
          }]
        }]
      }, {
        label: '一级 2',
        children: [{
          label: '二级 2-1',
          children: [{
            label: '三级 2-1-1'
          }]
        }, {
          label: '二级 2-2',
          children: [{
            label: '三级 2-2-1'
          }]
        }]
      }, {
        label: '一级 3',
        children: [{
          label: '二级 3-1',
          children: [{
            label: '三级 3-1-1'
          }]
        }, {
          label: '二级 3-2',
          children: [{
            label: '三级 3-2-1'
          }]
        }]
      }],
      defaultProps: { // 个性化定制
        children: 'children', // 子节点数组
        label: 'label' // 节点名称
      }
    }
  }
})
</script>

<style lang='scss' scoped></style>
```

![image-20210515202300405](https://public.shiguanghai.top/blog_img/image-20210515202300405RDcxJy.png)

[edu-boss-boot - 获取所有菜单并按层级展示](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/getMenuNodeListUsingGET)

封装请求 `services/menu.ts`

```typescript
export const getMenuNodeList = () => {
  return request({
    method: 'GET',
    url: '/boss/menu/getMenuNodeList'
  })
}
```

加载请求  `views/role/alloc-menu.vue`

```vue
<script lang="ts">
import Vue from 'vue'
import { getMenuNodeList } from '@/services/menu'

export default Vue.extend({
  name: 'AllocMenu',
  ...
  created () {
    this.loadMenus()
  },
  methods: {
    async loadMenus () {
      const { data } = await getMenuNodeList()
      console.log(data)
    }
  }
})
</script>
```

![image-20210515203227723](https://public.shiguanghai.top/blog_img/image-20210515203227723JJkJqU.png)

```vue
<script lang="ts">
import Vue from 'vue'
import { getMenuNodeList } from '@/services/menu'

export default Vue.extend({
  name: 'AllocMenu',
  props: {
    roleId: {
      type: [String, Number],
      required: true
    }
  },
  data () {
    return {
      menus: [],
      defaultProps: { // 个性化定制
        children: 'subMenuList', // 子节点数组
        label: 'name' // 节点名称
      }
    }
  },
  created () {
    this.loadMenus()
  },
  methods: {
    async loadMenus () {
      const { data } = await getMenuNodeList()
      this.menus = data.data
    }
  }
})
</script>
```

![image-20210515203542682](https://public.shiguanghai.top/blog_img/image-20210515203542682TknTNR.png)

### 分配菜单 - 保存分配

`views/role/alloc-menu.vue`

```vue
<template>
  <div class="alloc-menu">
    <el-card>
      <div slot="header">
        <span>分配权限</span>
      </div>
      <el-tree
        :data="menus"
        :props="defaultProps"
        show-checkbox
        default-expand-all
      ></el-tree>
      <div style="text-align: center">
        <el-button>清空</el-button>
        <el-button
          type="primary"
          @click="onSave"
        >保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { getMenuNodeList } from '@/services/menu'

export default Vue.extend({
  name: 'AllocMenu',
  ...
  methods: {
    ...
    onSave () {
      console.log('onSave')
      // 1. 拿到选中节点的数据 id 列表
      // 2. 请求提交保存
    }
  }
})
</script>
```

[edu-boss-boot - 给角色分配菜单](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/allocateRoleMenusUsingPOST)

封装请求 `services/menu.ts`

```typescript
export const allocateRoleMenus = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/menu/allocateRoleMenus',
    data
  })
}
```

加载请求  `views/role/alloc-menu.vue`

```vue
<template>
  <div class="alloc-menu">
    <el-card>
      <div slot="header">
        <span>分配权限</span>
      </div>
      <el-tree
        ref="menu-tree"
        node-key="id"
        ...
      ></el-tree>
      ...
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  getMenuNodeList,
  allocateRoleMenus
} from '@/services/menu'
import { Tree } from 'element-ui'

export default Vue.extend({
  name: 'AllocMenu',
  ...
  created () {
    this.loadMenus()
  },
  methods: {
    ...
    onSave () {
      // 1. 拿到选中节点的数据 id 列表
      const menuIdList = (this.$refs['menu-tree'] as Tree).getCheckedKeys()
      console.log(menuIdList)
      // 2. 请求提交保存
      // allocateRoleMenus({
      //   roleId: this.roleId,
      //   menuIdList: []
      // })
    }
  }
})
</script>
```

![image-20210515210221103](https://public.shiguanghai.top/blog_img/image-202105152102211032vCg1I.png)

```typescript
methods: {
  async loadMenus () {
    const { data } = await getMenuNodeList()
    this.menus = data.data
  },
  async onSave () {
    // 1. 拿到选中节点的数据 id 列表
    const menuIdList = (this.$refs['menu-tree'] as Tree).getCheckedKeys()
    // 2. 请求提交保存
    await allocateRoleMenus({
      roleId: this.roleId,
      menuIdList
    })
    // 3. 操作成功，返回
    this.$message.success('操作成功')
    this.$router.back()
  }
}
```

### 分配菜单 - 展示已分配权限

如何让指定节点被选中

> 分别通过`default-expanded-keys`和`default-checked-keys`设置默认展开和默认选中的节点。需要注意的是，此时必须设置`node-key`，其值为节点数据中的一个字段名，该字段在整棵树中是唯一的。

```vue
<el-tree
  ...
  :default-checked-keys="[5]"
></el-tree>
```

拿到当前角色所拥有的菜单列表，获取到其中的 id 放到数组中

[edu-boss-boot - 获取角色拥有的菜单列表](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%8F%9C%E5%8D%95%E7%AE%A1%E7%90%86/getRoleMenusUsingGET)

封装请求 `services/menu.ts`

```typescript
export const getRoleMenus = (roleId: string | number) => {
  return request({
    method: 'GET',
    url: '/boss/menu/getRoleMenus',
    // url: `/boss/menu/getRoleMenus?roleId=${roleId}`,
    params: { // axios 会把 params 转换为 key=value&key=value 的数据格式放到url后面（以？分割）
      roleId
    }
  })
}
```

加载请求  `views/role/alloc-menu.vue`

```vue
<el-tree
  ...
  :default-checked-keys="checkedKeys"
></el-tree>

<script lang="ts">
import Vue from 'vue'
import {
  ...
  getRoleMenus
} from '@/services/menu'
...

export default Vue.extend({
  name: 'AllocMenu',
  ...
  data () {
    return {
      ...
      checkedKeys: []
    }
  },
  created () {
    ...
    this.loadRoleMenus()
  },
  methods: {
    async loadRoleMenus () {
      const { data } = await getRoleMenus(this.roleId)
      // 获取 selected 为 true 的节点
      this.getCheckedKeys(data.data)
    },
    getCheckedKeys (menus: any) {
      menus.forEach((menu: any) => {
        if (menu.selected && !menu.subMenuList) {
          this.checkedKeys.push(menu.id as never)
        }
        if (menu.subMenuList) {
          this.getCheckedKeys(menu.subMenuList)
        }
      })
    }
    ...
  }
})
</script>
```

### 分配菜单 - 清空选中的菜单项

```vue
<div style="text-align: center">
  <el-button @click="resetChecked">清空</el-button>
  ...
</div>
```

```typescript
resetChecked () {
  (this.$refs['menu-tree'] as Tree).setCheckedKeys([])
}
```

### 分配资源

分配资源与分配菜单相似，故不再赘述

封装请求 `services/resource.ts`

[edu-boss-boot - 获取所有资源](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86/getAllUsingGET_1)

[edu-boss-boot - 给角色分配资源](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86/allocateRoleResourcesUsingPOST)

[edu-boss-boot - 获取角色拥有的资源列表](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86/getRoleResourcesUsingGET)

```typescript
export const getAllResources = () => {
  return request({
    method: 'GET',
    url: '/boss/resource/getAll'
  })
}

export const allocateRoleResources = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/resource/allocateRoleResources',
    data
  })
}

export const getRoleResources = (roleId: string | number) => {
  return request({
    method: 'GET',
    url: '/boss/resource/getRoleResources',
    params: {
      roleId
    }
  })
}
```

封装分配资源组件 `views/role/alloc-resource.vue`

```vue
<template>
  <div class="alloc-resource">
    <el-card>
      <div slot="header">
        <span>分配资源</span>
      </div>
      <el-tree
        ref="tree"
        :data="resources"
        node-key="id"
        :props="defaultProps"
        show-checkbox
        :default-checked-keys="defaultCheckedKeys"
        :default-expanded-keys="defaultCheckedKeys"
      ></el-tree>
      <div style="text-align: center">
        <el-button @click="resetChecked">清空</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  getAllResources,
  allocateRoleResources,
  getRoleResources
} from '@/services/resource'
import { getResourceCategories } from '@/services/resource-category'
import { Tree } from 'element-ui'

export default Vue.extend({
  name: 'AllocResource',
  props: {
    roleId: {
      type: [String, Number],
      required: true
    }
  },
  data () {
    return {
      resources: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      defaultCheckedKeys: []
    }
  },
  created () {
    this.loadResources()
    this.loadRoleResources()
  },
  methods: {
    async loadResources () {
      const ret = await Promise.all([getAllResources(), getResourceCategories()])
      const resources = ret[0].data.data
      const resourceCategories = ret[1].data.data

      resources.forEach((r: any) => {
        const category = resourceCategories.find((c: any) => c.id === r.categoryId)
        if (category) {
          category.children = category.children || []
          category.children.push(r)
        }
      })
      // 修改顶层分类 ID：因为分类 ID 和资源 ID 冲突
      resourceCategories.forEach((item: any) => {
        item.id = Math.random()
      })

      this.resources = resourceCategories
    },

    async loadRoleResources () {
      const { data } = await getRoleResources(this.roleId)
      this.getCheckedResources(data.data)
    },

    getCheckedResources (resources: any) {
      resources.forEach((r: any) => {
        r.resourceList && r.resourceList.forEach((c: any) => {
          if (c.selected) {
            this.defaultCheckedKeys = [...this.defaultCheckedKeys, c.id] as any
          }
        })
      })
    },

    async onSave () {
      const checkedNodes = (this.$refs.tree as Tree).getCheckedNodes()
      const resourceIdList: number[] = []
      checkedNodes.forEach(item => {
        if (!item.children) {
          resourceIdList.push(item.id)
        }
      })
      await allocateRoleResources({
        roleId: this.roleId,
        resourceIdList
      })
      this.$message.success('保存成功')
      this.$router.back()
    },

    resetChecked () {
      (this.$refs.tree as Tree).setCheckedKeys([])
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

注册点击事件 `views/role/components/List.vue`

```vue
<el-button
  type="text"
  @click="$router.push({
    name: 'alloc-resource',
    params: {
      roleId: scope.row.id
    }
  })"
>分配资源</el-button>
```

处理路由 `router.index.ts`

```typescript
{
  path: '/role/:roleId/alloc-resource',
  name: 'alloc-resource',
  component: () => import(/* webpackChunkName: 'alloc-menu' */ '@/views/role/alloc-resource.vue'),
  props: true // 将路由路径参数映射到组件的 props 数据中
}
```

![image-20210515223451846](https://public.shiguanghai.top/blog_img/image-20210515223451846cSQIQs.png)

## 21.13 用户管理

### 用户管理 - 布局

对于用户管理，这里已经处理好了列表的数据展示，参考菜单、资源管理，一样不再赘述。此外，列表内容的查询、重置功能已经实现，也不再赘述

封装请求 `services/user.ts`

[edu-boss-boot - 分页查询用户信息](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E7%94%A8%E6%88%B7%E6%8E%A5%E5%8F%A3/getUserPagesUsingPOST)

[edu-boss-boot - 封禁用户](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E7%94%A8%E6%88%B7%E6%8E%A5%E5%8F%A3/forbidUserUsingPOST)

```typescript
export const getUserPages = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/user/getUserPages',
    data
  })
}

export const forbidUser = (userId: string | number) => {
  return request({
    method: 'POST',
    url: '/boss/user/forbidUser',
    params: {
      userId
    }
  })
}
```

封装列表资源组件 `views/user/components/UserList.vue`

```vue
<template>
  <el-card>
    <div slot="header">
      <el-form :model="filterParams" ref="filter-form">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="filterParams.phone"></el-input>
        </el-form-item>
        <el-form-item label="注册时间" prop="rangeDate">
          <el-date-picker
            v-model="filterParams.rangeDate"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="loading"
            @click="handleReset"
          >重置</el-button>
          <el-button
            type="primary"
            @click="handleQuery"
            :disabled="loading"
          >查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="users"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column
        prop="id"
        label="用户ID"
        width="100">
      </el-table-column>
      <el-table-column
        prop="name"
        label="头像"
        width="80">
        <template slot-scope="scope">
          <img width="30px" :src="scope.row.portrait || 'https://public.shiguanghai.top/blog_img/default-avatarnUSD98.png'">
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="用户名"
        width="120">
      </el-table-column>
      <el-table-column
        prop="phone"
        label="手机号"
        width="120">
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="注册时间"
        width="120">
      </el-table-column>
      <!-- <el-table-column
        prop="name"
        label="状态"
        width="80">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="ENABLE"
            inactive-value="DISABLE"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleForbidUser(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column> -->
      <el-table-column
        prop="address"
        label="操作">
        <template>
          <el-button type="text" >分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { getUserPages, forbidUser } from '@/services/user'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'UserList',
  data () {
    return {
      users: [],
      filterParams: {
        currentPage: 1,
        pageSize: 100,
        phone: '',
        startCreateTime: '',
        endCreateTime: '',
        rangeDate: []
      },
      loading: true
    }
  },
  created () {
    this.loadUsers()
  },
  methods: {
    async loadUsers () {
      this.loading = true
      const { rangeDate } = this.filterParams
      if (rangeDate && rangeDate.length) {
        this.filterParams.startCreateTime = rangeDate[0]
        this.filterParams.endCreateTime = rangeDate[1]
      } else {
        this.filterParams.startCreateTime = ''
        this.filterParams.endCreateTime = ''
      }
      const { data } = await getUserPages(this.filterParams)
      this.users = data.data.records
      this.loading = false
    },
    // async handleForbidUser (user: any) {
    //   const { data } = await forbidUser(user.id)
    //   console.log(data)
    // },
    handleQuery () {
      this.filterParams.currentPage = 1
      this.loadUsers()
    },
    handleReset () {
      (this.$refs['filter-form'] as Form).resetFields()
      this.loadUsers()
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

加载资源列表 `views/user/index.vue`

```vue
<template>
  <div class="user">
    <user-list />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import UserList from './components/UserList.vue'

export default Vue.extend({
  name: 'UserIndex',
  components: {
    UserList
  }
})
</script>

<style lang="scss" scoped></style>
```

![image-20210516200720939](https://public.shiguanghai.top/blog_img/image-20210516200720939Abhvsz.png)

### 分配角色 - Select 选择器

参考 [Element - Dialog 对话框](https://element.eleme.cn/#/zh-CN/component/dialog#dialog-dui-hua-kuang)

`views/user/components/UserList.vue`

```vue
<template>
  <el-button
    type="text"
    @click="dialogVisible = true"
  >分配角色</el-button>
</template>

<el-dialog
  title="分配角色"
  :visible.sync="dialogVisible"
  width="50%"
>
  <span>分配角色</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button
      type="primary"
      @click="dialogVisible = false"
    >确 定</el-button>
  </span>
</el-dialog>
```

```typescript
data () {
  return {
    ...
    dialogVisible: false
  }
}
```

![image-20210516202336088](https://public.shiguanghai.top/blog_img/image-20210516202336088OzMm4v.png)

参考 [Element - Select 选择器](https://element.eleme.cn/#/zh-CN/component/select#select-xuan-ze-qi)

![image-20210516202618304](https://public.shiguanghai.top/blog_img/image-2021051620261830451pNrJ.png)

```vue
<template>
  <el-select v-model="value1" multiple placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>

  <el-select
    v-model="value2"
    multiple
    collapse-tags
    style="margin-left: 20px;"
    placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
  export default {
    data() {
      return {
        options: [{
          value: '选项1',
          label: '黄金糕'
        }, {
          value: '选项2',
          label: '双皮奶'
        }, {
          value: '选项3',
          label: '蚵仔煎'
        }, {
          value: '选项4',
          label: '龙须面'
        }, {
          value: '选项5',
          label: '北京烤鸭'
        }],
        value1: [],
        value2: []
      }
    }
  }
</script>
```

> 为`el-select`设置`multiple`属性即可启用多选，此时`v-model`的值为当前选中值所组成的数组。默认情况下选中值会以 Tag 的形式展现，你也可以设置`collapse-tags`属性将它们合并为一段文字。

`views/user/components/UserList.vue`

```vue
<el-select v-model="roleIdList" multiple placeholder="请选择">
  <el-option
    v-for="item in roles"
    :key="item.value"
    :label="item.label"
    :value="item.value">
  </el-option>
</el-select>
```

```typescript
data () {
  return {
    ...
    roles: [{
      value: '选项1',
      label: '黄金糕'
    }, {
      value: '选项2',
      label: '双皮奶'
    }, {
      value: '选项3',
      label: '蚵仔煎'
    }, {
      value: '选项4',
      label: '龙须面'
    }, {
      value: '选项5',
      label: '北京烤鸭'
    }],
    roleIdList: []
  }
},
```

![image-20210516203305624](https://public.shiguanghai.top/blog_img/image-20210516203305624MBree0.png)

### 分配角色 - 展示角色列表

[edu-boss-boot - 获取所有角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/getAllUsingGET_2)

封装请求 `services/role.ts`

```typescript
export const getAllRoles = () => {
  return request({
    method: 'GET',
    url: '/boss/role/all'
  })
}
```

加载请求  `views/user/components/UserList.vue`

```vue
<template>
  <el-button
    type="text"
    @click="handleSelectRole"
  >分配角色</el-button>
</template>

<script lang="ts">
...
import { getAllRoles } from '@/services/role'

export default Vue.extend({
  name: 'UserList',
  ...
  methods: {
    ...
    async handleSelectRole () {
      // 1. 加载角色列表
      const { data } = await getAllRoles()
      console.log(data)
      // 2. 展示对话框
      this.dialogVisible = true
    }
  }
})
</script>
```

![image-20210516204615567](https://public.shiguanghai.top/blog_img/image-20210516204615567f8COIM.png)

```vue
<el-select v-model="roleIdList" multiple placeholder="请选择">
  <el-option
    v-for="item in roles"
    :key="item.id"
    :label="item.name"
    :value="item.id">
  </el-option>
</el-select>

<script lang="ts">
...
export default Vue.extend({
  name: 'UserList',
  data () {
    return {
      ...
      roles: [],
      roleIdList: []
    }
  },
  ...
  methods: {
    ...
    async handleSelectRole () {
      // 1. 加载角色列表
      const { data } = await getAllRoles()
      this.roles = data.data
      // 2. 展示对话框
      this.dialogVisible = true
    }
  }
})
</script>
```

![image-20210516205142001](https://public.shiguanghai.top/blog_img/image-20210516205142001MZGlQf.png)

### 分配角色 - 提交分配

[edu-boss-boot - 给用户分配角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/allocateUserRolesUsingPOST)

封装请求 `services/role.ts`

```typescript
export const allocateUserRoles = (data: any) => {
  return request({
    method: 'POST',
    url: '/boss/role/allocateUserRoles',
    data
  })
}
```

加载请求  `views/user/components/UserList.vue`

```vue
<!-- 插槽作用域 -->
<template slot-scope="scope">
  <el-button
    type="text"
    @click="handleSelectRole(scope.row)"
  >分配角色</el-button>
</template>

<script lang="ts">
...
import {
  ...
  allocateUserRoles
} from '@/services/role'

export default Vue.extend({
  name: 'UserList',
  data () {
    return {
      ...
      currentUser: null // 分配角色的当前用户
    }
  },
  ...
  methods: {
    ...
    async handleSelectRole (role: any) {
      this.currentUser = role
      ...
    },
    async handleAllocRole () {
      const { data } = await allocateUserRoles({
        userId: (this.currentUser as any).id,
        roleIdList: this.roleIdList
      })
      this.$message.success('操作成功')
      this.dialogVisible = false
    }
  }
})
</script>
```

### 分配角色 - 展示已分配角色

我们的目标就是加载时向 `roleIdList` 中添加选中数据 Id

[edu-boss-boot - 查询用户角色](http://eduboss.lagou.com/boss/doc.html#/edu-boss-boot/%E8%A7%92%E8%89%B2%E7%AE%A1%E7%90%86/getUserRolesUsingGET)

封装请求 `services/role.ts`

```typescript
export const getUserRoles = (userId: string | number) => {
  return request({
    method: 'GET',
    url: `/boss/role/user/${userId}`
  })
}
```

加载请求  `views/user/components/UserList.vue`

```vue
<script lang="ts">
...
import {
  ...
  getUserRoles
} from '@/services/role'

export default Vue.extend({
  name: 'UserList',
  ...
  methods: {
    ...
    async handleSelectRole (role: any) {
      this.currentUser = role
      // 1. 加载角色列表
      ...
      // 2. 展示已分配角色
      const { data: { data: userRoles } } = await getUserRoles((this.currentUser as any).id)
      console.log(userRoles)
      // 3. 展示对话框
      ...
    },
    ...
  }
})
</script>
```

![image-20210516212709679](https://public.shiguanghai.top/blog_img/image-20210516212709679vZXTlm.png)

```typescript
// 2. 展示已分配角色
const { data: { data: userRoles } } = await getUserRoles((this.currentUser as any).id)
this.roleIdList = userRoles.map((item: any) => item.id)
```

![image-20210516213243713](https://public.shiguanghai.top/blog_img/image-20210516213243713mRQDjG.png)