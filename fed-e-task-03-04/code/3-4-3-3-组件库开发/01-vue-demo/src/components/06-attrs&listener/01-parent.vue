<template>
  <div>
    <!-- <myinput
      required
      placeholder="Enter your username"
      class="theme-dark"
      data-test="test">
    </myinput> -->


    <myinput
      required
      placeholder="Enter your username"
      class="theme-dark"
      @focus="onFocus"
      @input="onInput"
      data-test="test">
    </myinput>
    <button @click="handle">按钮</button>
  </div>
</template>

<script>
import myinput from './02-myinput'
export default {
  components: {
    myinput
  },
  methods: {
    handle () {
      console.log(this.value)
    },
    onFocus (e) {
      console.log(e)
    },
    onInput (e) {
      console.log(e.target.value)
    }
  }
}
</script>

<style>

</style>