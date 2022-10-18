import gasApi from '../api/gasApi'

/**
 * State
 * Vuexの状態
 */
const state = {
  /** 設定 */
  settings: {
    appName: 'ワークフロー',
    apiUrl: '',
    authToken: '',
  },

  /** 休暇申請データ */
  paidLeaveData: {},

  /** ローディング状態 */
  loading: {
    fetch: false,
    add: false,
    update: false,
    delete: false
  },

  /** エラーメッセージ */
  errorMessage: '',

}

/**
 * Mutations
 * ActionsからStateを更新するときに呼ばれる
 */
const mutations = {

  /** ローディング状態をセットする */
  setLoading (state, { type, v }) {
    state.loading[type] = v
  },

  /** エラーメッセージをセットする */
  setErrorMessage (state, { message }) {
    state.errorMessage = message
  },

  /** 設定を保存する */
  saveSettings (state, { settings }) {
    state.settings = { ...settings }
    const { appName, apiUrl, authToken } = state.settings
    document.title = appName
    gasApi.setUrl(apiUrl)
    gasApi.setAuthToken(authToken)
    // 家計簿データを初期化
    state.paidLeaveData = {}

    localStorage.setItem('settings', JSON.stringify(settings))
  },

  /** 設定を読み込む */
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

  /** 申請記録をセットする */
  setPaidLeaveData (state, { list }) {
    state.paidLeaveData = list
  },

  /** データを追加する */
  addPaidLeaveData (state, { item }) {
    const list = state.paidLeaveData
    if (list) {
      list.push(item)
    }
  },

}

/**
 * Actions
 * 画面から呼ばれ、Mutationをコミットする
 */
const actions = {
  /** 設定を保存する */
  saveSettings ({ commit }, { settings }) {
    commit('saveSettings', { settings })
  },

  /** 設定を読み込む */
  loadSettings ({ commit }) {
    commit('loadSettings')
  },

  /** 申請記録を取得する */
  async fetchPaidLeaveData ({ commit }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const res = await gasApi.fetch()
      commit('setPaidLeaveData', { list: res.data })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setPaidLeaveData', { list: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },

  /** 申請記録を作成する */
  async addPaidLeaveData ({ commit }, { item }) {
    const type = 'add'
    commit('setLoading', { type, v: true })
    try {
      const res = await gasApi.add(item)
      commit('addPaidLeaveData', { item: res.data })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

}

/**
 * Getters
 * 画面から取得され、Stateを加工して渡する
 */
const getters = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
