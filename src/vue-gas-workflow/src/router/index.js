// ライブラリ
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// コンポーネント
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import RequestOverview from '../views/RequestOverview.vue'
import RequestDetail from '../views/RequestDetail.vue'
import Departments from '../views/Departments.vue'
import Routes from '../views/Routes.vue'
import Admins from '../views/Admins.vue'
import Users from '../views/Users.vue'
import ItemDIalogTest from '../views/tests/ItemDIalogTest.vue'
import FormReactivityTest from '../views/tests/FormReactivityTest.vue'
import SendEmailTest from '../views/tests/SendEmailTest.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'RequestOverview',
    component: RequestOverview,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my/requests/:id',
    name: 'myRequestDetail',
    component: RequestDetail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/others/requests/:id',
    name: 'othersRequestDetail',
    component: RequestDetail,
    meta: {
      requiresAuth: true
    }
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
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/departments',
    name: 'Departments',
    component: Departments,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: '/routes',
    name: 'Routes',
    component: Routes,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: '/admins',
    name: 'Admins',
    component: Admins,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: '/item_dialog_test',
    name: 'ItemDIalogTest',
    component: ItemDIalogTest,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: '/form_reactivity_test',
    name: 'FormReactivityTest',
    component: FormReactivityTest,
    meta: {
      requiresAdmin: true
    }
  },
  {
    path: '/send_email_test',
    name: 'SendEmailTest',
    component: SendEmailTest,
    meta: {
      requiresAdmin: true
    }
  },

]

const router = new VueRouter({
  routes
})

// 以下は、ページへ遷移しようとする際、遷移直前に評価される
router.beforeEach( (to, from, next) => {
  // ログインステータスを取得
  const isAuth = store.getters['firebase/getLoginStatus']
  // 管理者ステータスを取得
  const isAdmin = store.getters['firebase/getIsAdmin']


  // 認証のみを必要とするページにアクセスした場合
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth) {
    if (isAuth) {
      // 認証済の場合はページへ遷移する
      next()
    } else {
      // 未認証の場合はログインページへ遷移する
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  } else {
    // 認証が不要な場合はページへ遷移する
    next()
  }

  // 管理者権限を必要とするページにアクセスした場合
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  if (requiresAdmin) {
    if (isAuth && isAdmin) {
      // 認証済かつ管理者の場合はページへ遷移する
      next()
    }
    if (isAuth && !isAdmin) {
      // 認証済かつ非管理者の場合は403ページへ遷移する
      next({ path: '/403' })
    } else {
      // 未認証の場合はログインページへ遷移する
      next({ path: '/login', query: { redirect: to.fullPath } })
    }
  }
})

export default router
