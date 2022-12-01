import db from '@/firebase/firebaseConfig'
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  writeBatch,
  collectionGroup,
} from 'firebase/firestore'
import { v4 as uuidv4} from 'uuid'

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
  requests: [],
  details: [],
  users: [],
  departments: [],
  routes: [],
  admins: [],

  userInfo: '',
  arrayRoute: [],

  /** バッジに表示する承認依頼の件数 */
  numberOfOthersRequest: null,

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
  setCollections(state, { collections, currentTableName }) {
    state[currentTableName] = collections
  },

  /** データを追加する */
  addCollection(state, { item, currentTableName }) {
    const list = state[currentTableName]
    list.push(item)
  },

  /** データを更新する */
  updateCollection(state, { item, currentTableName }) {
    const list = state[currentTableName]
    const index = list.findIndex(v => v.id === item.id)
    list.splice(index, 1, item)
  },

  /** データを削除する */
  deleteCollection(state, { id, currentTableName }) {
    const list = state[currentTableName]
    const index = list.findIndex(v => v.id === id)
    list.splice(index, 1)
  },

  /** 部署をセットする */
  setUserInfo(state, { userInfo }) {
    state.userInfo = userInfo
  },

  /** 申請ルート情報をセットする */
  setArrayRoute(state, { route }) {
    state.arrayRoute = route
  },

  /** バッジに表示する承認依頼の件数をセットする */
  setNumberOfOtersRequest(state, { val }) {
    state.numberOfOthersRequest = val
  },

}

const actions = {
  /** データを全件取得する */
  async fetchAllCollections({ commit }, { currentTableName }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const q = query(collection(db, currentTableName))
      const querySnapshot = await getDocs(q)
      const collections = []
      querySnapshot.forEach(doc => {
        collections.push({...doc.data(), id: doc.id})
      })

      commit('setCollections', { collections, currentTableName })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setCollections', { collections: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },

  /** データを作成する(IDを自動生成する) */
  async addCollection({ commit }, { item, currentTableName }) {
    const type = 'add'
    commit('setLoading', { type, v: true })
    try {
      const colRef = collection(db, currentTableName)
      // addDocでドキュメントを作成し、その際に付与されたIDをdocRefとして取得する
      const docRef = await addDoc(colRef, item)
      // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
      // serverTimestampが付与されたドキュメントを取得しstateにセットする
      const docSnap = await getDoc(docRef)
      const timestampedItem = docSnap.data()
      commit('addCollection', { item: timestampedItem, currentTableName })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを作成する(IDを任意の文字列に指定する) */
  async addCollectionWithTextId({ commit }, { item, currentTableName }) {
    const type = 'add'
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, currentTableName, item.id)
      await setDoc(docRef, item)
      // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
      // serverTimestampが付与されたドキュメントを取得しstateにセットする
      const docSnap = await getDoc(docRef)
      const timestampedItem = docSnap.data()
      commit('addCollection', { item: timestampedItem, currentTableName })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを更新する */
  async updateCollection({ commit }, { item, currentTableName }) {
    const type = 'update'
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, currentTableName, item.id)
      await updateDoc(docRef, item)
      commit('updateCollection', { item, currentTableName })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** データを削除する */
  async deleteCollection({ commit }, { item, currentTableName }) {
    const type = 'delete'
    const id = item.id
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, currentTableName, item.id)
      await deleteDoc(docRef, item)
      commit('deleteCollection', { id, currentTableName })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** 単一のWHEREクエリに合致するコレクションを取得する */
  async fetchCollectionsByOneQuery({ commit }, { currentTableName, customQuery }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const q = query(collection(db, currentTableName), where(customQuery.field, customQuery.compare, customQuery.value))
      const querySnapshot = await getDocs(q)
      const collections = []
      querySnapshot.forEach(doc => {
        collections.push({...doc.data(), id: doc.id})
      })

      commit('setCollections', { collections, currentTableName })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setCollections', { collections: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },

  /** ドキュメントIDを指定して単一のドキュメントを取得する */
  async fetchCollectionByDocId({ commit }, { currentTableName, docId }) {
    const type = 'fetch'
    commit('setLoading', { type, v: true })
    try {
      const docRef = doc(db, currentTableName, docId)
      const docSnap = await getDoc(docRef)
      const document = {...docSnap.data(), id: docSnap.id}
      commit('setCollections', { collections: document, currentTableName })
    } catch(e) {
      commit('setErrorMessage', { message: e })
      commit('setCollections', { collections: [] })
    } finally {
      commit('setLoading', { type, v: false})
    }
  },

  /** userIdとdocIdを渡して申請詳細（detailsサブコレクション）を取得する */
  async fetchDetail({ commit }, { userId, docId }) {
    const docRef = doc(db, 'users', userId, 'requests', docId, 'details', docId)
    const snapshot = await getDoc(docRef)
    const detail = snapshot.data()
    commit('setCollections', { collections: detail, currentTableName: 'details' })
  },

  /** userIdとdocIdを渡して申請概要（requestsサブコレクション）を取得する */
  async fetchRequest({ commit }, { userId, docId }) {
    const docRef = doc(db, 'users', userId, 'requests', docId,)
    const snapshot = await getDoc(docRef)
    const request = snapshot.data()
    commit('setCollections', { collections: request, currentTableName: 'requests' })
  },

  /** userIdを渡して当該ユーザーの申請（requestsサブコレクション）を取得する */
  async fetchMyRequests({ commit }, { userId }) {
    const subColRef = collection(db, 'users', userId, 'requests')
    const snapshot = await getDocs(subColRef)
    const docs = []
    snapshot.forEach(doc => {
      docs.push({ ...doc.data(), id: doc.id })
    })

    commit('setCollections', { collections: docs, currentTableName: 'requests' })
  },

  /** userIdを渡して自分宛ての申請（requestsサブコレクション）を取得する */
  async fetchOthersRequests({ commit }, { userId }) {
    const requestForMe = query(
      collectionGroup(db, 'requests'),
      where('current_approver_email', '==', userId)
    )
    const snapshot = await getDocs(requestForMe)
    const docs = []
    snapshot.forEach(doc => {
      docs.push({ ...doc.data(), id: doc.id })
    })

    commit('setCollections', { collections: docs, currentTableName: 'requests' })
  },

  /** 2階層のサブコレクションをusersコレクションにバッチ書き込み(add)する */
  async batchAddSubCollectionsToUsers({ commit }, { userId, item }) {
    const batch = writeBatch(db)
    const uid = uuidv4()

    // uuidをドキュメントIDとして指定し、空のドキュメントを作成しておく
    // doc関数の引数は、dbを除き偶数個で指定する必要がある
    const emptyDocRefRequest = doc(db, 'users', userId, 'requests', uid)
    const emptyDocRefDetail = doc(db, 'users', userId, 'requests', uid, 'details', uid)

    // バッチ書き込みを実行
    batch.set(emptyDocRefRequest, item.request)
    batch.set(emptyDocRefDetail, item.detail)
    await batch.commit()

    // serverTimestampが付与されたドキュメントを取得する
    const docSnap = await getDoc(emptyDocRefRequest)
    const timestampedItem = { ...docSnap.data(), id: uid }

    commit('addCollection', { item: timestampedItem, currentTableName: 'requests' })
  },

  /** バッチ書き込み(update) */
   async batchUpdateCollections({ commit }, { userId, itemRequest, itemDetail }) {
    const batch = writeBatch(db)

    // item*.idに対応するドキュメントを取得
    const docRequest = doc(db, 'users', userId, 'requests', itemRequest.id)
    const docDetail = doc(db, 'users', userId, 'requests', itemRequest.id, 'details', itemDetail.id)

    // バッチ書き込みを実行
    batch.set(docRequest, itemRequest)
    batch.set(docDetail, itemDetail)
    await batch.commit()

    commit('tes', {})
  },

  /** userIdを渡してユーザー情報を取得する */
  async fetchUserInfo({ commit }, { userId }) {
    const snapshot = await getDoc(doc(db, 'users', userId))
    const userInfo = snapshot.data()
    commit('setUserInfo', { userInfo })
  },

  /** 申請ルート情報を作成する */
  async createArrayRoute({ commit }, { requestType, department }) {
    const route = await getRoute(requestType, department)
    commit('setArrayRoute', { route })
  },

  /** バッジに表示する承認依頼の件数を取得する */
  countOthersRequest({ commit }) {
    const count = state.request_snippets.length
    let val = ''
    if (count == 0) {
      val = null
    } else {
      val = count
    }
    commit('setNumberOfOtersRequest', { val })
  },

}

/**
 * 部署から申請ルート情報を取得する
 * @param {string} requestType
 * @param {string} department
 * @returns {object}
 * arrayRoute = {
 *   department: string,
 *   title: string,
 *   approvers: array,
 *   readers: array,
 * }
 */
async function getRoute(requestType, department) {
  const currentTableName = 'routes'
  const q = query(
    collection(db, currentTableName),
    where('request_type', '==', requestType),
    where('department', '==', department),
  )
  const querySnapshot = await getDocs(q)
  const collections = []
  querySnapshot.forEach(doc => {
    collections.push({...doc.data(), id: doc.id})
  })

  return collections
}

const getters = {
  getArrayRoute(state) {
    return state.arrayRoute
  },

  getNumberOfOthersRequest(state) {
    return state.numberOfOthersRequest
  },

}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
