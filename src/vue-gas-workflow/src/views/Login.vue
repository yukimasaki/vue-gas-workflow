<template>
  <v-row justify="center">
    <v-col cols="12" sm="12" md="4">
      <v-card
        height="200px"
      >
        <v-card-title class="justify-center" mb-3>
          <h1 class="display-1">ログイン</h1>
        </v-card-title>

        <v-card-actions class="justify-center">
          <v-btn
            @click="loginWithGoogle"
            style="text-transform: none"
            width="80%"
          >
          Googleアカウントでログイン</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>


<script>
export default {
  name: 'Login',

  methods: {
    // Googleアカウントでログイン
    async loginWithGoogle() {
      await this.$store.dispatch('firebase/login')
      this.$router.push('/')
    }
  }
}
</script>
