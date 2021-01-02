


## 5.1模块打包工具的由来
模块化确实很好地解决了复杂应用开发过程当中的代码组织问题，但是随着我们引入模块化，我们的应用又会产生许多新的问题：

- ES Modules 存在环境兼容问题
- 模块文件过多，网络请求频繁
- 所有前端资源都需要模块化

无容置疑，模块化是必要的，不过我们需要在原有的基础之上引入更好的方案或者工具去解决上面几个问题。让开发者在开发阶段可以继续享受模块化所带来的优势，又不必担心模块化对生产环境所产生的一些影响。

我们希望它们能够满足：
1. 需要这样一个工具能够编译我们的代码，将开发阶段编写的那些包含新特性的代码直接转换为能够兼容绝大多数环境的代码。
2. 能过将散落的模块文件再次打包到一起。
3. 需要去支持不同种类的前端类型，就可以把前端开发过程中所涉及的资源文件都当作模块去使用。

由此，前端模块打包工具就诞生了。

## 5.2模块打包工具概述
前端领域有一些工具就很好地解决了以上这几个问题，其中最主流的就是Webpack、Parcel和Rollup。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027200245962.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

我们就拿Webpack为例，它的一些和新特性就很好地满足了上面我们所说的需求。

1. Webpack 作为一个模块打包器(`Module bundler`)，它本身就可以解决模块化JavaScript代码打包的问题。我们通过Webpack就可以将零散的代码打包到同一个JS文件当中。对于有环境兼容问题的代码，我们就可以在打包的过程当中通过模块加载器(`Loader`)对其进行编译转换。
2. 其次，Webpack还具备代码拆分(`Code Splitting`)的能力，它能够将应用当中所有的代码都按照我们的需要去打包。我们可以把应用加载过程当中初次运行时所必需的模块打包到一起，对于其他模块再单独存放，等到应用工作过程当中实际需要到某个模块再异步去加载这个模块，从而实现增量加载。
3. 最后，对于前端资源模块(`Asset Module`)的问题，Webpack支持在JavaScript当中以模块化的方式载入任意类型的资源文件。

这是Webpack解决了我们上边所说的这些需求，其他打包工具也都是类似的。总的来说，所有打包工具都是以模块化为目标。

打包工具解决的是前端整体的模块化，并不是指JavaScript模块化。它就可以让我们在开发阶段更好的去享受模块化所带来的优势，同时又不必担心模块化对生产环境所产生的影响，这就是模块化工具的作用。

## 5.3Webpack 基础
### Webpack 快速上手
Webpack作为目前最主流的前端模块打包器，提供了一整套的前端项目模块化方案，而不仅仅是局限于只对JavaScript的模块化。通过Webpack提供的前端模块化方案就可以很轻松地对前端项目开发过程中涉及到的所有的资源进行模块化。

接下来通过我们来通过一个小案例先来了解一下Webpack的基本使用。[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/01-getting-started)
  
1.我们首先安装项目依赖(自定义的项目可以忽略)
```
yarn
```
2.安装serve
```
yarn add serve --dev
```
3.通过serve运行项目(正常运行)
```
yarn serve .
```
4.引入Webpack，使用项目代码可以直接yarn安装依赖（引用项目代码的话可以忽略）
```
yarn add webpack webpack-cli --dev
```
5.打包src下的js代码
```
yarn webpack
```
6.修改html引用的js路径，去除type="module"（引用的项目代码已更改）
```
<script src="dist/main.js"></script>
```
7.将webpack命令定义到package.json当中（引用的项目代码已更改）
```
{
...
"scripts": {
    "build": "webpack"
  },
...
}
```
8.使用build启动打包
```
yarn build
```

### Webpack 配置文件
Webpack4以后的版本支持零配置的方式直接启动打包，这个打包过程会按照约定将 `'src/index.js' -> 'dist/main.js' `，但是很多时候我们都需要自定义这些路径。[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/02-configuration)

例如这个案例当中，入口就是src下的main.js，这时我们就需要专门为webpack添加专门的配置文件`webpack.config.js`，这个文件是一个运行在node环境当中的js文件，也就是说需要按照`Common JS`的方式去编写代码
```js
const path = require('path')

module.exports = {
  entry: './src/main.js', // 输入
  output: {
    filename: 'bundle.js', // 输出
    path: path.join(__dirname, 'output') // 输出目录(绝对路径 通过path转换)
  }
}
```

### Webpack 工作模式
Webpack4新增了一个工作模式的用发，这种用法大大简化了Webpack配置的复杂程度。可以理解成针对不同环境的几组预设配置。[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/03-mode)

我们注意到，打包过程中如果不设置`mode`，终端会打印出一段配置警告，大致意思是说我们没有去设置一个叫做`mode`的属性，Webpack会默认使用`production`模式去工作。在这个模式下面，Webpack会自动去启动一些优化插件，例如自动压缩代码，这对实际生产环境是非常友好的，但是打包结果无法阅读。

我们可以通过`cli`参数去指定打包模式，给webpack命令传入`--mode`参数。这个属性有三种取值：

- `production`生产模式下，会自动启动优化优化打包结果。
- `development`开发模式下，Webpack会自动优化打包速度，会添加一些调试过程中需要的辅助到代码当中
- `none`模式下，Webpack就是运行最原始状态的打包，不会做任何额外的处理。

具体这三种模式的差异可以在[官方文档](https://webpack.js.org/configuration/mode/)中找到。

除了使用`cli`指定工作模式，我们还可以到配置文件中去设置工作模式
```js
module.exports = {
  // 这个属性有三种取值，分别是 production、development 和 none。
  mode: 'development',
  ...
}
```

### Webpack 打包结果运行原理
打开[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/04-bundle-interpretation)打包过后的bundle.js文件，通过ctrl+K ctrl+0把代码折叠起来以便我们对整体结构的了解

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102718064321.png#pic_center)

我们可以看到，整体生成的代码是一个立即执行函数，这个函数是Webpack的工作入口，它接收modules参数，调用时传入一个数组。

展开这个数组，数组当中的每一个元素都是一个参数列表相同的函数，对应的函数就是源代码中的模块。也就是说，每一个模块最终都会被包裹到这样一个函数当中，从而去实现模块的私有作用域。

我们再来展开Webpack的工作入口函数，这个函数内部最开始先定义了一个对象用于去存放（缓存）我们加载过的模块。紧接着定义了一个require函数，顾名思义，这个函数就是用来加载模块的。再往后就是在require这个函数上挂在了一些其他的数据和一些工具函数。函数执行到最后它调用了require这个函数，传入0开始去加载模块。（这个地方的模块id实际就是上面的模块数组当中的元素下标，也就是说这里才开始加载源代码当中所谓的入口模块）

为了可以更好的理解，我们把它运行起来，通过浏览器的开发工具来单步调试一下

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027181819767.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
在最开始的位置加上一个断点，然后刷新页面启动调试。

在函数一开始运行的时候，它接受到的应该是两个模块所对应的两个函数
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027182029535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
在这个位置，它加载了id为0的模块，我们进入到这个require函数内部
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027182153155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
require函数内部先去判断模块有没有被加载过，如果加载了，就从缓存里面读，如果没有就创建一个新的对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027182315207.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
紧接着调用了这个模块相对应的函数，把刚刚创建的模块对象还有导出成员对象以及require函数传入进去。这样在模块内部就可以使用module.xeports导出成员，通过Webpack的require载入模块
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027182454202.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
我们进来，在模块内部，它先去调用了一个r函数，这个r函数内部作用就是用来给我们在导出对象上去添加一个标记，我们进去看一下
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102718275852.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
进来过后，它实际上就是在导出对象上定义了一个__esModule的一个标记，定义完成过后这个导出对象上面就有了这样一个标记
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027183106338.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
用来对外界表面这是一个ES Module，紧接着往下又调用了这个require函数，此时传入的id是1，也就是说去加载第一个模块，这个模块实际上就是我们在代码当中import的header。完成过后再去以相同的道理执行header模块
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027183120346.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
最后将header这个模块导出的整体的对象通过require函数return回去
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027183419304.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
module中的exports应该是一个对象，因为ES Module里面默认导出它是放在default上面。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027183513148.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
此时将模块的导出对象拿到，然后访问里面的default。这个时候调用这个default函数，内部还是会调用内部模块的代码
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027183728645.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
最终将创建完的元素拿到并append到body上面
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027183845779.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102718393287.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
这实际上就是Webpack打包大致的运行过程。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027184045592.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

我们可以看出来Webpack打包过后的代码并不会特别复杂，它只是说帮我们把所有的模块给放到了同一个文件当中。除此之外，它还提供了一些，让我们的模块与模块之间相互依赖的关系还可以保持原来的状态。

## 5.4Webpack 模块加载器 Loader

### Webpack 资源模块加载 (css-loader style-loader)
Webpack 不仅仅是JavaScript模块化打包工具，它更应该算是整个前端项目或者叫前端工程的模块打包工具，这也就是说我们还可以通过Webpack引入我们在前端项目中的任意类型文件。

接下来我们尝试Webpack打包CSS文件，[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/05-asset-loader)

Webpack内部默认只会处理JavaScript文件，我们可以通过适当的`Loader`（加载器）来处理CSS文件，内部的Loader只能处理JS文件，我们可以在去为其它类型的资源文件添加不同的Loader。

- Loader 是 Webpack 的核心特性
- 借助于 Loader 就可以加载任何类型的资源

这里需要的是一个css-loader，我们来安装一下
```
yarn add css-loader --dev
```
如果只是使用这样一个Loader，我们并不能得到预期的结果。因为css-loader的作用是将CSS文件转换为一个JS模块。只是将css代码push到这样一个由css-loader内部提供的数组当中，整个过程并没有去用到这个数组。

所以我们还需要安装一个style-loader，它的作用就是把css-loader转换过后的结果通过style标签的形式追加到页面上
```
yarn add style-loader --dev
```
安装过后需要在配置文件添加相应的配置
```js
module.exports = {
  ...
  entry: './src/main.css', // 将css文件作为打包入口
  ...
  module: {
    rules: [
      {
        test: /.css$/, // 匹配打包过程遇到的文件路径
        use: [ // 指定匹配到的文件使用到loader
          // 当我们配置多个loader 执行顺序从下至上
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
}
```

### Webpack 导入资源模块
通过以上方法，我们确实可以将CSS文件作为打包入口，不过Webpack打包入口一般还是JavaScript，因为**打包入口**从某种程度上可以算是应用的**运行入口**。

就目前而言，前端应用的业务一般是由JavaScript来驱动的，正确的做法还是应该把JS文件作为打包入口，在js代码中通过import的方式来引入CSS文件。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027200322997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

这样的话，css-loader仍然可以正常工作，[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/06-import-asset)

我们先将配置文件的入口改回main.js
```js

module.exports = {
  ...
  entry: './src/main.js',
  ...
```
然后在main.js内部通过import导入main.css
```js
// main.js
import './main.css' // 只需要执行
...
```
我们在为heading.js添加heading.css样式文件并编写简单样式，在heading.js当中导入
```js
// heading.js
import './heading.css'
...
```
传统的做法当中，我们是将样式和行为分离开单独去维护，单独去引入。而Webpack又建议我们要在js当中去载入css，这到底是问什么呢？

其实Webpack不仅仅建议我们在js中引入css，而是建议我们在编写代码过程当中去引入任何当前代码所需要的文件

- 根据代码的需要动态导入资源
- 真正需要资源的不是应用，而是代码

是这里的代码想要正常工作，就必须要去加载对应的资源，这也正是Webpack的哲学。

JavaScript代码本身是负责完成整个业务的业务功能，放大来看它就是驱动了整个前端应用。而在实现业务功能的过程当中可能需要用到样式或者图片等等一系列资源文件，如果建立了这种依赖关系

- 逻辑合理，JS确实需要这些资源文件
- 确保上线资源不缺失，都是必要的

>其实学习一个新事物不是说学会它的所有用法你就能提高，因为这些东西照着文档基本上谁都可以。很多时候这些新事物的思想才是突破点，能够搞明白这些新事物为什么这样设计，那你基本上就算是出道了。

### Webpack 文件资源加载器 (file-loader)
目前Webpack社区提供了非常多的资源加载器，接下来我们再来尝试一些有代表性的Loader。

首先是文件资源加载器，[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/07-file-loader) 

大多数的资源加载器都类似css-loader，都是将资源模块转化为js代码的实现方式去工作。但是还有一些我们经常用到的资源文件，例如项目当中的图片、字体，这些文件没有办法通过js的方式表示。

对于这一类的资源文件，我们需要用到文件资源加载器，也就是file-loader。

我们在项目当中已经添加了一张普通的图片，我们假设这张图片就是我们再去实现某个功能的时候所需要的一个资源。

按照Webpack的思想，我们也应该在用到这个资源的地方通过import去导入这张图片，然后让Webpack去处理资源的加载
```js
// main.js
import icon from './icon.png'
...
const img = new Image()
img.src = icon

document.body.append(img)
```
安装文件资源加载器file-loader
```
yarn add file-loader --dev
```
打开配置文件，添加一个单独的加载规则配置
```js
module.exports = {
  ...
  output: {
    ...
    publicPath: 'dist/' // 将项目根目录作为网站根目录
  },
  module: {
    rules: [
      ...
      {
        test: /.png$/,
        use: 'file-loader'
      }
    ]
  }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027205447549.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### Webpack URL加载器 (url-loader)
除了file-loader这种通过拷贝物理文件的形式去处理文件资源以外，还有一种通过Data URLs的形式去表示文件的方式。

Data URLs 是一种特殊的URL协议，它可以用来直接去表示一个文件。传统的URL一般要求服务器有一个对应的文件，然后通过请求这个地址得到服务器上对应的文件。

而Data URLs 是一种当前url就可以直接去表示文件内容的方式。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027205932580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
也就是说这种URL当中的文本就已经包含了文件的内容，在我们去使用这种URL的时候就不会再去发送任何的http请求。

例如这样一段Data URLs，浏览器就能够根据这样一段url解析出来这是一个html类型的文件内容，它的编码是UTF-8，内容是一段包含h1标签的html代码
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027210057974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027210316816.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
如果说是图片或者是字体这一类无法直接通过文本去表示的二进制类型文件。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027210456590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

我们可以通过将文件的内容进行base64 编码，以base 64编码过后的结果表示这个文件的内容

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102721054898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
例如这样一段给出的Data URLs，这个url就是表示了一个png类型的文件，文件编码是base64，后面就是这张图片的base64编码

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027210711568.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

一般情况下，base64编码会比较长，浏览器同样可以解析出来对应的文件

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027210808905.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

在Webpack打包静态资源模块时，同样可以通过这种方式去实现。通过Data URLs，我们就可以以代码的形式去表示任何类型的文件了。[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/08-url-loader) 

我们先来安装url-loader
```
yarn add url-loader --dev
```
修改配置文件，配合file-loader使用
```js
module.exports = {
  ...
  module: {
    ...
      {
        ...
        use: {
          loader: 'url-loader',
          options: {
    		// 小于10kb的文件转化为Data URLs 嵌入代码中
    		// 超出10kb的文件单独提取存放
            limit: 10 * 1024 // 10 KB
          }
        }
      }
    ]
  }
}
```

- 小文件使用 Data URLs，减少请求次数
- 大文件单独提取存放，提高加载速度
 
### Webpack 常用加载器分类
Webpack中的资源加载器是用来去处理和加工打包过程遇到的资源文件。除了以上介绍到的加载器，社区当中还有很多其他的加载器。

我们将这些Loader大致分为三类做一个归纳：

- 编译转换类

这种类型的Loader会把我们加载到的资源模块转换为JavaScript代码。

例如之前用到的css-loader，就是将css代码转化为bundle中的一个JavaScript模块，从而去实现通过JavaScript运行CSS。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027213204682.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 文件操作类

通常，文件操作类型的加载器都会把加载到的资源模块拷贝到输出的目录，同时又将这个文件的访问路径向外导出。

例如之前用到的file-loader，就是一个非常典型的文件操作加载器

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027214029521.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- 代码检查类

最后还有一种针对于代码质量检查的加载器，就是对我们所加载到的资源文件（一般是代码）去进行校验的一种加载器。它的目的是为了统一代码的风格从而去提高代码质量。

这种类型加载器一般不会修改我们生产环境的代码

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027214332604.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

### Webpack 与 ES2015 (babel-loader)
由于Webpack默认就能处理代码当中的import和export，所以很自然的会有人认为Webpack会自动编译ES6的代码。

实则不然，Webpack仅仅是对模块完成打包工作，所以它才会对代码中的import和export做一些相应的转化，除此之外，它并不能去转换代码当中其他的ES6特性。[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/09-babel-loader)

如果我们需要Webpack在打包过程中同时处理其他ES6特性的转换，我们需要为JS文件配置一个额外的编译型Loader。

例如在常见的就是babel-loader
```
yarn add babel-loader @babel/core @babel/preset-env --dev
```
在配置文件当中为JS文件指定加载器为babel-loader
```js
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /.js$/,
        use: {
          loader: 'babel-loader',
          // babel 只是转换JS代码的平台
          //需要基于不同插件转换代码中的具体特性
          options: {
            // 使用preset-env插件集合
            presets: ['@babel/preset-env']
          }
        }
      },
      ...
    ]
  }
}
```
这样babel-loader就会取代默认的加载器，在打包过程中就可以帮我们处理代码当中的一些新特性了。

- Webpack 只是打包工具
- 加载器可以用来编译转换代码

### Webpack 加载资源的方式 
除了代码中的import能够触发模块的加载，Webpack还提供了其他几种方式。

- 遵循 ES Modules 标准的 import 声明

```js
import createHeading from './heading.js'
import better from './better.png'
import './main.css'

const heading = createHeading()
const img = new Image()
img.src = better
document.body.append(heading)
document.body.append(img)
```

- 遵循 CommonJS 标准的 require 函数

```js
const createHeading = require('./heading.js').default
const better = require('./better.png')
require('./main.css')

const heading = createHeading()
const img = new Image()
img.src = better
document.body.append(heading)
document.body.append(img)
```
需要注意的是：通过require函数载入一个ES Modules的话，对于 ES Modules 的默认导出需要通过`require`导入结果的default属性获取（原生Node不能在 CommonJS 模块中通过 require 载入 ES Module）

- 遵循 AMD 标准的 define 函数和 require 函数

```js
define(['./heading.js', './better.png', './main.css'], (createHeading, better) => {
  const heading = createHeading.default()
  const img = new Image()
  img.src = better
  document.body.append(heading)
  document.body.append(img)
})

require(['./heading.js', './better.png', './main.css'], (createHeading, better) => {
  const heading = createHeading.default()
  const img = new Image()
  img.src = better
  document.body.append(heading)
  document.body.append(img)
})
```
**除非必要情况，不要在项目当中混合使用这些标准**，这会大大降低项目的可维护性。

除了JavaScript代码中的这三种方式以外，还有一些独立的加载器在工作时也会处理所加载到的资源当中的一些导入的模块。[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/10-load-way)

- 样式代码中的 @import 指令和 url 函数

例如css-loader加载的CSS文件，import指令以及部分属性当中的url函数也会去触发相应的资源模块加载。

- HTML 代码中图片标签的 src 属性

还有像html-loader去加载的html文件当中的一些src属性也会去触发相应的模块加载。

1.在样式文件中去导入资源模块
```js
// main.js
import './main.css'

// main.css
body {
  ...
  background-image: url(background.png);
  ...
}
```
2.样式文件当中除了属性当中使用到的url函数，还有import指令同样也支持去加载其他的样式资源模块。
```js
// reset.css
* {
  margin: 0;
  padding: 0;
}

// main.css
@import url(reset.css);
/*css-loader 同样支持 sass/less 风格的 @import 指令*/
/*@import 'reset.css';*/
...
```
以上就是css-loader在去加载样式时，样式文件中会去触发资源加载的两种方式。

3.接下来我们再来看一看html中加载额外资源的一些方式。
```js
// footer.html
<footer>
  <img src="better.png" alt="better" width="256">
  <a href="better.png">download png</a>
</footer>

// main.js
import footerHtml from './footer.html'
document.write(footerHtml)
```
安装并配置html-loader
```
yarn add html-loader --dev
```
```js
// webpack.config.js
module.exports = {
  ...
  module: {
    rules: [
      ...
      {
        test: /.html$/,
        use: {
          loader: 'html-loader',
          options: {
            // 默认只有img:src
            attrs: ['img:src', 'a:href']
          }
        }
      }
    ]
  }
}
```

### Webpack 核心工作原理
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027230947506.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
我们以一个普通的前端工程项目为例，在项目当中一般都会散落着各种各样的代码及资源文件

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027231050371.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
Webpack很根据我们的配置找到其中的一个文件作为打包的入口（一般为js文件）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027231449637.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

然后会顺着入口文件当中的代码根据代码中出现的import或者require之类的语句，解析推断出这个文件所依赖的资源模块。

然后分别去解析每一个资源模块对应的依赖。最后就形成了整个项目中所有用到文件之间的依赖关系的**依赖树**。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027231615855.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

有了这个依赖关系树过后，Webpack会递归这个依赖树，找到每个节点所对应的资源文件。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201027231749595.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
最后再根据配置文件当中的rules属性找到这个模块对应的加载器，交给对应的加载器去加载这个模块。将加载到的结果放到bundle.js，也就是打包结果当中。从而去实现这个项目的打包。

- Loader 机制是 Webpack 的核心

这个过程中，Loader机制起到了很重要的作用如果没有Loader，就没有办法实现各种资源文件的加载，对于Webpack来说也就只能算得上是一个打包/合并JS代码的一个工具了。


### Webpack 开发一个 Loader
这里我们来开发一个markdown-loader，希望有了这样一个加载器过后可以在代码中直接导入markdown文件。

Webpack加载资源的过程有点类似一个工作管道，你可以在这个过程当中依次使用多个loader
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201028130921446.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
但是要求我们最终这个管道工作过后的结果必须是一段JavaScript代码。要么我们的loader直接返回一段JS代码，要么去找一个合适的加载器接着去处理我们这里返回的结果

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201028131741224.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201028131051878.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)
我们都知道，markdown文件一般是被转换为html过后再呈现到页面。我们先来安装一个markdown解析的模块marked
```
yarn add marked --dev
```
```js
// markdown-loader.js
const marked = require('marked') // 导入marked模块

module.exports = source => {
  const html = marked(source) // 解析来自参数当中的source
  // return html // 需要返回js代码
  // return `module.exports = "${html}"` // 存在换行符、引号等丢失的问题
  // return `export default ${JSON.stringify(html)}` // 解决字符串的换行符、引号等问题

  // 返回 html 字符串交给下一个 loader 处理
  return html
}
```
安装一个用来处理html加载的loader
```
yarn add html-loader --dev
```
```js
// webpack.config.js
const path = require('path')

module.exports = {
  mode: 'none',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist/'
  },
  module: {
    rules: [
      {
        test: /.md$/,
        use: [
          'html-loader',
          './markdown-loader' // 通过相对路径找到markdown-loader
        ]
      }
    ]
  }
}
```

- Loader 负责资源文件从输入到输出的转换
- 对于同一个资源可以依次使用多个Loader

## 5.5Webpack 插件机制 Plugin
**插件机制**是Webpack当中另外一个核心特性，目的是**增强Webpack自动化能力**。我们知道，**Loader专注实现资源模块加载**，从而实现整体项目的打包。

而**Plugin解决其他自动化工作**，例如Plugin可以帮我们去实现自动在打包之前**清除dist目录**、或是帮我们**拷贝静态文件至输出目录**，又或是帮我们**压缩输出代码**。

总之有了 Plugin 的 Webpack **实现大多前端工程化工作**，这也正是很多初学者 "Webpack = 前端工程"的这种理解的原因。

### Webpack 自动清除输出目录插件 (clean-webpack-plugin)
Webpack每次打包的结果都是覆盖到dist目录，而在打包之前，dist中就可能存在一些之前的遗留文件，我们只能覆盖掉同名文件，其他已经移除的资源文件就会一直积累在当中。因此我们需要一个**自动清除输出目录**的插件。

clean-webpack-plugin这个插件就很好地解决了这样一个问题，它是一个第三方插件。
```
yarn add clean-webpack-plugin --dev
```
```js
// webpack.config.js

...
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  ...
  plugins: [ // 专门用于配置插件
    new CleanWebpackPlugin() // 创建一个实例
  ]
}
```

### Webpack 自动生成HTML插件 (html-webpack-plugin)
除此之外，还有一个常见的需求就是**自动生成使用 bundle.js 的 HTML**。

在此之前，我们的html都是通过硬编码的方式单独存放在项目的根目录下的，这种方式有两个问题：

第一就是我们在项目发布时，我们需要同时去发布根目录下的html文件和dist目录下所有的打包结果，相对麻烦。而且上线过后还需要去确保html代码中路径引用都是正确的。

第二个问题就是如果输出的目录也就是打包结果的配置发生变化的话，html代码当中script标签所引用的路径就需要手动去修改。

解决这两个问题最好的办法就是通过 Webpack 输出 HTML 文件
```
yarn add html-webpack-plugin --dev
```
```js
// webpack.config.js

...
// 默认导出一个插件的类型，不需要解构内部成员
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  ...
  output: {
    ...
    // html是自动生成到dist目录 就不再需要此配置
    // publicPath: 'dist/'
  },
  ...
  plugins: [
    ...
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin Sample', // 设置html标题
      meta: { // 设置对象中的元数据标签
        viewport: 'width=device-width'
      }
    })
  ]
}
```
如果需要对html文件进行大量的自定义的话，更好的做法是在源代码当中添加一个用于生成html文件的模板，让插件根据模板生成页面
```
src/index.html

...
<head>
  ...
  <title>Webpack</title>
</head>
<body>
  <div class="container">
    <h1><%= htmlWebpackPlugin.options.title %></h1>
  </div>
</body>
</html>
```
```js
// webpack.config.js

...

module.exports = {
  ...
  plugins: [
    ...
    // 生成多个页面
    
    // 用于生成 index.html
    new HtmlWebpackPlugin({
      template: './src/index.html' // 使用的模板地址
    }),
    // 用于生成 about.html
    new HtmlWebpackPlugin({
      filename: 'about.html' // 指定输出文件名 默认值为index.html
    })
  ]
}
```
### Webpack 插件使用总结（copy-webpack-plugin）
项目中还有一些不需要参加构建的静态文件，我们希望Webpack在打包时可以一并将它们复制到输出目录，对于这种需求可以借助于 copy-webpack-plugin 实现
```
yarn add copy-webpack-plugin --dev
```
```js
...
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  ...
  plugins: [
   ...
    new CopyWebpackPlugin([
      // 'public/**' // 通配符
      'public' // 或目录
    ])
  ]
}
```

至此我们了解了三种插件，它们适用于任何类型的项目

- clean-webpack-plugin
- html-webpack-plugin
- copy-webpack-plugin

### Webpack 开发一个 Plugin
- 相比于Loader，Plugin拥有更宽的能力范围。Loader只是在加载模块的环节工作，而插件的作用范围几乎可以触及到Webpack工作的每一个环节。

- Plugin 通过钩子机制实现(类似于事件)，为了便于插件的扩展，Webpack几乎给每一个环节都埋下了一个钩子，我们在去开发插件时就可以通过往这些不同的节点上挂载不同的任务。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201030210218325.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- Webpack要求每一个插件必须是一个函数或者是一个包含apply方法的对象。一般我们都会把这个插件定义为一个类型，然后在这个类型中定义一个apply方法。使用就是通过这个类型构建一个实例去使用。

- 通过在生命周期的钩子中挂载函数实现扩展

>需求：清除打包后的注释

```js
...

class MyPlugin {
  apply (compiler) {
    console.log('MyPlugin 启动')

    // emit钩子符合需求
    compiler.hooks.emit.tap('MyPlugin', compilation => {
      // compilation => 可以理解为此次打包的上下文
      for (const name in compilation.assets) {
        if (name.endsWith('.js')) { // 判断JS文件
          const contents = compilation.assets[name].source() // 获取文件内容
          const withoutComments = contents.replace(/\/\*\*+\*\//g, '')
          compilation.assets[name] = { // 覆盖原有内容
            source: () => withoutComments, // 新内容
            size: () => withoutComments.length // Webpack要求返回大小
          }
        }
      }
    })
  }
}

module.exports = {
  ...
  plugins: [
    ...
    new MyPlugin()
  ]
}

```

## 5.6Webpack 开发环境优化
以下这种周而复始的方式过于原始

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201030211914226.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

因此我们设想Webpack可以：1.以HTTP Server 运行。2.自动编译+自动刷新。3.提供 Source Map 支持。

### Webpack 自动编译
目前我们修改完源代码都是通过命令行手动重复去运行Webpack命令从而得到最新的打包结果。

我们也可以使用Webpack-cli中的 watch工作模式 来解决这个问题，这种模式下项目中的文件会被监视，一旦当这些文件发生变化，就会自动重新运行打包任务。

```
yarn webpack --watch
```

### Webpack 自动刷新浏览器
但是在 watch 模式下还是需要手动刷新浏览器页面才能浏览运行的结果。如果我们希望编译过后自动刷新浏览器，我们可以通过 BrowserSync 这个工具来实现。
```
yarn add browser-sync --dev
yarn browser-sync dist --files "**/*"
```
不过这个过程中Webpack会不断地将文件写入磁盘，然后BrowserSync再从磁盘中读取出来，这个过程当中一次就会多出两部磁盘读写操作，因此还需要继续改善开发体验。

### Webpack Dev Server
webpack-dev-server 是 Webpack 官方推出的一个开发工具，根据名字就应该知道，它提供一个开发服务器，并且集成了`自动编译`和`自动刷新浏览器`等一系列对开发非常友好的功能都集成在了一起。

```
yarn add webpack-dev-server --dev
```
需要注意的是，webpack-dev-server为了提高工作效率，并没有将打包后的结果写入到磁盘。它是将打包结果暂时存放在内存当中，而内部的http-server也正是将内存中的这些文件读出来发送给浏览器。
```
yarn webpack-dev-server [--open]
```
这样就会减少很多不必要的磁盘读写操作从而大大提高构建效率。

### Webpack Dev Server 静态资源访问
webpack-dev-server 默认会将构建结果的输出文件全部作为开发的资源文件。也就是说，只要是Webpack输出的文件都可以直接被访问。但是如果还有一些静态资源也需要作为开发服务器的资源被访问就需要额外做一些操作。
```js
...

module.exports = {
 ...
  devServer: {
    contentBase: './public', // 额外指明静态资源目录
  },
  ...
  plugins: [
    ...
    // // 开发阶段最好不要使用这个插件
    // new CopyWebpackPlugin(['public'])
  ]
}
```
### Webpack Dev Server 代理 API

由于开发服务器的缘故，我们还将应用运行在localhost的一个端口上面，而最终上线过后，一般又和API部署到同源地址下面，这样就会有一个非常常见的问题：实际生产当中可以直接访问API，但是回到开发环境就会产生跨域请求问题

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201030223134198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201030223207323.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

当然我们可以使用跨域资源共享（CORS）的方式来解决，但是使用CORS的前提是API必须支持，并不是任何情况下API都应该支持。

如果前后端同源部署，也就是 域名、协议、端口 一致的话，根本没有必要开启CORS，解决这个问题最好的办法就是在开发服务器当中去配置代理服务，也就是将接口服务代理到本地开发服务地址。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201030223615193.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201030223630822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ1MTQ5MjU2,size_16,color_FFFFFF,t_70#pic_center)

- webpack-dev-server就支持直接通过配置的方式添加代理服务

目标：将GitHub API 代理到开发服务器

```js
...

module.exports = {
 ...
  devServer: {
    ...
    proxy: { // 添加代理服务配置
      '/api': { // 需要被代理的请求路径前缀
        // http://localhost:8080/api/users -> https://api.github.com/api/users
        target: 'https://api.github.com', // 代理目标
        // 但是我们需要请求的接口地址没有/api
        // http://localhost:8080/api/users -> https://api.github.com/users
        pathRewrite: { // 代理路径重写
          '^/api': '' // 以api开头的替换为空
        },
        // 不能使用 localhost:8080 作为请求 GitHub 的主机名
        changeOrigin: true // 以实际代理请求的主机名请求
      }
    }
  },
  ...
}
```
```js
// main.js

const ul = document.createElement('ul')
document.body.append(ul)

// 跨域请求，虽然 GitHub 支持 CORS，但是不是每个服务端都应该支持。
// fetch('https://api.github.com/users')
fetch('/api/users') // http://localhost:8080/api/users
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      const li = document.createElement('li')
      li.textContent = item.login
      ul.append(li)
    })
  })
```
### Webpack Source Map
通过构建编译之类的操作，我们可以将开发阶段的源代码转化为能够在生产环境当中运行的代码。但这也就意味之我们在实际生产环境运行的代码于源代码之间完全不同。

此时如果需要去调试我们的应用，信息将无法定位。因为调试和报错都是基于运行代码，Source Map 就是解决这一类问题最好的一个办法。如果需要详细了解，可以看我的这篇博客： [如何正确使用 SourceMap？](https://shiguanghai.top/blogs/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A1%AE%E4%BD%BF%E7%94%A8%20SourceMap.html)


### Webpack 自动刷新的问题
在此之前，我们已经简单了解了webpack-dev-server的一些基本用法和特性。它主要就是为使用Webpack构建的项目提供一个友好的开发环境和一个可以用来调试的开发服务器。

使用Webpack Dev Server 可以使我们的开发过程更加专注于编码，因为它可以监视到代码的变化自动进行打包，再通过自动刷新的方式同步到浏览器以便于及时预览。

但是当你实际使用这样一个特性去完成一些具体的开发任务时，你会发现还是会有一些问题：

例如编辑器应用，我们想去及时调试编辑器当中文本内容的样式。正常情况下我们会先在编辑器中添加一些文本作为展示样例，当我们修改完样式过后，原本想着可以及时看到最新的界面效果，但是此时编辑器当中的内容却没有了。

这种文本内容丢失的问题无疑让我们感觉到自动刷新的"鸡肋"。因为我们每次修改完代码，Webpack监视到文件的变化过后就会自动打包，然后自动刷新到浏览器。一旦页面整体刷新，页面中任何之前的操作状态都会丢失。

- 办法1：代码中写死编辑器的内容
- 办法2：额外的代码实现刷新前保存，刷新后读取

- **问题核心：自动刷新导致的页面状态丢失**
- 更好的办法：页面不刷新的前提下，模块也可以及时更新

### Webpack HMR
HMR 即 `Hot Module Replacement` ，通过这种方式就可以解决上述解决的问题。

HMR已经集成在了 webpack-dev-server 中，可以直接使用 --hot 开启 亦或是在配置文件中开启
```
yarn webpack-dev-server --hot
```

详细的使用及其工作原理可通过我的另一篇博客 [热更新技术如何开着飞机修引擎？](https://shiguanghai.top/blogs/%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96/%E7%83%AD%E6%9B%B4%E6%96%B0%E6%8A%80%E6%9C%AF%E5%A6%82%E4%BD%95%E5%BC%80%E7%9D%80%E9%A3%9E%E6%9C%BA%E4%BF%AE%E5%BC%95%E6%93%8E.html) 来了解。

### Webpack HMR 注意事项
- 1.处理HMR的代码报错会导致自动刷新（ 使用 hotOnly 解决 ）
- 2.没启动 HMR 的情况下，HMR API 报错（ 使用if(module.hot){...} ）
- 3.代码中多了一些与业务无关的代码（打包后处理热替换的代码会被移除）

## 5.7Webpack 生产环境优化
### Webpack 不同环境下的配置
随着我们对开发阶段的优化，我们的打包结果会随之变得臃肿。Webpack为了实现这些特性，会自动往打包结果添加额外的代码：例如 Source Map 和 HMR。

但是这些对生产环境是冗余的，因为生成环境和开发环境有很大的差异。

- 生产环境注重运行效率
- 开发环境注重开发效率

针对这个问题，Webpack4 推出 模式(`mode`) 的用法。它为我们提供了不同模式下的一些预设配置。 

- Webpack 建议我们 为不同的工作环境创建不同的配置

创建不同的环境配置的方式主要有两种：

1. 配置文件根据环境不同导出不同配置（小型项目）

```js
// webpack.config.js
...
// 支持导出一个函数 返回所需要的配置对象
module.exports = (env, argv) => { // 1.通过cli传递的环境名参数 2.运行cli传递到所有参数
  const config = { // 开发模式
    mode: 'development',
    ...
  }

  if (env === 'production') { // 生产环境
    config.mode = 'production'
    config.devtool = false // 禁用Source Map
    config.plugins = [
      ...config.plugins,
      // 开发阶段可省略而生产环境需要的插件
      ...
    ]
  }

  return config
}
```
```
yarn webpack // 未传递任何参数 默认以开发模式打包
yarn webpack --env production // 以生产模式打包
```

2. 不同环境对应不同配置文件（大型项目）

```js
// webpack.common.js 公共环境配置
...

module.exports = {
  ...
}
```
```js
// webpack.prod.js 生产环境配置
...
const common = require('./webpack.common') // 导入公共配置
const merge = require('webpack-merge') // 使用merge方法合并配置

module.exports = merge(common, {
  mode: 'production',
  plugins: [ // 希望在公共配置原有基础上添加插件而不是覆盖
    ...
  ]
})
```
```js
// webpack.dev.js 开发环境配置
...
const common = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = merge(common, {
  mode: 'development',
  ...
})
```
```
yarn webpack --config webpack.[prod].js // prod/dev
```
同样可以定义到package.json中
```js
{
  ...
  "scripts": {
    "build": "webpack --config webpack.prod.js"
  },
  ...
}
```

### Webpack DefinePlugin
在 Webpack4 中新增的 production 模式下，内部开启了很多通用的优化功能，其中就包括 DefinePlugin。

- Define Plugin ：为代码注入全局成员。例如：process.env.NODE_ENV 这个常量（第三方模块以此判断运行环境）

```js
const webpack = require('webpack')

module.exports = {
  ...
  plugins: [
    new webpack.DefinePlugin({
      // 值要求的是一个代码片段
      API_BASE_URL: JSON.stringify('https://api.example.com')
    })
  ]
}
```
```js
// src/main.js
console.log(API_BASE_URL) // console.log("https://api.example.com")
```
### Webpack 体验 Tree Shaking
Tree-shaking 字面意思“摇树”，这里我们摇掉的是代码中为引用的部分，即 未引用代码(`dead-code`)。

它可以自动检测出代码中**未引用的代码**并移除掉
```js
// src/components.js 导出了三个函数，每个函数模拟一个组件

export const Button = () => {
  return document.createElement('button')

  console.log('dead-code') // 未引用代码
}

export const Link = () => {
  return document.createElement('a')
}

export const Heading = level => {
  return document.createElement('h' + level)
}
```
```js
// sec/index.js
import { Button } from './components'

document.body.appendChild(Button())
```
这会导致components里面很多代码用不到，而它们对于打包后的结果就是冗余的。

去除冗余代码是生产环境当中非常重要的一个工作，Tree Sharking 会在生产模式下自动开启
```
yarn webpack --mode production
```

### Webpack 使用Tree Shaking（usedExports）
需要注意的是，Tree Shaking不是指某个配置选项，而是一组功能搭配使用后的优化效果，这组功能会在 production 模式下自动开启。

还是与刚刚相同的一个项目
```
yarn webpack
```
```js
// dist/bundle.js
...
const Link = () => {
  return document.createElement('a')
}

const Heading = level => {
  return document.createElement('h' + level)
}
...
```
我们看到Link函数和Heading函数，虽然外部并没有使用仍然是导出了

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201031165132262.png#pic_center)
很明显这些导出毫无意义，我们可以借助一些优化功能去除
```js
module.exports = {
  ...
  optimization: { // 集中配置Webpack内部的一些优化功能
    // 模块只导出被使用的成员 '负责标记 枯树叶'
    usedExports: true,
    // 压缩输出结果 '负责 摇掉 它们'
    minimize: true
  }
}

```
### Webpack 合并模块函数（Scope Hoisting）
除了 usedExports 以外，还可以使用 concatenateModules 属性继续优化输出。

普通的打包结果是将每一个模块最终放到一个单独的函数当中，如果模块很多也就意味着我们在输出结果中会有很多模块函数。
```js
module.exports = {
  ...
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 尽可能合并每一个模块到一个函数中
    concatenateModules: true,
    // 压缩输出结果
    // minimize: true
  }
}
```

- 尽可能将所有模块合并输出到一个函数中
- 既提升了运行效率，又减少了代码的体积

这个特性又被称为 **Scope Hosting** ，也就是作用域提升。它是Webpack3 添加的一个特性，此时在去配合 minimize，代码体机有会减少很多。
### Webpack Tree Shaking 与 Babel
很多资料表示，如果我们使用 babel-loader，就会导致 tree-shaking 失效。针对这个问题，这里同意说明一下。

首先需要明确： Tree Shaking 实现前提是使用 ES Modules 组织代码，也就是交给 Webpack 处理的代码必须使用 ESM 实现的模块化。

为什么这么说？我们知道，Webpack打包之前是将模块根据配置交给不同的 Loader 去处理，最后在将所有 Loader 处理过后的所有结果打包到一起。

为了转换代码中的 ECMAScript 新特性，很多时候我们会选用 babel-loader 去处理JS。而在 Babel 转换代码时，可能处理掉代码中的 ES Modules --> Common JS

当然这取决于我们有没有使用转换ES Modules 的插件
```js
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              // ['@babel/preset-env'] // 最新版本的babel-loader中自动关闭了ESM转换插件
              // ['@babel/preset-env', { modules: 'commonjs' }] // 强制开启该插件 则会导致 Tree Shaking 失效
              // ['@babel/preset-env', { modules: false }] // 确保不会开启ESM转换插件
              // 也可以使用默认配置，也就是 auto，这样 babel-loader 会自动关闭 ESM 转换
              ['@babel/preset-env', { modules: 'auto' }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    // 模块只导出被使用的成员
    usedExports: true,
    // 尽可能合并每一个模块到一个函数中
    // concatenateModules: true,
    // 压缩输出结果
    // minimize: true
  }
}
```

### Webpack sideEffects
Webpack4 还新增了 sideEffects 新特性，它允许我们通过配置的方式去标识我们的代码是否有副作用从而为 Tree Shaking 提供更大的压缩空间。

- 副作用：模块执行时除了导出成员之外所做的事情
- sideEffects 一般用于 npm 包标记是否有副作用

[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/31-side-effects)，我们基于刚刚的案例基础知识把 components 拆分出了多个组件文件，然后在 index.js 中集中导出便于外界导入。

这是一种常见的同类文件组织方式，再回到入口文件中导入 components 中的 Button 成员。这样就会出现一个问题：因为我们载入的是 components 下的 index，index 中又载入了所有的组件模块。这就会导致我们只想载入 Button 组件，但是所有的组件模块都会被加载执行。

sideEffects 特性就可以用来解决此类问题
```js
module.exports = {
  ...
  optimization: {
    sideEffects: true, // production 下也会自动开启
  }
}
```
开启这个特性后，Webpack打包时就会先检查当前代码所属的 package.json 中有没有 sideEffects 标识，以此来判断此模块是否有副作用。

如果此模块没有副作用，没有用到的模块就不会再打包
```js
{
  ...
  "sideEffects": false // 标识代码没有副作用
}
```
此时没有用到的模块就不会在被打包进来了。
### Webpack sideEffects 注意
使用 sideEffects  的前提就是确保你的代码真的没有副作用，否则在Webpack打包时就会误删掉有副作用的代码。
```js
// src/extend.js

// 为 Number 的原型添加一个扩展方法
Number.prototype.pad = function (size) {
  // 将数字转为字符串 => '8'
  let result = this + ''
  // 在数字前补指定个数的 0 => '008'
  while (result.length < size) {
    result = '0' + result
  }
  return result
}
```
```js
// src/index.js

...
// 样式文件属于副作用模块
import './global.css'

// 副作用模块
import './extend'

console.log((8).pad(3))
...
```
```js
{
  ...
  "sideEffects": [ // 添加有副作用的文件
    "./src/extend.js",
    "*.css"
  ]
}
```
### Webpack 代码分割（CodeSplitting）
通过 Webpack 实现前端项目整体模块化的优势固然很明显，但是它同样存在一些弊端：

- 项目中所有代码最终都被打包到一起（如果应用非常复杂，bundle体积过大）
- 并不是每个模块在启动时都是必要的（浪费流量和带宽）

更为合理的方案是将打包结果按照一定的规则去分离到多个bundle中，根据应用的运行需要按需加载这些模块。这样就可以大大提高引用的响应速度以及它的运行效率。

可能有人会想起一开始说过的：
> Webpack 就是把项目中散落的模块合并到一起，从而去提高运行效率

这里我们又在说将它们分离开，二者是否自相矛盾？

其实这并不是矛盾，而是"物极必反"。资源太大了也不行，太碎了更不行。项目中划分的模块的颗粒度一般都会非常细，很多时候一个模块只是提供了一个小小的工具函数，并不能形成一个完整的功能单元。如果不把这些散落的模块合并到一起，就有可能运行一个小功能就要去加载非常多的模块。

而目前主流的 HTTP1.1 本身就有许多缺陷：

- 同域并行请求限制 
- 每次请求都会有一定的延迟
- 请求的 Header 浪费带宽流量

综上所述，模块打包是必要的，但是大应用要学会变通。为了解决这样的问题，Webpack支持一种**代码分包**的功能，也可以称为**代码分割**，它通过将模块按照我们所设计的规则打包到不同的bundle当中从而提高应用的响应速度。

目前 Webpack 实现分包的方式主要有两种：

- 多入口打包
- 动态导入

### Webpack 代码分割 多入口打包
**多入口打包** 一般适应于传统的**多页应用程序**，最常见的划分规则是一个页面对应一个打包入口，对于不同页面之间公共的部分单独提取。

[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/32-multiple-entry) 这是一个多页应用的示例，有 index 和 album 两个页面，代码的组织逻辑为 index.js 负责实现 index 页面上所有的功能，album.js 负责实现相册页面的所有功能，global.css 是公用的样式，fetch.js 是一个负责提供请求API方法的公共模块。

我们尝试为这个案例配置多个打包入口
```js
...

module.exports = {
  mode: 'none',
  entry: { // 配置为一个对象 而非数组
    index: './src/index.js', // 名称：路径
    album: './src/album.js'
  },
  output: {
    filename: '[name].bundle.js' // 占位符动态输出文件名
  },
  ...
  plugins: [
    ...
    new HtmlWebpackPlugin({
      ...
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      ...
      chunks: ['album']
    })
  ]
}

```
### Webpack 提取公共模块（splitChunks）
多入口打包非常容易理解和使用，但是它同样存在一个小小的问题：

- 不同入口中肯定会有公共模块（不同打包结果中会有相同模块出现）

例如项目中 index 入口和 album 入口使用相同的 global.css 和 fetch.js。我们需要将这些公共模块提取到单独的 bundle 中
```js
...

module.exports = {
...
  optimization: {
    splitChunks: {
      // 自动提取所有公共模块到单独 bundle
      chunks: 'all'
    }
  },
  ...
}
```
### Webpack 代码分割 动态导入
- 按需加载：需要用到某个模块时，再加载这个模块

这种 按需加载 的方式可以极大解决我们的带宽和流量，Webpack 中支持动态导入的方式来实现模块的按需加载，而且所有**动态导入的模块会被自动分包**。

相比于多入口的方式，动态导入更为灵活，因为我们可以通过代码逻辑控制我们是否需要加载某个模块或者是我们何时加载。

而分包的目的中就有很重要的一点：要让模块实现按需加载从而去提高应用的响应速度。

[项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-02/code/02-02-02-01-webpack-demo/34-dynamic-import)，这里有一个可以体现按需加载作用的场景。在页面的主体区域，如果访问的是文章页，得到的就是一个文章列表；如果访问的是相册页，显示的就是相册列表。

目前文章列表对应的就是 posts 组件，而相册列表对应的就是 album 组件。在打包入口 index 当中同时导入这两个模块，当锚点发生变化时，根据锚点的值决定显示哪个组件。

这里就会存在浪费的可能性：如果用户打开应用过后只是访问了其中的一个页面，另外一个页面所对应的组件的加载就是浪费。

如果是动态导入组件，就能解决这个问题，Webpack内部会自动解决分包和按需加载
```js
const render = () => {
  const hash = window.location.hash || '#posts'
  const mainElement = document.querySelector('.main')

  mainElement.innerHTML = ''

  if (hash === '#posts') {
    // mainElement.appendChild(posts())
    import('./posts/posts').then(({ default: posts }) => {
      mainElement.appendChild(posts())
    })
  } else if (hash === '#album') {
    // mainElement.appendChild(album())
    import('./album/album').then(({ default: album }) => {
      mainElement.appendChild(album())
    })
  }
}

render()

window.addEventListener('hashchange', render)
```

- 如果使用的是单页应用开发框架，比如 React 或者 Vue，在项目当中的路由映射组件就可以通过这种动态导入的的方式实现按需加载。

### Webpack 魔法注释（Magic Comments）
默认通过动态导入产生的 bundle 文件的名称只是一个序号，如果需要给这些 bundle 命名的话。可以使用 Webpack 特有的 魔法注释 来实现。

在调用import函数的参数位置添加一个行内注释，就可以给分包产生的 bundle 起上名字了
```js
...
  if (hash === '#posts') {
    import(/* webpackChunkName: 'components' */'./posts/posts').then(({ default: posts }) => {
      mainElement.appendChild(posts())
    })
  } else if (hash === '#album') {
    import(/* webpackChunkName: 'components' */'./album/album').then(({ default: album }) => {
      mainElement.appendChild(album())
    })
  }
}
...
```
相同的 ChunkName 最终会被打包到一起，借助于这样一个特点，就可以根据实际情况灵活组织动态加载的模块所输出的文件了。

### Webpack MiniCssExtractPlugin 提取CSS到单个文件
MiniCssExtractPlugin 是一个可以将 CSS 代码从打包结果中提取出来的插件。

通过这个插件就可以实现 CSS 模块的按需加载
```
yarn add mini-css-extract-plugin --dev
```
除此以外，目前我们所使用的样式模块是先交给 css-loader去解析，然后再交给 style-loader 去处理，这里 style-loader 的作用就是将样式代码通过style标签的方式注入到页面当中从而使样式可以工作。

使用 mini-css-extract-plugin 的话，样式就会单独存放到文件当中，也就不需要style标签，而是直接通过link的方式去引入
```js
...
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
 ...
 module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 'style-loader', // 将样式通过 style 标签注入
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    ...
    new MiniCssExtractPlugin()
  ]
}
```
需要注意的是，如果样式文件的体积不是很大的话，提取到单个文件当中效果可能适得其反。

如果 CSS 超过 150KB 才需要考虑是否将它提取到单独文件中，否则将 CSS 代码嵌入代码减少一次请求效果可能更好。
### Webpack OptimizeCssAssetsWebpackPlugin 压缩输出的CSS文件
使用 mini-css-extract-plugin 过后，样式文件就可以被提取到单独的 CSS 文件当中了，但是同样有一个小问题

当我们尝试以生产模式运行打包时
```
yarn webpack --mode production
```
按照以往经验，Webpack 会自动压缩生成的结果，但是这次样式文件并没有变化。这是因为 Webpack 内置的压缩插件仅仅是针对于 JS 文件的压缩，对于其他资源的压缩都需要额外的插件支持。

Webpack 官方推荐 optimize-css-assets-webpack-plugin 插件来压缩样式文件。
```
yarn add optimize-css-assets-webpack-plugin --dev
```
```js
...
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  ...
  plugins: [
    ...
    new OptimizeCssAssetsWebpackPlugin()
  ]
}
```
一个额外的点是，大家在官方文档中会发现文档中这个插件并不是配置在 Plugins 数组当中的，而是添加到了 optimization 当中的 minimizer 属性当中。

如果把插件配置到 Plugins 数组当中，着个插件在任何情况下都会正常工作，而配置到 minimizer 数组当中的话，只会在 minimize 这样一个特性开启时工作。

所以 Webpack 建议这种压缩类的插件应该配置到 minimizer 数组当中以便可以通过 minimize 选项统一控制。

但是需要注意的是，当我们配置了这个数组，就是要去自定义所使用的压缩器插件，内部的 JS 压缩器就会被覆盖。
```
yarn add terser-webpack-plugin --dev
```
```js
...
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

module.exports = {
  ...
  optimization: {
    minimizer: [
      new TerserWebpackPlugin(),
      new OptimizeCssAssetsWebpackPlugin()
    ]
  },
  ...
```
```
yarn webpack --mode production // 生产模式打包 minimize自动开启
```

### Webpack 输出文件名 Hash（substitutions）
一般我们去部署前端资源文件时都会启用服务器的静态资源缓存，这样对于用户的浏览器而言，就可以缓存住应用当中的静态资源，后续就不再需要请求服务器得到这些静态资源文件了。

这样整体应用的访问速度就有一个大幅度的提升，不过开启静态资源的客户端缓存也会有一些小问题：

如果在缓存策略当中，缓存的失效时间过短，效果就不是特别明显；如果失效时间过长，一旦这个过程中应用发生了更新，重新部署过后，有没有办法及时更新到客户端。

为了解决这个问题建议生产模式下，给输出的文件中添加 Hash 值，一旦资源文件发生改变，文件名称也可以一起变化。对于客户端，全新的文件名就是全新的请求，也就没有缓存的问题。这样就可以将服务端缓存的时间设置的非常长，也就不用担心文件更新过后的问题。

```js
...

module.exports = {
  ...
  output: {
    // 项目级别的 一旦项目有改动这次打包的hash值都会发生变化
    // filename: '[name]-[hash].bundle.js'

	// chunk级别的 打包过程中同一路的打包 chunkhash都是相同的
    // filename: '[name]-[chunkhash].bundle.js'

	// 文件级别的 不同的文件就有不同的hash值
	// filename: '[name]-[contenthash].bundle.js'

	// :8 指定Hash长度为8
    filename: '[name]-[contenthash:8].bundle.js'
  },
  ...
}

```