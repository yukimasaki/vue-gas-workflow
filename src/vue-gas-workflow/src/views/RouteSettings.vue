<template>
  <div>
    <!-- 申請ルートテーブルを表示させる -->
    <v-card>
      <v-card-title>
        <!-- 申請ルートタイトル -->
        <v-col cols="8">
          <div class="h5">
            {{ titleTableName + ': ' + title }}
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
  name: 'RouteSettings',

  components: {
    ItemDialogRoute,
    DeleteDialog
  },

  data() {
    return {
      /** state.useTableNameの値によってタイトル名を変更する */
      titleTableName: '',

      /** 申請書タイトル */
      title: '申請ルート設定',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      loading: state => state.workflow.loading.fetch,
      useTableName: state => state.firestore.useTableName
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '部署', value: 'department', sortable: true },
        { text: '順序', value: 'order', sortable: false },
        { text: 'メールアドレス', value: 'email', sortable: false },
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
      fetchAllCollections: 'firestore/fetchAllCollections',
      setUseTableName: 'firestore/setUseTableName',
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.ItemDialogRoute.open('add')
    },

    /** 編集ボタンがクリックされたとき */
    onClickEdit (item) {
      this.$refs.ItemDialogRoute.open('edit', item)
    },

    /** 削除ボタンがクリックされたとき */
    onClickDelete (item) {
      this.$refs.deleteDialog.open(item)
    },

    /** テーブルに表示させるデータを取得する */
    async getRecords() {
      await this.fetchAllCollections({ tableName: this.tableName })
      console.log(this.tableName)
      // TODO: 下記は正常に動作しない
      this.tableData = this.useTableName
    },

    /** state.useTableNameの値によってタイトル名を変更する */
    setTitleTableName() {
      switch (this.useTableName) {
        case 'paid_leave_routes':
          this.titleTableName = '休暇申請'
          break
        case 'equipment_routes':
          this.titleTableName = '備品申請'
          break
        default:
          this.titleTableName = ''
      }
    }

  },

  async created() {
    /** 画面リロードなどでstate.useTableNameが空になってしまった場合は初期値をセットしておく */
    if (!this.useTableName) {
      this.setUseTableName({ tableName: 'paid_leave_routes'})
    }

    /** state.useTableNameの値によってタイトル名を変更する */
    this.setTitleTableName()

    /** テーブルにデータをセットする */
    await this.getRecords()

  },

}
</script>
