const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: '/vue-gas-workflow',
  outputDir: 'docs'
})
