<template>
  <div>
    <v-card>
      <v-card-title>
        <!-- 申請書タイトル -->
        <v-col cols="8">
          <div class="text-h3">
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
        :items="tableData"
        :search="search"
        :footer-props="footerProps"
        :loading="loading"
        :sort-by="'id'"
        :sort-desc="true"
        :items-per-page="30"
        mobile-breakpoint="0"
      >
      </v-data-table>
    </v-card>

    <!-- 追加／編集ダイアログ -->
    <ItemDialog ref="itemDialog"/>

  </div>

</template>

<script>
import { mapState } from 'vuex'
import ItemDialog from '../components/ItemDialog.vue'

export default {
  name: 'PaidLeave',

  components: {
    ItemDialog
  },

  data() {
    return {
      /* 申請書タイトル */
      title: '休暇申請フォーム',
      /** ローディング状態 */
      loading: false,
      /** 検索文字 */
      search: '',
    }
  },

  computed: {
    ...mapState({
      tableData: state => state.tableData,
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: 'ID', value: 'id' },
        { text: '申請者', value: 'recipient_name', sortable: false },
        { text: '部署', value: 'department', sortable: false },
        { text: '事由', value: 'reason', sortable: false },
        { text: '予定日時', value: 'date_between', sortable: false },
        { text: '1日もしくは半休', value: 'full_or_half', sortable: false },
        { text: '緊急連絡先', value: 'contact', sortable: false },
        { text: '備考', value: 'memo', sortable: false },
        { text: 'ステータス', value: 'status', sortable: false },
        { text: '申請日', value: 'created_at' },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [] }
    }
  },

  methods: {
    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.itemDialog.open('add')
    },
  },
}
</script>
