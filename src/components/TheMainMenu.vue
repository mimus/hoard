<template>
  <v-list dense>
    <v-list-tile to="/">
      <v-list-tile-action>
        <v-icon>dashboard</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Home</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/tax-years">
      <v-list-tile-action>
        <v-icon>account_balance</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Tax Years</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/mining-pools">
      <v-list-tile-action>
        <v-icon>group_work</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Mining Pools</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/assets">
      <v-list-tile-action>
        <v-icon>euro_symbol</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Assets</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/location-groups">
      <v-list-tile-action>
        <v-icon>place</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Location Groups</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/deposit-events">
      <v-list-tile-action>
        <v-icon>play_for_work</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Deposits</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/airdrop-events">
      <v-list-tile-action>
        <v-icon>flare</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Airdrops</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/transfer-events">
      <v-list-tile-action>
        <v-icon class="rotate-right">call_split</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Transfers</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile to="/trade-events">
      <v-list-tile-action>
        <v-icon>repeat</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Trades</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
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
