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
          <!-- 部署
            * :items => state(オブジェクト)を指定する
            * item-text => ラベルとして表示させるオブジェクトのプロパティ名を指定する
            * item-text => 値として送信するオブジェクトのプロパティ名を指定する
          -->
          <v-select
            label="部署"
            v-model="department"
            :rules="departmentRules"
            :items="departments"
            item-text="department"
            item-value="department"
          />

          <!-- メールアドレス -->
          <v-text-field
            label="メールアドレス"
            v-model="email"
            :rules="emailRules"
            :readonly="actionType=='edit'"
          />

          <!-- 氏名 -->
          <v-text-field
            label="氏名"
            v-model="name"
            :rules="nameRules"
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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ItemDialogUsers',

  data () {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'users',
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
      /** メールアドレス */
      email: '',
      /** 氏名 */
      name: '',

      /** バリデーションルール */
      departmentRules: [
        v => v.trim().length > 0 || '部署は必須です',
      ],
      emailRules: [
        v => v.trim().length > 0 || 'メールアドレスは必須です',
        v => v.trim().length <= 32 || 'メールアドレスは32文字以内で入力してください',
      ],
      nameRules: [
        v => v.trim().length > 0 || '氏名は必須です',
        v => v.trim().length <= 32 || '氏名は32文字以内で入力してください',
      ],
    }
  },

  computed: {
    ...mapState({
      departments: state => state.firestore.departments,
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
        addDocumentWithTextId: 'firestore/addDocumentWithTextId',
        updateDocument: 'firestore/updateDocument',
        fetchAllCollections: 'firestore/fetchAllCollections',
      }
    ),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (actionType, item) {
      this.show = true
      this.actionType = actionType
      this.getDepartments()
      this.resetForm(item)
    },

    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },

    /** 追加／更新がクリックされたとき */
    async onClickAction () {
      const item = {
        id: this.email,
        department: this.department,
        name: this.name,
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
      this.department = item.department || ''
      this.email = item.id || ''
      this.name = item.name || ''

      this.$refs.form.resetValidation()
    },

    /** 部署情報を取得する */
    async getDepartments() {
      const currentTableName = 'departments'
      await this.fetchAllCollections({ currentTableName })
    }
  },

}
</script>
