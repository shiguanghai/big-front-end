// 搜索引擎是怎么获取网页内容的？
const http = require('http')

// 通过程序获取指定的网页内容
// 服务端
http.get('http://localhost:3000/', res => {
// 客户端
// http.get('http://localhost:8080/', res => {
  let data = ''
  res.on('data', chunk => {
    data += chunk
  })
  res.on('end', () => {
    console.log(data)
  })
})
