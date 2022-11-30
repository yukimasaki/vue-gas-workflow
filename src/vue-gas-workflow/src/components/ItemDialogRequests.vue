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
              v-model="date_between"
              :rules="dateBetweenRules"
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
          :disabled="loading"
          @click="onClickClose"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          :disabled="!valid"
          :loading="loading"
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

export default {
  name: 'ItemDialogRequests',

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
      date_between: '',
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
      dateBetweenRules: [
        v => v.trim().length > 0 || '予定日時は必須です',
      ],
      contactRules: [
        v => v.trim().length > 0 || '緊急連絡先は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      /** ローディング状態 */
      loading: state => state.workflow.loading.add || state.workflow.loading.update,
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
    }),

    ...mapActions({
      batchAddSubCollectionsToUsers: 'firestore/batchAddSubCollectionsToUsers',
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

    /** 追加／更新がクリックされたとき */
    async onClickAction () {
      if (this.actionType === 'add') {

        const userId = this.getUserEmail()
        const item = {
          request: {
            title: '12/24終日',
            status: '保留中',
            current_approver_email: 'test@example.com',
            created_at: serverTimestamp()
          },
          detail: {
            current_step: 1,
            max_step: 3,
            reason: '私用のため',
            date: '2022/12/24',
            contact: '080-1111-2222',
            memo: 'よろしくお願いします。',
            routes: ['route1', 'route2', 'route3'],
            comments: ['comment1', 'comment2', 'comment3']
          }
        }
        await this.batchAddSubCollectionsToUsers({ userId, item })

        this.show = false
      }
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.title = item.title || ''
      this.reason = item.reason || ''
      this.date_between = item.date_between || ''
      this.contact = item.contact || ''
      this.memo = item.memo || ''

      this.$refs.form.resetValidation()
    },

  }
}
</script>
