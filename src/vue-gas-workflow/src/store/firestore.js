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
  request_snippets: [],
  request_details: [],
  employees: [],
  departments: [],
  routes: [],
  administrators: [],
  users: [],
  requests: [],

  /** map型、array型 */
  mapEmployee: {},
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

  /** 従業員情報をセットする */
  setMapEmployee(state, { employee }) {
    state.mapEmployee = employee
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

  /** バッチ書き込み(add) */
  async batchAddCollections({ commit }, { itemSnippets, itemDetails }) {
    const type = 'add'
    const batch = writeBatch(db)
    commit('setLoading', { type, v: true })
    try {
      // コレクションの参照を取得
      const colRefSnippets = collection(db, 'request_snippets')
      const colRefDetails = collection(db, 'request_details')
      // batch.add()を実現するため、ドキュメントのIDを取得しておく
      const snippetsId = doc(colRefSnippets).id
      const detailsId = doc(colRefDetails).id
      // 空のドキュメントを作成する
      const emptyDocSnippets = doc(db, 'request_snippets', snippetsId)
      const emptyDocDetails = doc(db, 'request_details', detailsId)
      // 申請概要(ドキュメント)と申請詳細を紐づけるための情報をitemDetailsに追加する
      itemDetails.snippet_ref = snippetsId
      // バッチ書き込みを実行
      batch.set(emptyDocSnippets, itemSnippets)
      batch.set(emptyDocDetails, itemDetails)
      await batch.commit()
      // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
      // serverTimestampが付与されたドキュメントを取得しstateにセットする
      const docRefSnippets = doc(db, 'request_snippets', snippetsId)
      const docSnapSnippets = await getDoc(docRefSnippets)
      const timestampedItemSnippets = { ...docSnapSnippets.data(), id: docRefSnippets.id }
      commit('addCollection', { item: timestampedItemSnippets, currentTableName: 'request_snippets' })
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** バッチ書き込み(update) */
   async batchUpdateCollections({ commit }, { itemSnippets, itemDetails }) {
    const type = 'update'
    const batch = writeBatch(db)
    commit('setLoading', { type, v: true })
    try {
      // item*.idに対応するドキュメントを取得
      const docSnippets = doc(db, 'request_snippets', itemSnippets.id)
      const docDetails = doc(db, 'request_details', itemDetails.id)
      // バッチ書き込みを実行
      batch.set(docSnippets, itemSnippets)
      batch.set(docDetails, itemDetails)
      await batch.commit()
    } catch (e) {
      commit('setErrorMessage', { message: e })
    } finally {
      commit('setLoading', { type, v: false })
    }
  },

  /** 申請者情報を作成する */
  async createMapEmployee({ commit }, { userEmail }) {
    const employee = await getEmployee(userEmail)
    commit('setMapEmployee', { employee })
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
 * 従業員情報を取得する
 * @param {string} userEmail
 * @returns {object} mapEmployee = {
 *   email,
 *   name,
 *   depaertment
 * }
 */
async function getEmployee(userEmail) {
  const currentTableName = 'employees'
  const q = query(collection(db, currentTableName), where('email', '==', userEmail))
  const querySnapshot = await getDocs(q)
  const collections = []
  querySnapshot.forEach(doc => {
    collections.push({...doc.data(), id: doc.id})
  })

  return collections
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
  getMapEmployee(state) {
    return state.mapEmployee
  },

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
