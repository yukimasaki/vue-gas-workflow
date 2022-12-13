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
          <!-- 承認者テーブルにデータを追加するためのフォーム
               プルダウンメニューで「氏名(メールアドレス)」を選択すると、
               v-model:userInfoにオブジェクトが代入される。
           -->
          <v-select
            label="管理者"
            v-model="userInfo"
            :items="users"
            :item-text="users => `${users.name} (${users.id})`"
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
  name: 'ItemDialogAdmins',

  data () {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'admins',
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',

      userInfo: '',
      id: '',
      email: '',
      name: '',
    }
  },

  computed: {
    ...mapState({
      users: state => state.firestore.users,
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
        addDocumentWithTextId: 'firestore/addDocumentWithTextId',
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
      this.getUsers()
      this.resetForm(item)
    },

    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },

    /** 追加／更新がクリックされたとき */
    async onClickAction () {
      const item = {
        id: this.userInfo.id,
        name: this.userInfo.name,
      }
      const currentTableName = this.currentTableName

      if (this.actionType === 'add') {
        await this.addDocumentWithTextId({ item, currentTableName })
      } else {
        await this.updateDocument({ item, currentTableName })
      }

      this.show = false
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.userInfo = { name: item.name, email: item.email } || ''

      this.$refs.form.resetValidation()
    },

    /** プルダウンメニュー用 従業員情報を取得する */
    async getUsers() {
      const currentTableName = 'users'
      await this.fetchAllCollections({ currentTableName })
    },

  }
}
</script>
