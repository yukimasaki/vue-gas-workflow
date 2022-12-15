<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog
    v-model="show"
    scrollable
    persistent
    max-width="500px"
    eager
  >
    <v-card>
      <v-card-title>{{ titleText }}</v-card-title>
      <v-divider/>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- タイトル -->
          <v-text-field
            label="タイトル"
            v-model="title"
            :rules="titleRules"
          />

          <!-- 選択した申請書ごとに項目を出し分けする -->
          <div v-if="requestType == 'paid_leave'">
            <!-- 事由 -->
            <v-textarea
              label="事由"
              v-model="reason"
              :rules="reasonRules"
              rows="3"
            />

            <!-- 予定日時 -->
            <v-textarea
              label="予定日時"
              v-model="date"
              :rules="dateRules"
              rows="3"
            />

            <!-- 緊急連絡先 -->
            <v-text-field
              label="緊急連絡先"
              v-model="contact"
              :rules="contactRules"
            />

            <!-- 備考 -->
            <v-textarea
              label="備考"
              v-model="memo"
              rows="3"
            />
          </div>

        </v-form>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="grey darken-1"
          text
          @click="onClickClose"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          :disabled="!valid"
          @click="onClickAction"
        >
          {{ actionText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'ItemDialogRequestDetail',

  data () {
    return {
      /** フォームの出し分け */
      requestType: '',
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'edit',
      /** 親コンポーネントから受け取ったitemを格納 */
      item: {},
      /** ID */
      id: '',
      /** タイトル */
      title: '',
      /** 事由 */
      reason: '',
      /** 予定日時 */
      date: '',
      /** 緊急連絡先 */
      contact: '',
      /** 備考 */
      memo: '',

      /** バリデーションルール */
      titleRules: [
        v => v.trim().length > 0 || 'タイトルは必須です',
      ],
      reasonRules: [
        v => v.trim().length > 0 || '事由は必須です',
      ],
      dateRules: [
        v => v.trim().length > 0 || '予定日時は必須です',
      ],
      contactRules: [
        v => v.trim().length > 0 || '緊急連絡先は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      userInfo: state => state.firestore.userInfo
    }),

    /** ダイアログのタイトル */
    titleText () {
      return this.actionType === 'add' ? 'データ追加' : 'データ編集'
    },
    /** ダイアログのアクション */
    actionText () {
      return this.actionType === 'add' ? '追加' : '更新'
    }
  },

  methods: {
    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
      getArrayRoute: 'firestore/getArrayRoute',
    }),

    ...mapActions({
      batchAddSubCollectionsToUsers: 'firestore/batchAddSubCollectionsToUsers',
      fetchUserInfo: 'firestore/fetchUserInfo',
      createArrayRoute: 'firestore/createArrayRoute',
      sendEmail: 'firestore/sendEmail',
      batchUpdateDocuments: 'firestore/batchUpdateDocuments',
    }),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (actionType, item, requestType) {
      this.item = item

      console.log(`this.item:`)
      console.log(this.item)

      this.show = true
      this.actionType = actionType
      this.requestType = requestType
      this.resetForm(item)
    },

    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },

    /** 更新がクリックされたとき */
    async onClickAction () {
      if (this.actionType === 'edit') {
        // 1ステップ目の承認者をリセットする
        this.item.itemRequest.current_approver_email = this.item.itemDetail.routes.approvers[0].email
        this.item.itemDetail.current_approver_email = this.item.itemDetail.routes.approvers[0].email

        // ステータスをリセットする
        this.item.itemRequest.status = '保留中'
        this.item.itemDetail.status = '保留中'

        // 現在のステップ数をリセットする
        this.item.itemDetail.current_step = 1

        // 申請ルート情報のステータスを保留中にリセットする
        this.item.itemDetail.routes.approvers.map(element => element.status = '保留中')

        // フォームに入力された内容に差し替える
        this.item.itemRequest = { ...this.item.itemRequest, title: this.title }
        this.item.itemDetail = { ...this.item.itemDetail, title: this.title, reason: this.reason, date: this.date, contact: this.contact, memo: this.memo }

        const userId = this.item.itemRequest.email
        const docId = this.$route.params.id
        const itemRequest = this.item.itemRequest
        const itemDetail = this.item.itemDetail
        const operationType = '再提出'

        this.batchUpdateDocuments({ userId, docId, itemRequest, itemDetail, operationType })

        // to: 承認者メールアドレスをセットする
        const emailTo = this.item.itemDetail.routes.approvers[0].email
        // subject: 申請が再提出された旨を題名に記載する
        const emailSubject = `申請が再提出されました [${this.title}]`
        // body: 詳細画面へのリンクを記載する
        const detailPageUrl = window.location.href
        const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
        // メール送信
        const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
        await this.sendEmail({ emailConfig })

        this.show = false
      }
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.title = item.title || ''
      this.reason = item.reason || ''
      this.date = item.date || ''
      this.contact = item.contact || ''
      this.memo = item.memo || ''

      this.$refs.form.resetValidation()
    },

    createEmailBody(emailSubject, detailPageUrl) {
      const emailBody =
        `${emailSubject}<br><br>詳細は下記リンクからご確認ください。<br><br><a href="${detailPageUrl}">${detailPageUrl}</a>`
      return emailBody
    },

  }
}
</script>
