<template>
  <div>
    <v-btn @click="loginWithGoogle">ログイン</v-btn>
    <v-btn @click="logout">ログアウト</v-btn>
    <p class="h5">
      <!-- ログインユーザーの表示名を表示する -->
      {{ userName }}
    </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import firebaseApp from '../firebase/firebaseConfig'

export default {
  name: 'Login',

  computed: {
    ...mapState({
      userName: state => state.firebase.userName
    })
  },

  created() {
    this.$store.dispatch('firebase/onAuth')
  },

  methods: {
    // Googleアカウントでログイン
    loginWithGoogle() {
      // 初期化
      firebaseApp

      this.$store.dispatch('firebase/login')
    },

    // ログアウト
    logout(){
      // 初期化
      firebaseApp

      this.$store.dispatch('firebase/logout')
    }
  },
}
</script>
