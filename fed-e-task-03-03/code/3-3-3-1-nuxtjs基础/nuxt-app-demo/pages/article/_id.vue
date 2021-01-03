<template>
  <div>
    <!-- <h1>article page</h1> -->
    <h1>{{ article.title }}</h1>
    <div>{{ article.body }}</div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ArticlePage',
  // asyncData 上下文对象
  async asyncData (context) {
    // 这里有我们需要的数据
    console.log(context)
    const { data } = await axios({
      method: 'GET',
      url: 'http://localhost:3000/data.json'
    })
    // asyncData 里面没有 this
    // 不能通过这种方式获取 id
    // console.log(this.$router.params)

    // 可以通过上下文对象的 params.id 或者 router.params.id
    // 拿到后将字符串类型转换为数字类型
    const id = Number.parseInt(context.params.id)
    return {
      article: data.posts.find(item => item.id === id)
    }
  }
}
</script>

<style>

</style>
