<template>
  <div>
    <myinput ref="mytxt"></myinput>

    <button @click="focus">获取焦点</button>
  </div>
</template>

<script>
import myinput from './02-myinput'
export default {
  components: {
    myinput
  },
  methods: {
    focus () {
      this.$refs.mytxt.focus()
      this.$refs.mytxt.value = 'hello'
    }
  }
  // mounted () {
  //   this.$refs.mytxt.focus()
  // }
}
</script>

<style>

</style>