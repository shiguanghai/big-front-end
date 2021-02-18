<template>
  <div class="grandson">
    grandson<br>
    $parent.$parent.title：{{ $parent.$parent.title }}<br>
    <button @click="$parent.$parent.handle">获取 $parent.$parent.title</button>
    <button @click="$parent.$parent.title = 'Hello $parent.$parent.title'">改变 $parent.$parent.title</button>
  </div>
</template>

<script>
export default {
}
</script>

<style>
.grandson {
  border:navajowhite 1px solid;
}
</style>