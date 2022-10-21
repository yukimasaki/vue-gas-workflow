import db from '@/firebase/firebaseConfig'
import {
  collection,
  addDoc,
  query,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore'

const state = {
  /** ローディング状態 */
  loading: {
    fetch: false,
    add: false,
    update: false,
    delete: false
  },

  /** エラーメッセージ */
  errorMessage: '',

  /** 従業員のコレクション */
  employees: []
}

const mutations = {
  /** ローディング状態をセットする */
  setLoading (state, { type, v }) {
    state.loading[type] = v
  },

  /** エラーメッセージをセットする */
  setErrorMessage (state, { message }) {
    state.errorMessage = message
  },

  /** 取得したデータをセットする */
  setAllCollections(state, { collections }) {
    state.employees = collections
  },

  /** データを追加する */
  addCollection(state, { item }) {
    const list = state.employees
    list.push(item)
  },

  /** データを更新する */
  updateCollection(state, { item }) {
    const list = state.employees
    const index = list.findIndex(v => v.id === item.id)
    list.splice(index, 1, item)
  }
}

const actions = {
  // データを取得する
  async fetchAllCollections({ commit }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const q = query(collection(db, 'employees'))
      const querySnapshot = await getDocs(q)
      const collections = []
      querySnapshot.forEach(doc => {
        collections.push({...doc.data(), id: doc.id})
      })

      commit('setAllCollections', { collections })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setAllCollections', { collections: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },

  // データを作成する
  async addCollection({ commit }, { item }) {
    const type = 'add'
    commit('setLoading', { type, v: true })
    try {
      const colRef = collection(db, 'employees')
      await addDoc(colRef, item)
      commit('addCollection', { item })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  // データを更新する
  async updateCollection({ commit }, { item }) {
    const type = 'update'
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, 'employees', item.id)
      await updateDoc(docRef, item)
      commit('updateCollection', { item })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  // データを削除する

}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
