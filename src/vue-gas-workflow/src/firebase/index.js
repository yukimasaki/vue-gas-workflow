import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  user: {},
}

const firebase_store = new Vuex.Store({
  state,
  // mutations,
  // actions,
  // getters
})

export default firebase_store
