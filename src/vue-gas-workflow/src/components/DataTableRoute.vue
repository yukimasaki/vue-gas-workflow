<template>
  <div>
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
        <v-btn dark color="green" @click="onClickAdd">
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
      :loading="loading"
      :sort-by="['order']"
      :sort-desc="[false]"
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
    <ItemDialogRoute ref="ItemDialogRoute"/>

    <!-- 削除ダイアログ -->
    <DeleteDialog ref="deleteDialog"/>
  </div>
</template>

<script>
import ItemDialogRoute from '../components/ItemDialogRoute.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Route',

  components: {
    ItemDialogRoute,
    DeleteDialog
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTable: 'paid_leave_routes',
      /** 申請書タイトル */
      title: '申請ルート設定',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
      /** 現在開いているタブ */
      currentTab: 'paid_leave',
    }
  },

  computed: {
    ...mapState({
      paid_leave_routes: state => state.firestore.paid_leave_routes,
      loading: state => state.workflow.loading.fetch,
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '部署', value: 'department', sortable: true },
        { text: '順序', value: 'order', sortable: false },
        { text: 'メールアドレス', value: 'email', sortable: false },
        { text: '氏名', value: 'name', sortable: false },
        { text: '役割', value: 'role', sortable: false },
        { text: '操作', value: 'actions', sortable: false },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [] }
    },
  },

  methods: {
    ...mapActions({
      fetchCollectionsByOneQuery: 'firestore/fetchCollectionsByOneQuery',
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      const currentTab = this.currentTab
      this.$refs.ItemDialogRoute.open('add', {}, currentTab)
    },

    /** 編集ボタンがクリックされたとき */
    onClickEdit (item) {
      this.$refs.ItemDialogRoute.open('edit', item)
    },

    /** 削除ボタンがクリックされたとき */
    onClickDelete (item) {
      const currentTable = this.currentTable
      this.$refs.deleteDialog.open(item, currentTable)
    },

    /** テーブルに表示させるデータを取得する */
    async getRecords() {
      const currentTable = this.currentTable
      const customQuery = {
        field: 'request_type',
        compare:'==',
        value: this.currentTab
      }
      await this.fetchCollectionsByOneQuery({ currentTable, customQuery })
      this.tableData = this.paid_leave_routes
    },

    /** クリックされたタブ情報を親コンポーネント（Route.vue）から受け取る
     *  リロードした際は下記メソッドは実行されないのでdata()で定義したデフォルト値がセットされる
     */
    setCurrentTab(currentTab) {
      this.currentTab = currentTab
    },

  },

  created() {
    this.getRecords()
  },

}
</script>
