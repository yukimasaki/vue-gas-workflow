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
          <v-select
            label="管理者"
            v-model="employeeInfo"
            :items="employees"
            :item-text="employees => `${employees.name} (${employees.email})`"
            return-object
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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ItemDialogAdmin',

  data () {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'administrators',
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',

      employeeInfo: '',
      id: '',
      email: '',
      name: '',

      /** バリデーションルール */
      employeeInfoRules: [
        v => v.trim().length > 0 || '管理者は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      employees: state => state.firestore.employees,
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
    ...mapActions(
      {
        fetchAllCollections: 'firestore/fetchAllCollections',
        addDocument: 'firestore/addDocument',
        updateDocument: 'firestore/updateDocument',
      }
    ),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (actionType, item) {
      this.show = true
      this.actionType = actionType
      this.getEmployees()
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
        email: this.employeeInfo.email,
        name: this.employeeInfo.name,
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
      this.employeeInfo = {email: item.email, name: item.name} || ''

      this.$refs.form.resetValidation()
    },

    /** プルダウンメニュー用 従業員情報を取得する */
    async getEmployees() {
      const currentTableName = 'employees'
      await this.fetchAllCollections({ currentTableName })
    },

  }
}
</script>
