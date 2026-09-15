<template>
    <div class="main-container">
    <sidebar class="sidebar-container" />
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
      </div>
      <app-main />
    </div>
</template>

<script>
import { AppMain, Navbar, Sidebar } from './components'

export default {
    name: 'Layout',
    components: {
        AppMain,
        Navbar,
        Sidebar
    },
    computed: {
        fixedHeader() {
            return this.$store.state.settings.fixedHeader
        }
    }
}
</script>

