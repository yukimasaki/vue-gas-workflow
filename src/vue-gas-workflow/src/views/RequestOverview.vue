<template>
  <div>
    <!-- タブレイアウト -->
    <v-row>
      <v-col cols="12" md="6" xs="12">
        <v-tabs grow color="green">
          <v-tab @click="onClickTab('myRequests')">自分の申請</v-tab>
          <v-tab @click="onClickTab('othersRequests')">
            <template v-if="getNumberOfOthersRequest">
              <v-badge
                color="red"
                :content="getNumberOfOthersRequest"
              >承認依頼</v-badge>
            </template>
            <template v-else>承認依頼</template>
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- コンテンツ -->
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
        @click:row="onClickRow"
      >

      <template v-slot:[`item.status`]="{ item }">
        <v-chip
          class="ma-2"
          :color="statusColor(item)"
          text-color="white"
        >
          <v-icon left>
            {{ statusIcon(item) }}
          </v-icon>
          {{ item.status }}
        </v-chip>
      </template>

      </v-data-table>
    </v-card>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogRequests ref="ItemDialogRequests"/>

  </div>

</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import ItemDialogRequests from '../components/ItemDialogRequests.vue'

export default {
  name: 'RequestOverView',

  components: {
    ItemDialogRequests
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'myRequests',
      /** 現在開いているタブ */
      currentTabName: 'myRequests',
      /* 申請書タイトル */
      title: '申請一覧',
      /** 検索文字 */
      search: '',
      /** テーブルに表示させるデータ */
      tableData: [],
    }
  },

  computed: {
    ...mapState({
      loading: state => state.workflow.loading.fetch,
      requests: state => state.firestore.requests,
    }),

    ...mapGetters({
      getNumberOfOthersRequest: 'firestore/getNumberOfOthersRequest',
    }),

    /** 申請日の表示形式をフォーマット */
    formattedTableData () {
      return this.tableData.map((item) => ({
        ...item,
        created_at: this.dateToStr24HPad0(item.created_at.toDate())
      }))
    },

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '作成日時', value: 'created_at' },
        { text: 'ステータス', value: 'status', sortable: false },
        { text: 'タイトル', value: 'title', sortable: false },
        { text: '申請者', value: 'name', sortable: false },
        { text: '部署', value: 'department', sortable: false },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [30, -1] }
    },

  },

  methods: {
    ...mapActions({
      fetchMyRequests: 'firestore/fetchMyRequests',
      fetchOthersRequests: 'firestore/fetchOthersRequests',
      countOthersRequest: 'firestore/countOthersRequest',
    }),

    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
    }),

    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.ItemDialogRequests.open('add')
    },

    onClickRow(item) {
      this.$router.push({ path: `/requests/${item.id}` })
    },

    async onClickTab(currentTabName) {
      const userId = this.getUserEmail()

      switch(currentTabName) {
        case 'myRequests':
          await this.fetchMyRequests({ userId })
          break
        case 'othersRequests':
          await this.fetchOthersRequests({ userId })
          break
      }
      this.tableData = this.requests
    },

    dateToStr24HPad0(date, format) {
        if (!format) {
            format = 'YYYY/MM/DD hh:mm'
        }
        format = format.replace(/YYYY/g, date.getFullYear())
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2))
        format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2))
        format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2))
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2))
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2))
        return format
    },

    statusColor(item) {
      let color = ''
      switch (item.status) {
        case '完了': color =  'green' ; break
        case '保留中': color =  'blue' ; break
        case '否認': color =  'red' ; break
        case '差戻し': color =  'orange' ; break
      }
      return color
    },

    statusIcon(item) {
      let icon = ''
      switch (item.status) {
        case '完了': icon =  'mdi-check' ; break
        case '保留中': icon =  'mdi-timer-sand' ; break
        case '否認': icon =  'mdi-cancel' ; break
        case '差戻し': icon =  'mdi-arrow-u-left-bottom' ; break
      }
      return icon
    },

  },

  async created() {
    const userId = this.getUserEmail()
    await this.fetchMyRequests({ userId })
    this.tableData = this.requests

    // await this.countOthersRequest()
  },

}
</script>
