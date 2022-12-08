<template>
  <div>
    <!-- 申請状況 -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card >
          <!-- スマホは縦型のステップを表示 -->
          <template v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
            <v-stepper v-if="currentStep" v-model="currentStep" vertical>
              <template v-for="( n, index ) in maxStep">
                <v-stepper-step
                  :key="`${n}-step`"
                  :complete="routes.approvers[index].status == '完了'"
                  :step="n"
                  :rules="[() => {
                    const rules = [
                      routes.approvers[index].status == '否認' ? true : false,
                      routes.approvers[index].status == '差戻し' ? true : false,
                    ]
                    return !rules.some(v => v == true)
                  }]"
                  >
                  {{ routes.approvers[index].name }}
                  <small class="mt-2">{{ routes.approvers[index].status }}</small>
                </v-stepper-step>
                <div
                  :key="`${n}-div`"
                  v-if="n < maxStep"
                  style="border-left:1px solid rgba(0,0,0,.25); height:30px; margin-left:36px;"
                ></div>
              </template>
            </v-stepper>
          </template>

          <!-- その他の端末は横型のステップを表示 -->
          <template v-else>
            <v-stepper v-if="currentStep" v-model="currentStep" alt-labels>
              <v-stepper-header>
                <template v-for="( n, index ) in maxStep">
                  <v-stepper-step
                    :key="`${n}-step`"
                    :complete="routes.approvers[index].status == '完了'"
                    :step="n"
                    :rules="[() => {
                      const rules = [
                        routes.approvers[index].status == '否認' ? true : false,
                        routes.approvers[index].status == '差戻し' ? true : false,
                      ]
                      return !rules.some(v => v == true)
                    }]"
                    >
                    {{ routes.approvers[index].name }}
                    <small class="mt-2">{{ routes.approvers[index].status }}</small>
                  </v-stepper-step>
                  <v-divider :key="`${n}-divider`" v-if="n < maxStep" />
                </template>
              </v-stepper-header>
            </v-stepper>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- 申請詳細 -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card>
          <v-card-text>
            <v-form readonly>
              <v-text-field
                label="タイトル"
                v-model="title"
              />

              <v-text-field
                label="作成日時"
                v-model="created_at"
              />

              <v-text-field
                label="申請者"
                v-model="name"
              />

              <v-text-field
                label="メールアドレス"
                v-model="email"
              />

              <v-text-field
                label="部署"
                v-model="department"
              />

              <v-text-field
                label="事由"
                v-model="reason"
              />

              <v-text-field
                label="予定日時"
                v-model="date"
              />

              <v-text-field
                label="緊急連絡先"
                v-model="contact"
              />

              <v-text-field
                label="備考"
                v-model="memo"
              />

            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 承認・否認等のボタン -->
    <v-footer app padless>
      <v-col col="12" class="text-center">
        <v-btn class="mx-2" color="green" :dark="isDisabledApproveBtn? false : true" @click="onClickApprove" :disabled="isDisabledApproveBtn">承認</v-btn>
        <v-btn class="mx-2" color="green" :dark="isDisabledApproveBtn? false : true" @click="onClickDisapprove" :disabled="isDisabledApproveBtn">否認</v-btn>
        <v-btn class="mx-2" color="green" :dark="isDisabledApproveBtn? false : true" @click="onClickRemand" :disabled="isDisabledApproveBtn">差戻し</v-btn>
      </v-col>
    </v-footer>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

export default {
  name: 'RequestDetail',
  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'details',
      /** stateのデータを受け取って格納する */
      data: {},
      /** フォームに表示するデータを格納 */
      title: '',
      created_at: '',
      email: '',
      name: '',
      department: '',
      routes: {},
      reason: '',
      date: '',
      contact: '',
      memo: '',

      /** ステップの制御に使用 */
      currentStep: null,
      maxStep: null,

      /** Firestoreにバッチ書き込みするデータを格納 */
      latestStatus: '',
      latestApproverEmail: '',

    }
  },

  computed: {
    ...mapState({
      requests: state => state.firestore.requests,
      details: state => state.firestore.details,
      selectedTabName: state => state.firestore.selectedTabName,
    }),

    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
    }),

    /** 各種ボタンの表示/非表示ルール */
    isDisabledApproveBtn() {
      // 各種ボタンを非活性にする際の条件を列挙する
      if (!this.currentStep) {
        return true
      } else {
        const rules = [
          this.routes.approvers[this.currentStep - 1].email != this.getUserEmail ? true : false,
          this.routes.approvers[this.maxStep - 1].status == '完了' ? true : false,
          this.routes.approvers[this.currentStep - 1].status == '否認' ? true : false,
          this.routes.approvers[this.currentStep - 1].status == '差戻し' ? true : false,
        ]

        // 配列「rules」に1つでも「true」の要素があったら「true」を返す
        return rules.some(v => v == true)
      }
    },

  },

  methods: {
    ...mapActions({
      fetchCollectionsByOneQuery: 'firestore/fetchCollectionsByOneQuery',
      fetchMyDetail: 'firestore/fetchMyDetail',
      fetchOthersDetail: 'firestore/fetchOthersDetail',
      fetchRequest: 'firestore/fetchRequest',
      batchUpdateCollections: 'firestore/batchUpdateCollections',
    }),

    async fetchRequestDetail() {
      const path = this.$route.path
      const userId = this.getUserEmail
      const docId = this.$route.params.id

      if (path.startsWith('/my/')) {
        await this.fetchMyDetail({ userId, docId })
      } else if (path.startsWith('/others/')) {
        await this.fetchOthersDetail({ userId, docId })
      }
      this.data = this.details
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

    setData() {
      const date = this.data.created_at.toDate()
      const formattedDate = this.dateToStr24HPad0(date)

      this.title = this.data.title
      this.created_at = formattedDate
      this.email = this.data.email
      this.name = this.data.name
      this.department = this.data.department
      this.routes = this.data.routes
      this.currentStep = this.data.current_step
      this.maxStep = this.data.max_step

      this.reason = this.data.reason
      this.date = this.data.date
      this.contact = this.data.contact
      this.memo = this.data.memo
    },

    onClickApprove() {
      // フロント側の表示を更新
      // 最終ステップの場合
      if (this.currentStep == this.maxStep) {
        this.routes.approvers[this.currentStep - 1].status = '完了'
        this.latestStatus = this.routes.approvers[this.currentStep - 1].status
        this.latestApproverEmail = null
      // それ以外のステップの場合
      } else {
        this.routes.approvers[this.currentStep - 1].status = '完了'
        this.currentStep++
        this.latestStatus = '保留中'
        this.latestApproverEmail = this.routes.approvers[this.currentStep - 1].email
      }
      this.batchUpdate()
    },

    onClickDisapprove() {
      this.routes.approvers[this.currentStep - 1].status = '否認'
      this.latestStatus = '否認'
        this.latestApproverEmail = null
      this.batchUpdate()
    },

    onClickRemand() {
      this.routes.approvers[this.currentStep - 1].status = '差戻し'
      this.latestStatus = '差戻し'
      this.latestApproverEmail = null
      this.batchUpdate()
    },

    async batchUpdate() {
      // requestドキュメントを取得し変数に格納する
      const userId = this.data.email
      const docId = this.$route.params.id
      await this.fetchRequest({ userId, docId })

      // stateのオブジェクトを参照渡ししているため、下記エラーが出る？
      // [vuex] unknown local mutation type: tes, global type: firestore/tes
      // TODO：オブジェクトをコピーする https://qiita.com/c6tower/items/f36201539d94112bee7e
      let itemRequest = this.requests

        // 最新のステータスを格納する
      itemRequest.status = this.latestStatus
      // 最新の承認者メールアドレスを格納する
      itemRequest.current_approver_email = this.latestApproverEmail

      // itemDetailを作成
      let itemDetail = this.data
      itemDetail.current_step = this.currentStep

      // Firestoreにバッチ書き込み(update)
      this.batchUpdateCollections({ userId, docId, itemRequest, itemDetail })
    },
  },

  async created() {
    await this.fetchRequestDetail()
    this.setData()
  },
}
</script>
