<template>
  <v-btn @click="this.addDocTest">addDocTest</v-btn>
</template>

<script>
import db from '@/firebase/firebaseConfig'
import {
  collection,
  addDoc
} from 'firebase/firestore'

export default {
  name: 'FirestoreTest',

  methods: {
    async addDocTest() {
      const colRef = collection(db, "cities")
      const data = {
        name: "Los Angeles",
        state: "CA",
        country: "USA"
      }
      await addDoc(colRef, data)
    }
  }
}
</script>
