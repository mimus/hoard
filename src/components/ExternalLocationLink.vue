<template>
  <external-asset-link
    v-if="address"
    :asset="assetId"
    type="address"
    :item="address"
    v-bind="propsForLink"
  />
</template>

<script>
import Vue from 'vue'
import commonProps from './ExternalAssetLinkCommonProps'

export default Vue.component('external-location-link', {
  props: {
    id: { type: Number, required: true }, // location ID
    ...commonProps
  },
  computed: {
    location () {
      return this.$store.getters.location(this.id)
    },
    assetId () {
      return this.location && this.location.asset
    },
    address () {
      return this.location && this.location.address
    },
    propsForLink () {
      var cloneProps = Object.assign({}, this.$props)
      delete cloneProps.id
      return cloneProps
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
