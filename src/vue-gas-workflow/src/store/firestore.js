import db from '@/firebase/firebaseConfig'
import {
  collection,
  addDoc
} from 'firebase/firestore'

const state = {}

const mutations = {}

const actions = {
  async addDocTest() {
    const colRef = collection(db, "cities")
    const data = {
      name: "Los Angeles",
      state: "CA",
      country: "USA"
    }
    await addDoc(colRef, data)
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
