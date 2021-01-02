const express = require('express')
const fs = require('fs')
const template = require('art-template')
// 创建一个 express 实例
const app = express()

// 添加一个路由，当其以get请求网站根路径时触发
app.get('/', (req, res) => {
  // 1. 得到模板内容
  // readFile 是一个异步方法，readFileSync 是一个同步方法
  // 默认得到的是二进制数据，为了得到字符串可以指定utf-8编码
  const templateStr = fs.readFileSync('./index.html', 'utf-8')

  // 2. 得到数据
  // 默认得到的是字符串类型，使用JSON.parse()转换成数据对象
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'))
  
  // 3. 渲染：数据 + 模板 = 完整结果
  // 第一个参数：要渲染的模板字符串
  // 第二个参数：数据对象
  const html = template.render(templateStr, data)
  
  // 4. 把渲染结果发送给客户端
  res.send(html)
})

app.listen(3000, () => console.log('running...'))
