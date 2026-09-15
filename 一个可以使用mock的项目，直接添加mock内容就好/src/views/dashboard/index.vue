<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <p>欢迎回来！登录成功！</p>
    <el-button type="primary" @click="handleLogout">退出登录</el-button>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  methods: {
    handleLogout() {
      this.$store.dispatch('user/logout').then(() => {
        this.$router.push('/login')
      }).catch(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 50px;
  text-align: center;
}

h1 {
  color: #42b983;
  margin-bottom: 20px;
}

p {
  color: #666;
  margin-bottom: 30px;
}
</style>
