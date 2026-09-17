<template>
  <div class="hello-world">
    <h1>Hello World</h1>
    <p>这是一个 Hello World 页面</p>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld'
}
</script>

<style scoped>
.hello-world {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.hello-world h1 {
  font-size: 48px;
  color: #409EFF;
}
.hello-world p {
  font-size: 16px;
  color: #606266;
}
</style>
