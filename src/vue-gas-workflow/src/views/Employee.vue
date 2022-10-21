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
    <ItemDialogEmployee ref="ItemDialogEmployee"/>

  </div>
</template>

<script>
import ItemDialogEmployee from '../components/ItemDialogEmployee.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Employee',

  components: {
    ItemDialogEmployee
  },

  data() {
    return {
      /* 申請書タイトル */
      title: '従業員一覧',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      employees: state => state.firestore.employees,
      loading: state => state.workflow.loading.fetch,
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: 'メールアドレス', value: 'email', sortable: false },
        { text: '氏名', value: 'name', sortable: false },
        { text: '部署', value: 'department', sortable: true },
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
      this.$refs.ItemDialogEmployee.open('add')
    },

    /** テーブルに表示させるデータを取得する */
    async getRecords() {
      await this.fetchAllCollections()
      this.tableData = this.employees
    },

  },

  async created() {
    await this.getRecords()
    console.log(this.tableData)
  },

}
</script>
