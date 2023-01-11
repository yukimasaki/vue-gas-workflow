<template>
  <!-- <div v-if="formData.length != 0"> -->
  <div>

    <v-row justify="center">
      <v-col cols="12" md="6" xs="12">
        <v-card>
          <v-card-text>
            <v-form readonly>
              <v-text-field
              label="タイトル"
              v-model="testFormData.title"
              />
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <ItemDialogCreateRequest ref="ItemDialogCreateRequest"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ItemDialogCreateRequest from '../../components/ItemDialogCreateRequest.vue'

export default {
  name: 'FormReactivityTest',

  components: {
    ItemDialogCreateRequest
  },

  data() {
    return {
      title: 'FormReactivityTest',
      testFormData: {}
    }
  },

  computed: {
    ...mapGetters({
      getUserEmail: 'firebase/getUserEmail'
    }),
  },

  methods: {
    ...mapActions({
      fetchMyTestFormData: 'firestore/fetchMyTestFormData'
    }),

    onClickAdd() {
      this.$refs.ItemDialogCreateRequest.open('add')
    },

  },

  created() {
    const userId = this.getUserEmail
    const docId = 'spNTUth2YEpRcB4KJEFo'
    this.fetchMyTestFormData({ userId, docId })
  },

}
</script>
