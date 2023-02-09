<template>
    <v-col align="center">
      <h1 class="text-h1 py-8">404</h1>
      <v-icon class="text-h2 py-4">mdi-emoticon-cry-outline</v-icon>
      <p class="text-body-1 py-2">ページが見つかりません</p>
    </v-col>
</template>

<script>
export default {
  name: 'NotFound',

  created () {
    this.$router.replace({ path: '/404' })
  },
}
</script>
