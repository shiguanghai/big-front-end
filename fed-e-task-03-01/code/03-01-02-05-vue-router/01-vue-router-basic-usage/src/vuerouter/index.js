let _Vue = null

export default class VueRouter {
  static install (Vue) {
    // 1.判断当前插件是否已经被安装
    // 如果插件已经安装直接返回
    if (VueRouter.install.installed && _Vue === Vue) return
    VueRouter.install.installed = true
    // 2.把 Vue 构造函数记录到全局变量
    _Vue = Vue
    // 3.把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 混入
    _Vue.mixin({
      beforeCreate () {
        // 判断 router 对象是否已经挂载了 Vue 实例上
        if (this.$options.router) {
          // 把 router 对象注入到 Vue 实例上
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    // 记录路径和对应的组件
    this.routeMap = {}
    this.data = _Vue.observable({
      // 当前的默认路径
      current: '/'
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    // routes => [{ name: '', path: '', component: }]
    // 遍历所有的路由信息，记录路径和组件的映射
    this.options.routes.forEach(route => {
      // 记录路径和组件的映射关系
      this.routeMap[route.path] = route.component
    })
  }

  initComponents (Vue) {
    _Vue.component('router-link', {
      // 接收外部传入的参数
      props: {
        to: String
      },
      // 使用运行时版本的 Vue.js
      // 此时没有编译器 直接来写一个 render函数
      render (h) { // 参数 h 创建虚拟DOM render函数中调用h函数并将结果返回
        // h函数 接收三个参数
        return h('a', { // 1. 创建的元素对应的选择器
          attrs: { // 2. 给标签设置属性 attes 指明DOM对象属性
            // history
            href: this.to
            // hash
            // href: '#' + this.to
          },
          on: { // 给 a标签 注册点击事件
            click: this.clickhander
          }
        }, [this.$slots.default]) // 3. 生成元素的子元素
      },
      methods: {
        clickhander (e) { // 时间参数 e
          // 改变浏览器地址栏 pushiState 不向服务器发送请求
          // history
          history.pushState({}, '', this.to) // data title url
          // hash
          // window.location.hash = '#' + this.to
          this.$router.data.current = this.to // 响应式对象data
          e.preventDefault() // 阻止事件默认行为
        }
      }
      // template: '<a :href="to"><slot></slot></a>'
    })

    const self = this // 保存 this
    _Vue.component('router-view', {
      render (h) {
        // 根据当前路径找到对应的组件，注意 this 的问题
        const component = self.routeMap[self.data.current]
        return h(component) // 将组件转换为虚拟DOM返回
      }
    })
  }

  // history
  initEvent () {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }

  // hash
  // 监听页面 load 和 hashchange 方法，在这个地方有个判断
  // 如果当前页面的 hash 不存在，则自动加上 '#/' ,并加载 '/' 的组件
  // initEvent () {
  //   window.addEventListener('load', this.hashChange.bind(this))
  //   window.addEventListener('hashchange', this.hashChange.bind(this))
  // }

  // hashChange () {
  //   if (!window.location.hash) {
  //     window.location.hash = '#/'
  //   }
  //   this.data.current = window.location.hash.substr(1)
  // }
}
