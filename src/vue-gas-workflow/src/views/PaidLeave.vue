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
    <ItemDialogPaidLeave ref="ItemDialogPaidLeave"/>

  </div>

</template>

<script>
import { mapState, mapActions } from 'vuex'
import ItemDialogPaidLeave from '../components/ItemDialogPaidLeave.vue'

export default {
  name: 'PaidLeaveFirestore',

  components: {
    ItemDialogPaidLeave
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTable: 'paid_leave_requests',
      /* 申請書タイトル */
      title: '休暇申請フォーム(Firestore)',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      paid_leave_requests: state => state.firestore.paid_leave_requests,
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
        { text: '申請者', value: 'recipient.name', sortable: false },
        { text: '部署', value: 'recipient.department', sortable: false },
        { text: '事由', value: 'reason', sortable: false },
        { text: '予定日時', value: 'date_between', sortable: false },
        { text: '緊急連絡先', value: 'contact', sortable: false },
        { text: '備考', value: 'memo', sortable: false },
        { text: 'ステータス', value: 'status', sortable: false },
        { text: '申請日', value: 'created_at' },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [] }
    },

    /** item.created_atを［yyyy/MM/dd HH:mm］形式で表示する */
  },

  methods: {
    ...mapActions({
      fetchAllCollections: 'firestore/fetchAllCollections',
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.ItemDialogPaidLeave.open('add')
    },

    async getRecords() {
      const currentTable = this.currentTable
      await this.fetchAllCollections({ currentTable })
      this.tableData = this.paid_leave_requests
    }
  },

  async created() {
    this.getRecords()
  },

}
</script>
