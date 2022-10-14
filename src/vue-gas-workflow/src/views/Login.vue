<template>
  <div>
    <button class="btn btn-secondary" @click="authMethod">
      認証
    </button>
    <p class="h5">
      {{ data.email_address }}
      {{ user.email_address }}
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import firebaseApp from '../firebase/firebaseConfig'
import {
  getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence
} from "firebase/auth";

export default {
  name: 'Login',

  data() {
    return {
      data: { email_address: ''}
    }
  },

  computed: {
    ...mapState({
      user: state => state.firebase.user
    }),
  },

  methods: {
    authMethod() {
      // 初期化
      firebaseApp

      const provider = new GoogleAuthProvider()
      const auth = getAuth();
      signInWithPopup(auth, provider).then((result) => {
        const user = result.user
        this.data.email_address = user.email
        setPersistence(auth, browserLocalPersistence)
        console.log(this.data.email_address)
      }).catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        const email = error.email
        console.log('errorCode: ' + errorCode + '/errorMessage: ' + errorMessage + '/email: '+ email)
      })
    }
  },
}
</script>
