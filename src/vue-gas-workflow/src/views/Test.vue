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

    <ItemDialogCreateRequest ref="ItemDialogCreateRequest"/>
  </div>
</template>

<script>
import ItemDialogCreateRequest from '../components/ItemDialogCreateRequest.vue'

export default {
  name: 'Test',

  components: {
    ItemDialogCreateRequest
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
      this.$refs.ItemDialogCreateRequest.open('add')
    },

  },

  created() {
  },

}
</script>
