<script>
import {
  NSpin,
  useMessage,
} from 'naive-ui'
import {
  adminActionLogin,
} from '@/api'
import {
  router,
} from '@/router'
import {
  useAuthStore,
} from '@/store'
export default {
  name: 'AdminLogin',
  components: {
    NSpin,
  },
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      ms: useMessage(),
    }
  },
  methods: {
    async login() {
      // TODO: 在这里实现登录逻辑
      // console.log(`用户名：${this.username}，密码：${this.password}`)
      try {
        this.loading = true
        const {
          message,
          data,
        } = await adminActionLogin(this.username, this.password)
        const {
          token,
        } = JSON.parse(data)
        const authStore = useAuthStore()
        authStore.setAdmainT(token)
        router.push({
          name: 'user',
        })
        this.ms.success(message ?? '')
      }
      catch (error) {
        this.ms.error(error.message ?? '')
      }
      finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <NSpin :show="loading">
    <div class="container">
      <h1>管理员登录</h1>
      <form>
        <div>
          <label for="username">用户名：</label>
          <input id="username" v-model="username" type="text">
        </div>
        <div>
          <label for="password">密码：</label>
          <input id="password" v-model="password" type="password">
        </div>
        <button type="submit" @click.prevent="login">
          登录
        </button>
      </form>
    </div>
  </NSpin>
</template>

<style>
.container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100vh;
}

h1 {
margin-bottom: 1rem;
}

form {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
}

label {
font-weight: bold;
margin-bottom: 0.5rem;
}

input {
padding: 0.5rem;
border-radius: 0.25rem;
border: 1px solid #ccc;
margin-bottom: 1rem;
}

button {
padding: 0.5rem 1rem;
border-radius: 0.25rem;
border: none;
background-color: #007bff;
color: #3f2e00;
font-weight: bold;
cursor: pointer;
}
</style>
