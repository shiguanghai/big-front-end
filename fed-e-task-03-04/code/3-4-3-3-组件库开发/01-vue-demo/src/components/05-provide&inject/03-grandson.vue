<template>
  <div class="grandson">
    grandson<br>
    title：{{ title }}<br>
    <button @click="handle">获取 title</button>
    <button @click="title='yyy'">改变 title</button>
  </div>
</template>

<script>
export default {
  inject: ['title', 'handle']
}
</script>

<style>
.grandson {
  border:navajowhite 1px solid;
}
</style>