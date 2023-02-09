<template>
  <v-row justify="center">
    <v-col cols="12" md="6" xs="12">
      <v-card>
        <v-card-text>
          <p>※設定はこのデバイスのみに保存されます。<br>デバイスごとに設定を保存してください。</p>
          <v-form v-model="valid">
            <h3>アプリ設定</h3>
            <!-- API URL -->
            <v-text-field
              label="API URL"
              v-model="settings.apiUrl"
              :counter="150"
              :rules="apiUrlRules"
            />
            <!-- Auth Token -->
            <v-text-field
              label="Auth Token"
              v-model="settings.authToken"
              :counter="36"
              :rules="authTokenRules"
            />
            <v-row class="mt-4 px-3 pb-3">
              <v-spacer/>
              <v-btn color="primary" :disabled="(!valid || saveButtonDisabled)" @click="onClickSave">保存</v-btn>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import { mapState } from 'vuex'
export default {
  name: 'Settings',

  data () {
    return {
      settings: { ...this.$store.state.workflow.settings},
      valid: false,
      saveButtonDisabled: false,

      /** バリデーションルール */
      apiUrlRules: [
        v => v.trim().length > 0 || 'API URLは必須です',
        v => v.trim().length <= 150 || '150文字以内で入力してください',
      ],
      authTokenRules: [
        v => v.trim().length > 0 || 'Auth Tokenは必須です',
        v => v.trim().length == 36 || '36文字で入力してください',
      ],
    }
  },

  methods: {
    onClickSave () {
      this.$store.dispatch('workflow/saveSettings', { settings: this.settings })
      this.saveButtonDisabled = !this.saveButtonDisabled
    }
  },
}
</script>
