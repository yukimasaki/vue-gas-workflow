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
        apiKey: "AIzaSyCsCctH0r0gfALLZhQrLC4Y6ywaELOY5pA",
        authDomain: "vue-auth-e5641.firebaseapp.com",
        projectId: "vue-auth-e5641",
        storageBucket: "vue-auth-e5641.appspot.com",
        messagingSenderId: "37975153108",
        appId: "1:37975153108:web:c88e0a974a1b751e4d9e41"
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
