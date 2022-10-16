<template>
  <div class="form-wrapper">
    <p>※設定はこのデバイスのみに保存されます。</p>
    <v-form v-model="valid">
      <h3>アプリ設定</h3>
      <!-- アプリ名 -->
      <v-text-field
        label="アプリ名"
        v-model="settings.appName"
        :counter="30"
        :rules="[appNameRule]"
      />
      <!-- API URL -->
      <v-text-field
        label="API URL"
        v-model="settings.apiUrl"
        :counter="150"
        :rules="[stringRule]"
      />
      <!-- Auth Token -->
      <v-text-field
        label="Auth Token"
        v-model="settings.authToken"
        :counter="150"
        :rules="[stringRule]"
      />
      <v-row class="mt-4">
        <v-spacer/>
        <v-btn color="primary" :disabled="!valid" @click="onClickSave">保存</v-btn>
      </v-row>
    </v-form>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
export default {
  name: 'Settings',

  data () {
    return {

      /** 設定 */
      // ↓ mapState表記だとなぜかエラーになる
      // ...mapState({
      //   settings: state => state.workflow.settings
      // }),
      settings: { ...this.$store.state.workflow.settings},

      /** 入力したデータが有効かどうか */
      valid: false,

      //test
      /** バリデーションルール */
      appNameRule: v => v.length <= 30 || '30文字以内で入力してください',
      stringRule: v => v.length <= 150 || '150文字以内で入力してください',
    }
  },

  methods: {
    onClickSave () {
      this.$store.dispatch('workflow/saveSettings', { settings: this.settings })
    }
  },
}
</script>

<style>
.form-wrapper {
  max-width: 500px;
  margin: auto;
}
</style>
