import gasApi from '../api/gasApi'

const state = {
  settings: {
    apiUrl: '',
    authToken: '',
  },
  showSettingsMessage: false,
  settingsMessage: '',
}

const mutations = {
  saveSettings (state, { settings }) {
    state.settings = { ...settings }
    const { apiUrl, authToken } = state.settings
    gasApi.setUrl(apiUrl)
    gasApi.setAuthToken(authToken)

    localStorage.setItem('settings', JSON.stringify(settings))
  },

  loadSettings (state) {
    const settings = JSON.parse(localStorage.getItem('settings'))
    if (settings) {
      state.settings = Object.assign(state.settings, settings)
    }
    const { apiUrl, authToken } = state.settings
    gasApi.setUrl(apiUrl)
    gasApi.setAuthToken(authToken)
  },

  toggleShowSettingsMessage (state) {
    state.showSettingsMessage = !state.showSettingsMessage
  },
  setSettingsMessage (state, settingsMessage) {
    state.settingsMessage = settingsMessage
  },
}

const actions = {
  saveSettings ({ commit }, { settings }) {
    commit('toggleShowSettingsMessage')
    commit('saveSettings', { settings })
    commit('setSettingsMessage', '設定を保存しました。')
  },

  loadSettings ({ commit }) {
    commit('loadSettings')
  },

  toggleShowSettingsMessage ({ commit }) {
    commit('toggleShowSettingsMessage')
  },
}

const getters = {
  getSettings (state) {
    return state.settings
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
