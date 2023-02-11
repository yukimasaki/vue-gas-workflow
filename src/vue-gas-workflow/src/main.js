import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import initFirebase from './firebase/firebaseConfig.js'

Vue.config.productionTip = false

const createApp = async () => {
  // Firebaseを初期化
  initFirebase

  // ユーザー情報をセット
  await store.dispatch('firebase/onAuth')

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
    created: () => (document.documentElement.setAttribute('lang', 'ja')),
  }).$mount('#app')
}

createApp()
