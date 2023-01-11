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
              v-model="formData.title"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn @click="updateValue()">値を更新</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <ItemDialogCreateRequest ref="ItemDialogCreateRequest"/>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import ItemDialogCreateRequest from '../../components/ItemDialogCreateRequest.vue'

export default {
  name: 'FormReactivityTest',

  components: {
    ItemDialogCreateRequest
  },

  data() {
    return {
      title: 'FormReactivityTest',
      formData: {}
    }
  },

  computed: {
    ...mapState({
      testFormData: state => state.firestore.testFormData

    }),

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

    // methodsからdataの値を変更し、リアクティブにビューに反映させることができた
    updateValue() {
      this.formData.title = '値が変更されました'
    },

  },

async created() {
    const userId = this.getUserEmail
    const docId = 'spNTUth2YEpRcB4KJEFo'
    await this.fetchMyTestFormData({ userId, docId })
    this.formData = this.testFormData
  },

}
</script>
