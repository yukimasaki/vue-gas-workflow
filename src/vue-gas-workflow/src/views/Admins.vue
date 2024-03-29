<template>
  <div>
    <v-card>
      <v-card-title>
        <!-- ページタイトル -->
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
        :sort-by="'name'"
        :sort-desc="false"
        :items-per-page="30"
        mobile-breakpoint="0"
      >

        <!-- 操作列 -->
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon @click="onClickDelete(item)">mdi-delete</v-icon>
        </template>

      </v-data-table>
    </v-card>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogAdmins ref="ItemDialogAdmins"/>

    <!-- 削除ダイアログ -->
    <DeleteDialog ref="deleteDialog"/>

  </div>
</template>

<script>
import ItemDialogAdmins from '../components/ItemDialogAdmins.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Admins',

  components: {
    ItemDialogAdmins,
    DeleteDialog
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'admins',
      /** 申請書タイトル */
      title: '管理者一覧',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      admins: state => state.firestore.admins,
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '氏名', value: 'name', sortable: false },
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
      fetchAllCollections: 'firestore/fetchAllCollections',
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.ItemDialogAdmins.open('add')
    },

    /** 編集ボタンがクリックされたとき */
    onClickEdit (item) {
      this.$refs.ItemDialogAdmins.open('edit', item)
    },

    /** 削除ボタンがクリックされたとき */
    onClickDelete (item) {
      const currentTableName = this.currentTableName
      this.$refs.deleteDialog.open(item, currentTableName)
    },

    /** テーブルに表示させるデータを取得する */
    async getRecords() {
      const currentTableName = this.currentTableName
      await this.fetchAllCollections({ currentTableName })
      this.tableData = this.admins
    },

  },

  async created() {
    await this.getRecords()
  },

}
</script>
