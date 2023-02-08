<template>
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
            label="申請種別"
            v-model="formBind.common.request_type"
            :items="selectReqestType"
            :rules="requestTypeRules"
            :disabled="actionType == 'edit'"
            return-object
          />

          <v-text-field
            label="タイトル"
            v-model="formBind.common.title"
            :rules="titleRules"
          />

          <!-- 選択した申請書ごとに項目を出し分けする -->
          <!-- 休暇申請 -->
          <div v-if="formBind.common.request_type.value == 'paid_leave'">
            <v-textarea
              label="事由"
              v-model="formBind.unique.paid_leave.reason"
              :rules="reasonRules"
              rows="3"
            />

            <v-menu
              ref="menuDate"
              v-model="menuDate"
              :close-on-content-click="false"
              :return-value.sync="formBind.unique.paid_leave.date"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="formBind.unique.paid_leave.date"
                  label="日付"
                  readonly
                  v-on="on"
                  :rules="dateRules"
                />
              </template>
              <v-date-picker
                v-model="formBind.unique.paid_leave.date"
                type="date"
                color="primary"
                locale="ja-jp"
                no-title
                scrollable
                :day-format="date => new Date(date).getDate()"
              >
                <v-spacer/>
                <v-btn text color="grey" @click="menuDate = false">キャンセル</v-btn>
                <v-btn text color="primary" @click="$refs.menuDate.save(formBind.unique.paid_leave.date)">選択</v-btn>
              </v-date-picker>
            </v-menu>

            <v-radio-group
              v-model="formBind.unique.paid_leave.length"
              label="半日または終日"
              :rules="lengthRules"
            >
              <v-radio
                label="半日"
                value="half_day"
              />
              <v-radio
                label="終日"
                value="full_day"
              />
            </v-radio-group>

            <v-text-field
              label="緊急連絡先"
              v-model="formBind.unique.paid_leave.contact"
              :rules="contactRules"
            />

            <v-textarea
              label="備考"
              v-model="formBind.unique.paid_leave.memo"
              rows="3"
            />
          </div>

          <!-- 備品申請 -->
          <div v-else-if="formBind.common.request_type.value == 'equipment'">
            <v-textarea
              label="商品名"
              v-model="formBind.unique.equipment.item_name"
              :rules="itemNameRules"
              rows="3"
            />

            <v-textarea
              label="購入理由"
              v-model="formBind.unique.equipment.reason"
              :rules="reasonRules"
              rows="3"
            />

            <v-textarea
              label="備考"
              v-model="formBind.unique.equipment.memo"
              rows="3"
            />
          </div>

          <!-- ホスティング申請 -->
          <div v-else-if="formBind.common.request_type.value == 'hosting'">
            <v-text-field
              label="顧客名"
              v-model="formBind.unique.hosting.customer_name"
              :rules="customerNameRules"
            />

            <v-text-field
              label="ドメイン名"
              v-model="formBind.unique.hosting.domain_name"
              :rules="domainNameRules"
            />

            <v-select
              label="取得方法"
              v-model="formBind.unique.hosting.acquire_type"
              :items="selectAcquireType"
              :rules="acquireTypeRules"
              return-object
              :append-icon = "formBind.unique.hosting.acquire_type == '' ? 'mdi-menu-down' : 'mdi-close'"
              @click:append="clearAcquireType"
            />

            <!-- TODO: rakumoワークフローを参考に項目を追加していく -->
            <v-radio-group
              v-model="formBind.unique.hosting.acquire_date_radio"
              label="ドメイン取得日"
              :rules="acquireDateRadioRules"
            >
              <v-radio
                label="今すぐ"
                value="just_now"
                @click="formBind.unique.hosting.acquire_date_picker = ''"
              />
              <v-radio
                label="指定日あり"
                value="scheduled"
              />
            </v-radio-group>
            <v-menu
              ref="menuAcquireDatePicker"
              v-model="menuAcquireDatePicker"
              :close-on-content-click="false"
              :return-value.sync="formBind.unique.hosting.acquire_date_picker"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="formBind.unique.hosting.acquire_date_picker"
                  label="指定日を選択してください。"
                  readonly
                  v-on="on"
                  class="mt-0 pt-0"
                  :rules=[aquireDatePickerRules]
                  :disabled="formBind.unique.hosting.acquire_date_radio != 'scheduled'"
                />
              </template>
              <v-date-picker
                v-model="formBind.unique.hosting.acquire_date_picker"
                type="date"
                color="primary"
                locale="ja-jp"
                no-title
                scrollable
                :day-format="date => new Date(date).getDate()"
              >
                <v-spacer/>
                <v-btn text color="grey" @click="menuAcquireDatePicker = false">キャンセル</v-btn>
                <v-btn text color="primary" @click="$refs.menuAcquireDatePicker.save(formBind.unique.hosting.acquire_date_picker)">選択</v-btn>
              </v-date-picker>
            </v-menu>

            <v-select
              label="ドメイン移管申請"
              v-model="formBind.unique.hosting.transfer_request"
              :items="selectTransferRequest"
              return-object
              :append-icon = "formBind.unique.hosting.transfer_request == '' ? 'mdi-menu-down' : 'mdi-close'"
              @click:append="clearTransferRequest"
            />

            <v-radio-group
              v-model="formBind.unique.hosting.payment_type"
              label="支払方法"
              :rules="paymentTypeRules"
            >
              <v-radio
                label="月額"
                value="monthly"
              />
              <v-radio
                label="年間一括"
                value="anuually"
              />
            </v-radio-group>

            <v-text-field
              label="料金"
              v-model="formBind.unique.hosting.price"
              :rules="priceRules"
            />

            <v-checkbox
              label="今すぐホスティングを開始する"
              v-model="formBind.unique.hosting.start_hosting_immediately"
            />

            <v-menu
              ref="menuDnsTransferDatePicker"
              v-model="menuDnsTransferDatePicker"
              :close-on-content-click="false"
              :return-value.sync="formBind.unique.hosting.dns_transfer_date_picker"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="formBind.unique.hosting.dns_transfer_date_picker"
                  label="DNS切り替え日"
                  readonly
                  v-on="on"
                  class="mt-0 pt-0"
                />
              </template>
              <v-date-picker
                v-model="formBind.unique.hosting.dns_transfer_date_picker"
                type="date"
                color="primary"
                locale="ja-jp"
                no-title
                scrollable
                :day-format="date => new Date(date).getDate()"
              >
                <v-spacer/>
                <v-btn text color="grey" @click="menuDnsTransferDatePicker = false">キャンセル</v-btn>
                <v-btn text color="primary" @click="$refs.menuDnsTransferDatePicker.save(formBind.unique.hosting.dns_transfer_date_picker)">選択</v-btn>
              </v-date-picker>
            </v-menu>

            <v-text-field
              label="現在のホスティング会社"
              v-model="formBind.unique.hosting.current_hosting_service"
            />

            <v-menu
              ref="menuCancelOtherServiceDatePicker"
              v-model="menuCancelOtherServiceDatePicker"
              :close-on-content-click="false"
              :return-value.sync="formBind.unique.hosting.cancel_other_service_date_picker"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="formBind.unique.hosting.cancel_other_service_date_picker"
                  label="他社への解約依頼日"
                  readonly
                  v-on="on"
                  class="mt-0 pt-0"
                />
              </template>
              <v-date-picker
                v-model="formBind.unique.hosting.cancel_other_service_date_picker"
                type="date"
                color="primary"
                locale="ja-jp"
                no-title
                scrollable
                :day-format="date => new Date(date).getDate()"
              >
                <v-spacer/>
                <v-btn text color="grey" @click="menuCancelOtherServiceDatePicker = false">キャンセル</v-btn>
                <v-btn text color="primary" @click="$refs.menuCancelOtherServiceDatePicker.save(formBind.unique.hosting.cancel_other_service_date_picker)">選択</v-btn>
              </v-date-picker>
            </v-menu>

            <v-radio-group
              v-model="formBind.unique.hosting.payment_status"
              label="引落し状況"
              :rules="paymentStatusRules"
            >
              <v-radio
                label="初めての引落し"
                value="first_payment"
              />
              <v-radio
                label="当社で引落し歴あり"
                value="has_past_payment"
              />
            </v-radio-group>

            <v-select
              label="引落し開始月"
              v-model="formBind.unique.hosting.payment_start_month"
              :items="selectPaymentStartMonth"
              return-object
              :append-icon = "formBind.unique.hosting.payment_start_month == '' ? 'mdi-menu-down' : 'mdi-close'"
              @click:append="clearPaymentStartMonth"
            />

            <v-select
              label="現サイトデータの処遇"
              v-model="formBind.unique.hosting.site_data_handling"
              :items="selectSiteDataHandling"
              return-object
              :append-icon = "formBind.unique.hosting.site_data_handling == '' ? 'mdi-menu-down' : 'mdi-close'"
              @click:append="clearSiteDataHandling"
              :rules="siteDataHandlingRules"
            />

            <v-textarea
              label="備考"
              v-model="formBind.unique.hosting.memo"
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
import { mapState, mapActions, mapGetters } from 'vuex'
import { serverTimestamp } from '@firebase/firestore'
import { v4 as uuidv4} from 'uuid'

export default {
  name: 'ItemDialogRequests',

  data () {
    return {
      /** 申請種別 */
      selectReqestType: [
        {text: '休暇申請', value: 'paid_leave'},
        {text: '備品申請', value: 'equipment'},
        {text: 'ホスティング申請', value: 'hosting'},
      ],
      /** ドメイン名取得方法 */
      selectAcquireType: [
        {text: '当社で新規取得', value: 'new_domain_name_with_us'},
        {text: '当社で取得済み', value: 'exist_domain_name_with_us'},
        {text: '他社からの移管', value: 'domain_transfer_to_us'},
        {text: 'ホスティングのみ当社', value: 'only_hosting_with_us'},
      ],
      /** ドメイン名取得方法 */
      selectTransferRequest: [
        {text: '申請済み', value: 'requested'},
        {text: '未 (客先で申請)', value: 'not_done_by_customer'},
        {text: '未 (当社で申請)', value: 'not_done_by_us'},
      ],
      /** 引落し開始月 */
      selectPaymentStartMonth: [
        {text: '1月', value: 'january'},
        {text: '2月', value: 'february'},
        {text: '3月', value: 'march'},
        {text: '4月', value: 'april'},
        {text: '5月', value: 'may'},
        {text: '6月', value: 'june'},
        {text: '7月', value: 'july'},
        {text: '8月', value: 'august'},
        {text: '9月', value: 'september'},
        {text: '10月', value: 'october'},
        {text: '11月', value: 'november'},
        {text: '12月', value: 'december'},
      ],
        /** 現サイトデータの処遇 */
        selectSiteDataHandling: [
          {text: '移動する (他社制作の場合は要相談)', value: 'required_transfer'},
          {text: '移動しない (新規のため)', value: 'no_transfer_cause_new_customer'},
          {text: '移動しない (データも不要)', value: 'no_transfer_cause_data_unnecessary'},
          {text: '移動しない (データは保管/要相談)', value: 'no_transfer_but_keep_data'},
        ],
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menuDate: false,
      menuAcquireDatePicker: false,
      menuDnsTransferDatePicker: false,
      menuCancelOtherServiceDatePicker: false,
      /** 操作タイプ 'add' or 'edit' */
      actionType: 'add',

      /** フォームのバインディング */
      formBind: {
        common: {
          request_type: {
            text: '',
            value: ''
          },
          current_step: '',
          max_step: '',
          status: '',
          current_approver_email: '',
          created_at: '',
          email: '',
          name: '',
          department: '',
          title: '',
          routes: {
            approvers: [],
            // readers: []
          },
          comments: []
        },
        unique: {
          paid_leave: {
            reason: '',
            date: '',
            length: '',
            contact: '',
            memo: ''
          },
          equipment: {
            item_name: '',
            reason: '',
            memo: ''
          },
          hosting: {
            customer_name: '',
            domain_name: '',
            acquire_type: '',
            acquire_date_radio: '',
            acquire_date_picker: '',
            transfer_request: '',
            payment_type: '',
            price: '',
            start_hosting_immediately: '',
            dns_transfer_date_picker: '',
            current_hosting_service: '',
            cancel_other_service_date_picker: '',
            payment_status: '',
            payment_start_month: '',
            site_data_handling: '',
            memo: ''
          },
        },
      },

      /** バリデーションルール
       * 共通
       */
      requestTypeRules: [
        v => Object.keys(v).length > 0 || '申請種別は必須です',
      ],
      titleRules: [
        v => v.trim().length > 0 || 'タイトルは必須です',
      ],
      /** 休暇申請 */
      reasonRules: [
        v => v.trim().length > 0 || '事由は必須です',
      ],
      dateRules: [
        v => v.trim().length > 0 || '日付は必須です',
      ],
      lengthRules: [
        v => v.trim().length > 0 || '長さは必須です',
      ],
      contactRules: [
        v => v.trim().length > 0 || '緊急連絡先は必須です',
      ],
      /** 備品申請 */
      itemNameRules: [
        v => v.trim().length > 0 || '商品名は必須です',
      ],
      /** ホスティング申請 */
      customerNameRules: [
        v => v.trim().length > 0 || '顧客名は必須です',
      ],
      domainNameRules: [
        v => v.trim().length > 0 || 'ドメイン名は必須です',
      ],
      acquireTypeRules: [
        v => Object.keys(v).length > 0 || '取得方法は必須です',
      ],
      acquireDateRadioRules: [
        v => v.trim().length > 0 || 'ドメイン取得日は必須です',
      ],
      paymentTypeRules: [
        v => v.trim().length > 0 || '支払方法は必須です',
      ],
      priceRules: [
        v => v.trim().length > 0 || '料金は必須です',
      ],
      paymentStatusRules: [
        v => v.trim().length > 0 || '引落し状況は必須です',
      ],
      siteDataHandlingRules: [
        v => Object.keys(v).length > 0 || '現サイトデータの処遇は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      userInfo: state => state.firestore.userInfo
    }),


    /** バリデーションルール
     *  ホスティング申請
     */
    aquireDatePickerRules () {
      const acquireDateRadio = this.formBind.unique.hosting.acquire_date_radio
      if (acquireDateRadio == 'just_now') {
        return true
      } else {
        const acquireDatePicker = this.formBind.unique.hosting.acquire_date_picker
        const rules = acquireDatePicker.trim().length > 0
        return rules || 'ドメイン取得日は必須です'
      }
    },

    /** ダイアログのタイトル */
    titleText () {
      return this.actionType === 'add' ? 'データ追加' : 'データ編集'
    },
    /** ダイアログのアクション */
    actionText () {
      return this.actionType === 'add' ? '追加' : '更新'
    },
  },

  methods: {
    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
      getArrayRoute: 'firestore/getArrayRoute',
    }),

    ...mapActions({
      addDocumentAsSubCollection: 'firestore/addDocumentAsSubCollection',
      updateDocumentInSubCollection: 'firestore/updateDocumentInSubCollection',
      fetchUserInfo: 'firestore/fetchUserInfo',
      createArrayRoute: 'firestore/createArrayRoute',
      sendEmail: 'firestore/sendEmail',
    }),

    /**
     * ダイアログを表示する。
     * このメソッドは親から呼び出される。
     */
    open (actionType, item = {}) {
      this.show = true
      this.actionType = actionType
      this.resetForm(item)
    },

    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },

    /** 追加がクリックされたとき */
    async onClickAction () {
      if (this.actionType === 'add') {
        const uid = uuidv4()
        const userId = this.getUserEmail()
        const item = await this.createItem(uid, userId)
        await this.addDocumentAsSubCollection({ uid, userId, item })
        this.show = false
        const nextApproverEmail = item.common.current_approver_email
        this.notifyToApprover(nextApproverEmail, item)
      } else {
        const userId = this.getUserEmail()
        const docId = this.formBind.id
        const item = this.updateItem()
        console.log(item)
        await this.updateDocumentInSubCollection({ userId, docId, item })
        this.show = false
        // 親コンポーネントにitemを渡してフォームを最新の状態にする
        this.$emit('submitEdit', item)
        // 親コンポーネントに「submitOnClickAction」イベントを渡し、notifyToApproverメソッドを発火させる
        const nextApproverEmail = item.common.routes.approvers[0].email
        this.$emit('submitOnClickAction', nextApproverEmail)
      }
    },

    // 承認者にメール通知する (追加時のみ呼び出される)
    notifyToApprover(nextApproverEmail, item) {
      const emailTo = nextApproverEmail
      const emailSubject = `[承認依頼] [${item.common.title}]`
      const detailPageUrl = `${window.location.href}others/requests/${item.id}`
      const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
      const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
      this.sendEmail({ emailConfig })
    },

    /** actionType == 'edit'時にitemを更新する */
    updateItem() {
      // itemをフォームに入力された内容に置き換える
      const item = this.formBind

      // 差戻しされた申請を修正した後に手動でリセットすべき項目を置き換える
      // common:
      // current_approver_email
      item.common.current_approver_email = item.common.routes.approvers[0].email

      // current_step
      item.common.current_step = 1

      // status
      item.common.status = '保留中'

      // routes.approvers.status
      item.common.routes.approvers.forEach(
        element => {
          element.status = '保留中'
        }
      )

      return item
    },

    /** actionType == 'add'時にitemを作成する */
    async createItem(uid, userId) {
        // プルダウンで選択された申請種別のvalueを変数へ格納
        const requestTypeValue = this.formBind.common.request_type.value

        // 申請者のユーザー情報を取得
        await this.fetchUserInfo({ userId })

        // 所属部署を変数へ格納
        const department = this.userInfo.department

        // TODO: 以下の2文は、「fetchRoutes」という新たなActionsにまとめても良いかも
        // 申請種別と所属部署を引数として、stateに申請経路情報を生成する
        await this.createArrayRoute({ requestTypeValue, department })
        // getters経由で申請経路情報を取得し、変数へ格納する
        const routes = this.getArrayRoute()[0]

        // 取得した申請経路情報には、各申請のステータス情報が含まれていないため、フロント側で付加しておく
        const arrayAddedStatus = []
        routes.approvers.forEach(element => {
          arrayAddedStatus.push({...element, status: '保留中'})
          routes.approvers = arrayAddedStatus
        })

        // ステップ数を格納する
        const currentStep = 1
        const maxStep = routes.approvers.length

        // 申請種別に固有の情報を生成する
        const createUniqueItem = (requestTypeValue) => {
          switch(requestTypeValue) {
            case 'paid_leave': {
              const uniqueItem = {
                paid_leave: {
                  reason: this.formBind.unique.paid_leave.reason,
                  date: this.formBind.unique.paid_leave.date,
                  length: this.formBind.unique.paid_leave.length,
                  contact: this.formBind.unique.paid_leave.contact,
                  memo: this.formBind.unique.paid_leave.memo
                }
              }
              return uniqueItem
            }
            case 'equipment': {
              const uniqueItem = {
                equipment: {
                  item_name: this.formBind.unique.equipment.item_name,
                  reason: this.formBind.unique.equipment.reason,
                  memo: this.formBind.unique.equipment.memo
                }
              }
              return uniqueItem
            }
          }
        }
        const uniqueItem = createUniqueItem(requestTypeValue)

        const item = {
          id: uid,
          common: {
            request_type: this.formBind.common.request_type,
            current_step: currentStep,
            max_step: maxStep,
            status: '保留中',
            current_approver_email: routes.approvers[0].email,
            created_at: serverTimestamp(),
            email: this.userInfo.id,
            name: this.userInfo.name,
            department: this.userInfo.department,
            title: this.formBind.common.title,

            routes: {
                approvers: routes.approvers,
                // readers: routes.readers ?? ''
              },

            comments: []
          },

          unique: {
            ...uniqueItem
          }
        }

        return item
    } ,

    /** フォームの内容を初期化します */
    resetForm (item) {
      if (this.actionType == 'edit') {
        // 現状は参照渡しでitemを渡している
        // this.formBind = item
        // RequestDetail.vue > created() でObject.assignを使うと画面が白く表示されてしまうため、
        // 本メソッド内でitemをディープコピーしている
        this.formBind = JSON.parse(JSON.stringify(item))
        this.formBind.common.created_at = item.common.created_at
      } else {
        //this.formBind.common配下のプロパティに空値をセットする
        // キーを取得する
        const commonPorpKeys = Object.keys(this.formBind.common)
        // キーの数の分だけ、空値をセットする処理を繰り返す
        commonPorpKeys.forEach(key => {
          this.formBind.common[key] = ''
        })

        //this.formBind.unique.[申請種別]配下のプロパティに空値をセットする
        // 申請種別キーを取得する
        const uniquePropRequestTypeKeys = Object.keys(this.formBind.unique)
        // 申請種別キーの数の分だけ、ネストされた処理を繰り返す
        uniquePropRequestTypeKeys.forEach(requestTypeKey => {
          // 項目名キーを取得する
          const uniquePropItemNameKeys = Object.keys(this.formBind.unique[requestTypeKey])
          // 項目名キーの数の分だけ、空値をセットする処理を繰り返す
          uniquePropItemNameKeys.forEach(itemNameKey => {
            this.formBind.unique[requestTypeKey][itemNameKey] = ''
          })
        })
      }

      this.$refs.form.resetValidation()
    },

    /** ホスティング申請 選択状態を解除する */
    clearAcquireType() {
      this.formBind.unique.hosting.acquire_type = ''
    },
    clearTransferRequest() {
      this.formBind.unique.hosting.transfer_request = ''
    },
    clearPaymentStartMonth() {
      this.formBind.unique.hosting.payment_start_month = ''
    },
    clearSiteDataHandling() {
      this.formBind.unique.hosting.site_data_handling = ''
    },

    createEmailBody(emailSubject, detailPageUrl) {
      const emailBody =
        `${emailSubject}<br><br>詳細は下記リンクからご確認ください。<br><br><a href="${detailPageUrl}">${detailPageUrl}</a>`
      return emailBody
    },

  }
}
</script>
