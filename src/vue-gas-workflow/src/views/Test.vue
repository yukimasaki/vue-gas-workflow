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
            <v-btn dark color="green" @click="sendEmail">
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
import { createTransport } from 'nodemailer'

export default {
  name: 'Test',

  data() {
    return {
      /** 申請書タイトル */
      title: 'メールテスト',
    }
  },

  computed: {
  },

  methods: {
    async sendEmail() {
      const transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_AUTH_USER,
          pass: process.env.EMAIL_AUTH_PASS
        }
      })

      try {
        await transporter.sendMail({
          from: `"ワークフロー" <${process.env.EMAIL_FROM}>`,
          to: `${process.env.EMAIL_TO}`,
          subject: `申請がありました。`,
          text: `テスト送信です。`
        })
      } catch (error) {
        console.log(`メール送信に失敗しました。`)
        throw error
      }
    }
  },

  created() {
  },

}
</script>
