<template>
  <v-btn @click="this.addDocTest">addDocTest</v-btn>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'FirestoreTest',

  methods: {
    ...mapActions('firestore', ['addDocTest'])
  }
}
</script>
