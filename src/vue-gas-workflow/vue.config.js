const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  outputDir: 'docs',
  assetsDir: './',
  publicPath: '/vue-gas-workflow',
  filenameHashing: false,
  productionSourceMap: false
})
