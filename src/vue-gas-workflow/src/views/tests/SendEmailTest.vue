<template>
  <div>
    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card>
          <v-card-text>
            <v-form readonly>
              <v-text-field
              label="タイトル"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn @click="sendEmail()">test</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
const nodemailer = require('nodemailer')

export default {
  name: 'SendEmailTest',

  components: {
  },

  data() {
    return {
      title: 'SendEmailTest',
    }
  },

  computed: {
  },

  methods: {
    async sendEmail() {
      const transporter = nodemailer.createTransport({
        host: process.env.VUE_APP_EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.VUE_APP_EMAIL_USER,
          pass: process.env.VUE_APP_EMAIL_PASS,
        },
      })

      const message = {
        from: 'process.env.VUE_APP_EMAIL_FROM',
        to: 'process.env.VUE_APP_EMAIL_TO',
        subject: 'ワークフローアプリからテスト送信です',
        text: 'てすとてすと',
      }

      try {
        transporter.sendMail(message, function(error, success) {
          if (error) {
            console.log('メール送信に失敗しました。')
            console.log(error.message)
          }
          console.log('メール送信に成功しました。')
          console.log(success.messageId)
        })
      } catch (e) {
        console.log('メール送信時に例外が発生しました。', e)
      }
    },
  },

async created() {
  },

}
</script>
