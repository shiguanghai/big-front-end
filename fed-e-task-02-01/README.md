



## 【简答题】一、谈谈你对工程化的初步认识，结合你之前遇到过的问题说出三个以上工程化能够解决问题或者带来的价值。
**前端工程化是指遵循一定的标准和规范，通过工具提高效率降低成本的一种手段。一切提高效率、降低成本、质量保证为目的的手段都属于工程化**

- 日常开发会面临的一些问题
	* 想要使用 ES6+ 新特性，但是兼容有问题
	* 想要使用 Less/Sass/PostCss 增强CSS的编程性，但是运行环境不能直接支持
	* 想要使用 模块化/组件化 的方式提高项目的可维护性，但是运行环境也不能直接支持
	* 部署上线前需要手动压缩代码及资源文件，部署过程需要手动上传代码到服务器
	* 多人协作开发，无法硬性统一大家的代码风格，从仓库中pull回来的代码质量无法保证
	* 部分功能开发时需要等待后端服务接口提前完成才可以做具体编码

- 使用工程化
	* 开发时使用ES6+新语法，发布前编译，不用担心兼容性。
	* 使用Less/Sass等预编译语言，增强CSS编程性。
	* 使用或封装模块，进行模块化开发，提高代码复用性。
	* 校验代码质量，统一代码风格，使开发更规范化。
	* 提高项目上线效率，自动压缩代码和资源文件，自动发布等。
	* 解决依赖后端问题，如接口，模板引擎，本地运行,热更新调试等。

## 【简答题】二、你认为脚手架除了为我们创建项目结构，还有什么更深的意义？
**脚手架工具的本质作用：创建项目基础结构、提供项目规范和约定**

通常我们在去开发相同类型的项目时都会有一些相同的约定，其中包括：

- 相同的组织结构
- 相同的开发范式
- 相同的模块依赖
- 相同的工具配置
- 相同的基础代码

这样一来，就会出现，当我们去搭建新项目时有大量的重复工作要做，脚手架工具就是去用来解决这一问题的。我们可以通过脚手架工具去快速搭建特定类型的项目骨架，基于这个骨架完成后续的开发工作。

## 【编程题】一、概述脚手架实现的过程，并使用 NodeJS 完成一个自定义的小型脚手架工具

**脚手架实现过程**
在启动过后，会自动询问一些预设的问题，然后将回答的结果结合一些模板文件生成一个项目的结构。

1.创建工作目录，初始化package.json文件，通过VSCode打开
```
mkdir sample-scaffolding
cd sample-scaffolding
yarn init
code .
```
2.在package.json中添加 bin 字段，用于指定 CLI 应用的入口文件
```
{
  ...
  "bin": "cli.js"
  ...
}
```
3.添加 cli.js 文件，并添加文件头
```
#!/user/bin/env node
```
如果操作系统为Linux或macOS还需要修改文件的读写权限为755
```
chmod 755 cli.js
```
4.实现脚手架的具体业务

- 通过命令行交互询问用户问题
- 根据用户回答的结果生成文件

5.在node中发起命令行交互询问使用inquirer模块
```
yarn add inquirer
```
6.通过模板引擎ejs渲染文件
```
yarn add ejs
```
7.在代码中载入inquirer模块
```js
#!/user/bin/env node

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const ejs = require('ejs')

// prompt()发起命令行的询问 可接收一个数组参数
inquirer.prompt([
  { // 每一个成员即为一个问题
    type: 'input', // 问题输入方式
    name: 'name', // 问题返回值的键
    message: 'Project name?' // 终端给出的提示
  }
])
.then(anwsers => {
  // 根据用户回答的结果生成文件

  // 模板目录
  const tmplDir = path.join(__dirname, 'templates')
  // 目标目录
  const destDir = process.cwd()

  // 将模板下的文件全部转换到目标目录
  fs.readdir(tmplDir, (err, files) => {
    if (err) throw err
    files.forEach(file => {
      // 通过模板引擎提供的rendFile()渲染文件
      // 参数 文件的绝对路径 模板引擎工作的数据上下文 回调函数
      ejs.renderFile(path.join(tmplDir, file), anwsers, (err, result) => {
        if (err) throw err
        // 将结果写入目标文件路径
        fs.writeFileSync(path.join(destDir, file), result)
      })
    })
  })
})
```
8.将此模块链接到全局范围，使之成为一个全局模块包
```
yarn link
```
9.创建一个新的工作目录
```
cd ..
mkdir demo
cd .\demo\
```
10.在新的工作目录下输入命令
```
sample-scaffolding
```

[完整项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-01/code/02-01-02-07-sample-scaffolding)

## 【编程题】二、尝试使用 Gulp 完成项目的自动化构建
1.添加gulp模块
```
yarn add gulp --dev
```
2.在项目根目录下添加gulpfile.js入口文件
```
code gulpfile.js
```
3.添加项目中需要使用到的插件

>1.）使用 gulp-load-plugins 插件批量引入package.json文件中的依赖项工具，从而不必在gulfile.js中手动引入每个gulp插件
```
yarn add gulp-load-plugins --dev
```
>2.）使用 gulp-sass 插件编译 scss 文件，将 scss 转换为 css；后续我们将使用 gulp-clean-css 插件，对 css 文件进行压缩
```
yarn add gulp-sass --dev
yarn gulp-clean-css --dev
```
```js
const style = () => {
  // 通过src的选项参数base来确定转换过后的基准路径
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // 完全展开构建后的代码
    .pipe(dest('temp'))
}
```
>3.）使用 gulp-babel、 @babel/core、 @babel/preset-env 插件编译 js 文件，将 es6 转换为 es5；后续我们将使用 gulp-uglify 插件，对 js 文件进行压缩
```
yarn add gulp-babel @babel/core @babel/preset-env --dev
yarn add gulp-uglify --dev
```
```js
const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
     // 只是去唤醒babel/core这个模块当中的转换过程
     // babel作为一个平台不做任何事情，只是提供一个环境
     // presets 就是插件的集合
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
}
```
>4.）使用 gulp-swig 插件编译 html 文件，并将数据对象中的变量注入模板，设置不缓存页面；后续我们将使用 gulp-htmlmin 插件，对 html 文件进行压缩
```
yarn add gulp-swig --dev
yarn add gulp-htmlmin --dev
```
```js
const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data: data, defaults: { cache: false } }))  // 编译html，并将数据对象中的变量注入模板，不缓存
    .pipe(dest('temp'))
}
```
>5.）使用 gulp-imagemin 插件将图片文件和字体文件进行压缩
```
yarn add gulp-imagemin --dev
```
```js
const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}
```
```
注意：
gulp-imagemin 插件内置了几个 git 上的插件，拉取极易失败；
可以采取以下方法，将可 install 成功

C:\Windows\System32\drivers\etc\hosts
找到上面路径的文件，进行编辑
添加以下内容：
52.74.223.119     github.com
192.30.253.119    gist.github.com
54.169.195.247    api.github.com
185.199.111.153   assets-cdn.github.com
151.101.76.133    raw.githubusercontent.com
151.101.76.133    gist.githubusercontent.com
151.101.76.133    cloud.githubusercontent.com
151.101.76.133    camo.githubusercontent.com
151.101.76.133    avatars0.githubusercontent.com
151.101.76.133    avatars1.githubusercontent.com
151.101.76.133    avatars2.githubusercontent.com
151.101.76.133    avatars3.githubusercontent.com
151.101.76.133    avatars4.githubusercontent.com
151.101.76.133    avatars5.githubusercontent.com
151.101.76.133    avatars6.githubusercontent.com
151.101.76.133    avatars7.githubusercontent.com
151.101.76.133    avatars8.githubusercontent.com

添加后使用cmd，运行ipconfig/flushdns
```
>6.）我们在编译前，使用 del 插件将原先编译后的文件目录删除
```
yarn add del --dev
```
```js
const clean = () => {
  return del(['dist', 'temp'])
}
```

>7.）当代码修改并保存，使用 browser-sync 插件使浏览器热更新，提高我们的开发效率
```
yarn add browser-sync --dev
```
```js
const serve = () => {
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false, // 是否提示
    port: 2080, // 端口
    open: true, // 自动打开页面 默认true
    files: 'temp/**', // 启动后自动监听的文件
    server: { 
      baseDir: ['temp', 'src', 'public'],
      routes: { // 优先于baseDir
        '/node_modules': 'node_modules'
      }
    }
  })
}
```
>8.）使用 gulp-useref 插件可以将 HTML 引用的多个 CSS 和 JS 合并起来，减小依赖的文件个数，从而减少浏览器发起的请求次数。gulp-useref 根据注释将 HTML 中需要合并压缩的区块找出来，对区块内的所有文件进行合并。需要注意的是，gulp-useref只负责合并，不负责压缩
```
yarn add gulp-useref --dev
```
```js
const useref = () => {
  return src('dist/*.html', { base: 'dist' })
    .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
    .pipe(dest('dist'))
}
```
>9.)使用 gulp-if 插件来判断读取流文件类型，并压缩对应文件
```
yarn add gulp-if --dev
```
```js
const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    // html js css三种流
    // 压缩js文件
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    // 压缩css文件
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    // 压缩html文件
    .pipe(
      plugins.if(/\.html$/,plugins.htmlmin({ // 默认只压缩空白字符
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        })))
    .pipe(dest('dist'))
}
```
4.在gulpfile.js中定义构建任务
```js
// 实现这个项目的构建任务

const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')

const plugins = loadPlugins()
const bs = browserSync.create()

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

const clean = () => {
  return del(['dist', 'temp'])
}

const style = () => {
  // 通过src的选项参数base来确定转换过后的基准路径
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // 完全展开构建后的代码
    .pipe(dest('temp'))
}

const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
     // 只是去唤醒babel/core这个模块当中的转换过程
     // babel作为一个平台不做任何事情，只是提供一个环境
     // presets 就是插件的集合
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
}

const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data: data, defaults: { cache: false } }))  // 编译html，并将数据对象中的变量注入模板，不缓存
    .pipe(dest('temp'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}

const serve = () => {
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload)

  bs.init({
    notify: false, // 是否提示
    port: 2080, // 端口
    open: true, // 自动打开页面 默认true
    files: 'temp/**', // 启动后自动监听的文件
    server: { 
      baseDir: ['temp', 'src', 'public'],
      routes: { // 优先于baseDir
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    // html js css三种流
    // 压缩js文件
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    // 压缩css文件
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    // 压缩html文件
    .pipe(
      plugins.if(/\.html$/,plugins.htmlmin({ // 默认只压缩空白字符
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true
        })))
    .pipe(dest('dist'))
}

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build = series(
  clean, 
  parallel(
    series(compile, useref), 
    image, 
    font, 
    extra
  )  
)

const develop = series(compile, serve)

module.exports = {
  clean,
  build,
  develop
}
```

[完整项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-01/pages-boilerplate-gulp)

## 【编程题】三、使用 Grunt 完成项目的自动化构建
1.添加grunt模块
```
yarn add grunt --dev
```
2.在项目根目录下添加gruntfile.js入口文件
```
code gruntfile.js
```
3.添加项目中需要使用到的插件

>1.）使用 load-grunt-tasks 插件批量引入package.json文件中的依赖项工具，从而不必在gruntfile.js中手动引入每个gulp插件
```
yarn add load-grunt-tasks --dev
```
>2.）使用 grunt-sass 插件编译 scss 文件，将 scss 转换为 css；后续我们将使用 grunt-contrib-cssmin 插件，对 css 文件进行压缩
```
yarn add grunt-sass --dev
yarn add grunt-contrib-cssmin
```
```js
// 将scss转换为css
sass: {
  options: {
    implementation: sass, // 用于指定grunt-sass中使用哪个模块去处理sass的编译
    sourceMap: false, // 自动生成对应的sourceMap文件
    outputStyle: 'expanded' // 完全展开构建后的代码
  },
  build: {
    expand: true,
    ext: '.css',
    cwd: 'src/assets/styles',
    src: '*.scss',
    dest: 'dist/assets/styles'
  }
},
```
>3.）使用 grunt-babel @babel/core @babel/preset-env 插件编译 js 文件，将 es6 转换为 es5；后续我们将使用 grunt-contrib-uglify 插件，对 js 文件进行压缩
```
yarn add grunt-babel @babel/core @babel/preset-env --dev
yarn add grunt-contrib-uglify --dev
```
```js
// 将es6转换为es5
babel: {
  options: {
    sourceMap: false,
    presets: ['@babel/preset-env']
  },
  build: {
    expand: true,
    cwd: 'src/assets/scripts',
    src: '*.js',
    dest: 'dist/assets/scripts'
  }
},
```
>4.）使用 grunt-swigtemplates 插件编译 html 文件，并将数据对象中的变量注入模板，设置不缓存页面；后续我们将使用 grunt-contrib-htmlmin 插件，对 html 文件进行压缩
```
yarn add grunt-swigtemplates --dev
yarn add grunt-contrib-htmlmin --dev
```
```js
// 编译html，并将数据对象中的变量注入模板
swigtemplates: {
  options: {
    defaultContext: data,
    templatesDir: 'src'
  },
  build: {
    src: ['src/*.html'],
    dest: 'dist/'
  }
},
```
>5.）使用 grunt-contrib-imagemin 插件将图片文件和字体文件进行压缩
```
yarn add grunt-contrib-imagemin --dev
```
```js
// 压缩图片文字
imagemin: {
  build: {
    expand: true,
    cwd: 'src/assets/images',
    src: '**',
    dest: 'dist/assets/images'
  },
  buildFont: {
    expand: true,
    cwd: 'src/assets/fonts',
    src: '**',
    dest: 'dist/assets/fonts'
  }
},
```
>6.）使用 grunt-contrib-copy 插件将无需编译的文件直接复制到目标目录
```
yarn add grunt-contrib-copy --dev
```
```js
// 将无需编译的文件直接复制到目标目录
copy: {
  build: {
    expand: true,
    cwd: 'public',
    src: '**',
    dest: 'dist'
  }
},
```
>7.）我们在编译前，使用 grunt-contrib-clean 插件将原先编译后的文件目录删除
```
yarn add grunt-contrib-clean --dev
```
```js
// 删除目录
clean: {
  build: {
    src: ['dist', '.tmp']
  }
},
```
>8.）当代码修改并保存，使用 grunt-browser-sync 插件使浏览器热更新，提高我们的开发效率。使用 grunt-contrib-watch 插件任务，监听文件变化时，对其进行编译处理。需要注意的是，执行任务时，watch 必须在 browserSync 之后执行
```
yarn add grunt-browser-sync --dev
yarn add grunt-contrib-watch --dev
```
```js
// 浏览器同步测试工具
browserSync: {
  build: {
    open: true, // 自动打开页面 默认true
    notify: false, // 是否提示
    bsFiles: {
      src: ['dist', 'src', 'public']
    },
    options: {
      watchTask: true,
      server: {
        baseDir: ['dist', 'src', 'public'],
        routes: { // 优先于baseDir
          '/node_modules': 'node_modules'
        }
      }
    }
  }
},
// 监听文件变化，对其进行编译处理
watch: {
  bulidScss: {
    files: 'src/assets/styles/*.scss',
    tasks: ['sass']
  },
  bulidJs: {
    files: 'src/assets/scripts/*.js',
    tasks: ['babel']
  },
  buildHtml: {
    files: 'src/*.html',
    tasks: ['swigtemplates']
  }
},
```
>9.）使用 grunt-usemin 插件可以将 HTML 引用的多个 CSS 和 JS 合并起来，减小依赖的文件个数，从而减少浏览器发起的请求次数。grunt-usemin 根据注释将 HTML 中需要合并压缩的区块找出来，对区块内的所有文件进行合并。需要注意的是，grunt-usemin只负责合并，不负责压缩。使用 grunt-contrib-concat 插件 该任务解析 HTML 标记以查找每个块，并在 type = js 时，为concat、uglify任务初始化相应的 Grunt 配置，在 type = css 时，初始化concat、cssmin任务。
>不需要在initConfig里配置concat、uglify、cssmin这三个任务
```
yarn add grunt-usemin --dev
yarn add grunt-contrib-concat --dev 
```
```js
// 资源合并压缩
useminPrepare: {
  html: 'dist/*.html',
  options: {
    dest: 'dist',
    root: ['dist', '.'],
  }
},
usemin: {
  html: 'dist/*.html'
},
htmlmin: {
  options: {
    removeComments: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true
  },
  build: {
    expand: true,
    cwd: 'dist',
    src: '*.html',
    dest: 'dist'
  }
}
```

4.在gruntfile.js中定义构建任务
```js
// 实现这个项目的构建任务


const sass = require('sass')


const LoadGruntTasks = require('load-grunt-tasks') 

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

module.exports = (grunt) => {
  // grunt.initConfig() 用于为任务添加一些配置选项
  grunt.initConfig({
    // 删除目录
    clean: {
      build: {
        src: ['dist', '.tmp']
      }
    },
    // 将scss转换为css
    sass: {
      options: {
        implementation: sass, // 用于指定grunt-sass中使用哪个模块去处理sass的编译
        sourceMap: false, // 自动生成对应的sourceMap文件
        outputStyle: 'expanded' // 完全展开构建后的代码
      },
      build: {
        expand: true,
        ext: '.css',
        cwd: 'src/assets/styles',
        src: '*.scss',
        dest: 'dist/assets/styles'
      }
    },
    // 将es6转换为es5
    babel: {
      options: {
        sourceMap: false,
        presets: ['@babel/preset-env']
      },
      build: {
        expand: true,
        cwd: 'src/assets/scripts',
        src: '*.js',
        dest: 'dist/assets/scripts'
      }
    },
    // 编译html，并将数据对象中的变量注入模板
    swigtemplates: {
      options: {
        defaultContext: data,
        templatesDir: 'src'
      },
      build: {
        src: ['src/*.html'],
        dest: 'dist/'
      }
    },
    // 压缩图片文字
    imagemin: {
      build: {
        expand: true,
        cwd: 'src/assets/images',
        src: '**',
        dest: 'dist/assets/images'
      },
      buildFont: {
        expand: true,
        cwd: 'src/assets/fonts',
        src: '**',
        dest: 'dist/assets/fonts'
      }
    },
    // 将无需编译的文件直接复制到目标目录
    copy: {
      build: {
        expand: true,
        cwd: 'public',
        src: '**',
        dest: 'dist'
      }
    },
    // 浏览器同步测试工具
    browserSync: {
      build: {
        open: true, // 自动打开页面 默认true
        notify: false, // 是否提示
        bsFiles: {
          src: ['dist', 'src', 'public']
        },
        options: {
          watchTask: true,
          server: {
            baseDir: ['dist', 'src', 'public'],
            routes: { // 优先于baseDir
              '/node_modules': 'node_modules'
            }
          }
        }
      }
    },
    // 监听文件变化，对其进行编译处理
    watch: {
      bulidScss: {
        files: 'src/assets/styles/*.scss',
        tasks: ['sass']
      },
      bulidJs: {
        files: 'src/assets/scripts/*.js',
        tasks: ['babel']
      },
      buildHtml: {
        files: 'src/*.html',
        tasks: ['swigtemplates']
      }
    },
    // 资源合并压缩
    useminPrepare: {
      html: 'dist/*.html',
      options: {
        dest: 'dist',
        root: ['dist', '.'],
      }
    },
    usemin: {
      html: 'dist/*.html'
    },
    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
      },
      build: {
        expand: true,
        cwd: 'dist',
        src: '*.html',
        dest: 'dist'
      }
    }
    
  })

  // 三个任务编译，互不干扰，不分前后顺序
  grunt.registerTask('compile', ['sass', 'babel', 'swigtemplates'])

  // 'copy', 'compile', 'imagemin'，这三个任务执行，互不干扰，不分前后顺序
  // 必须先执行'compile'任务后，依次执行'useminPrepare'、'concat'、'cssmin'、 'uglify'、 'usemin'、 'htmlmin'任务
  grunt.registerTask('build', [
    'clean', // 清除
    'compile',
    'useminPrepare', 'concat', 'cssmin', 'uglify', 'usemin', 'htmlmin', // 压缩
    'copy', 'imagemin', // 其他
  ])

  // 必须先执行'compile'任务后，才能'browserSync'任务
  // 切记'watch'不能在'browserSync'任务之前执行
  grunt.registerTask('develop', ['compile', 'browserSync', 'watch'])

  LoadGruntTasks(grunt) // 自动加载所有的 grunt 插件中的任务
}
```

[完整项目代码](https://gitee.com/shiguanghaitop/big-front-end-phase-5/tree/master/fed-e-task-02-01/pages-boilerplate-grunt)