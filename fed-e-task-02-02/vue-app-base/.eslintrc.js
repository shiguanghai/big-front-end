module.exports = {
  // 默认情况下，ESLint 会在所有父级目录里寻找配置文件，一直到根目录。
  // 如果发现配置文件中有 “root”: true，它就会停止在父级目录中寻找
  "root": true,
  "env": { // 标记当前代码最终的运行环境
    "node": true // Node.js 全局变量和作用域
  },
  "extends": [ // 记录共享配置
    // 插件名称可以省略 eslint-plugin- 前缀
    "plugin:vue/essential", // plugin:插件名称/配置名字
    // 一个配置文件可以从基础配置中继承已启用的规则。
    // 如下，如果值为字符串数组则每个配置继承它前面的配置。
    // 值为 "eslint:recommended" 的 extends 属性启用了eslint默认的规则
    "eslint:recommended",
    "@vue/standard"
  ],
  "parserOptions": {
    // 设置解析器选项能帮助 ESLint 确定什么是解析错误，所有语言选项默认都是 false
    "parser": "babel-eslint" // 解析器，默认使用Espree
  },
  "rules": { // 配置eslint中每一个校验规则的开启/关闭
     // ESLint 附带有大量的规则。你可以在rules选项中设置，
     // 设置的规则将覆盖上面继承的默认规则
     // 要改变一个规则设置，你必须将规则 ID 设置为下列值之一：
     // "off" 或 0 - 关闭规则
     // "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
     // "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
    indent: ["error", 4] // 强制使用一致的缩进
    // eqeqeq: [2, 'always'], // 要求使用 === 和 !==
    // semi: [2, 'never'], // 要求或禁止使用分号代替 ASI
    // quotes: [2, 'single'], // 强制使用一致的反勾号、双引号或单引号
  }
}