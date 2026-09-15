// 示例：vue.config.js 中的配置逻辑
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: config => {
    // 1. 找到项目中默认处理 svg 的规则，排除掉 icons 目录
    // (防止默认的 file-loader 处理了我们的图标)
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()

    // 2. 为 src/icons 目录创建一个新的规则
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]' // 关键：定义生成的 id 格式，例如 user.svg -> icon-user
      })
      .end()
  }
}
