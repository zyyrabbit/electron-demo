'use strict';

const path = require('path')
const webpack = require('webpack')

const devMode = process.env.NODE_ENV !== 'production'
const region = process.env.APP_REGION || 'demo'
const host = 'localhost'
const port = 9080
const EnvInfo = require(`../app/${region}/env`)
const packages = require(`../app/${region}/package.json`);

const baseConfig = {
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../app', region, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(ts|js|vue)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            appendTsSuffixTo: [/\.vue$/],
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  node: {
    __dirname: devMode,
    __filename: devMode
  },
  devServer: {
    contentBase: path.join(__dirname, '../'),
    host,
    port,
    hot: true,
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV: JSON.stringify(devMode),
      __HOST: JSON.stringify(devMode ? `http://${host}:${port}` : ''),
      __STATIC: JSON.stringify(devMode ? path.join(__dirname, '../static').replace(/\\/g, '\\\\') : ''),
      __API_HOST: JSON.stringify(EnvInfo.host),
      __APP_VERSION: JSON.stringify(packages.version),
      __APP_VERSION_CODE: JSON.stringify(EnvInfo.versionCode),
      __APP_NAME: JSON.stringify(EnvInfo.name),
      __APP_NAME_CN: JSON.stringify(EnvInfo.nameCN),
      __REGION: JSON.stringify(region),
      __CT_APPKEY: JSON.stringify(EnvInfo.ctAppKey),
      __CT_APPSECRET: JSON.stringify(EnvInfo.ctAppSecret),
      __FEED_URL: JSON.stringify(EnvInfo.feedUrl),
      __SOCKET_PORT: EnvInfo.socketPort || 11137
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node'],
    alias: {
      '@': path.join(__dirname, '../src'),
    }
  }
};

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  baseConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = baseConfig
