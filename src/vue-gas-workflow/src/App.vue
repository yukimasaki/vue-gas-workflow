<template>
  <v-app>
    <!-- ツールバー -->
    <v-app-bar app color="green" dark>
      <!-- タイトル -->
      <v-toolbar-title>{{ appName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- テーブルアイコンのボタン -->
      <v-btn icon to="/">
        <v-icon>mdi-file-table-outline</v-icon>
      </v-btn>
      <!-- 歯車アイコンのボタン -->
      <v-btn icon to="/settings">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>
    <!-- メインコンテンツ -->
    <v-main>
      <v-container fluid>
        <!-- router-view の中身がパスによって切り替わる -->
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  // ミューテーション経由でstateの設定を読み込む
  // beforeCreate()は［Appインスタンスは生成後 かつ データ初期化前］に実行される
  // 参考：https://qiita.com/ksh-fthr/items/2a9f173c706ef6939f93
  beforeCreate () {
    this.$store.dispatch('loadSettings')
  },

  computed: mapState({
    appName: state => state.settings.appName
  }),

}
</script>
