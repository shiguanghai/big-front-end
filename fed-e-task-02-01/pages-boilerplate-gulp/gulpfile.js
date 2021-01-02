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