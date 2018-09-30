<template>
  <div v-if="linksProps.length">
    <ul>
      <li
        v-for="link in linksProps"
        :key="`${link.asset}_${link.type}_${link.item}`"
      >
        <external-asset-link v-bind="link" />
      </li>
    </ul>
  </div>
</template>

<script>

import Vue from 'vue'
import commonProps from './ExternalAssetLinkCommonProps'

export default Vue.component('external-asset-links', {
  inheritAttrs: false,
  props: {
    links: { type: Array },
    ...commonProps
  },
  computed: {
    linksProps () {
      if (!this.links) { return [] }
      return this.links.map(link => this.propsForLink(link))
    }
  },
  methods: {
    propsForLink (link) {
      var cloneProps = Object.assign({}, this.$props, link)
      delete cloneProps.links
      return cloneProps
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
