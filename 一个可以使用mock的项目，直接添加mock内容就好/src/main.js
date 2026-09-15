// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from '@/router'
import store from './store'
import locale from 'element-ui/lib/locale/lang/zh-CN'
// import '@/styles/index.scss'// global css

import '@/icons' // icon
import '@/permission'

// if (process.env.NODE_ENV === 'development') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

Vue.use(ElementUI, { locale })
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
