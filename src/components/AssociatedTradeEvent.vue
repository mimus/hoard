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
      var label = 'Unknown trade event'
      var route = ''
      var title = ''

      var item = this.$store.getters.tradeEvent(link.id)
      if (item) {
        title = item.label
        var sold = item.disposed.map(x => `${u.formatAssetValue(x.amount, x.asset)} ${x.asset}`).join(', ')
        var bought = item.acquired.map(x => `${u.formatAssetValue(x.amount, x.asset)} ${x.asset}`).join(', ')
        label = `Sold ${sold} for ${bought}`
        route = { name: 'TradeEvents' }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
