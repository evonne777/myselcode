<template>
  <div class="login-container">
    <h3 class="title">Login Form</h3>
    <el-form ref="loginForm" :model="loginForm" class="login-form" auto-complete="on" label-position="left">
      <el-form-item>
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input class="short"  v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input class="short" v-model="loginForm.password"></el-input>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handletest">test</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '111111',
      },
      loading: false,
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    // showPwd() {
    //   if (this.passwordType === 'password') {
    //     this.passwordType = ''
    //   } else {
    //     this.passwordType = 'password'
    //   }
    //   this.$nextTick(() => {
    //     this.$refs.password.focus()
    //   })
    // }
    handletest() {
      this.$store.dispatch('user/test', '这是一个测试').then(() => {
        console.log('测试成功')
      }).catch((err) => {
        console.error('测试失败:', err)
      })
    },
    handleLogin() {
      this.loading = true
      this.$store.dispatch('user/login', this.loginForm).then(() => {
        this.loading = false
        // 页面跳转，如果有redirect参数则跳转过去，否则跳转首页 '/'
        this.$router.push({ path: this.redirect || '/'})
      }).catch((err) => {
        this.loading = false
        console.error('登录失败:', err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  $bg:#2d3a4b;
  $dark_gray:#889aa4;
  $light_gray:#eee;

  .login-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    overflow: hidden;

    .login-form {
      position: relative;
      width: 520px;
      max-width: 100%;
      padding: 160px 35px 0;
      margin: 0 auto;
      overflow: hidden;
    }

    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;
    }

    .title-container {
      position: relative;

      .title {
        font-size: 26px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
    }

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
  </style>
