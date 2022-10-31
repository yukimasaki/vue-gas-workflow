<template>
  <v-app>
    <!-- ツールバー -->
    <v-app-bar app color="green" dark>

      <!-- タイトル -->
      <v-toolbar-title
        @click="$router.push('/')"
        style="cursor: pointer"
      >{{ appName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- ログイン時のみ、メニューを表示する -->
      <v-toolbar-items v-if="loginStatus">
        <!-- ユーザー関連のメニュー -->
        <v-menu
          offset-y
          open-on-hover>
          <template v-slot:activator="{on}">
            <!-- Googleアカウントの表示名を表示する -->
            <v-btn text v-on="on" style="cursor: default"><v-avatar size="40" class="mr-3"><img :src="userIcon"></v-avatar>{{ userName }}</v-btn>
          </template>
          <v-list>

            <v-list-item link>
              <v-list-item-content>
                <v-list-item-title @click="logout">ログアウト</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

          </v-list>
        </v-menu>

        <!-- 設定関連のメニュー -->
        <v-menu
          offset-y
          open-on-hover>
          <template v-slot:activator="{on}">
            <v-btn text v-on="on" style="cursor: default">設定</v-btn>
          </template>
          <v-list>
            <!-- 従業員設定 -->
            <v-list-item link to="/department">
              <v-list-item-content>
                <v-list-item-title>部署設定</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- 従業員設定 -->
            <v-list-item link to="/employee">
              <v-list-item-content>
                <v-list-item-title>従業員設定</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- 申請ルート設定 -->
            <v-list-item link to="/route">
              <v-list-item-content>
                <v-list-item-title>申請ルート設定</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- アプリ設定 -->
            <v-list-item link to="/settings">
              <v-list-item-content>
                <v-list-item-title>アプリ設定</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

          </v-list>
        </v-menu>

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
import { mapState, mapGetters } from 'vuex'
// import initFirebase from './firebase/firebaseConfig'

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
    }),

    ...mapGetters({
      userName: 'firebase/getUserName',
      userIcon: 'firebase/getUserIcon',
      loginStatus: 'firebase/getLoginStatus'
    })
  },

  beforeCreate () {
    // ミューテーション経由でstateの設定を読み込む
    // beforeCreate()は［Appインスタンスは生成後 かつ データ初期化前］に実行される
    // 参考：https://qiita.com/ksh-fthr/items/2a9f173c706ef6939f93
    this.$store.dispatch('workflow/loadSettings')
  },

  methods: {
    // ログアウト
    async logout(){
      await this.$store.dispatch('firebase/logout')
      // this.$router.push('/login')
    }
  },


  watch: {
    errorMessage () {
      this.snackbar = true
    }
  },

}
</script>
