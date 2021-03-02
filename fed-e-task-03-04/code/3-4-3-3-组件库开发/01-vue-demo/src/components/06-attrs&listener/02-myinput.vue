<template>
  <!--
    1. 从父组件传给自定义子组件的属性，如果没有 prop 接收
       会自动设置到子组件内部的最外层标签上
       如果是 class 和 style 的话，会合并最外层标签的 class 和 style 
  -->
  <!-- <input type="text" class="form-control" :placeholder="placeholder"> -->
  <!-- <input type="text" class="form-control"> -->

  <!--
    2. 如果子组件中不想继承父组件传入的非 prop 属性，可以使用 inheritAttrs 禁用继承
       然后通过 v-bind="$attrs" 把外部传入的非 prop 属性设置给希望的标签上

       但是这不会改变 class 和 style
  -->
  <!-- <div>
    <input type="text" v-bind="$attrs" class="form-control">
    <input type="text" class="form-control">
  </div> -->


  <!--
    3. 注册事件
  -->

  <!-- <div>
    <input
      type="text"
      v-bind="$attrs"
      class="form-control"
      @focus="$emit('focus', $event)"
      @input="$emit('input', $event)"
    >
  </div> -->


  <!--
    4. $listeners
  -->

  <div>
    <input
      type="text"
      v-bind="$attrs"
      class="form-control"
      v-on="$listeners"
    >
  </div>
</template>

<script>
export default {
  // props: ['placeholder', 'style', 'class']
  // props: ['placeholder']
  inheritAttrs: false
}
</script>

<style>

</style>