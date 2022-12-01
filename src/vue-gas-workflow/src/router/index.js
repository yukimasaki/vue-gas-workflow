// ライブラリ
import Vue from 'vue'
import VueRouter from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// コンポーネント
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import RequestOverview from '../views/RequestOverview.vue'
import RequestDetail from '../views/RequestDetail.vue'
import Employee from '../views/Employee.vue'
import Department from '../views/Department.vue'
import Route from '../views/Route.vue'
import Admin from '../views/Admin.vue'
import Users from '../views/Users.vue'
import Test from '../views/Test.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'RequestOverview',
    component: RequestOverview,
    meta: {requiresAuth: true}
  },
  {
    path: '/request_detail/:id',
    name: 'RequestDetail',
    component: RequestDetail,
    meta: {requiresAuth: true}
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter(to, from, next) {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        if(user) {
          // 認証済みの場合はトップページへ遷移
          next('/')
        } else {
          // 未認証の場合はログインページへ遷移
          next()
        }
      })
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {requiresAuth: true}
  },
  {
    path: '/employee',
    name: 'Employee',
    component: Employee,
    meta: {requiresAuth: true}
  },
  {
    path: '/department',
    name: 'Department',
    component: Department,
    meta: {requiresAuth: true}
  },
  {
    path: '/route',
    name: 'Route',
    component: Route,
    meta: {requiresAuth: true}
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: {requiresAuth: true}
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {requiresAuth: true}
  },
  {
    path: '/test',
    name: 'Test',
    component: Test,
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
