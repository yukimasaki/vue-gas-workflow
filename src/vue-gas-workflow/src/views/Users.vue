<template>
  <div>
    <!-- 従業員テーブルを表示させる -->
    <v-card>
      <v-card-title>
        <!-- 申請書タイトル -->
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
        :sort-by="'department'"
        :sort-desc="false"
        :items-per-page="30"
        mobile-breakpoint="0"
      >

        <!-- 操作列 -->
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon class="mr-2" @click="onClickEdit(item)">mdi-pencil</v-icon>
          <v-icon @click="onClickDelete(item)">mdi-delete</v-icon>
        </template>

      </v-data-table>
    </v-card>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogUsers ref="ItemDialogUsers"/>

    <!-- 削除ダイアログ -->
    <DeleteDialog ref="deleteDialog"/>

  </div>
</template>

<script>
import ItemDialogUsers from '../components/ItemDialogUsers.vue'
import DeleteDialog from '../components/DeleteDialog.vue'
import { mapActions, mapState } from 'vuex'
import { scrollHintHelper } from '../helpers/scrollHintHelper'

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
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '部署', value: 'department', sortable: true },
        { text: 'メールアドレス', value: 'id', sortable: false },
        { text: '氏名', value: 'name', sortable: false },
        { text: '取得可能な有給日数', value: 'available_paid_leave_days', sortable: false },
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

  mounted() {
    // /** テーブルにScrollHintを表示する */
    scrollHintHelper.showScrollHint()
  },

}
</script>
