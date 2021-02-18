<template>
  <div class="child">
    child<br>
    title：{{ title }}<br>
    <button @click="handle">获取 title</button>
    <button @click="title='xxx'">改变 title</button>
    <grandson></grandson>
  </div>
</template>

<script>
import grandson from './03-grandson'
export default {
  components: {
    grandson
  },
  inject: ['title', 'handle']
}
</script>

<style>
.child {
  border:paleturquoise 1px solid;
}
</style>