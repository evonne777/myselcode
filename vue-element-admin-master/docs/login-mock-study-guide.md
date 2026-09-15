# 登录界面与 Mock 数据学习手册

这是一份跟着 `vue-element-admin` 源码做实验的入门手册。目标不是背 API，而是能回答：

1. 用户点击 Login 后，请求经过了哪些文件？
2. token 从哪里来，保存在哪里，什么时候被使用？
3. mock 数据怎样被注册成接口？
4. 为什么输入 `admin / 111111` 能登录，而输入其他用户名会失败？

> 项目使用 Vue 2、Vuex、Axios、Element UI 和 Vue CLI 4。代码中的 mock 只用于本地学习，不能直接当作真实后端认证。

## 0. 准备环境

在项目根目录执行：

```bash
npm install
CHOKIDAR_USEPOLLING=true npm run dev
```

浏览器打开：

```text
http://localhost:9527/login
```

如果直接执行 `npm run dev` 出现 `EMFILE: too many open files`，说明 Linux 文件监控句柄不足。使用上面的 `CHOKIDAR_USEPOLLING=true` 可以改用轮询监控。

登录页预置了两组学习账号：

| 用户名 | 密码 | mock 返回的角色 |
| --- | --- | --- |
| `admin` | 任意 6 位及以上字符 | `admin` |
| `editor` | 任意 6 位及以上字符 | `editor` |

密码在当前 mock 中没有真正校验，这是刻意简化的演示行为，后面会专门观察它。

## 1. 先画出调用链

先不要修改代码，在编辑器中依次打开这些文件：

```text
src/views/login/index.vue
src/api/user.js
src/store/modules/user.js
src/utils/request.js
src/utils/auth.js
src/permission.js
mock/index.js
mock/user.js
mock/mock-server.js
.env.development
```

把调用链记成下面这样：

```text
登录按钮
  -> login/index.vue 的 handleLogin()
  -> this.$store.dispatch('user/login', loginForm)
  -> store/modules/user.js 的 login action
  -> api/user.js 的 login()
  -> utils/request.js 创建的 Axios 实例
  -> /dev-api/vue-element-admin/user/login
  -> mock/mock-server.js 注册的 Express 路由
  -> mock/user.js 返回 { code: 20000, data: { token } }
  -> Vuex 保存 token
  -> Cookie 保存 Admin-Token
  -> 路由跳转
  -> permission.js 请求 user/info
  -> mock/user.js 根据 token 返回角色和用户资料
```

### 学习检查 1

在 `login/index.vue` 中找到 `handleLogin`，回答：

- 为什么先调用 `this.$refs.loginForm.validate`？
- `loading` 在请求前后分别是什么值？
- 登录成功后为什么使用 `redirect`，而不是永远跳转到 `/`？

在 `src/api/user.js` 中找到 `login`，回答：

- `url` 为什么没有写 `/dev-api`？
- `baseURL` 是在哪里补上的？

答案可以通过代码验证：`.env.development` 的 `VUE_APP_BASE_API` 是 `/dev-api`，`src/utils/request.js` 将它传给 Axios 的 `baseURL`。

## 2. 学习登录表单

打开 `src/views/login/index.vue`，从 template 找到：

```vue
<el-form :model="loginForm" :rules="loginRules">
```

这里有两个核心对象：

- `loginForm`：表单数据，包含 `username` 和 `password`。
- `loginRules`：Element UI 表单校验规则。

本项目的校验器在 `data()` 中定义：

- 用户名通过 `validUsername` 校验。
- 密码长度必须至少为 6 位。
- `prop="username"` 和 `prop="password"` 把表单项与校验规则对应起来。
- `v-model` 让输入框内容同步回 `loginForm`。

### 实验 A：观察表单校验

1. 访问 `/login`。
2. 清空用户名，点击 Login，观察错误提示。
3. 输入用户名，密码输入 `123`，观察密码提示。
4. 输入 `admin` 和 `111111`，点击 Login。
5. 打开浏览器开发者工具的 Network 面板，找到登录请求。
6. 记录请求方法、请求地址、请求体和响应体。

你应该看到：

```text
POST /dev-api/vue-element-admin/user/login
请求体: { "username": "admin", "password": "111111" }
响应体: { "code": 20000, "data": { "token": "admin-token" } }
```

### 实验 B：理解密码显示按钮

点击密码框右侧的眼睛图标，观察密码框的 `type` 在 `password` 和空字符串之间切换。对应代码是 `showPwd()`。

这里的重点是：显示或隐藏密码只改变输入框表现，不会改变提交数据。

## 3. 学习 Axios 与 Vuex 登录动作

### 3.1 API 层只描述请求

`src/api/user.js` 的 `login(data)` 做的事情很少：

```js
return request({
  url: '/vue-element-admin/user/login',
  method: 'post',
  data
})
```

它没有保存 token，也没有跳转页面。这样分层后，API 文件只负责描述后端接口。

### 3.2 Vuex action 负责登录结果

`src/store/modules/user.js` 的 `login` action 做三件事：

1. 清理用户名：`username.trim()`。
2. 从响应中取出 `data.token`。
3. 同时提交 `SET_TOKEN` 并调用 `setToken` 写入 Cookie。

这里有两个存储位置：

- Vuex state：供当前页面运行时读取。
- Cookie `Admin-Token`：刷新页面后仍能恢复登录状态。

### 实验 C：观察 token

1. 用 `admin / 111111` 登录。
2. 在浏览器 Application/Storage 中找到 Cookie `Admin-Token`。
3. 刷新页面，观察仍然可以进入首页。
4. 在 `src/utils/auth.js` 中确认 Cookie 名称是 `Admin-Token`。
5. 退出登录，再观察这个 Cookie 是否被删除。

注意：当前 mock token 是固定字符串，真实系统通常由服务端生成短期 token，并在服务端验证。

### 3.3 请求拦截器如何携带 token

打开 `src/utils/request.js`：

```js
if (store.getters.token) {
  config.headers['X-Token'] = getToken()
}
```

这表示后续请求会自动携带 `X-Token` 请求头。登录接口本身发生在 token 产生之前，所以第一次登录请求不依赖这个请求头；`user/info` 等后续请求会携带它。

响应拦截器会检查后端自定义的 `res.code`：

- `20000`：返回业务数据。
- 其他值：弹出错误消息并 reject Promise。
- `50008`、`50012`、`50014`：视为 token 无效或过期，提示重新登录。

## 4. 学习 mock 数据是怎样变成接口的

### 4.1 mock/index.js 汇总模块

`mock/index.js` 引入 `mock/user.js`，然后通过展开运算符合并成 `mocks` 数组。每一项描述一个接口：

```js
{
  url: '/vue-element-admin/user/login',
  type: 'post',
  response: config => { ... }
}
```

因此新增 mock 接口通常包括两步：创建接口描述，再把文件引入汇总数组。

### 4.2 mock/mock-server.js 注册 Express 路由

开发服务器启动时，`vue.config.js` 的 `devServer.before` 会加载 `mock/mock-server.js`。

`responseFake` 会把：

```text
VUE_APP_BASE_API + mock url
/dev-api + /vue-element-admin/user/login
```

组合成正则 URL，再调用：

```js
app[mock.type](mock.url, mock.response)
```

所以浏览器请求 `/dev-api/vue-element-admin/user/login` 时，开发服务器可以在本地直接返回数据，不需要真正的后端服务。

`body-parser` 负责把 POST 请求体解析到 `req.body`。登录 mock 通过 `config.body.username` 读取用户名。

### 4.3 mock/user.js 的登录逻辑

当前登录 mock 的核心逻辑是：

```js
const token = tokens[username]

if (!token) {
  return { code: 60204, message: 'Account and password are incorrect.' }
}

return { code: 20000, data: token }
```

请特别注意：它只根据用户名查 token，没有检查密码。因此 `admin` 配合任意满足前端长度校验的密码都能成功。

## 5. 故意制造失败，观察错误链路

### 实验 D：未知用户名

1. 输入用户名 `student`，密码 `111111`。
2. 点击登录。
3. 观察页面消息和 Network 响应。
4. 回到 `mock/user.js`，找到错误码 `60204`。
5. 回到 `src/utils/request.js`，确认非 `20000` 会走 `Promise.reject`。
6. 回到登录页，确认 `.catch` 会把 `loading` 恢复为 `false`。

预期结果：请求到达 mock，但登录失败，页面不会进入首页。

### 实验 E：绕过前端校验的思考题

前端校验不是安全边界。即使把密码长度校验删掉，真实后端也必须重新校验用户名和密码。当前 mock 没有密码数据，所以它只能演示“用户名对应 token”的流程。

## 6. 给 mock 增加真正的密码校验

这是第一项代码练习。先在 `mock/user.js` 中把用户数据改成同时保存密码，例如：

```js
const accounts = {
  admin: { password: '111111', token: 'admin-token' },
  editor: { password: '111111', token: 'editor-token' }
}
```

然后修改登录 response：

```js
const { username, password } = config.body
const account = accounts[username]

if (!account || account.password !== password) {
  return {
    code: 60204,
    message: 'Account and password are incorrect.'
  }
}

return {
  code: 20000,
  data: { token: account.token }
}
```

练习要求：

1. 正确用户名和密码可以登录。
2. 正确用户名和错误密码不能登录。
3. 未知用户名不能登录。
4. `user/info` 仍能根据 `admin-token` 和 `editor-token` 返回资料。

修改 mock 文件后，开发服务器通常会自动热加载；若没有生效，停止并重新执行启动命令。

## 7. 学习 user/info 与路由守卫

登录成功只得到 token。进入首页前，`src/permission.js` 还会检查用户资料：

1. `getToken()` 从 Cookie 读取 token。
2. `store.dispatch('user/getInfo')` 调用 `/vue-element-admin/user/info`。
3. mock 从 `config.query.token` 读取 token。
4. `users[token]` 找到角色、姓名、头像和介绍。
5. Vuex 提交 `SET_ROLES`、`SET_NAME`、`SET_AVATAR`、`SET_INTRODUCTION`。
6. `permission/generateRoutes` 根据 roles 生成可访问路由。
7. `router.addRoutes(accessRoutes)` 动态添加路由。

### 实验 F：观察角色差异

1. 用 `admin` 登录，记录可见菜单。
2. 退出后用 `editor` 登录，记录可见菜单。
3. 对照 `mock/user.js` 中两个 token 对应的 `roles`。
4. 对照 `src/store/modules/permission.js` 中角色与路由的判断逻辑。

如果 token 被手动改成不存在的值，`user/info` 会返回 `50008`，路由守卫会清除 token 并跳回登录页。

## 8. 最终自测清单

完成本章后，你应该能独立完成这些任务：

- 在登录页增加一个表单字段，并说明它是否真正发送给 mock。
- 修改登录失败消息，并在页面看到它。
- 新增一个 `guest` 用户及其 `guest-token`。
- 为 `guest-token` 增加一份 `users` 资料。
- 解释为什么新增用户后还需要检查角色路由。
- 解释 `20000`、`60204`、`50008` 在请求拦截器中的不同结果。
- 使用 Network 面板确认请求地址包含 `/dev-api`。
- 解释 Cookie、Vuex state 和请求头之间的关系。

## 9. 推荐的学习顺序

每次只做一个小实验，并按下面格式记录：

```text
我修改了：
我预期看到：
实际看到：
真正决定行为的文件：
我还不明白：
```

建议顺序：

1. 先不改代码，完成调用链和 Network 观察。
2. 修改登录失败消息，验证 mock 热加载。
3. 增加密码校验，验证成功和失败分支。
4. 增加 `guest` 用户，观察 token、user/info 和角色菜单。
5. 最后再阅读 Axios 拦截器和路由守卫的异常分支。

这样学习时，每一个结论都能被浏览器请求、控制台输出或页面行为验证。
