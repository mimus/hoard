<template>
  <v-breadcrumbs :items="breadcrumbs">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item>
        <router-link
          v-if="item.path"
          :to="item.path"
        >
          {{ item.text }}
        </router-link>
        <span v-else>
          {{ item.text }}
        </span>
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script>

import Vue from 'vue'
import { mapGetters } from 'vuex'

export default Vue.component('the-main-breadcrumbs', {
  computed: mapGetters([
    'breadcrumbs'
  ])
})

</script>
