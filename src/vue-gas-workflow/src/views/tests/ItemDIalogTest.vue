<template>
  <div>
    <v-row>
      <v-col col="12">
        <v-card>
          <v-card-title>{{ title }}</v-card-title>
          <v-card-text>
            <v-spacer></v-spacer>
          </v-card-text>
          <v-card-actions>
            <v-btn dark color="secondary" @click="onClickAdd">
              <v-icon left>mdi-plus</v-icon>
              追加テスト
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <ItemDialogRequests ref="ItemDialogRequests"/>
  </div>
</template>

<script>
import ItemDialogRequests from '../../components/ItemDialogRequests.vue'

export default {
  name: 'ItemDIalogTest',

  components: {
    ItemDialogRequests
  },

  data() {
    return {
      /** 申請書タイトル */
      title: 'テスト',
    }
  },

  computed: {
  },

  methods: {
    onClickAdd() {
      this.$refs.ItemDialogRequests.open('add')
    },

  },

  created() {
  },

}
</script>
