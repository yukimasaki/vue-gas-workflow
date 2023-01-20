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
    meta: { requiresAuth: true }
  },
  {
    path: '/my/requests/:id',
    name: 'myRequestDetail',
    component: RequestDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/others/requests/:id',
    name: 'othersRequestDetail',
    component: RequestDetail,
    meta: { requiresAuth: true }
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
    meta: { requiresAuth: true }
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
  {
    path: '/item_dialog_test',
    name: 'ItemDIalogTest',
    component: ItemDIalogTest,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/form_reactivity_test',
    name: 'FormReactivityTest',
    component: FormReactivityTest,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/send_email_test',
    name: 'SendEmailTest',
    component: SendEmailTest,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },

]

const router = new VueRouter({
  routes
})

// 認証状態をチェック
router.beforeEach( (to, from, next) => {
  // 管理者認証に関する処理
  // 下記はもともとfirebase.jsに記述していたが、onAuthがrouterより後に評価されてしまうため、router内で処理する必要がある。
  // if (Object.keys(user).length != 0) {
  //   const getAdminEmails = async () => {
  //     await dispatch('firestore/fetchAllCollections', { currentTableName: 'admins' }, { root: true })
  //     const adminEmails = rootGetters['firestore/getAdminEmails']
  //     const isAdmin = adminEmails.includes(state.userEmail)
  //     commit('setIsAdmin', isAdmin)
  //     console.log(`isAdmin: ${isAdmin}`)
  //   }
  //   getAdminEmails()
  // }

  const setStateIsAdmin = async (user) => {
    await store.dispatch('firestore/fetchAllCollections', { currentTableName: 'admins' })
    const admins = store.getters['firestore/getAdminEmails']
    const userEmail = user.email
    const isAdmin = admins.includes(userEmail)
    console.log(`isAdmin: ${isAdmin}`)
    store.commit('firebase/setIsAdmin', isAdmin)
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth) {
    // 認証状態を取得
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      if(user) {
        // 管理者であるか否かを判定し結果をstoreにコミットする
        setStateIsAdmin(user)

        // 認証済の場合はページへ遷移する
        next()
      } else {
        // 未認証の場合はログインページへ遷移する
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    })
  } else {
    // 認証が不要な場合はページへ遷移する
    next()
  }
})

export default router
