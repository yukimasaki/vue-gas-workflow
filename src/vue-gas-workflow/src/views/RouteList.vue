<template>
    <v-row justify="center">
      <v-col cols="12" sm="12" md="4">
        <h3 class="mb-3">{{ title }}</h3>
        <v-card
          class="mb-2"
          v-for="form in forms"
          :key="form.name"
          :to="form.link"
        >
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
  name: 'RouteSettings',

  data() {
    return {
      title: '申請ルート設定',

      forms: [
        {name: '休暇申請', link: '/paid_leave_route'},
        {name: '備品申請', link: '/route_settings'},
      ],
    }
  },

}
</script>
