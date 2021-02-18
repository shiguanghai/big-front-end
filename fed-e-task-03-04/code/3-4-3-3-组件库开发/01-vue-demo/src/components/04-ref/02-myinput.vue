<template>
  <div>
    <input v-model="value" type="text" ref="txt">
  </div>
</template>

<script>
export default {
  data () {
    return {
      value: 'default'
    }
  },
  methods: {
    focus () {
      this.$refs.txt.focus()
    }
  }
}
</script>

<style>

</style>