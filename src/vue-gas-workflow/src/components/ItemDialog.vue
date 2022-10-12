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
            :reles="[reasonRules]"
          />

          <!-- 予定日時 -->
          <v-textarea
            label="予定日時"
            v-model="date_between"
            :reles="[dateBetweenRules]"
          />

          <!-- 緊急連絡先 -->
          <v-text-field
            label="緊急連絡先"
            v-model="contact"
            :rules="[contactRule]"
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
      /** ローディング状態 */
      loading: false,
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
    onClickAction () {
      // あとで実装
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
