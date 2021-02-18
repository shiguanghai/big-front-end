import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  data: {
    title: '根实例 - Root'
  },
  methods: {
    handle () {
      console.log(this.title)
    }
  }
}).$mount('#app')
