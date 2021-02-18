<template>
  <div class="child">
    child<br>
    $parent.title：{{ $parent.title }}<br>
    <button @click="$parent.handle">获取 $parent.title</button>
    <button @click="$parent.title = 'Hello $parent.title'">改变 $parent.title</button>
  
    <grandson></grandson>
  </div>
</template>

<script>
import grandson from './03-grandson'
export default {
  components: {
    grandson
  }
}
</script>

<style>
.child {
  border:paleturquoise 1px solid;
}
</style>