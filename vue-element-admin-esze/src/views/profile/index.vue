<!-- eslint-disable -->
<template>
  <div>
    <el-breadcrumb class='app-breadcrumb' separator='/'>
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.meta.title">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">{{ item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>
<script>
/* eslint-disable */
import pathToRegexp from 'path-to-regexp'
export default {
  data() {
    return {
       levelList: [
        { meta: { title: '首页' } },
        { meta: { title: '系统管理' } },
        { meta: { title: '用户列表' } }
      ]
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    getBreadcrumb() {
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]
      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
      this.levelList.push( { meta: { title: '首页' } },
        { meta: { title: '系统管理' } },
        { meta: { title: '用户列表' } })
    },
    pathCompile (path) {
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      console.log(item)
      const path = '/example/table'
      this.$router.push(path)
    }
  }
}
</script>

<style  scoped>
.breadcrumb-enter-active, .breadcrumb-leave-active {
  transition: all 0.3s;
}
.breadcrumb-enter, .breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
