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
  myRequests: [],
  othersRequests: [],
  details: [],
  users: [],
  departments: [],
  routes: [],
  admins: [],

  userInfo: '',
  arrayRoute: [],
  selectedTabName: '',
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

  /** 選択したタブ情報を保持する */
  setSelectedTabName(state, { selectedTabName }) {
    state.selectedTabName = selectedTabName
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

  /** userIdとdocIdを渡して自分の申請詳細（detailsサブコレクション）を取得する */
  async fetchMyDetail({ commit }, { userId, docId }) {
    const docRef = doc(db, 'users', userId, 'requests', docId, 'details', docId)
    const snapshot = await getDoc(docRef)
    const detail = snapshot.data()
    commit('setCollections', { collections: detail, currentTableName: 'details' })
  },

  /** userIdとdocIdを渡して他ユーザーの申請詳細（detailsサブコレクション）を取得する */
  async fetchOthersDetail({ commit }, { userId, docId }) {
    const requestForMe = query(
      collectionGroup(db, 'details'),
      // セキュリティルールは current_approver_email == request.auth.token.email というクエリを想定しているため、そのクエリを実装する必要がある
      where('id', '==', docId),
      where('current_approver_email', '==', userId)
    )
    const snapshot = await getDocs(requestForMe)
    const docs = []
    snapshot.forEach(doc => {
      docs.push({ ...doc.data(), id: doc.id })
    })
    const result = docs[0]

    commit('setCollections', { collections: result, currentTableName: 'details' })
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

    commit('setCollections', { collections: docs, currentTableName: 'myRequests' })
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

    commit('setCollections', { collections: docs, currentTableName: 'othersRequests' })
  },

  /** 2階層のサブコレクションをusersコレクションにバッチ書き込み(add)する */
  async batchAddSubCollectionsToUsers({ commit }, { uid, userId, item }) {
    const batch = writeBatch(db)

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

    commit('addCollection', { item: timestampedItem, currentTableName: 'myRequests' })
  },

  /** バッチ書き込み(update) */
   async batchUpdateCollections({ commit }, { userId, docId, itemRequest, itemDetail }) {
    const batch = writeBatch(db)

    // item*.idに対応するドキュメントを取得
    const docRequest = doc(db, 'users', userId, 'requests', docId)
    const docDetail = doc(db, 'users', userId, 'requests', docId, 'details', docId)

    // バッチ書き込みを実行
    batch.set(docRequest, itemRequest)
    batch.set(docDetail, itemDetail)
    await batch.commit()

    commit('setCollections', { collections: itemRequest, currentTableName: 'requests' })
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

  /** 選択したタブ情報を保持する */
  setSelectedTabName({ commit }, { selectedTabName }) {
    commit('setSelectedTabName', { selectedTabName })
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

}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
