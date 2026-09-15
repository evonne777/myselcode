<!-- eslint-disable  -->
<template>
  <div class="roght-menu">
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <!-- <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"> -->
        <i class="el-icon-caret-bottom"></i>
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <router-link to="/">
          <el-dropdown-item>
            Home
          </el-dropdown-item>
        </router-link>
          <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <br/>
    ---------------------
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
        <!-- 设置当前激活高亮 -->
        <!-- 控制菜单是否折叠收起 -->
        <!-- 设置菜单背景颜色 -->
        <!-- 设置菜单中普通文字的颜色 -->
        <!-- 是否只有一个菜单可以打开 -->
        <!-- 激活菜单项的文字颜色 -->
        <!-- 关闭播放过渡动画 -->
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style  scoped>

</style>
