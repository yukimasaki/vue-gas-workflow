<template>
  <!-- 申請ルートテーブルを表示させる -->
  <v-card>
    <!-- タブレイアウト -->
    <v-tabs grow color="primary">
      <v-tab @click="onClickTab('paid_leave')">休暇申請</v-tab>
      <v-tab @click="onClickTab('equipment')">備品申請</v-tab>
    </v-tabs>

    <!-- コンテンツ -->
    <!-- データテーブル -->
    <v-card-title>
      <!-- 申請ルートタイトル -->
      <v-col cols="8">
        <div class="h5">
          {{ title }}
        </div>
      </v-col>
      <v-spacer/>
      <!-- 追加ボタン -->
      <v-col class="text-right" cols="4">
        <v-btn dark color="secondary" @click="onClickAdd">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
      <!-- 検索フォーム -->
      <v-col cols="12">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          clearable
        />
      </v-col>
    </v-card-title>
    <!-- テーブル -->
    <v-data-table
      class="text-no-wrap"
      :headers="tableHeaders"
      :items="tableData"
      :search="search"
      :footer-props="footerProps"
      :sort-by="['department', 'order']"
      :sort-desc="[false, false]"
      :items-per-page="30"
      mobile-breakpoint="0"
    >
      <!-- 操作列 -->
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon class="mr-2" @click="onClickEdit(item)">mdi-pencil</v-icon>
        <v-icon @click="onClickDelete(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogRoutes ref="ItemDialogRoutes"/>

    <!-- 削除ダイアログ -->
    <DeleteDialog ref="deleteDialog"/>

</v-card>
</template>

<script>
import ItemDialogRoutes from '../components/ItemDialogRoutes.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Routes',

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'routes',
      /** 申請書タイトル */
      title: '申請ルート設定',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
      /** 現在開いているタブ */
      currentTabName: 'paid_leave',
    }
  },

  components: {
    ItemDialogRoutes,
    DeleteDialog,
  },

  computed: {
    ...mapState({
      routes: state => state.firestore.routes,
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '部署', value: 'department', sortable: true },
        { text: 'タイトル', value: 'title', sortable: false },
        { text: '操作', value: 'actions', sortable: false },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [30, -1] }
    },
  },

  methods: {
    ...mapActions({
      fetchCollectionsByOneQuery: 'firestore/fetchCollectionsByOneQuery',
    }),

    /** タブをクリックした際に、編集対象の申請書名を子コンポーネント（DataTableRoute.vue）に渡す */
    onClickTab(currentTabName) {
      this.setCurrentTabName(currentTabName)
      this.getRecords()
    },

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      const currentTabName = this.currentTabName
      this.$refs.ItemDialogRoutes.open('add', {}, currentTabName)
    },

    /** 編集ボタンがクリックされたとき */
    onClickEdit (item) {
      const currentTabName = this.currentTabName
      this.$refs.ItemDialogRoutes.open('edit', item, currentTabName)
    },

    /** 削除ボタンがクリックされたとき */
    onClickDelete (item) {
      const currentTableName = this.currentTableName
      this.$refs.deleteDialog.open(item, currentTableName)
    },

    /** テーブルに表示させるデータを取得する */
    async getRecords() {
      const currentTableName = this.currentTableName
      const customQuery = {
        field: 'request_type',
        compare:'==',
        value: this.currentTabName
      }
      await this.fetchCollectionsByOneQuery({ currentTableName, customQuery })
      this.tableData = this.routes
    },

    /** クリックされたタブ情報を保持する
     *  リロードした際は下記メソッドは実行されないのでdata()で定義したデフォルト値がセットされる
     */
    setCurrentTabName(currentTabName) {
      this.currentTabName = currentTabName
    },
  },

  created() {
    this.getRecords()
  },

}
</script>
