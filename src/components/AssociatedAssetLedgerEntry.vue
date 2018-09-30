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
      var label = 'Unknown asset ledger entry'
      var route = ''
      var title = ''

      var item = this.$store.getters.assetLedgerEntry(link.id)
      if (item) {
        title = item.label
        var asset = this.$store.getters.asset(item.asset)
        var assetLabel = (asset && (asset.symbol || asset.label)) || item.asset
        label = `Asset: ${assetLabel} (${u.formatAssetValue(item.amount, item.asset)})`
        route = { name: 'Asset', params: { id: item.asset } }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
