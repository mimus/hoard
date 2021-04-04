<template>
  <v-app>
    <v-navigation-drawer
      app
      v-model="drawer"
      fixed width="220"
    >
      <v-layout
        column
        fill-height
        justify-space-between
      >
        <the-main-menu></the-main-menu>
        <test-data-loader></test-data-loader>
      </v-layout>
    </v-navigation-drawer>
    <v-app-bar
      app
      fixed
      dense
      extended
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Hoard</v-toolbar-title>
      <v-spacer />
      <AssetPriceFetcher />
      <v-spacer />
      <app-persistence></app-persistence>

      <template v-slot:extension>
        <the-main-breadcrumbs></the-main-breadcrumbs>
      </template>
    </v-app-bar>
    <v-content>
      <v-container
        container--fluid
        style="position: relative; z-index: 0;"
      >
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import '@/components/TheMainMenu'
import '@/components/TestDataLoader'
import AssetPriceFetcher from '@/components/AssetPriceFetcher'
import '@/components/AppPersistence'
import '@/components/TheMainBreadcrumbs'
import '@/components/AssetIcon'
import '@/components/AssociatedLink'
import '@/components/AssociatedLinks'
import '@/components/ExternalLocationLink'
import '@/components/ExternalAssetLink'
import '@/components/ExternalAssetLinks'
import '@/components/PriceLookup'
import '@/components/ExternalTransactionFetcher'
import '@/components/ExternalTransactionsFetcher'
import '@/components/DateTimePicker'
import '@/components/AssetSelect'
import '@/components/LocationSelect'
import '@/components/IncomeSourceSelect'
import '@/components/BaseForm'
import '@/components/LocationItemsList'

export default {
  name: 'App',
  components: { AssetPriceFetcher },
  data: () => ({
    drawer: null
  })
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Override Vuetify styles */
.theme--light.v-card .v-card__text {
  color: rgba(0,0,0,.87);
}
.v-data-table td {
    font-weight: 400;
    font-size: 13px;
}
.v-data-table td,
.v-data-table th {
    padding: 10px;
    vertical-align: top;
}
</style>
