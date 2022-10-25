<template>
  <!-- 削除ダイアログ -->
  <v-dialog
    v-model="show"
    persistent
    max-width="290"
  >
    <v-card>
      <v-card-title/>
      <v-card-text class="black--text">
        削除しますか？
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="grey" text :disabled="loading" @click="onClickClose">キャンセル</v-btn>
        <v-btn color="red" text :loading="loading" @click="onClickDelete">削除</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'DeleteDialog',

  data () {
    return {
      /** ダイアログの表示状態 */
      show: false,
      /** 受け取ったデータ */
      item: {},
      currentTable: ''
    }
  },

  computed: mapState({
    /** ローディング状態 */
    loading: state => state.workflow.loading.delete
  }),

  methods: {
    ...mapActions(
      {deleteCollection: 'firestore/deleteCollection'}
    ),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (item, currentTable) {
      this.show = true
      this.item = item
      this.currentTable = currentTable
    },
    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },
    /** 削除がクリックされたとき */
    async onClickDelete () {
      const item = this.item
      const currentTable = this.currentTable

      await this.deleteCollection({ item, currentTable })
      this.show = false
    }
  }
}
</script>
