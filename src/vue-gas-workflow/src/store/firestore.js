import db from '@/firebase/firebaseConfig'
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
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
  paid_leave_requests: [],
  employees: [],
  departments: [],
  paid_leave_routes: [],
  equipment_routes: [],

  /** サブコレクション */
  sub_employee: [],
  sub_route: [],
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

  /** 従業員情報をセットする */
  setSubCollectionEmployee(state, { employee }) {
    state.sub_employee = employee
  },

  /** 申請ルート情報をセットする */
  setSubCollectionRoute(state, { route }) {
    state.sub_route = route
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
      // addDocでドキュメントを作成し、その際に付与されたIDをdocRefとして取得する
      const docRef = await addDoc(colRef, item)
      // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
      // serverTimestampが付与されたドキュメントを取得しstateにセットする
      const docSnap = await getDoc(docRef)
      const timestampedItem = docSnap.data()
      commit('addCollection', { item: timestampedItem, currentTable })
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

  /** サブコレクションを作成する（employee） */
  async createSubCollectionEmployee({ commit }, { userEmail }) {
    const employee = await getEmployee(userEmail)
    commit('setSubCollectionEmployee', { employee })
  },

  /** サブコレクションを作成する（route） */
  async createSubCollectionRoute({ commit }, { department }) {
    const route = await getRoute(department)
    commit('setSubCollectionRoute', { route })
  },

}

/**
 * 従業員情報を取得する
 * @param {string} userEmail
 * @returns {object} sub_employee = {
 *   email,
 *   name,
 *   depaertment
 * }
 */
async function getEmployee(userEmail) {
  const currentTable = 'employees'
  const q = query(collection(db, currentTable), where('email', '==', userEmail))
  const querySnapshot = await getDocs(q)
  const collections = []
  querySnapshot.forEach(doc => {
    collections.push({...doc.data(), id: doc.id})
  })

  return collections
}

/**
 * 部署から申請ルート情報を取得する
 * @param {string} department
 * @returns {object} sub_route = {
 *   0: {order, department, approverEmail, role}
 *   1: {order, department, approverEmail, role}
 *   ...
 * }
 */
async function getRoute(department) {
  const currentTable = 'paid_leave_routes'
  const q = query(
    collection(db, currentTable),
    where('department', '==', department),
    orderBy('order', 'asc')
  )
  const querySnapshot = await getDocs(q)
  const collections = []
  querySnapshot.forEach(doc => {
    collections.push({...doc.data(), id: doc.id})
  })

  return collections
}

const getters = {
  getSubCollectionEmployee(state) {
    return state.sub_employee
  },

  getSubCollectionRoute(state) {
    return state.sub_route
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
