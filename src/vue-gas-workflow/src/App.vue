<template>
  <v-app>
    <!-- ツールバー -->
    <v-app-bar app color="primary" dark>

      <!-- タイトル -->
      <v-toolbar-title
        @click="toRoot()"
        style="cursor: pointer"
      ><v-icon large v-if="!isRoot">mdi-chevron-left</v-icon>{{ appName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- ログイン時のみ、メニューを表示する -->
      <v-toolbar-items v-if="isAuth">
        <!-- ユーザー関連のメニュー -->
        <v-menu
          offset-y
          open-on-hover
          :close-on-content-click="true"
        >
          <template v-slot:activator="{ on }">
            <!-- Googleアカウントの表示名を表示する -->
            <v-btn text v-on="on" style="cursor: default"><v-avatar size="40" class="mr-3"><img :src="userIcon"></v-avatar>{{ userName }}</v-btn>
          </template>
          <v-list>
            <!-- 管理者メニュー -->
            <v-list-group
              v-if="isAdmin"
              v-model="isActiveAdminMenu"
              no-action
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>管理者向け設定</v-list-item-title>
                </v-list-item-content>
              </template>
              <v-list-item
                v-for="adminMenuItem in adminMenuItems"
                link
                :key="adminMenuItem.title"
                :to="adminMenuItem.link"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ adminMenuItem.title }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>

            <!-- アプリ設定 -->
            <v-list-item link to="/settings">
              <v-list-item-content>
                <v-list-item-title>アプリ設定</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <!-- ログアウト -->
            <v-list-item link>
              <v-list-item-content>
                <v-list-item-title @click="logout">ログアウト</v-list-item-title>
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
    <v-snackbar v-model="snackbar" color="info">
      {{ message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- アラート -->
    <v-dialog
      v-model="showSettingsAlert"
      transition="scale-transition"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-toolbar color="primary" dark elevation-1>
          <v-btn icon @click="onClickCloseSettingsAlert = true"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title>メール設定をしてください</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pt-3">
          <router-link :to="{ path: '/settings' }" @click.native="onClickCloseSettingsAlert = true">設定画面</router-link>からメール設定を完了させてください。
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>

</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',

  data () {
    return {
      appName: 'ワークフロー',
      snackbar: false,
      message: '',
      isActiveAdminMenu: true,
      onClickCloseSettingsAlert: false,
      adminMenuItems: [
        {
          title: '管理者設定',
          link: '/admins'
        },
        {
          title: '部署設定',
          link: '/departments'
        },
        {
          title: '従業員設定',
          link: '/users'
        },
        {
          title: '申請ルート設定',
          link: '/routes'
        },
      ],
    }
  },

  computed: {
    ...mapState({
      authMessage: state => state.firebase.authMessage,
      settingsMessage: state => state.workflow.settingsMessage,
      showSettingsMessage: state => state.workflow.showSettingsMessage,
      isAdmin: state => state.firebase.isAdmin,
    }),

    ...mapGetters({
      userName: 'firebase/getUserName',
      userIcon: 'firebase/getUserIcon',
      isAuth: 'firebase/getLoginStatus',
      getSettings: 'workflow/getSettings',
    }),

    isRoot () {
      const currentPath = this.$route.path
      if (currentPath == '/') {
        return true
      } else {
        return false
      }
    },

    /** 3つの変数を監視し、メール設定アラートを表示するか否かを返す関数 */
    showSettingsAlert () {
      /** 監視対象の1つ目の変数は、computed(getters)の「isAuth」変数 */
      const isAuth = this.isAuth

      /** 監視対象の2つ目の変数は、dataプロパティの「onClickCloseSettingsAlert」変数(デフォルト:false)で
       *  アラート内のリンクをクリックすると値がtrueに変わる(処理はtemplate側に記載)。
       */
      const onClickCloseSettingsAlert = this.onClickCloseSettingsAlert

      /** 監視対象の3つ目の変数。
       *  アプリ設定の2項目(API URL、Auth Token)のいずれかが未設定(空値)の場合にtrueを返す
       */
      const hasEmptySetting = () => {
        const settings = this.getSettings
        const checkTargets = [
          settings.apiUrl == '' ? true : false,
          settings.authToken == '' ? true : false,
        ]
        return checkTargets.some(v => v == true)
      }

      /** 結果を配列に格納 */
      const checkTargets = [
        isAuth,
        hasEmptySetting(),
        !onClickCloseSettingsAlert
      ]

      /** 両方がtrueの場合、trueを返す */
      return checkTargets.every(v => v == true)
    },
  },

  methods: {
    ...mapActions({
      toggleShowSettingsMessage: 'workflow/toggleShowSettingsMessage'
    }),

    async logout(){
      await this.$store.dispatch('firebase/logout')
    },

    toRoot() {
      const currentPath = this.$route.path

      if (currentPath != '/') {
        // ルートディレクトリにいない場合は、ルートディレクトリに遷移する
        this.$router.push('/')
      } else {
        // ルートディレクトリにいる場合は、画面をリロードする
        this.$router.go({ path: '/', force: true })
      }
    },

    setSiteTitle () {
      document.title = this.appName
    },
  },

  created () {
    this.setSiteTitle()
  },

  beforeCreate () {
    // ミューテーション経由でstateの設定を読み込む
    // beforeCreate()は［Appインスタンスは生成後 かつ データ初期化前］に実行される
    // 参考：https://qiita.com/ksh-fthr/items/2a9f173c706ef6939f93
    this.$store.dispatch('workflow/loadSettings')
  },


  watch: {
    authMessage () {
      this.message = this.authMessage
      this.snackbar = true
    },
    showSettingsMessage () {
      const showSettingsMessage = this.showSettingsMessage
      if (showSettingsMessage) {
        this.message = this.settingsMessage
        this.snackbar = true
        this.toggleShowSettingsMessage()
      }
    },
  },
}
</script>
