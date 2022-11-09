<template>
  <!-- データ追加／編集ダイアログ -->
  <v-dialog
    v-model="show"
    scrollable
    persistent
    max-width="700px"
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
            * item-value => 値として送信するオブジェクトのプロパティ名を指定する
          -->
          <v-select
            label="部署"
            v-model="department"
            :rules="departmentRules"
            :items="departments"
            item-text="department"
            item-value="department"
          />

          <!-- タイトル -->
          <v-text-field
            label="タイトル"
            v-model="title"
            :rules="titleRules"
          />

          <!-- 承認者数 -->
          <v-text-field
            label="承認者数"
            v-model="approvers.length"
            :rules="numberOfApproversRules"
            readonly
          />

          <v-data-table
            class="text-no-wrap"
            :headers="tableHeaders"
            :items="approvers"
            :footer-props="footerProps"
            :loading="loading"
            :sort-by="['order']"
            :sort-desc="[false]"
            :items-per-page="30"
            mobile-breakpoint="0"
            hide-default-footer
          >

            <!-- 操作列 -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon @click="deleteApprover(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>

          <!-- 承認者テーブルにデータを追加するためのフォーム -->
          <!-- 従業員 -->
          <v-select
            label="承認者"
            v-model="employeeInfo"
            :items="employees"
            :item-text="employees => `${employees.name} (${employees.email})`"
            return-object
          />
          <v-spacer/>
          <!-- 追加ボタン -->
          <v-btn
            color="blue darken-1"
            text
            :disabled="!employeeInfo.email"
            :loading="loading"
            @click="addApprover"
          >追加</v-btn>
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
  name: 'ItemDialogRoute',

  data () {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'routes',
      /** 操作対象のタブ */
      currentTabName: '',
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
      /** タイトル */
      title: '',
      /** 従業員 */
      employeeInfo: '',
      /** 承認者数 */
      numberOfApprovers: '',

      /** test */
      approvers: [],
      readers: [],

      /** バリデーションルール */
      departmentRules: [
        v => v.trim().length > 0 || '部署は必須です',
      ],
      titleRules: [
        v => v.trim().length > 0 || 'タイトルは必須です',
      ],
      numberOfApproversRules: [
        v => v > 0 || '承認者は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      loading: state => state.workflow.loading.add || state.workflow.loading.update,
      departments: state => state.firestore.departments,
      employees: state => state.firestore.employees,
    }),

    /** ダイアログのタイトル */
    titleText () {
      return this.actionType === 'add' ? 'データ追加' : 'データ編集'
    },

    /** ダイアログのアクション */
    actionText () {
      return this.actionType === 'add' ? '追加' : '更新'
    },

    /** テーブルのヘッダー設定 */
    tableHeaders () {
      return [
        { text: '順序', value: 'order', sortable: false },
        { text: 'メールアドレス', value: 'email', sortable: false },
        { text: '氏名', value: 'name', sortable: false },
        { text: '操作', value: 'actions', sortable: false },
      ]
    },

    /** テーブルのフッター設定 */
    footerProps () {
      return { itemsPerPageText: '', itemsPerPageOptions: [30, -1] }
    },
  },

  methods: {
    ...mapActions(
      {
        addCollection: 'firestore/addCollection',
        updateCollection: 'firestore/updateCollection',
        fetchAllCollections: 'firestore/fetchAllCollections',
      }
    ),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (actionType, item, currentTabName) {
      this.show = true
      this.actionType = actionType
      this.currentTabName = currentTabName
      this.getDepartments()
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
        request_type: this.currentTabName,
        department: this.department,
        title: this.title,
        approvers: this.approvers,
        // readers: this.readers
      }

      const currentTableName = this.currentTableName

      if (this.actionType === 'add') {
        await this.addCollection({ item, currentTableName })
      } else {
        await this.updateCollection({ item, currentTableName })
      }

      this.show = false
    },

    /** 承認者追加ボタンがクリックされたとき */
    addApprover () {
      const approvers = {
        order: this.approvers.length + 1,
        email: this.employeeInfo.email,
        name: this.employeeInfo.name,
      }

      /** テーブルに追加 */
      this.approvers.push(approvers)

      /** プルダウンメニューをクリア */
      this.employeeInfo = []
    },

    /** 承認者削除ボタンがクリックされたとき */
    deleteApprover(item) {
      const list = this.approvers
      const index = list.indexOf(item)
      list.splice(index, 1)
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.id = item.id || ''
      this.department = item.department || ''
      this.title = item.title || ''
      this.approvers = item.approvers || []
      this.readers = item.readers || []

      this.$refs.form.resetValidation()
    },

    /** プルダウンメニュー用 部署情報を取得する */
    async getDepartments() {
      const currentTableName = 'departments'
      await this.fetchAllCollections({ currentTableName })
    },

    /** プルダウンメニュー用 従業員情報を取得する */
    async getEmployees() {
      const currentTableName = 'employees'
      await this.fetchAllCollections({ currentTableName })
    },

  }
}
</script>
