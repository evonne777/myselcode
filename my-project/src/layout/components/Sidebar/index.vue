<template>
    <div :class="{'has-logo':showLogo}">
        <logo v-if="showLogo" :collapse="isCollapse" />
        <el-scrollbar wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                :background-color="variables.menuBg"
                :text-color="variables.menuText"
                :unique-opened="false"
                :active-text-color="variables.menuActiveText"
                :collapse-transition="false"
                mode="vertical"
            >
                <!-- <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path"></sidebar-item> -->
            </el-menu>
        </el-scrollbar>
    </div>
</template>


<script>
import variables from '@/styles/variables.scss'
import SidebarItem from './SidebarItem'
    export default {
        components: { SidebarItem},
        computed: {
            sidebar() {
                return this.$store.state.app.sidebar
            },
            opened() {
                return this.$store.state.app.sidebar.opened
            },
            activeMenu() {
                const route = this.$route
                console.log(this.$route)
                const { meta, path } = route
                if (meta.activeMenu) {
                    return meta.activeMenu
                }
                return
            },
            showLogo() {
                return this.$store.state.settings.sidebarLogo
            },
            variables() {
                return variables
            },
            isCollapse() {
                return !this.sidebar.opened
            },
            routes() {
                return this.$router.options.routes   // 项目没有 permission 模块，直接取路由表
            }
        }
    }
</script>