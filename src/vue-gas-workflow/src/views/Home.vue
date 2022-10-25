<template>
    <v-row justify="center">
      <v-col cols="12" sm="12" md="4">
        <v-card
          class="mb-2"
          v-for="form in forms"
            :key="form.name"
            :to="form.link">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ form.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
  </template>

<script>
export default {
  name: 'Home',

  data() {
    return {
      forms: [
        {name: '休暇申請', link: '/paid_leave'},
        {name: '休暇申請(Firestore)', link: '/paid_leave_firestore'},
        {name: '備品申請', link: '/equipment'},
      ],
    }
  }
}
</script>
