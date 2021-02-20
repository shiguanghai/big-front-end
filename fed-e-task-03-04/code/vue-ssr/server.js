const Vue = require('vue')
const express = require('express')
const fs = require('fs')

const renderer = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync('./index.template.html',
  'utf-8')
})

const server = express()

server.get('/', (req, res) => {
  const app = new Vue({
    template: `
      <div id="app">
        <h1>{{ message }}</h1>
      </div>
    `,
    data: {
      message: '时光海'
    }
  })
  
  renderer.renderToString(app, {
    title: '时光海',
    meta: `
      <meta name="description" content="时光海">
    `
  }, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error.')
    }
    res.setHeader('Content-Type',
    'text/html; charset=utf-8')
    res.end(html)
  })
})

server.listen(3000, () => {
  console.log('server runing at port 3000.')
})
