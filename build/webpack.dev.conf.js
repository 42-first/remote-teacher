var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      chunks: ['app'],
      inject: true
    }),
    // 学生接收器
    new HtmlWebpackPlugin({
      filename: 'student.html',
      template: './src/pages/student/student.html',
      chunks: ['student'],
      inject: true
    }),
    //
    new HtmlWebpackPlugin({
      filename: 'market.html',
      template: './src/pages/market/market.html',
      chunks: ['market'],
      inject: true
    }),
    // 教师遥控器重构
    new HtmlWebpackPlugin({
      filename: 'teacher.html',
      template: './src/pages/teacher/teacher.html',
      chunks: ['teacher'],
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})
