<template>
  <div v-if="formData.length != 0">
    <!-- 申請状況 -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card >
          <!-- スマホは縦型のステップを表示 -->
          <template v-if="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm">
            <v-stepper v-model="formData.common.current_step" vertical>
              <template v-for="( n, index ) in formData.common.max_step">
                <v-stepper-step
                  v-if="n != undefined"
                  :key="`${n}-step`"
                  :complete="formData.common.routes.approvers[index].status == '完了'"
                  :step="n"
                  :rules="[() => {
                    const rules = [
                      formData.common.routes.approvers[index].status == '否認' ? true : false,
                      formData.common.routes.approvers[index].status == '差戻し' ? true : false,
                    ]
                    return !rules.some(v => v == true)
                  }]"
                  >
                  {{ formData.common.routes.approvers[index].name }}
                  <small class="mt-2">{{ formData.common.routes.approvers[index].status }}</small>
                </v-stepper-step>
                <div
                  :key="`${n}-div`"
                  v-if="n < formData.common.max_step"
                  style="border-left:1px solid rgba(0,0,0,.25); height:30px; margin-left:36px;"
                ></div>
              </template>
            </v-stepper>
          </template>

          <!-- その他の端末は横型のステップを表示 -->
          <template v-else>
            <v-stepper v-model="formData.common.current_step" alt-labels>
              <v-stepper-header>
                <template v-for="( n, index ) in formData.common.max_step">
                  <v-stepper-step
                    v-if="n != undefined"
                    :key="`${n}-step`"
                    :complete="formData.common.routes.approvers[index].status == '完了'"
                    :step="n"
                    :rules="[() => {
                      const rules = [
                        formData.common.routes.approvers[index].status == '否認' ? true : false,
                        formData.common.routes.approvers[index].status == '差戻し' ? true : false,
                      ]
                      return !rules.some(v => v == true)
                    }]"
                    >
                    {{ formData.common.routes.approvers[index].name }}
                    <small class="mt-2">{{ formData.common.routes.approvers[index].status }}</small>
                  </v-stepper-step>
                  <v-divider :key="`${n}-divider`" v-if="n < formData.common.max_step" />
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
                v-model="formData.common.title"
              />

              <v-text-field
                label="作成日時"
                v-model="formattedDate"
              />

              <v-text-field
                label="申請者"
                v-model="formData.common.name"
              />

              <v-text-field
                label="メールアドレス"
                v-model="formData.common.email"
              />

              <v-text-field
                label="部署"
                v-model="formData.common.department"
              />

              <!-- 選択した申請書ごとに項目を出し分けする -->
              <!-- 休暇申請 -->
              <div v-if="requestTypeValue == 'paid_leave'">
                <v-textarea
                  auto-grow
                  rows="1"
                  label="事由"
                  v-model="formData.unique.paid_leave.reason"
                />
                <v-textarea
                  auto-grow
                  rows="1"
                  label="予定日時"
                  v-model="formData.unique.paid_leave.date"
                />
                <v-text-field
                  label="緊急連絡先"
                  v-model="formData.unique.paid_leave.contact"
                />
                <v-textarea
                  auto-grow
                  rows="1"
                  label="備考"
                  v-model="formData.unique.paid_leave.memo"
                />
              </div>
              <!-- 備品申請 -->
              <div v-else-if="requestTypeValue == 'equipment'">
                <v-textarea
                  auto-grow
                  rows="1"
                  label="商品名"
                  v-model="formData.unique.equipment.item_name"
                />
                <v-textarea
                  auto-grow
                  rows="1"
                  label="購入理由"
                  v-model="formData.unique.equipment.reason"
                />
                <v-textarea
                  auto-grow
                  rows="1"
                  label="備考"
                  v-model="formData.unique.equipment.memo"
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
        <v-btn class="mx-2" color="primary" :dark="isDisabledApproveBtn? false : true" @click="onClickApprove" :disabled="isDisabledApproveBtn">承認</v-btn>
        <v-btn class="mx-2" color="primary" :dark="isDisabledApproveBtn? false : true" @click="onClickDisapprove" :disabled="isDisabledApproveBtn">否認</v-btn>
        <v-btn class="mx-2" color="primary" :dark="isDisabledApproveBtn? false : true" @click="onClickRemand" :disabled="isDisabledApproveBtn">差戻し</v-btn>
        <v-btn class="mx-2" color="primary" :dark="isDisabledEditBtn? false : true" @click="onClickEdit" :disabled="isDisabledEditBtn">編集</v-btn>
      </v-col>
    </v-footer>

    <!-- 追加／編集ダイアログ -->
    <ItemDialogRequests ref="ItemDialogRequests" @submitRemand="updateForm"/>

  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import ItemDialogRequests from '../components/ItemDialogRequests.vue'

export default {
  name: 'RequestDetail',

  components: {
    ItemDialogRequests
  },

  data() {
    return {
      formData: [],
      currentTableName: 'requests',
      latestStatus: '',
      latestApproverEmail: '',
    }
  },

  computed: {
    ...mapState({
      requests: state => state.firestore.requests,
      selectedTabName: state => state.firestore.selectedTabName,
    }),

    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
    }),

    formattedDate() {
      // 画面描画直後はthis.dataが空値のためif文でエラー回避しておく
      if (this.formData == '') {
        return null
      } else {
        const date = this.formData.common.created_at.toDate()
        return this.dateToStr24HPad0(date)
      }
    },
    requestTypeValue() {
      if(this.formData == '') {
        return null
      } else {
        return this.formData.common.request_type.value
      }
    },

    /** 各種ボタンの表示/非表示ルール */
    isDisabledApproveBtn() {
      // 画面生成直後だとthis.currentStepがnullのため、下記コード内でインデックスを取得できずエラーとなる。
      // そのため、if文で一時的にtrueを返しておく。
      if (!this.formData.common.current_step) {
        return true
      } else {
        // 各種ボタンを非活性にする際の条件を列挙する
        const rules = [
          this.formData.common.routes.approvers[this.formData.common.current_step - 1].email != this.getUserEmail ? true : false,
          this.formData.common.routes.approvers[this.formData.common.max_step - 1].status == '完了' ? true : false,
          this.formData.common.routes.approvers[this.formData.common.current_step - 1].status == '否認' ? true : false,
          this.formData.common.routes.approvers[this.formData.common.current_step - 1].status == '差戻し' ? true : false,
        ]

        // 配列「rules」に1つでも「true」の要素があったら「true」を返す
        return rules.some(v => v == true)
      }
    },

    isDisabledEditBtn() {
      // 編集ボタンを非活性にする際の条件を列挙する
      const rules = [
        this.formData.common.email != this.getUserEmail ? true : false, // 申請者とログイン中ユーザーが異なる
        this.formData.common.status == '保留中' ? true: false,
        this.formData.common.status == '完了' ? true: false,
        this.formData.common.status == '否認' ? true: false
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
      updateSubCollection: 'firestore/updateSubCollection',
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

    //メール以外動作確認済み
    async onClickApprove() {
      // 最終ステップの場合
      if (this.formData.common.current_step == this.formData.common.max_step) {
        this.formData.common.routes.approvers[this.formData.common.current_step - 1].status = '完了'
        this.formData.common.status = '完了'
        this.formData.common.current_approver_email = ''

        const userId = this.formData.common.email
        const docId = this.$route.params.id
        const operationType = '承認'
        const item = this.formData

        await this.updateSubCollection({ userId, docId, item, operationType })
        this.notifyToApplicant(operationType)

      // それ以外のステップの場合
      } else {
        this.formData.common.routes.approvers[this.formData.common.current_step - 1].status = '完了'
        this.formData.common.status = '保留中'
        this.formData.common.current_approver_email = this.formData.common.routes.approvers[this.formData.common.current_step - 1].email
        this.formData.common.current_step++

        const userId = this.formData.common.email
        const docId = this.$route.params.id
        const operationType = '承認'
        const item = this.formData
        await this.updateSubCollection({ userId, docId, item, operationType })

        const nextApproverEmail = this.formData.common.current_approver_email
        this.notifyToNextApprover(nextApproverEmail)
      }
    },

    //メール以外動作確認済み
    async onClickDisapprove() {
      this.formData.common.routes.approvers[this.formData.common.current_step - 1].status = '否認'
      this.formData.common.status = '否認'
      this.formData.common.current_approver_email = ''

      const userId = this.formData.common.email
      const docId = this.$route.params.id
      const operationType = '否認'
      const item = this.formData

      await this.updateSubCollection({ userId, docId, item, operationType })
      this.notifyToApplicant(operationType)
    },

    //メール以外動作確認済み (onClickApproveの最終ステップ時の処理、onClickDisapproveと統合できるのでは？)
    async onClickRemand() {
      this.formData.common.routes.approvers[this.formData.common.current_step - 1].status = '差戻し'
      this.formData.common.status = '差戻し'
      this.formData.common.current_approver_email = ''

      const userId = this.formData.common.email
      const docId = this.$route.params.id
      const operationType = '差戻し'
      const item = this.formData

      await this.updateSubCollection({ userId, docId, item, operationType })
      this.notifyToApplicant(operationType)
    },

    // TODO: 適切な関数名にリネームする
    async batchUpdate(operationType) {
      // TODO: 新しいデータ構造に対応する

      // requestドキュメントを取得し変数に格納する
      const userId = this.formData.common.email
      const docId = this.$route.params.id
      await this.fetchRequest({ userId, docId })
      const itemRequest = this.requests

      // itemDetailを作成
      const itemDetail = this.data
      itemDetail.current_step = this.formData.common.current_step

      // 最新のステータスを格納する
      itemRequest.status = this.latestStatus
      itemDetail.status = this.latestStatus
      // 最新の承認者メールアドレスを格納する
      itemRequest.current_approver_email = this.latestApproverEmail

      // Firestoreにバッチ書き込み(update)
      this.updateSubCollection({ userId, docId, itemRequest, itemDetail, operationType })
    },

    createEmailBody(emailSubject, detailPageUrl) {
      const emailBody =
        `${emailSubject}<br><br>詳細は下記リンクからご確認ください。<br><br><a href="${detailPageUrl}">${detailPageUrl}</a>`
      return emailBody
    },

    onClickEdit() {
      const item = this.formData
      this.$refs.ItemDialogRequests.open('edit', item)
    },

    // 子コンポーネントからitemを受け取りフォームに反映する
    updateForm(item) {
      this.formData = item
    },

    // 申請者本人にメール通知する
    notifyToApplicant(operationType) {
      const emailTo = this.formData.common.email
      const emailSubject = `申請が${operationType}されました [${this.formData.common.title}]`
      const url = window.location.href
      const detailPageUrl = url.replace('/others', '/my')
      const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
      const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
      this.sendEmail({ emailConfig })
    },

    // 次のステップの承認者にメール通知する
    notifyToNextApprover(nextApproverEmail) {
      const emailTo = nextApproverEmail
      const emailSubject = `[承認依頼] [${this.formData.common.title}]`
      const detailPageUrl = window.location.href
      const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
      const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
      this.sendEmail({ emailConfig })
    },
  },

  async created() {
    await this.fetchRequestDetail()
    this.formData = this.requests
  },
}
</script>
