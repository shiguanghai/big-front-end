<template>
  <div>children2</div>
</template>

<script>
export default {
  data () {
    return {
      title: 'children2 获取子组件 - title'
    }
  },
  methods: {
    handle () {
      console.log(this.title)
    }
  }
}
</script>

<style>

</style>