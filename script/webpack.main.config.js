'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.config')

const mainConfig = merge(baseConfig, {
  entry: {
    main: path.join(__dirname, '../src/main/index.ts')
  },
  target: 'electron-main'
})

module.exports = mainConfig
