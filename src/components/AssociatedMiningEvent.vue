<script>
import u from '../utils'
import linkTemplate from './associatedLinkTemplate'

export default {
  props: {
    link: Object
  },
  computed: {
    model () {
      var link = this.link
      var label = 'Unknown mining event'
      var route = ''
      var title = ''

      var item = this.$store.getters.miningEvent(link.id)
      if (item) {
        title = item.label
        var pool = this.$store.getters.miningPool(item.pool)
        var poolLabel = (pool && pool.label) || `Pool: ${item.pool}`
        var asset = this.$store.getters.asset(pool.asset)
        var assetLabel = (asset && (asset.symbol || asset.label)) || pool.asset
        label = `${poolLabel} ${u.formatAssetValue(item.amount, pool.asset)} ${assetLabel}`
        route = { name: 'MiningPool', params: { id: pool.id } }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
