/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  publicPath: '',
  assetsDir: '',
  runtimeCompiler: true,
  lintOnSave: true,
  // productionSourceMap: false,
  // 默认babel-loader会忽略node_modules中的文件
  // 但是dolphin-plugin-tools用了es6的语法, 配置对其显示转译
  // 配合babel sourceType: 'unambiguous'来使用 https://github.com/babel/babel/issues/9187,
  transpileDependencies: [
    'dolphin-plugin-tools',
    /@hui-pro/
  ],
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      // 打包的css如有必要加上@charset
      config.plugin('optimize-css').tap(args => {
        try {
          args[0].cssnanoOptions.preset[1].normalizeCharset = true
          return args
        } catch (_) {
          return args
        }
      })
    }
  },
  // 用于开发环境下与后端联调
  // 如有需要, 还可以配合easy-proxy进行使用
  devServer: {
    // 如果改动node_modules内的代码, 不会触发热重载, 则取消下面的注释
    // watchOptions: {
    //   ignored: []
    // },
    proxy: {
      '/api': {
        target: 'http://10.193.172.23:17067/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
