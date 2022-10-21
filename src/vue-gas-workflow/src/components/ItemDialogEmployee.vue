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

          <!-- メールアドレス -->
          <v-text-field
            label="メールアドレス"
            v-model="email"
            :reles="emailRules"
          />

          <!-- 氏名 -->
          <v-text-field
            label="氏名"
            v-model="name"
            :reles="nameRules"
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
  name: 'ItemDialogEmployee',

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
      ],
      nameRules: [
        v => v.trim().length > 0 || '氏名は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      /** ローディング状態 */
      loading: state => state.workflow.loading.add || state.workflow.loading.update
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
        addCollection: 'firestore/addCollection',
        updateCollection: 'firestore/updateCollection'
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
      const tableName = 'employees'

      const item = {
        id: this.id,
        department: this.department,
        email: this.email,
        name: this.name,
      }

      if (this.actionType === 'add') {
        await this.addCollection({ tableName, item })
      } else {
        await this.updateCollection({ tableName, item })
      }

      this.show = false
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.department = item.department || ''
      this.email = item.email || ''
      this.name = item.name || ''

      this.$refs.form.resetValidation()
    }
  }
}
</script>
