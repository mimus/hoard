<template>
  <span v-if="link">
    <span v-if="withTypeLabel">{{ typeLabel }}:</span>
    <span v-if="withLabel">{{ label }}</span>
    <span v-if="withShortLabel">{{ shortLabel }}</span>
    <v-btn
      :href="link"
      target="_blank"
      :title="linkTitle"
      text icon small
      :color="color"
      class="external-asset-link-btn"
    >
      <v-icon small>open_in_new</v-icon>
    </v-btn>
  </span>
</template>

<script>
import Vue from 'vue'
import commonProps from './ExternalAssetLinkCommonProps'

export default Vue.component('external-asset-link', {
  props: {
    asset: { type: String, required: true },
    type: { type: String, required: true },
    item: { type: null },
    ...commonProps
  },
  computed: {
    service () {
      return this.$services[this.asset] && this.$services[this.asset][`${this.type}Link`]
    },
    link () {
      if (!this.service) { return false }
      return this.service.link(this.item)
    },
    linkTitle () {
      if (!this.service) { return false }
      return this.service.linkTitle(this.item)
    },
    label () {
      if (!this.service) { return false }
      return this.service.label(this.item)
    },
    shortLabel () {
      if (!this.service) { return false }
      return this.service.shortLabel(this.item)
    },
    typeLabel () {
      switch (this.type) {
        case 'address':
          return 'Address'
        case 'transaction':
          return 'Transaction'
      }
      return ''
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .external-asset-link-btn {
    width: 24px;
    height: 24px;
    margin: -2px 8px 0 0;
  }
</style>
