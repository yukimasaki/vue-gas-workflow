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
        <v-btn color="grey" text @click="onClickClose">キャンセル</v-btn>
        <v-btn color="error" text @click="onClickDelete">削除</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'DeleteDialog',

  data () {
    return {
      /** ダイアログの表示状態 */
      show: false,
      /** 受け取ったデータ */
      item: {},
      currentTableName: ''
    }
  },

  methods: {
    ...mapActions(
      {deleteDocument: 'firestore/deleteDocument'}
    ),

    /**
     * ダイアログを表示します。
     * このメソッドは親から呼び出されます。
     */
    open (item, currentTableName) {
      this.show = true
      this.item = item
      this.currentTableName = currentTableName
    },
    /** キャンセルがクリックされたとき */
    onClickClose () {
      this.show = false
    },
    /** 削除がクリックされたとき */
    async onClickDelete () {
      const item = this.item
      const currentTableName = this.currentTableName

      await this.deleteDocument({ item, currentTableName })
      this.show = false
    }
  }
}
</script>
