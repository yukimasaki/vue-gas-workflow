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

      <v-toolbar-items>
        <!-- ログインメニュー -->
        <v-menu
          v-if="loginStatus"
          offset-y
          open-on-hover>
          <template v-slot:activator="{on}">
            <!-- ログイン時はGoogleアカウントの表示名を表示する -->
            <v-btn text v-on="on"><v-avatar size="40" class="mr-3"><img :src="userIcon"></v-avatar>{{ userName }}</v-btn>
          </template>
          <!-- ログイン時はドロップダウンメニューを表示する -->
          <v-list>
            <v-list-item link>
              <v-list-item-content>
                <v-list-item-title @click="logout">ログアウト</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>

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
