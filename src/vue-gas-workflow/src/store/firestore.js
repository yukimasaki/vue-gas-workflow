import db from '@/firebase/firebaseConfig'
import {
  collection,
  doc,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
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

  /** コレクション */
  employees: [],
  paid_leave_routes: [],
  equipment_routes: [],
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
    const tableName = state.useTableName
    state[tableName] = collections
  },

  /** データを追加する */
  addCollection(state, { item }) {
    const tableName = state.useTableName
    const list = state[tableName]
    list.push(item)
  },

  /** データを更新する */
  updateCollection(state, {  item }) {
    const tableName = state.useTableName
    const list = state[tableName]
    const index = list.findIndex(v => v.id === item.id)
    list.splice(index, 1, item)
  },

  /** データを削除する */
  deleteCollection(state, { id }) {
    const tableName = state.useTableName
    const list = state[tableName]
    const index = list.findIndex(v => v.id === id)
    list.splice(index, 1)
  },

}

const actions = {
  /** データを取得する */
  async fetchAllCollections({ commit }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const q = query(collection(db, state.useTableName))
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

  /** データを作成する */
  async addCollection({ commit }, { item }) {
    const type = 'add'
    commit('setLoading', { type, v: true })
    try {
      const colRef = collection(db, state.useTableName)
      await addDoc(colRef, item)
      commit('addCollection', { item })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを更新する */
  async updateCollection({ commit }, { item }) {
    const type = 'update'
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, state.useTableName, item.id)
      await updateDoc(docRef, item)
      commit('updateCollection', { item })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを削除する */
  async deleteCollection({ commit }, { item }) {
    const type = 'delete'
    const id = item.id
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, state.useTableName, item.id)
      await deleteDoc(docRef, item)
      commit('deleteCollection', { id })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
