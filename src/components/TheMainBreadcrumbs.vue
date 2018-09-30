<template>
  <v-breadcrumbs>
    <v-breadcrumbs-item
      v-for="breadcrumb in breadcrumbs"
      :key="breadcrumb.path"
    >
      <router-link
        v-if="breadcrumb.path"
        :to="breadcrumb.path"
      >
        {{ breadcrumb.label }}
      </router-link>
      <span v-else>
        {{ breadcrumb.label }}
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
