<template>
  <div>
    <div
      v-for="(entry, entryIndex) in entries"
      :key="`${entryIndex}`"
    >
      {{ entry.amount | formatAssetValue(entry.asset) }} {{ entry.asset }}
      <div
        v-if="entry.comments"
        class="comments"
      >
        {{ entry.comments }}
      </div>
      <associated-links :links="entry.linked" />
    </div>
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
.comments {
  font-style: italic;
}
</style>
