import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
} from "firebase/auth"

const state = {
  loggedIn: false,

  userUid: '',
  userName: '',
  userIcon: '',
  userEmail: '',

  authMessage: '',
}

const mutations = {
  setLoginStatus(state, loggedIn) {
    state.loggedIn = loggedIn
  },

  setUserUid(state, userUid) {
    state.userUid = userUid
  },
  setUserName(state, userName) {
    state.userName = userName
  },
  setUserIcon(state, userIcon) {
    state.userIcon = userIcon
  },
  setUserEmail(state, userEmail) {
    state.userEmail = userEmail
  },

  setAuthMessage(state, authMessage) {
    state.authMessage = authMessage
  },
}

const actions = {
  // ログイン
  async login({ commit }) {
    console.log('login action')
    const provider = new GoogleAuthProvider()
    const auth = getAuth()

    await signInWithPopup(auth, provider)
      .then((result) => {
        // const credential = GoogleAuthProvider.credentialFromResult(result)
        // const token = credential.accessToken

        const user = result.user
        commit('setUserUid', user.uid)
        commit('setUserName', user.displayName)
        commit('setUserIcon', user.photoURL)
        commit('setUserEmail', user.email)

        commit('setAuthMessage', 'ログインしました。')
        console.log('login success')
      }).catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message

        // const credential = GoogleAuthProvider.credentialFromError(error)

        console.log('login error: ', errorCode, errorMessage)
      })

    await setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('keeping state')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('keeping state error: ', errorCode, errorMessage)
      })
  },

  // ログアウト
  logout ({ commit }) {
    const auth = getAuth()
    signOut(auth).then(() => {
      commit('setAuthMessage', 'ログアウトしました。')
      console.log('logout success')
      commit('setLoginStatus', false)
    }).catch((error) => {
      console.log('logout error', error)
    })
  },

  onAuth({ commit }) {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      user = user ? user : {}
      commit('setUserUid', user.uid)
      commit('setUserName', user.displayName)
      commit('setLoginStatus', user.uid ? true : false)
      commit('setUserIcon', user.photoURL)
      commit('setUserEmail', user.email)
      console.log('onAuth')
    })
  },
}

const getters = {
  getLoginStatus(state) {
    return state.loggedIn
  },
  getUserUid(state) {
    return state.userUid
  },
  getUserName(state) {
    return state.userName
  },
  getUserIcon(state) {
    return state.userIcon
  },
  getUserEmail(state) {
    return state.userEmail
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
