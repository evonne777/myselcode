import { login, logout, test } from '@/api/user'
  //数据，相当于data
  const state = {

  }
  const getters = {

  }
  //里面定义方法，操作state方发
  const mutations = {

  }
  // 操作异步操作mutation
  const actions = {
    test({ commit }, message) {
      return new Promise((resolve, reject) => {
        test(message).then(response => {
          const { data } = response
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    login({ commit }, userInfo) {
      const { username, password } = userInfo
      return new Promise((resolve, reject) => {
        login({ username: username.trim(), password: password }).then(response => {
          const { data } = response
          resolve(data)
        }).catch(err => {
          reject(err)
        })
      })
    },
    logout({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    }
  }
  const modules = {

  }

export default {
  namespaced :true,
  state,
  mutations,
  actions
}
