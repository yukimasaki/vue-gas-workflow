<template>
  <div>
    {{ $route.params.id }}<br>
    {{ request_details }}
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'RequestDetail',

  data() {
    return {
      currentTableName: 'request_details',
      data: [],
    }
  },

  computed: {
    ...mapState({
      request_details: state => state.firestore.request_details,
    })
  },

  methods: {
    ...mapActions({
      fetchCollectionsByOneQuery: 'firestore/fetchCollectionsByOneQuery'
    }),

    async fetchRequestDetail() {
      const currentTableName = this.currentTableName
      const customQuery = {
        field: 'snippet_ref',
        compare: '==',
        value: this.$route.params.id
      }

      await this.fetchCollectionsByOneQuery({ currentTableName, customQuery })
      this.data = this.request_details
      console.log(this.data)
    },
  },

  created() {
    this.fetchRequestDetail()
  },
}
</script>
