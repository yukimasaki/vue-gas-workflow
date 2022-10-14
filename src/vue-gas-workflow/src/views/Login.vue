<template>
  <div>
    <button class="btn btn-secondary" @click="authMethod">
      認証
    </button>
    <p class="h5">
      {{ data.email_address }}
    </p>
  </div>
</template>

<script>
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default {
  name: 'Login',

  data() {
    return {
      data: {}
    }
  },

  methods: {
    authMethod() {
      const firebaseConfig = {
        apiKey: process.env.VUE_APP_APIKEY,
        authDomain: process.env.VUE_APP_AUTHDOMAIN,
        projectId: process.env.VUE_APP_PROJECTID,
        storageBucket: process.env.VUE_APP_STORAGEBUCKET,
        messagingSenderId: process.env.VUE_APP_MESSAGESENDER,
        appId: process.env.VUE_APP_APPID
      }
      initializeApp(firebaseConfig)

      const provider = new GoogleAuthProvider()
      const auth = getAuth();
      signInWithPopup(auth, provider).then((result) => {
        const user = result.user
        const data = { email_address: user.email}
        return data
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
