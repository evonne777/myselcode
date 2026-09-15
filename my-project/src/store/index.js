import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import settings from './modules/setting'
import app from './modules/app'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    settings,
    app
  },
})

export default store


