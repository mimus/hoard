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
      var label = 'Unknown transfer event'
      var route = ''
      var title = ''

      var item = this.$store.getters.transferEvent(link.id)
      if (item) {
        title = item.label
        var asset = this.$store.getters.asset(item.asset)
        var assetLabel = (asset && (asset.symbol || asset.label)) || item.asset
        label = `Transferred ${u.formatAssetValue(item.amount, item.asset)} ${assetLabel}`
        route = { name: 'TransferEvents' }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
