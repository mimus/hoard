<script>
import linkTemplate from './associatedLinkTemplate'

export default {
  props: {
    link: Object
  },
  computed: {
    model () {
      var link = this.link
      var label = 'Unknown location'
      var route = ''
      var title = ''

      var item = this.$store.getters.location(link.id)
      if (item) {
        title = item.label
        label = item.label
        route = { name: 'Location', params: { id: item.group, locid: item.id } }
      }

      return { label, route, title }
    }
  },
  template: linkTemplate
}
</script>
