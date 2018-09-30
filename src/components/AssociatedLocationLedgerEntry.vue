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
      var label = 'Unknown location ledger entry'
      var route = ''
      var title = ''

      var item = this.$store.getters.locationLedgerEntry(link.id)
      if (item) {
        title = item.label
        var location = this.$store.getters.location(item.location)
        var locationLabel = `Location: ${item.location}`
        var assetSymbol = ''
        if (location && location.label) {
          locationLabel = location.label
          var asset = this.$store.getters.asset(location.asset)
          assetSymbol = asset && asset.symbol
        }
        label = `${locationLabel} (${u.formatAssetValue(item.amount, location && location.asset)} ${assetSymbol})`
        route = { name: 'Location', params: { id: location.group, locid: location.id } }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
