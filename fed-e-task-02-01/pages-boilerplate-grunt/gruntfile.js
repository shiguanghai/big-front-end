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
        src: ['dist', 'temp', '.tmp']
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
        dest: 'temp/assets/styles'
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
        dest: 'temp/assets/scripts'
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
        dest: 'temp/'
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
          src: ['temp', 'src', 'public']
        },
        options: {
          watchTask: true,
          server: {
            baseDir: ['temp', 'src', 'public'],
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
      html: 'temp/*.html',
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
        cwd: 'temp',
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
