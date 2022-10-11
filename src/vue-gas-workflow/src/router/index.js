import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
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
  routes
})

export default router
