import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'
import PaidLeave from '../views/PaidLeave.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/paid_leave',
    name: 'PaidLeave',
    component: PaidLeave
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
