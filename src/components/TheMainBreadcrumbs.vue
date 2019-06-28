<template>
  <v-breadcrumbs :items="breadcrumbs">
    <v-breadcrumbs-item
      slot="item"
      slot-scope="{ item }"
    >
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
