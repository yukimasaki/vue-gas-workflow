import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import PaidLeave from '../views/PaidLeave.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {requiresAuth: true}
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {requiresAuth: false},
    beforeEnter(to, from, next) {
      if(store.getters['firebase/getLoginStatus']) {
        // ログイン時はトップページにリダイレクト
        next('/')
      } else {
        // 未ログイン時はログインページを表示
        next()
      }
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {requiresAuth: true}
  },
  {
    path: '/paid_leave',
    name: 'PaidLeave',
    component: PaidLeave,
    meta: {requiresAuth: true}
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

// ログイン状態をチェック（Boolean: true/false）
function isLogin() {
  return store.getters['firebase/getLoginStatus']
}

// 未認証の場合はログイン画面('/login')へリダイレクト
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // requiresAuthがtrueなら評価
    if (!isLogin()) {
      // 未ログイン時はログインページへリダイレクト
      next('/login')
    } else {
      next()  // スルー
    }
  } else {
    next()  // スルー
  }
})

export default router
