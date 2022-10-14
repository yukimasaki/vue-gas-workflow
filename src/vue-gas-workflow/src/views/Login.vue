<template>
  <div>
    <button class="btn btn-secondary" @click="authMethod">
      認証
    </button>
    <p class="h5">
      <!-- stateの値を取得したい -->
      {{ user }}
    </p>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import firebaseApp from '../firebase/firebaseConfig'
import {
  getAuth, signInWithPopup, GoogleAuthProvider
} from "firebase/auth";

export default {
  name: 'Login',

  data() {
    return {
      data: {}
    }
  },

  computed: {
    ...mapState({
      // ↓は正常に動作している
      user: state => state.firebase.user
    }),
  },

  methods: {
    ...mapActions(
      'firebase', ['saveUser']
    ),

    authMethod() {
      // 初期化
      firebaseApp

      const provider = new GoogleAuthProvider()
      const auth = getAuth();
      signInWithPopup(auth, provider).then((result) => {
        // const user = result.user
        const user = 'hoge'
        // ↓は正常に動作している
        this.saveUser(user)
        console.log(result.user.email)
      }).catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        const email = error.email
        console.log('errorCode: ' + errorCode + '/errorMessage: ' + errorMessage + '/email: '+ email)
      })
    },
  },
}
</script>
