/*
 * @Author: freysu
 * @Date: 2024-11-18 05:05:32
 * @LastEditors: freysu
 * @LastEditTime: 2024-11-23 17:30:06
 * @Description: file content
 */
const path = require('path')
module.exports = {
  entry: './original_src/index.js',
  //  production + 缺省不写
  mode: 'production',
  // mode: 'development',
  // devtool: 'source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'webpack_dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'webpack_dist'),
    compress: true,
    port: 9000
  }
}
