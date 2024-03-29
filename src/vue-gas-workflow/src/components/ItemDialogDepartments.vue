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
          <!-- 部署 -->
          <v-text-field
            label="部署"
            v-model="department"
            :rules="departmentRules"
          />

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
          color="primary"
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
import { mapActions } from 'vuex'

export default {
  name: 'ItemDialogDepartments',

  data () {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'departments',
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',
      /** ID */
      id: '',
      /** 部署 */
      department: '',

      /** バリデーションルール */
      departmentRules: [
        v => v.trim().length > 0 || '部署は必須です',
        v => v.length <= 32 || '32文字以内で入力してください'
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
    ...mapActions(
      {
        addDocument: 'firestore/addDocument',
        updateDocument: 'firestore/updateDocument'
      }
    ),

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
        id: this.id,
        department: this.department,
      }
      const currentTableName = this.currentTableName

      if (this.actionType === 'add') {
        await this.addDocument({ item, currentTableName })
      } else {
        await this.updateDocument({ item, currentTableName })
      }

      this.show = false
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.department = item.department || ''

      this.$refs.form.resetValidation()
    }
  }
}
</script>
