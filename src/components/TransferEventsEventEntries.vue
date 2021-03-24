<template>
  <div>
    <div
      v-for="(entry, index) in entries"
      :key="`${index}`"
    >
      {{ entry.amount | formatAssetValue(entry.asset) }}
      <associated-links :links="entry.linked" />
    </div>
    <template v-if="!entries || !entries.length">
      &mdash;
    </template>
  </div>
</template>

<script>

export default {
  props: {
    entries: Array
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
