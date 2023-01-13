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

            <v-textarea
              label="予定日時"
              v-model="formBind.unique.paid_leave.date"
              :rules="dateRules"
              rows="3"
            />

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
      ],
      /** ダイアログの表示状態 */
      show: false,
      /** 入力したデータが有効かどうか */
      valid: false,
      /** 日付選択メニューの表示状態 */
      menu: false,
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
            contact: '',
            memo: ''
          },
          equipment: {
            item_name: '',
            reason: '',
            memo: ''
          },
        },
      },

      /** バリデーションルール */
      requestTypeRules: [
        // v => v != '' || '申請種別は必須です',
      ],
      titleRules: [
        v => v.trim().length > 0 || 'タイトルは必須です',
      ],
      reasonRules: [
        v => v.trim().length > 0 || '事由は必須です',
      ],
      dateRules: [
        v => v.trim().length > 0 || '予定日時は必須です',
      ],
      contactRules: [
        v => v.trim().length > 0 || '緊急連絡先は必須です',
      ],
      itemNameRules: [
        v => v.trim().length > 0 || '商品名は必須です',
      ],
    }
  },

  computed: {
    ...mapState({
      userInfo: state => state.firestore.userInfo
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

        // // to: 承認者メールアドレスをセットする
        // const emailTo = routes.approvers[0].email
        // // subject: 申請が否認された旨を題名に記載する
        // const emailSubject = `[承認依頼] [${this.title}]`
        // // body: 詳細画面へのリンクを記載する
        // const detailPageUrl = `${window.location.href}others/requests/${uid}`
        // const emailBody = this.createEmailBody(emailSubject, detailPageUrl)
        // // メール送信
        // const emailConfig = { to: emailTo, subject: emailSubject, body: emailBody }
        // await this.sendEmail({ emailConfig })

        this.show = false
      } else {
        // 入力内容に変化がない場合は更新ボタンを非活性にしたい

        const userId = this.getUserEmail()
        const docId = this.formBind.id
        const item = this.updateItem()
        console.log(item)
        await this.updateDocumentInSubCollection({ userId, docId, item })
        this.show = false
      }
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

    createEmailBody(emailSubject, detailPageUrl) {
      const emailBody =
        `${emailSubject}<br><br>詳細は下記リンクからご確認ください。<br><br><a href="${detailPageUrl}">${detailPageUrl}</a>`
      return emailBody
    },

  }
}
</script>
