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
      var label = 'Unknown deposit event'
      var route = ''
      var title = ''

      var item = this.$store.getters.depositEvent(link.id)
      if (item) {
        title = item.label
        var asset = this.$store.getters.asset(item.asset)
        var assetLabel = (asset && (asset.symbol || asset.label)) || item.asset
        label = `Deposited ${u.formatAssetValue(item.amount, item.asset)} ${assetLabel}`
        route = { name: 'DepositEvents' }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
