<template>
  <div>
    <steps :count="count" :active="active"></steps>
    <button @click="next">下一步</button>
  </div>
</template>

<script>
import Steps from './Steps.vue'
export default {
  components: {
    Steps
  },
  data () {
    return {
      count: 4,
      active: 0
    }
  },
  methods: {
    next () {
      this.active++
    }
  }
}
</script>

<style>

</style>
