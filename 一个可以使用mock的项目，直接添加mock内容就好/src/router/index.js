import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('@/views/login/index'), hidden: true },
    { path: '/dashboard', component: () => import('@/views/dashboard/index'), hidden: true }
  ]
})
