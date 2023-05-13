<script lang='ts'>
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
import bgImg from '@/assets/login_bg.webp'

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
      bgImg,
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
        } = JSON.parse(data as any)
        const authStore = useAuthStore()
        authStore.setAdmainT(token)
        router.push({
          name: 'user',
        })
        this.ms.success(message ?? '')
      }
      catch (error: any) {
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
    <div class="admin-login-container" :style="{ backgroundImage: `url(${bgImg})` }">
      <div class="m-auto p-15 f-c-c min-w-345 rounded-10 card-shadow bg-white bg-opacity-60">
        <div class="admin-login-white-back">
          <h1 class="admin-login-title">
            管理员登录
          </h1>
          <form class="admin-login-form">
            <div class="admin-login-row">
              <label class="admin-login-label" for="username">用户名：</label>
              <input id="username" v-model="username" class="admin-login-input" type="text">
            </div>
            <div class="admin-login-row">
              <label class="admin-login-label" for="password">密码：</label>
              <input id="password" v-model="password" class="admin-login-input" type="password">
            </div>
            <button class="admin-login-bt" type="submit" @click.prevent="login">
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  </NSpin>
</template>

<style>
.admin-login-title {
font-size: 24px;
margin-bottom: 40px;
text-align: center;
color: #6a6a6a;
}
.admin-login-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100vh;
width: 100%;
background-color: rgb(232,234,241);
}

.admin-login-row {
display: flex;
justify-content: space-between;
align-items: center;
width: 110%;
}

.admin-login-white-back {
background-color: rgba(245, 246, 251, 0.6);
padding: 40px;
border-radius: 10px;
box-shadow: 0 1px 2px -2px #00000029, 0 3px 6px #0000001f, 0 5px 12px 4px #00000017;
}

.title {
margin-bottom: 1rem;
}

.admin-login-form {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
}

.admin-login-label {
font-weight: bold;
margin-bottom: 0.5rem;
}

.admin-login-input {
padding: 0.5rem;
border-radius: 0.25rem;
border: 0.5px solid #007bff;
margin-bottom: 1rem;
}

button.admin-login-bt {
padding: 0.5rem 1rem;
border-radius: 0.25rem;
border: none;
background-color: #3361eb;
color: white;
font-weight: bold;
cursor: pointer;
height: 45px;
width: 110%;
margin-top: 20px;
}
</style>
