// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')
// var proxyUrl = 'http://10.0.3.3:9000'
var proxyUrl = 'https://b.yuketang.cn'

// proxyUrl = 'https://protest.xuetangonline.com'
proxyUrl = 'https://ykt-envning.rainclassroom.com'
// proxyUrl = 'https://zhktpt.yuketang.cn'


function proxyConfig () {
  return {
    target: proxyUrl,
    changeOrigin: true,
    secure: true
  }
}

// 是否部署到七牛
let productionCDN = false;
if(process.env && process.env.BUILD_ENV) {
  console.log('BUILD_ENV:', process.env.BUILD_ENV);
  if(process.env.BUILD_ENV === 'qiniu') {
    productionCDN = true;
  }
}


module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: '', //static
    assetsPublicPath: '/static/lesson/',
    // 静态资源是否部署到七牛
    productionCDN: productionCDN,
    productionSourceMap: false,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8088,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static/lesson/',
    assetsPublicPath: '/',
    proxyTable: {
      '/wsapp/': {
        // target: 'wss://protest.xuetangonline.com',
        target: 'wss://ykt-envning.rainclassroom.com',
        changeOrigin: true,
        ws: true,
        secure: false
      },
      '/web': proxyConfig(),
      '/static': proxyConfig(),
      '/pc': proxyConfig(),
      '/v/api': proxyConfig(),
      '/v': proxyConfig(),
      '/api/v3': proxyConfig(),
      '/v/quiz': proxyConfig(),
      '/group': proxyConfig(),
      '/api': proxyConfig(),
      '/v/lesson': proxyConfig(),
      '/lesson': proxyConfig(),
      '/hls': proxyConfig(),
      '/reporter': proxyConfig(),
      '/train_platform': proxyConfig(),
      '/video-log': proxyConfig()
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
