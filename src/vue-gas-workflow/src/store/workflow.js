import gasApi from '../api/gasApi'

const state = {
  /** 設定 */
  settings: {
    appName: 'ワークフロー',
    apiUrl: '',
    authToken: '',
  },

}

const mutations = {

  saveSettings (state, { settings }) {
    state.settings = { ...settings }
    const { appName, apiUrl, authToken } = state.settings
    document.title = appName
    gasApi.setUrl(apiUrl)
    gasApi.setAuthToken(authToken)

    localStorage.setItem('settings', JSON.stringify(settings))
  },

  loadSettings (state) {
    const settings = JSON.parse(localStorage.getItem('settings'))
    if (settings) {
      state.settings = Object.assign(state.settings, settings)
    }
    const { appName, apiUrl, authToken } = state.settings
    document.title = appName
    gasApi.setUrl(apiUrl)
    gasApi.setAuthToken(authToken)
  },

}

const actions = {
  saveSettings ({ commit }, { settings }) {
    commit('saveSettings', { settings })
  },

  loadSettings ({ commit }) {
    commit('loadSettings')
  },

}

const getters = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
