<template>
	<div>
    <!-- 将父组件传递过来的属性展开给 input -->
    <input v-bind="$attrs" :type="type" :value="value" @input="handleInput">
  </div>
</template>

<script>
export default {
  name: 'LgInput',
  inheritAttrs: false, // 禁用父组件传递过来的属性
  props: {
    value: {
      type: String
    },
    type: {
      type: String,
      default: 'text'
    }
  },  
  methods: {
    handleInput (evt) {
      this.$emit('input', evt.target.value)
      const friendParent = parent => {
        while (parent) {
          if (parent.$options.name === 'LgFormItem') {
            break
          } else {
            parent = parent.$parent
          }
        }
        return parent
      }
      const parent = friendParent(this.$parent)
      if (parent) {
        parent.$emit('validate')
      }
    }
  }
}
</script>

<style>

</style>
