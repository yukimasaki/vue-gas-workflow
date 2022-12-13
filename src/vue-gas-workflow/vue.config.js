const { defineConfig } = require('@vue/cli-service')

const isProd = process.env.NODE_ENV === 'production'

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: isProd ? '/workflow' : '/',
  outputDir: 'docs',
  filenameHashing: false,
  productionSourceMap: false
})
