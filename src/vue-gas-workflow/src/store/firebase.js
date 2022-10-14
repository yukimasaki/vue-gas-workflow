// 文字列型で値を渡したらstateの書き換えに成功した。
// オブジェクト型で値を渡す方法について要検証。

const state = {
  user: 'test',
}

const mutations = {
  /** ユーザー情報をセットする */
  setUser (state, user) {
    state.user = user
  },
}

const actions = {
  /** ユーザー情報を保存する */
  saveUser ({ commit }, user) {
    commit('setUser', user)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
