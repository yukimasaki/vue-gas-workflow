<template>
  <div>
    <button class="btn btn-secondary" @click="loginWithGoogle">
      認証
    </button>
    <p class="h5">
      <!-- ログインユーザーの表示名を表示する -->
      {{ userName }}
    </p>
  </div>
</template>

<script>
import firebaseApp from '../firebase/firebaseConfig'
import { mapState } from 'vuex'

export default {
  name: 'Login',

  computed: {
    ...mapState({
      userName: state => state.firebase.userName
    }),
  },

  methods: {

    // Googleアカウントでログイン
    loginWithGoogle() {
      // 初期化
      firebaseApp

      this.$store.dispatch('firebase/login')
    },
  },
}
</script>
