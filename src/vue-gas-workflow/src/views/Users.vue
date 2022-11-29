<template>
  <div>
    <v-row>
      {{ users }}
      <v-spacer></v-spacer>
    </v-row>

    <v-row>
      <v-btn dark color="green" @click="onClickAdd">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-row>

    <ItemDialogUsers ref="ItemDialogUsers"/>

    <DeleteDialog ref="deleteDialog"/>

  </div>
</template>

<script>
import ItemDialogUsers from '../components/ItemDialogUsers.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Users',

  components: {
    ItemDialogUsers,
    DeleteDialog
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'users',
      /** 申請書タイトル */
      title: '従業員一覧',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      users: state => state.firestore.users,
      loading: state => state.workflow.loading.fetch,
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '部署', value: 'department', sortable: true },
        { text: 'メールアドレス', value: 'email', sortable: false },
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
      this.$refs.ItemDialogUsers.open('add')
    },

    /** 編集ボタンがクリックされたとき */
    onClickEdit (item) {
      this.$refs.ItemDialogUsers.open('edit', item)
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
      this.tableData = this.users
    },

  },

  created() {
    this.getRecords()
  },

}
</script>
