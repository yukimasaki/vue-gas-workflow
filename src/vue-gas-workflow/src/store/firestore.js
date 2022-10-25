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

  /** データ変更対象のテーブル名をセットする */
  useTableName: '',

  /** コレクション */
  paid_leave_requests: [],
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
  setAllCollections(state, { collections, currentTable }) {
    state[currentTable] = collections
  },

  /** データを追加する */
  addCollection(state, { item, currentTable }) {
    const list = state[currentTable]
    list.push(item)
  },

  /** データを更新する */
  updateCollection(state, { item, currentTable }) {
    const list = state[currentTable]
    const index = list.findIndex(v => v.id === item.id)
    list.splice(index, 1, item)
  },

  /** データを削除する */
  deleteCollection(state, { id, currentTable }) {
    const list = state[currentTable]
    const index = list.findIndex(v => v.id === id)
    list.splice(index, 1)
  },

  /** テーブル名をセットする */
  setUseTableName(state, { tableName }) {
    state.useTableName = tableName
  },

  /** 従業員情報を取得する */
  setEmployee(state) {
    state.employee
  }
}

const actions = {
  /** データを取得する */
  async fetchAllCollections({ commit }, { currentTable }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const q = query(collection(db, currentTable))
      const querySnapshot = await getDocs(q)
      const collections = []
      querySnapshot.forEach(doc => {
        collections.push({...doc.data(), id: doc.id})
      })

      commit('setAllCollections', { collections, currentTable })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setAllCollections', { collections: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },

  /** データを作成する */
  async addCollection({ commit }, { item, currentTable }) {
    const type = 'add'
    commit('setLoading', { type, v: true })
    try {
      const colRef = collection(db, currentTable)
      await addDoc(colRef, item)
      commit('addCollection', { item, currentTable })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを更新する */
  async updateCollection({ commit }, { item, currentTable }) {
    const type = 'update'
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, currentTable, item.id)
      await updateDoc(docRef, item)
      commit('updateCollection', { item, currentTable })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを削除する */
  async deleteCollection({ commit }, { item, currentTable }) {
    const type = 'delete'
    const id = item.id
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, currentTable, item.id)
      await deleteDoc(docRef, item)
      commit('deleteCollection', { id, currentTable })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** テーブル名をセットする */
  setUseTableName({ commit }, { tableName }) {
    commit('setUseTableName', { tableName })
  },

  /** 従業員情報を取得する */
  async getEmployee({ commit }) {
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
  }
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
