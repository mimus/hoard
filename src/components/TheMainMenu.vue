<template>
  <v-list dense>
    <v-list-item to="/">
      <v-list-item-action>
        <v-icon>dashboard</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/tax-years">
      <v-list-item-action>
        <v-icon>account_balance</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Tax Years</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/mining-pools">
      <v-list-item-action>
        <v-icon>group_work</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Mining Pools</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/assets">
      <v-list-item-action>
        <v-icon>euro_symbol</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Assets</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/location-groups">
      <v-list-item-action>
        <v-icon>place</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Location Groups</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/deposit-events">
      <v-list-item-action>
        <v-icon>play_for_work</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Deposits</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/income-sources">
      <v-list-item-action>
        <v-icon>flare</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Income Sources</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/income-events">
      <v-list-item-action>
        <v-icon>flare</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Other Income</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/transfer-events">
      <v-list-item-action>
        <v-icon class="rotate-right">call_split</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Transfers</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item to="/trade-events">
      <v-list-item-action>
        <v-icon>repeat</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Trades</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
import Vue from 'vue'

export default Vue.component('the-main-menu', {
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .rotate-right {
    transform: rotate(90deg);
  }
</style>
