<template>
  <div>
    <v-row>
      <v-col col="12">
        <v-card>
          <v-card-text>
            {{ users }}
            <v-spacer></v-spacer>
          </v-card-text>
          <v-card-actions>
            <v-btn dark color="green" @click="onClickAddUser">
              <v-icon left>mdi-plus</v-icon>
              usersを作成
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col col="12">
        <v-card>
          <v-card-text>
            {{ myRequests }}
            <v-spacer></v-spacer>
          </v-card-text>
          <v-card-actions>
            <v-btn dark color="green" @click="onClickAddRequest">
              <v-icon left>mdi-plus</v-icon>
              requestsを作成
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <ItemDialogUsers ref="ItemDialogUsers"/>
    <ItemDialogRequests ref="ItemDialogRequests"/>

    <DeleteDialog ref="deleteDialog"/>

  </div>
</template>

<script>
import ItemDialogUsers from '../components/ItemDialogUsers.vue'
import ItemDialogRequests from '../components/ItemDialogRequests.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  name: 'Users',

  components: {
    ItemDialogUsers,
    ItemDialogRequests,
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
      myRequests: state => state.firestore.myRequests,
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
    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
    }),

    ...mapActions({
      fetchAllCollections: 'firestore/fetchAllCollections',
      fetchMyRequests: 'firestore/fetchMyRequests',
      fetchOthersRequests: 'firestore/fetchOthersRequests',
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAddUser () {
      this.$refs.ItemDialogUsers.open('add')
    },
    onClickAddRequest () {
      this.$refs.ItemDialogRequests.open('add')
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

      const userId = this.getUserEmail()
      await this.fetchMyRequests({ userId })
    },

  },

  created() {
    this.getRecords()
  },

}
</script>
