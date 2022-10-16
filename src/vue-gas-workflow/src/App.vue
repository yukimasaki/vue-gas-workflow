<template>
  <v-app>
    <!-- ツールバー -->
    <v-app-bar app color="green" dark>

      <!-- タイトル -->
      <v-toolbar-title>{{ appName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <!-- テーブルアイコンのボタン -->
        <v-btn text to="/">トップ</v-btn>

        <!-- ユーザーアイコンのボタン -->
        <v-btn text to="/login">{{ userName }}</v-btn>

        <!-- 歯車アイコンのボタン -->
        <v-btn text to="/settings">設定</v-btn>
      </v-toolbar-items>

    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main>
      <v-container fluid>
        <!-- router-view の中身がパスによって切り替わる -->
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- スナックバー -->
    <v-snackbar v-model="snackbar" color="error">{{ errorMessage }}</v-snackbar>
  </v-app>

</template>

<script>
import { mapState } from 'vuex'
import firebaseApp from './firebase/firebaseConfig'

export default {
  name: 'App',

  data () {
    return {
      snackbar: false,
    }
  },

  computed: {
    ...mapState({
      appName: state => state.workflow.settings.appName,
      errorMessage: state => state.workflow.errorMessage,
      userName: state => state.firebase.userName
    }),

  },

  beforeCreate () {
    // ミューテーション経由でstateの設定を読み込む
    // beforeCreate()は［Appインスタンスは生成後 かつ データ初期化前］に実行される
    // 参考：https://qiita.com/ksh-fthr/items/2a9f173c706ef6939f93
    this.$store.dispatch('workflow/loadSettings')

    // 認証状態を取得
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


  watch: {
    errorMessage () {
      this.snackbar = true
    }
  },

}
</script>
