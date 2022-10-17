// ライブラリ
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// コンポーネント
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

// 認証状態をチェック
router.beforeEach( (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    // 認証状態を取得
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if(user) {
        // 認証済の場合はページへ遷移する
        next()
      } else {
        // 未認証の場合はログインページへ遷移する
        next('/login')
      }
    })
  } else {
    next()
  }
})

export default router
