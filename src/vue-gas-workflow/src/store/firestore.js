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
import gasApi from '../api/gasApi'

const state = {
  workflowMessage: '',

  requests: [],
  myRequests: [],
  othersRequests: [],
  users: [],
  departments: [],
  routes: [],
  admins: [],
  paid_leave_days: [],

  // FormReactivityTest
  testFormData: [],

  userInfo: '',
  arrayRoute: [],
  selectedTabName: '',
}

const mutations = {
  setWorkflowMessage(state, workflowMessage) {
    state.workflowMessage = workflowMessage
  },

  /** 取得したデータをセットする */
  setState(state, { collections, currentTableName }) {
    state[currentTableName] = collections
  },

  /** データを追加する */
  addState(state, { item, currentTableName }) {
    const list = state[currentTableName]
    list.push(item)
  },

  /** データを更新する */
  updateState(state, { item, currentTableName }) {
    const list = state[currentTableName]
    const index = list.findIndex(v => v.id === item.id)
    list.splice(index, 1, item)
  },

  /** データを削除する */
  deleteState(state, { id, currentTableName }) {
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
    const q = query(collection(db, currentTableName))
    const querySnapshot = await getDocs(q)
    const collections = []
    querySnapshot.forEach(doc => {
      collections.push({...doc.data(), id: doc.id})
    })

    commit('setState', { collections, currentTableName })
  },

  /** データを作成する(IDを自動生成する) */
  async addDocument({ commit }, { item, currentTableName }) {
    const colRef = collection(db, currentTableName)
    // addDocでドキュメントを作成し、その際に付与されたIDをdocRefとして取得する
    const docRef = await addDoc(colRef, item)
    // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
    // serverTimestampが付与されたドキュメントを取得しstateにセットする
    const docSnap = await getDoc(docRef)
    // timestampedItemにidプロパティを追加
    // ※この処理をしておかないと、一覧画面で更新時に引数が足りずエラーになる
    const timestampedItem = { ...docSnap.data(), id: docSnap.id }
    commit('addState', { item: timestampedItem, currentTableName })
    commit('setWorkflowMessage', 'データを追加しました。')
  },

  /** データを作成する(IDを任意の文字列に指定する) */
  async addDocumentWithTextId({ commit }, { item, currentTableName }) {
    const docRef = doc(db, currentTableName, item.id)
    await setDoc(docRef, item)
    // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
    // serverTimestampが付与されたドキュメントを取得しstateにセットする
    const docSnap = await getDoc(docRef)
    const timestampedItem = docSnap.data()
    commit('addState', { item: timestampedItem, currentTableName })
  },

  /** データを更新する */
  async updateDocument({ commit }, { item, currentTableName }) {
    const docRef = doc(db, currentTableName, item.id)
    await updateDoc(docRef, item)
    commit('updateState', { item, currentTableName })
    commit('setWorkflowMessage', 'データを更新しました。')
  },

  /** データを削除する */
  async deleteDocument({ commit }, { item, currentTableName }) {
    const id = item.id
    const docRef = doc(db, currentTableName, item.id)
    await deleteDoc(docRef, item)
    commit('deleteState', { id, currentTableName })
    commit('setWorkflowMessage', 'データを削除しました。')
  },

  /** 単一のWHEREクエリに合致するコレクションを取得する */
  async fetchCollectionsByOneQuery({ commit }, { currentTableName, customQuery }) {
    const q = query(collection(db, currentTableName), where(customQuery.field, customQuery.compare, customQuery.value))
    const querySnapshot = await getDocs(q)
    const collections = []
    querySnapshot.forEach(doc => {
      collections.push({...doc.data(), id: doc.id})
    })
    commit('setState', { collections, currentTableName })
  },

  /** ドキュメントIDを指定して単一のドキュメントを取得する */
  async fetchCollectionByDocId({ commit }, { currentTableName, docId }) {
    const docRef = doc(db, currentTableName, docId)
    const docSnap = await getDoc(docRef)
    const document = {...docSnap.data(), id: docSnap.id}
    commit('setState', { collections: document, currentTableName })
  },

  /** userIdとdocIdを渡して自分の申請詳細を取得する */
  async fetchMyDetail({ commit }, { userId, docId }) {
    const docRef = doc(db, 'users', userId, 'requests', docId)
    const snapshot = await getDoc(docRef)
    const requests = snapshot.data()
    commit('setState', { collections: requests, currentTableName: 'requests' })
  },

  /** userIdとdocIdを渡して他ユーザーの申請詳細を取得する */
  async fetchOthersDetail({ commit }, { userId, docId }) {
    const requestForMe = query(
      collectionGroup(db, 'requests'),
      where('id', '==', docId),
      where('common.current_approver_email', '==', userId)
    )
    const snapshot = await getDocs(requestForMe)
    const docs = []
    snapshot.forEach(doc => {
      docs.push({ ...doc.data(), id: doc.id })
    })
    const result = docs[0]

    commit('setState', { collections: result, currentTableName: 'requests' })
  },

  /** userIdとdocIdを渡して申請概要（requestsサブコレクション）を取得する */
  async fetchRequest({ commit }, { userId, docId }) {
    const docRef = doc(db, 'users', userId, 'requests', docId,)
    const snapshot = await getDoc(docRef)
    const request = snapshot.data()
    commit('setState', { collections: request, currentTableName: 'requests' })
  },

  /** userIdを渡して当該ユーザーの申請（requestsサブコレクション）を取得する */
  async fetchMyRequests({ commit }, { userId }) {
    const subColRef = collection(db, 'users', userId, 'requests')
    const snapshot = await getDocs(subColRef)
    const docs = []
    snapshot.forEach(doc => {
      docs.push({ ...doc.data(), id: doc.id })
    })

    commit('setState', { collections: docs, currentTableName: 'myRequests' })
  },

  /** userIdを渡して自分宛ての申請（requestsサブコレクション）を取得する */
  async fetchOthersRequests({ commit }, { userId }) {
    const requestForMe = query(
      collectionGroup(db, 'requests'),
      where('common.current_approver_email', '==', userId)
    )
    const snapshot = await getDocs(requestForMe)
    const docs = []
    snapshot.forEach(doc => {
      docs.push({ ...doc.data(), id: doc.id })
    })

    commit('setState', { collections: docs, currentTableName: 'othersRequests' })
  },

  /** users配下のサブコレクションにドキュメントを追加する */
  async addDocumentAsSubCollection({ commit }, { uid, userId, item }) {
    // uuidをドキュメントIDとして指定し、空のドキュメントを作成しておく
    // doc関数の引数は、dbを除き偶数個で指定する必要がある
    const docRef = doc(db, 'users', userId, 'requests', uid)

    // itemをdocRefで指定したドキュメントパスへ保存
    await setDoc(docRef, item)

    // serverTimestampが付与されていないitemをv-data-tableに表示するとエラーとなるため、
    // serverTimestampが付与されたドキュメントを取得しstateにセットする
    const docSnap = await getDoc(docRef)
    const timestampedItem = docSnap.data()

    commit('addState', { item: timestampedItem, currentTableName: 'myRequests' })
    commit('setWorkflowMessage', '申請を提出しました。')
  },

  /** users配下のサブコレクションのドキュメントを更新する */
  async updateDocumentInSubCollection({ commit }, { docId, userId, item }) {
    const docRef = doc(db, 'users', userId, 'requests', docId)
    await setDoc(docRef, item)
    const docSnap = await getDoc(docRef)
    const timestampedItem = docSnap.data()

    commit('setState', { item: timestampedItem, currentTableName: 'requests' })
    commit('setWorkflowMessage', '申請を再提出しました。')
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

    commit('addState', { item: timestampedItem, currentTableName: 'myRequests' })
    commit('setWorkflowMessage', '申請を提出しました。')
  },

  /** サブコレクションを更新する */
  async updateSubCollection({ commit }, { userId, docId, item, operationType }) {
    const docRef = doc(db, 'users', userId, 'requests', docId)
    await updateDoc(docRef, item)
    commit('setState', { item, currentTableName: 'requests' })
    commit('setWorkflowMessage', `申請を${operationType}しました。`)
  },

  /** userIdを渡してユーザー情報を取得する */
  async fetchUserInfo({ commit }, { userId }) {
    const snapshot = await getDoc(doc(db, 'users', userId))
    const userInfo = snapshot.data()
    commit('setUserInfo', { userInfo })
  },

  /** 申請ルート情報を作成する */
  async createArrayRoute({ commit }, { requestTypeValue, department }) {
    const route = await getRoute(requestTypeValue, department)
    commit('setArrayRoute', { route })
  },

  /** 選択したタブ情報を保持する */
  setSelectedTabName({ commit }, { selectedTabName }) {
    commit('setSelectedTabName', { selectedTabName })
  },

  /** 送信先・ボディなどの情報をGAS APIにPOST送信しメール送信する */
  async sendEmail({ commit }, { emailConfig }) {
    await gasApi.sendEmail(emailConfig)
    commit('setWorkflowMessage', 'メール送信しました。')
  },

  // FormReactivityTest
  async fetchMyTestFormData({ commit }, { userId, docId }) {
    const docRef = doc(db, 'users', userId, 'testFormData', docId)
    const snapshot = await getDoc(docRef)
    const testFormData = snapshot.data()
    commit('setState', { collections: testFormData, currentTableName: 'testFormData' })
    commit('setWorkflowMessage', 'データを取得しました。')
  },

}

/**
 * 部署から申請ルート情報を取得する
 * @param {string} requestTypeValue
 * @param {string} department
 * @returns {object}
 * arrayRoute = {
 *   department: string,
 *   title: string,
 *   approvers: array,
 *   readers: array,
 * }
 */
async function getRoute(requestTypeValue, department) {
  const currentTableName = 'routes'
  const q = query(
    collection(db, currentTableName),
    where('request_type', '==', requestTypeValue),
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

  getAdminEmails(state) {
    const arrayAdminEmail = []
    state.admins.map(element => {
      arrayAdminEmail.push(element.id)
    })
    return arrayAdminEmail
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
