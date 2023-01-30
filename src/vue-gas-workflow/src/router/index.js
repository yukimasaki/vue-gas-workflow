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

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'RequestOverview',
    component: RequestOverview,
    meta: {
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/my/requests/:id',
    name: 'myRequestDetail',
    component: RequestDetail,
    meta: {
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/others/requests/:id',
    name: 'othersRequestDetail',
    component: RequestDetail,
    meta: {
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      requiresAdmin: false
    },
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
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/departments',
    name: 'Departments',
    component: Departments,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/routes',
    name: 'Routes',
    component: Routes,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admins',
    name: 'Admins',
    component: Admins,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
]

const router = new VueRouter({
  routes
})

// 以下は、ページへ遷移しようとする際、遷移直前に評価される
router.beforeEach( (to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  // adminsコレクションを配列として取得し、自身のユーザーID(Email)が含まれるかを判定する関数
  const checkAdminStatus = async (user) => {
    try {
      await store.dispatch('firestore/fetchAllCollections', { currentTableName: 'admins' })
      const admins = store.getters['firestore/getAdminEmails']
      const isAdmin = admins.includes(user.email)
      store.commit('firebase/setAdminStatus', isAdmin)
      return isAdmin
    } catch (err) {
      return false
    }
  }

  if (requiresAuth && requiresAdmin) {
    // 認証および管理者権限を必要とするページにアクセスした場合
    onAuthStateChanged(auth, async (user) => {
      const isAdmin = await checkAdminStatus(user)
      if (user && isAdmin) {
        // 認証済かつ管理者の場合、ページへ遷移する
        next()
      } else if (user && !isAdmin) {
        // 認証済かつ非管理者の場合、/403へ遷移する
        next({ path: '/403' })
      } else {
        // 未認証の場合、/loginへ遷移する
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    })

  } else if (requiresAuth && !requiresAdmin) {
    onAuthStateChanged(auth, (user) => {
      // 認証のみを必要とするページにアクセスした場合
      if (user) {
        next()
      } else {
        // 未認証の場合、/loginへ遷移する
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    })

  } else {
    // 認証が不要なページにアクセスした場合 (/loginへのアクセスを想定)
    next()
  }
})

export default router
