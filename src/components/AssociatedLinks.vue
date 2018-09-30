<template>
  <div v-if="links && links.length">
    <ul>
      <li v-for="link in links" :key="`${link.type}_${link.id}`">
        <associated-link :link="link" />
      </li>
    </ul>
  </div>
</template>

<script>

import Vue from 'vue'

export default Vue.component('associated-links', {
  props: {
    links: Array
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
