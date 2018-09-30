<script>
import linkTemplate from './associatedLinkTemplate'

export default {
  props: {
    link: Object
  },
  computed: {
    model () {
      var link = this.link
      var label = 'Unknown asset'
      var route = ''
      var title = ''

      var item = this.$store.getters.asset(link.id)
      if (item) {
        title = item.label
        var assetLabel = item.symbol || item.label
        label = `Asset: ${assetLabel}`
        route = { name: 'Asset', params: { id: item.id } }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
