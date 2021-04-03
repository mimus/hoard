<template>
  <div>
    <component
      :is="componentName"
      v-if="componentName"
      :link="link"
    />
    <div v-else>
      Unknown link type: {{ link.type }}
    </div>
</div>
</template>

<script>
import Vue from 'vue'
import AssociatedAsset from './AssociatedAsset'
import AssociatedAssetLedgerEntry from './AssociatedAssetLedgerEntry'
import AssociatedLocation from './AssociatedLocation'
import AssociatedLocationLedgerEntry from './AssociatedLocationLedgerEntry'
import AssociatedMiningEvent from './AssociatedMiningEvent'
import AssociatedTransferEvent from './AssociatedTransferEvent'
import AssociatedIncomeEvent from './AssociatedIncomeEvent'
import AssociatedDepositEvent from './AssociatedDepositEvent'
import AssociatedTradeEvent from './AssociatedTradeEvent'

export default Vue.component('associated-link', {
  components: {
    AssociatedAsset,
    AssociatedAssetLedgerEntry,
    AssociatedLocation,
    AssociatedLocationLedgerEntry,
    AssociatedMiningEvent,
    AssociatedTransferEvent,
    AssociatedIncomeEvent,
    AssociatedDepositEvent,
    AssociatedTradeEvent
  },
  props: {
    link: Object
  },
  computed: {
    componentName () {
      var type = this.link.type
      if (type && type.length) {
        var typeTitleCase = type.charAt(0).toUpperCase() + type.substr(1)
        var componentName = `Associated${typeTitleCase}`
        if (this.$options.components[componentName]) {
          return componentName
        }
      }
      return false
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.related-links-col {
  min-width: 300px;
}
</style>
