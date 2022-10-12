import Vue from 'vue'
import Vuex from 'vuex'
import gasApi from '../api/gasApi'

Vue.use(Vuex)

/**
 * State
 * Vuexの状態
 */
const state = {
  /** 設定 */
  settings: {
    appName: 'GAS 家計簿',
    apiUrl: '',
    authToken: '',
    strIncomeItems: '給料, ボーナス, 繰越',
    strOutgoItems: '食費, 趣味, 交通費, 買い物, 交際費, 生活費, 住宅, 通信, 車, 税金',
    strTagItems: '固定費, カード'
  },

  /** 休暇申請データ */
  abData: {},

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
    state.abData = {}

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
  setAbData (state, { list }) {
    state.abData = list
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
  async fetchAbData ({ commit }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const res = await gasApi.fetch()
      commit('setAbData', { list: res.data })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setAbData', { list: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },
}

/** カンマ区切りの文字をトリミングして配列にする */
const createItems = v => v.split(',').map(v => v.trim()).filter(v => v.length !== 0)

/**
 * Getters
 * 画面から取得され、Stateを加工して渡する
 */
const getters = {
  /** 収入カテゴリ（配列） */
  incomeItems (state) {
    return createItems(state.settings.strIncomeItems)
  },
  /** 支出カテゴリ（配列） */
  outgoItems (state) {
    return createItems(state.settings.strOutgoItems)
  },
  /** タグ（配列） */
  tagItems (state) {
    return createItems(state.settings.strTagItems)
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
