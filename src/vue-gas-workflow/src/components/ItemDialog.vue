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
          <!-- 事由 -->
          <v-textarea
            label="事由"
            v-model="reason"
            :reles="reasonRules"
          />

          <!-- 予定日時 -->
          <v-textarea
            label="予定日時"
            v-model="date_between"
            :reles="dateBetweenRules"
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
          />

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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ItemDialog',

  data () {
    return {
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',
      /** 事由 */
      reason: '',
      /** 予定日時 */
      date_between: '',
      /** 緊急連絡先 */
      contact: '',
      /** 備考 */
      memo: '',

      /** バリデーションルール */
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
      loading: state => state.loading.add || state.loading.update
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
    ...mapActions([
      /** 申請記録を作成 */
      'addPaidLeaveData'
    ]),

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
      const item = {
        id: 1,                  // 既存レコードをもとに連番を生成する処理を追加する
        recipient_name: 'テストイチロウ',  // ログイン情報をもとに氏名を取得する処理を追加する
        department: 'テスト部',           // 同上
        reason: this.reason,
        date_between: this.date_between,
        contact: this.contact,
        memo: this.memo,
        status: '承認中',                  // 作成時は［承認中］をセットする
        created_at: '',
      }

      await this.addPaidLeaveData({ item })

      this.show = false
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.reason = item.reason || ''
      this.date_between = item.date_between || ''
      this.contact = item.contact || ''
      this.memo = item.memo || ''

      this.$refs.form.resetValidation()
    }
  }
}
</script>
