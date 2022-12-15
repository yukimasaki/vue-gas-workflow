<template>
  <div>
    <!-- 申請状況 -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card >
          <!-- スマホは縦型のステップを表示 -->
          <template v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
            <v-stepper v-if="data.current_step" v-model="data.current_step" vertical>
              <template v-for="( n, index ) in data.max_step">
                <v-stepper-step
                  :key="`${n}-step`"
                  :complete="data.routes.approvers[index].status == '完了'"
                  :step="n"
                  :rules="[() => {
                    const rules = [
                      data.routes.approvers[index].status == '否認' ? true : false,
                      data.routes.approvers[index].status == '差戻し' ? true : false,
                    ]
                    return !rules.some(v => v == true)
                  }]"
                  >
                  {{ data.routes.approvers[index].name }}
                  <small class="mt-2">{{ data.routes.approvers[index].status }}</small>
                </v-stepper-step>
                <div
                  :key="`${n}-div`"
                  v-if="n < data.max_step"
                  style="border-left:1px solid rgba(0,0,0,.25); height:30px; margin-left:36px;"
                ></div>
              </template>
            </v-stepper>
          </template>

          <!-- その他の端末は横型のステップを表示 -->
          <template v-else>
            <v-stepper v-if="data.current_step" v-model="data.current_step" alt-labels>
              <v-stepper-header>
                <template v-for="( n, index ) in data.max_step">
                  <v-stepper-step
                    :key="`${n}-step`"
                    :complete="data.routes.approvers[index].status == '完了'"
                    :step="n"
                    :rules="[() => {
                      const rules = [
                        data.routes.approvers[index].status == '否認' ? true : false,
                        data.routes.approvers[index].status == '差戻し' ? true : false,
                      ]
                      return !rules.some(v => v == true)
                    }]"
                    >
                    {{ data.routes.approvers[index].name }}
                    <small class="mt-2">{{ data.routes.approvers[index].status }}</small>
                  </v-stepper-step>
                  <v-divider :key="`${n}-divider`" v-if="n < data.max_step" />
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
                v-model="data.title"
              />

              <v-text-field
                label="作成日時"
                v-model="formattedDate"
              />

              <v-text-field
                label="申請者"
                v-model="data.name"
              />

              <v-text-field
                label="メールアドレス"
                v-model="data.email"
              />

              <v-text-field
                label="部署"
                v-model="data.department"
              />

              <!-- 選択した申請書ごとに項目を出し分けする -->
              <!-- 休暇申請 -->
              <div v-if="requestTypeValue == 'paid_leave'">
                <v-text-field
                  label="事由"
                  v-model="data.reason"
                />
                <v-text-field
                  label="予定日時"
                  v-model="data.date"
                />
                <v-text-field
                  label="緊急連絡先"
                  v-model="data.contact"
                />
                <v-text-field
                  label="備考"
                  v-model="data.memo"
                />
              </div>
              <!-- 備品申請 -->
              <div v-else-if="requestTypeValue == 'equipment'">
                <v-text-field
                  label="商品名"
                  v-model="data.item_name"
                />
                <v-text-field
                  label="購入理由"
                  v-model="data.reason"
                />
                <v-text-field
                  label="備考"
                  v-model="data.memo"
                />
              </div>

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
        <v-btn class="mx-2" color="green" :dark="isDisabledEditBtn? false : true" @click="onClickEdit" :disabled="isDisabledEditBtn">編集</v-btn>
      </v-col>
    </v-footer>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogRequestDetail ref="ItemDialogRequestDetail"/>

  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import ItemDialogRequestDetail from '../components/ItemDialogRequestDetail.vue'

export default {
  name: 'RequestDetail',

  components: {
    ItemDialogRequestDetail
  },

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'details',

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

    /** stateのデータを受け取って格納する */
    data() {
      return this.details
    },
    formattedDate() {
      // 画面描画直後はthis.dataが空値のためif文でエラー回避しておく
      if (this.data == '') {
        return false
      } else {
        const date = this.data.created_at.toDate()
        return this.dateToStr24HPad0(date)
      }
    },
    requestTypeValue() {
      if(this.details == '') {
        return false
      } else {
        return this.details.request_type.value
      }
    },

    /** 各種ボタンの表示/非表示ルール */
    isDisabledApproveBtn() {
      // 画面生成直後だとthis.currentStepがnullのため、下記コード内でインデックスを取得できずエラーとなる。
      // そのため、if文で一時的にtrueを返しておく。
      if (!this.data.current_step) {
        return true
      } else {
        // 各種ボタンを非活性にする際の条件を列挙する
        const rules = [
          this.data.routes.approvers[this.data.current_step - 1].email != this.getUserEmail ? true : false,
          this.data.routes.approvers[this.data.max_step - 1].status == '完了' ? true : false,
          this.data.routes.approvers[this.data.current_step - 1].status == '否認' ? true : false,
          this.data.routes.approvers[this.data.current_step - 1].status == '差戻し' ? true : false,
        ]

        // 配列「rules」に1つでも「true」の要素があったら「true」を返す
        return rules.some(v => v == true)
      }
    },

    isDisabledEditBtn() {
      // 編集ボタンを非活性にする際の条件を列挙する
      const rules = [
        this.data.email != this.getUserEmail ? true : false, // 申請者とログイン中ユーザーが異なる
        this.data.status == '保留中' ? true: false,
        this.data.status == '完了' ? true: false,
        this.data.status == '否認' ? true: false
      ]

      // 配列「rules」に1つでも「true」の要素があったら「true」を返す
      return rules.some(v => v == true)
    },

  },

  methods: {
    ...mapActions({
      fetchCollectionsByOneQuery: 'firestore/fetchCollectionsByOneQuery',
      fetchMyDetail: 'firestore/fetchMyDetail',
      fetchOthersDetail: 'firestore/fetchOthersDetail',
      fetchRequest: 'firestore/fetchRequest',
      batchUpdateDocuments: 'firestore/batchUpdateDocuments',
      sendEmail: 'firestore/sendEmail',
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
      // this.data = this.details
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

    // 不要なので削除する
    setData() {
    },

    async onClickApprove() {
      const operationType = '承認'

      // フロント側の表示を更新
      // 最終ステップの場合
      if (this.data.current_step == this.data.max_step) {
        this.data.routes.approvers[this.data.current_step - 1].status = '完了'
        this.latestStatus = this.data.routes.approvers[this.data.current_step - 1].status
        this.latestApproverEmail = ''
        this.batchUpdate(operationType)

        // to: 申請者メールアドレスをセットする
        const emailTo = this.data.email
        // subject: 申請が承認された旨を題名に記載する
        const emailSubject = `申請が${operationType}されました [${this.data.title}]`
        // body: 詳細画面へのリンクを記載する
        const url = window.location.href
        const detailPageUrl = url.replace('/others', '/my')
        const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
        // メール送信
        const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
        await this.sendEmail({ emailConfig })

      // それ以外のステップの場合
      } else {
        this.data.routes.approvers[this.data.current_step - 1].status = '完了'
        this.data.current_step++
        this.latestStatus = '保留中'
        this.latestApproverEmail = this.data.routes.approvers[this.data.current_step - 1].email
        this.batchUpdate(operationType)

        // to: 次の承認者メールアドレスをセットする
        const emailTo = this.latestApproverEmail
        // subject: 申請が承認された旨を題名に記載する
        const emailSubject = `[承認依頼] [${this.data.title}]`
        // body: 詳細画面へのリンクを記載する
        const detailPageUrl = window.location.href
        const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
        // メール送信
        const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
        await this.sendEmail({ emailConfig })
      }
    },

    async onClickDisapprove() {
      this.data.routes.approvers[this.data.current_step - 1].status = '否認'
      this.latestStatus = '否認'
      this.latestApproverEmail = ''
      const operationType = '否認'
      this.batchUpdate(operationType)

      // to: 申請者メールアドレスをセットする
      const emailTo = this.data.email
      // subject: 申請が否認された旨を題名に記載する
      const emailSubject = `申請が${operationType}されました [${this.data.title}]`
      // body: 詳細画面へのリンクを記載する
      const url = window.location.href
      const detailPageUrl = url.replace('/others', '/my')
      const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
      // メール送信
      const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
      await this.sendEmail({ emailConfig })
    },

    async onClickRemand() {
      this.data.routes.approvers[this.data.current_step - 1].status = '差戻し'
      this.latestStatus = '差戻し'
      this.latestApproverEmail = ''
      const operationType = '差戻し'
      this.batchUpdate(operationType)

      // to: 申請者メールアドレスをセットする
      const emailTo = this.data.email
      // subject: 申請が否認された旨を題名に記載する
      const emailSubject = `申請が${operationType}されました [${this.data.title}]`
      // body: 詳細画面へのリンクを記載する
      const url = window.location.href
      const detailPageUrl = url.replace('/others', '/my')
      const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
      // メール送信
      const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
      await this.sendEmail({ emailConfig })
    },

    async batchUpdate(operationType) {
      // requestドキュメントを取得し変数に格納する
      const userId = this.data.email
      const docId = this.$route.params.id
      await this.fetchRequest({ userId, docId })
      const itemRequest = this.requests

      // itemDetailを作成
      const itemDetail = this.data
      itemDetail.current_step = this.data.current_step

      // 最新のステータスを格納する
      itemRequest.status = this.latestStatus
      itemDetail.status = this.latestStatus
      // 最新の承認者メールアドレスを格納する
      itemRequest.current_approver_email = this.latestApproverEmail

      // Firestoreにバッチ書き込み(update)
      this.batchUpdateDocuments({ userId, docId, itemRequest, itemDetail, operationType })
    },

    createEmailBody(emailSubject, detailPageUrl) {
      const emailBody =
        `${emailSubject}<br><br>詳細は下記リンクからご確認ください。<br><br><a href="${detailPageUrl}">${detailPageUrl}</a>`
      return emailBody
    },

    async onClickEdit() {
      const userId = this.data.email
      const docId = this.$route.params.id
      await this.fetchRequest({ userId, docId })
      const itemRequest = this.requests
      const itemDetail = this.data

      const requestType = 'paid_leave'
      const item = {
        title: this.data.title,
        reason: this.data.reason,
        date: this.data.date,
        contact: this.data.contact,
        memo: this.data.memo,

        itemRequest: itemRequest,
        itemDetail: itemDetail
      }
      await this.$refs.ItemDialogRequestDetail.open('edit', item, requestType)
    },
  },

  async created() {
    await this.fetchRequestDetail()
    this.setData()
    console.log(this.requestType)
  },
}
</script>
