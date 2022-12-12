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
            <v-btn dark color="green" @click="onClickSend">
              <v-icon left>mdi-send</v-icon>
              メール送信
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Test',

  data() {
    return {
      /** 申請書タイトル */
      title: 'メールテスト',
    }
  },

  computed: {
    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail',
    })
  },

  methods: {
    ...mapActions({
      sendEmail: 'firestore/sendEmail',
    }),

    async onClickSend() {
      const emailConfig = {
        to: this.getUserEmail,
        subject: 'テストです。',
        body: 'テスト送信です！'
      }
      await this.sendEmail({ emailConfig })
    },

  },

  created() {
  },

}
</script>
