<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>

export default {
  data () {
    return {
      msg: this.$store.state.message
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
