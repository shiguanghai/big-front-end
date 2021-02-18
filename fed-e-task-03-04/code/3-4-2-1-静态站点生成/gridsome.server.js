// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const axios = require('axios')

module.exports = function (api) {
  api.loadSource(async ({ addCollection }) => {
    const posts = addCollection('Post')
    const tags = addCollection('Tag')

    posts.addReference('tags', 'Tag')

    tags.addNode({
      id: '1',
      title: 'The author'
    })
    tags.addNode({
      id: '2',
      title: 'foo'
    })

    posts.addNode({
      id: '1',
      title: 'A post',
      tags: ['1']
    })

    // Use the Data Store API here: https://gridsome.org/docs/data-store-api/
    // const collection = addCollection('Post')

    const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts')

    for (const item of data) {
      posts.addNode({
        id: item.id,
        title: item.title,
        content: item.body
      })
    }
  })

  api.createPages(({ createPage }) => {
    // Use the Pages API here: https://gridsome.org/docs/pages-api/
    createPage({
      path: '/my-page',
      component: './src/templates/MyPage.vue'
    })
  })
}
