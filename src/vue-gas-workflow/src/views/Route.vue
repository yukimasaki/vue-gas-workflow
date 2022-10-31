<template>
  <!-- 申請ルートテーブルを表示させる -->
  <v-card>
    <!-- タブレイアウト -->
    <v-tabs grow color="green">
      <v-tab @click="onClickTab('paid_leave')">休暇申請</v-tab>
      <v-tab @click="onClickTab('equipment')">備品申請</v-tab>
    </v-tabs>

    <!-- コンテンツ -->
    <!-- データテーブル -->
    <DataTableRoute ref="DataTableRoute"/>
  </v-card>
</template>

<script>
import DataTableRoute from '../components/DataTableRoute.vue'

export default {
  name: 'Route',

  components: {
    DataTableRoute
  },

  methods: {
    /** タブをクリックした際に、編集対象の申請書名を子コンポーネント（DataTableRoute.vue）に渡す */
    onClickTab(currentTabName) {
      this.$refs.DataTableRoute.setcurrentTabName(currentTabName)
      this.$refs.DataTableRoute.getRecords()
    },
  },
}
</script>
