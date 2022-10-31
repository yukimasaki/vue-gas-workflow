<template>
  <div>
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
        :items="formattedTableData"
        :search="search"
        :footer-props="footerProps"
        :loading="loading"
        :sort-by="'created_at'"
        :sort-desc="true"
        :items-per-page="30"
        mobile-breakpoint="0"
      >

      </v-data-table>
    </v-card>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogRequest ref="ItemDialogRequest"/>

  </div>

</template>

<script>
import { mapState, mapActions } from 'vuex'
import ItemDialogRequest from '../components/ItemDialogRequest.vue'

export default {
  name: 'RequestOverView',

  components: {
    ItemDialogRequest
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'request_snippets',
      /* 申請書タイトル */
      title: '自分の申請一覧',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      request_snippets: state => state.firestore.request_snippets,
      loading: state => state.workflow.loading.fetch,
    }),

    /** 申請日の表示形式をフォーマット */
    formattedTableData () {
      return this.tableData.map((item) => ({
        ...item,
        created_at:
          item.created_at.toDate().getFullYear() + '/' +
          item.created_at.toDate().getMonth() + '/' +
          item.created_at.toDate().getDate() + ' ' +
          item.created_at.toDate().getHours() + ':' +
          item.created_at.toDate().getMinutes()
      }))
    },

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: 'タイトル', value: 'title', sortable: false },
        { text: '申請者', value: 'recipient.name', sortable: false },
        { text: '部署', value: 'recipient.department', sortable: false },
        { text: 'ステータス', value: 'status', sortable: false },
        { text: '作成日時', value: 'created_at' },
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
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.ItemDialogRequest.open('add')
    },

    async getRecords() {
      const currentTableName = this.currentTableName
      await this.fetchAllCollections({ currentTableName })
      this.tableData = this.request_snippets
    }
  },

  created() {
    this.getRecords()
  },

}
</script>