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

          <!-- 順序 -->
          <v-text-field
            type="number"
            label="順序"
            v-model="order"
            min="1"
            max="10"
            :rules="orderRules"
          />

          <!-- 従業員 -->
          <v-select
            label="従業員"
            v-model="employeeInfo"
            :items="employees"
            :item-text="employees => `${employees.name} (${employees.email})`"
            :rules="employeeRules"
            return-object
          />

          <!-- 役割 -->
          <v-select
            label="役割"
            v-model="role"
            :items="roles"
            :rules="roleRules"
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
  name: 'ItemDialogRoute',

  data () {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'paid_leave_routes',
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
      /** 部署 */
      department: '',
      /** 順序 */
      order: '',
      /** 従業員 */
      employeeInfo: '',
      /** 役割 */
      role: '',
      roles: ['承認', '回覧'],

      /** バリデーションルール */
      departmentRules: [
        v => v.trim().length > 0 || '部署は必須です',
      ],
      orderRules: [
        v => v.trim().length > 0 || '順序は必須です',
        v => Number.isInteger(Number(v)) || '整数で入力してください',
        v => Number(v) >= 1 && Number(v) <= 10 || '1～10までの整数を入力してください',
      ],
      employeeRules: [
        v => !!v || '従業員は必須です',
      ],
      roleRules: [
        v => v.trim().length > 0 || '役割は必須です',
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
    }
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
        department: this.department,
        order: this.order,
        email: this.employeeInfo.email,
        name: this.employeeInfo.name,
        role: this.role,
        request_type: this.currentTabName,
      }
      const currentTableName = this.currentTableName

      if (this.actionType === 'add') {
        await this.addCollection({ item, currentTableName })
      } else {
        await this.updateCollection({ item, currentTableName })
      }

      this.show = false
    },

    /** フォームの内容を初期化します */
    resetForm (item = {}) {
      this.department = item.department || ''
      this.order = item.order || ''
      this.employee = `${item.name} (${item.email})` || ''
      this.role = item.role || ''

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
