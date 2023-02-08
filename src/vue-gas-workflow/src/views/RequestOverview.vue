<template>
  <div>
    <!-- タブレイアウト -->
    <v-row>
      <v-col cols="12" md="6" xs="12">
        <v-tabs grow color="primaryDarken">
          <v-tab @click="onClickTab('myRequests')">自分の申請</v-tab>
          <v-tab @click="onClickTab('othersRequests')">
            <template v-if="numberOfOthersRequests">
              <v-badge
                color="info"
                :content="numberOfOthersRequests"
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
        :sort-by="'common.created_at'"
        :sort-desc="true"
        :items-per-page="30"
        mobile-breakpoint="0"
        @click:row="onClickRow"
      >
        <template v-slot:[`item.common.created_at`]="{ item }">{{ formatDate(item) }}</template>
        <template v-slot:[`item.common.status`]="{ item }">
          <v-chip
            class="ma-2"
            :color="statusColor(item)"
            text-color="white"
          >
            <v-icon left>
              {{ statusIcon(item) }}
            </v-icon>
            {{ item.common.status }}
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
import scrollHint from 'scroll-hint'
import 'scroll-hint/css/scroll-hint.css'

export default {
  name: 'RequestOverView',

  components: {
    ItemDialogRequests,
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'myRequests',
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
      myRequests: state => state.firestore.myRequests,
      othersRequests: state => state.firestore.othersRequests,
      selectedTabName: state => state.firestore.selectedTabName,
    }),

    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
    }),

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '作成日時', value: 'common.created_at' },
        { text: '申請種別', value: 'common.request_type.text', sortable: false },
        { text: 'ステータス', value: 'common.status', sortable: false },
        { text: 'タイトル', value: 'common.title', sortable: false },
        { text: '申請者', value: 'common.name', sortable: false },
        { text: '部署', value: 'common.department', sortable: false },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [30, -1] }
    },

    /** 承認依頼タブに表示する件数バッジ */
    numberOfOthersRequests () {
      return this.othersRequests.length
    },
  },

  methods: {
    ...mapActions({
      fetchMyRequests: 'firestore/fetchMyRequests',
      fetchOthersRequests: 'firestore/fetchOthersRequests',
      setSelectedTabName: 'firestore/setSelectedTabName',
    }),


    /** 追加ボタンがクリックされたとき */
    onClickAdd () {
      this.$refs.ItemDialogRequests.open('add')
    },

    onClickRow(item) {
      // セキュリティルールによってクエリを出しわける必要があるため、
      // selectedTabNameによってルーティングを切り替えておく
      switch(this.selectedTabName) {
        case 'myRequests':
          this.$router.push({ path: `/my/requests/${item.id}` })
          break
        case 'othersRequests':
          this.$router.push({ path: `/others/requests/${item.id}` })
          break
      }
    },

    async onClickTab(selectedTabName) {
      this.setSelectedTabName({ selectedTabName })
      const userId = this.getUserEmail
      switch(selectedTabName) {
        case 'myRequests':
          await this.fetchMyRequests({ userId })
          this.tableData = this.myRequests
          break
        case 'othersRequests':
          this.tableData = this.othersRequests
          break
      }
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

    formatDate(item) {
      return this.dateToStr24HPad0(item.common.created_at.toDate())
    },

    statusColor(item) {
      let color = ''
      switch (item.common.status) {
        case '完了': color =  'success' ; break
        case '保留中': color =  'info' ; break
        case '否認': color =  'error' ; break
        case '差戻し': color =  'warning' ; break
      }
      return color
    },

    statusIcon(item) {
      let icon = ''
      switch (item.common.status) {
        case '完了': icon =  'mdi-check' ; break
        case '保留中': icon =  'mdi-timer-sand' ; break
        case '否認': icon =  'mdi-cancel' ; break
        case '差戻し': icon =  'mdi-arrow-u-left-bottom' ; break
      }
      return icon
    },

  },

  async created() {
    this.setSelectedTabName({ selectedTabName: 'myRequests' })
    const userId = this.getUserEmail
    await this.fetchMyRequests({ userId })
    await this.fetchOthersRequests({ userId })
    this.tableData = this.myRequests
  },

  mounted() {
    /** テーブルにScrollHintを表示する */
    const theTable = document.getElementsByTagName('table')[0]
    const parentOfTheTable = theTable.parentElement
    parentOfTheTable.classList.add('js-scrollable')
    new scrollHint(
      '.js-scrollable',
      {
        i18n: {
          scrollable: 'スクロールできます'
        }
      }
    )
  },
}
</script>
