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
      var label = 'Unknown airdrop event'
      var route = ''
      var title = ''

      var item = this.$store.getters.airdropEvent(link.id)
      if (item) {
        title = item.label
        var asset = this.$store.getters.asset(item.asset)
        var assetLabel = (asset && (asset.symbol || asset.label)) || item.asset
        label = `Airdrop of ${u.formatAssetValue(item.amount, item.asset)} ${assetLabel}`
        route = { name: 'AirdropEvents' }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
