<template>
  <div>
    <!-- 申請状況 -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card >
          <v-stepper v-model="currentStep" alt-labels>
            <v-stepper-header>
              <template v-for="( n, index ) in steps">
                <v-stepper-step
                  :key="`${n}-step`"
                  :complete="currentStep > n"
                  :step="n" >
                  {{ routes.approvers[index].name }}
                  <small class="mt-1">{{ routes.approvers[index].role }}</small>
                </v-stepper-step>
                <v-divider :key="`${n}-divider`" v-if="routes.approvers[index].order < routes.approvers.length" />
              </template>
            </v-stepper-header>
          </v-stepper>
        </v-card>
      </v-col>
    </v-row>

    <!-- 申請詳細 -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card>
          <v-card-text>
            <v-form readonly>
              <v-text-field
                label="タイトル"
                v-model="title"
              />

              <v-text-field
                label="作成日時"
                v-model="created_at"
              />

              <v-text-field
                label="申請者"
                v-model="recipient.name"
              />

              <v-text-field
                label="メールアドレス"
                v-model="recipient.email"
              />

              <v-text-field
                label="部署"
                v-model="recipient.department"
              />

              <v-text-field
                label="事由"
                v-model="detail.reason"
              />

              <v-text-field
                label="予定日時"
                v-model="detail.date_between"
              />

              <v-text-field
                label="緊急連絡先"
                v-model="detail.contact"
              />

              <v-text-field
                label="備考"
                v-model="detail.memo"
              />

            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 承認・否認等のボタン -->
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
          <v-card>
            <v-card-actions class="justify-center">
              <v-btn class="mx-2" color="green" :dark="isDisabledApproveBtn? false : true" @click="onClickApprove" :disabled="isDisabledApproveBtn">承認</v-btn>
              <v-btn class="mx-2" color="green" dark @click="onClickDisapprove">否認</v-btn>
              <v-btn class="mx-2" color="green" dark @click="onClickRemand">差戻し</v-btn>
            </v-card-actions>
          </v-card>

      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'RequestDetail',

  data() {
    return {
      /** 操作対象のテーブル */
      currentTableName: 'request_details',
      /** stateのデータを受け取って格納する */
      data: {},
      /** フォームに表示するデータを格納 */
      title: '',
      status: '',
      created_at: '',
      recipient: {},
      detail: {},
      routes: [],
      /** ステップの制御に使用 */
      steps: 1,
      currentStep: '',
      maxStep: '',
    }
  },

  computed: {
    ...mapState({
      request_details: state => state.firestore.request_details,
    }),

    /** 各種ボタンの表示/非表示ルール */
    isDisabledApproveBtn() {
      return this.currentStep > this.maxStep ? true : false
    },
  },

  methods: {
    ...mapActions({
      fetchCollectionsByOneQuery: 'firestore/fetchCollectionsByOneQuery'
    }),

    async fetchRequestDetail() {
      const currentTableName = this.currentTableName
      const customQuery = {
        field: 'snippet_ref',
        compare: '==',
        value: this.$route.params.id
      }

      await this.fetchCollectionsByOneQuery({ currentTableName, customQuery })
      this.data = this.request_details[0]
    },

    dateToStr24HPad0(date, format) {
        if (!format) {
            format = 'YYYY/MM/DD hh:mm'
        }
        format = format.replace(/YYYY/g, date.getFullYear())
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2))
        format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2))
        format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2))
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2))
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2))
        return format
    },

    formatDate() {
      const date = this.data.created_at.toDate()
      this.data.created_at = this.dateToStr24HPad0(date)
    },

    setData() {
      this.title = this.data.title
      this.status = this.data.status
      this.created_at = this.data.created_at
      this.recipient = this.data.recipient
      this.detail = this.data.detail
      this.routes = this.data.route
      this.currentStep = this.data.current_step
      this.maxStep = this.data.max_step
    },

    setSteps() {
      this.steps = this.routes.approvers.length
    },

    onClickApprove() {
      if (this.currentStep <= this.maxStep) {
        this.currentStep++
      }
    },

    onClickDisapprove() {},

    onClickRemand() {},

    onClickRead() {},
  },

  async created() {
    await this.fetchRequestDetail()
    await this.formatDate()
    await this.setData()
    this.setSteps()
  },
}
</script>
