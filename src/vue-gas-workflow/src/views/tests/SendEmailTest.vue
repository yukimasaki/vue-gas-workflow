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
            <v-btn>test</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
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
  },

async created() {
  },

}
</script>
