import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut
} from "firebase/auth"

const state = {
  loggedIn: false,
  userUid: '',
  userName: '',
  userIcon: ''
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
  }
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

        console.log('login success')
      }).catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message

        // const credential = GoogleAuthProvider.credentialFromError(error)

        console.log('login error: ', errorCode, errorMessage)
      })

    await setPersistence(auth, browserSessionPersistence)
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
      console.log('logout success')
      commit('setLoginStatus', false)
    }).catch((error) => {
      console.log('logout error', error)
    })
  },

  onAuth({ commit }) {
    const auth = getAuth()
    onAuthStateChanged(auth, (user) => {
      const blankUser = {
        uid: '',
        displayName: 'ログイン',
        photoURL: ''
      }
      user = user ? user : blankUser
      commit('setUserUid', user.uid)
      commit('setUserName', user.displayName)
      commit('setLoginStatus', user.uid ? true : false)
      commit('setUserIcon', user.photoURL)
      console.log('onAuth')
    })
  }
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
