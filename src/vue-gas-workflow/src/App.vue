<template>
  <v-app>
    <!-- ツールバー -->
    <v-app-bar app color="primary" dark>

      <!-- タイトル -->
      <v-toolbar-title
        @click="toRoot()"
        style="cursor: pointer"
      >{{ appName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- ログイン時のみ、メニューを表示する -->
      <v-toolbar-items v-if="isAuth">
        <!-- ユーザー関連のメニュー -->
        <v-menu
          offset-y
          open-on-hover
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on }">
            <!-- Googleアカウントの表示名を表示する -->
            <v-btn text v-on="on" style="cursor: default"><v-avatar size="40" class="mr-3"><img :src="userIcon"></v-avatar>{{ userName }}</v-btn>
          </template>
          <v-list>
            <!-- 管理者メニュー -->
            <v-list-group
              v-if="isAdmin"
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

            <!-- 下記メニューはv-forでループ処理したい -->
            <!-- テスト用メニュー -->
            <v-list-item link to="/item_dialog_test">
              <v-list-item-content>
                <v-list-item-title>ItemDIalogTest</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link to="/form_reactivity_test">
              <v-list-item-content>
                <v-list-item-title>FormReactivityTest</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item link to="/send_email_test">
              <v-list-item-content>
                <v-list-item-title>SendEmailTest</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

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
  </v-app>

</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'App',

  data () {
    return {
      snackbar: false,
      message: '',

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
      appName: state => state.workflow.settings.appName,
      authMessage: state => state.firebase.authMessage,
      workflowMessage: state => state.firestore.workflowMessage,
      isAdmin: state => state.firebase.isAdmin,
    }),

    ...mapGetters({
      userName: 'firebase/getUserName',
      userIcon: 'firebase/getUserIcon',
      isAuth: 'firebase/getLoginStatus',
    }),
  },

  beforeCreate () {
    // ミューテーション経由でstateの設定を読み込む
    // beforeCreate()は［Appインスタンスは生成後 かつ データ初期化前］に実行される
    // 参考：https://qiita.com/ksh-fthr/items/2a9f173c706ef6939f93
    this.$store.dispatch('workflow/loadSettings')
  },

  methods: {
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
  },


  watch: {
    authMessage () {
      this.message = this.authMessage
      this.snackbar = true
    },
    workflowMessage () {
      this.message = this.workflowMessage
      this.snackbar = true
    },
  },

}
</script>
