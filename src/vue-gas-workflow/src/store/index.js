import Vue from 'vue'
import Vuex from 'vuex'
import workflow from '@/store/workflow.js'
import firebase from '@/store/firebase.js'

Vue.use(Vuex)

export default new Vuex.Store ({
  modules: { workflow, firebase }
})
