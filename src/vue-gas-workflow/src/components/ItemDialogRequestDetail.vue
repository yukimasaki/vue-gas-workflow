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
          <!-- 申請書の種類 -->
          <v-select
            label="申請書の種類"
            v-model="requestType"
            :items="items"
            :rules="requestTypeRules"
          />

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
import { serverTimestamp } from '@firebase/firestore'
import { v4 as uuidv4} from 'uuid'

export default {
  name: 'ItemDialogRequestDetail',

  data () {
    return {
      /** 申請書の種類 */
      items: [
        {text: '休暇申請', value: 'paid_leave'},
        {text: '備品申請', value: 'equipment'},
      ],
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',
      /** 申請書の種類 */
      requestType: '',
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
      requestTypeRules: [
        v => v.trim().length > 0 || '申請書の種類は必須です',
      ],
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
    }),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (actionType, item) {
      this.show = true
      this.actionType = actionType
      this.resetForm(item)
    },

    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },

    /** 追加がクリックされたとき */
    async onClickAction () {
      if (this.actionType === 'add') {

        // 申請ルート情報をarray型に格納する
        // ↓ごちゃごちゃしてるのでキレイにする！
        const uid = uuidv4()
        const userId = this.getUserEmail()
        const requestType = this.requestType
        await this.fetchUserInfo({ userId })
        const department = this.userInfo.department
        await this.createArrayRoute({ requestType, department })
        const routes = this.getArrayRoute()[0]
        const arrayAddedStatus = []
        routes.approvers.forEach(element => {
          arrayAddedStatus.push({...element, status: '保留中'})
        })
        routes.approvers = arrayAddedStatus
        // ステップ数を格納する
        const currentStep = 1
        const maxStep = routes.approvers.length

        const item = {
          request: {
            title: this.title,
            status: '保留中',
            current_approver_email: routes.approvers[0].email,
            created_at: serverTimestamp(),
            email: this.userInfo.id,
            name: this.userInfo.name,
            department: this.userInfo.department
          },
          detail: {
            id: uid,
            title: this.title,
            status: '保留中',
            current_approver_email: routes.approvers[0].email,
            created_at: serverTimestamp(),
            email: this.userInfo.id,
            name: this.userInfo.name,
            department: this.userInfo.department,
            current_step: currentStep,
            max_step: maxStep,
            reason: this.reason,
            date: this.date,
            contact: this.contact,
            memo: this.memo,
            routes: routes,
            comments: []
          }
        }
        await this.batchAddSubCollectionsToUsers({ uid, userId, item })

        // to: 承認者メールアドレスをセットする
        const emailTo = routes.approvers[0].email
        // subject: 申請が否認された旨を題名に記載する
        const emailSubject = `申請が提出されました [${this.title}]`
        // body: 詳細画面へのリンクを記載する
        const detailPageUrl = `${window.location.href}others/requests/${uid}`
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
