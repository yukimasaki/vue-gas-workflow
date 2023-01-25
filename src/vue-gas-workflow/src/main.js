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
  console.log(`main.js:`)
  console.log(store.state.firebase.userEmail)

  await store.dispatch('firebase/onAuth')

  // ISSUE: 下記で、userEmailが空値のままなのはなぜか？
  console.log(store.state.firebase.userEmail)

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

createApp()
