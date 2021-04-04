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
      var label = 'Unknown income event'
      var route = ''
      var title = ''

      var item = this.$store.getters.incomeEvent(link.id)
      if (item) {
        title = item.label
        var asset = this.$store.getters.asset(item.asset)
        var assetLabel = (asset && (asset.symbol || asset.label)) || item.asset
        label = `Income of ${u.formatAssetValue(item.amount, item.asset)} ${assetLabel}`
        var source = this.$store.getters.incomeSource(item.source)
        if (source) {
          label += ` (${source.label})`
        }
        route = source ? { name: 'IncomeSource', params: { sourceId: source.id } } : { name: 'IncomeSources' }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
