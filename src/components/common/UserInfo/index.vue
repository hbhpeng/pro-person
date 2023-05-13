<script setup lang='ts'>
import {
  NSpin,
  useMessage,
} from 'naive-ui'
import {
  computed,
  ref,
  watch,
} from 'vue'
import {
  useAuthStoreWithout,
} from '@/store/modules/auth'
import {
  userActionLogin,
  userActionRegist,
} from '@/api'

const props = defineProps < Props > ()

const emit = defineEmits < Emit > ()

const authStore = useAuthStoreWithout()

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

// const showModal = ref(false)
const loginFormVisible = ref(true)
const registerFormVisible = ref(false)
const username = ref('')
const password = ref('')
const ms = useMessage()
const loading = ref(false)

watch(
  () => showModal,
  (value) => {
    if (value) {
      username.value = ''
      password.value = ''
    }
  }, {
    deep: true,
  },
)

// const openModal = () => {
//   showModal.value = true
// }

const closeModal = () => {
  showModal.value = false
}

const showLoginForm = () => {
  loginFormVisible.value = true
  registerFormVisible.value = false
}

const showRegisterForm = () => {
  loginFormVisible.value = false
  registerFormVisible.value = true
}

const validateUsername = (name: string) => {
  const regex = /^[a-zA-Z0-9_]{6,20}$/ // 匹配包含字母、数字和下划线的6-20个字符
  return regex.test(name)
}

const validatePassword = (mima: string) => {
  const regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,16}$/ // 匹配包含大写字母、小写字母、数字和特殊字符的8-16个字符
  return regex.test(mima)
}

const validateCanNext = () => {
  if (!validateUsername(username.value)) {
    ms.error('用户名不合法')
    return false
  }
  if (!validatePassword(password.value)) {
    ms.error('密码不合法')
    return false
  }
  return true
}

const loginOrRegister = async (isLogin: boolean) => {
  try {
    loading.value = true
    let userdata: any
    if (isLogin)
      userdata = await userActionLogin(username.value, password.value)

    else
      userdata = await userActionRegist(username.value, password.value)

    const message: string = userdata.message as string
    const data: string = userdata.data as string
    const {
      token,
    } = JSON.parse(data as any)
    showModal.value = false
    authStore.$state.userToken = token
    authStore.setUserT(token)
    ms.success(message ?? '')
  }
  catch (error: any) {
    ms.error(error.message ?? '')
  }
  finally {
    loading.value = false
  }
}

const loginAction = async () => {
  if (validateCanNext())
    loginOrRegister(true)
}
const registerAction = async () => {
  if (validateCanNext())
    loginOrRegister(false)
}
</script>

<template>
  <div v-if="showModal" class="modal">
    <NSpin :show="loading">
      <div class="modal-content">
        <button class="close-button user-info" @click="closeModal">
          X
        </button>

        <div v-if="loginFormVisible">
          <!-- <h2>登录</h2> -->
          <form class="user-info">
            <label class="user-info" for="email">账号:</label>
            <input id="email" v-model="username" class="user-info" type="email" name="email" placeholder="字母、数字和下划线的6-20个字符">

            <label class="user-info" for="password">密码:</label>
            <input id="password" v-model="password" class="user-info" type="password" name="password" placeholder="8-16个字符">

            <button class="user-info" type="submit" @click.prevent="loginAction">
              立即登录
            </button>
          </form>

          <p>没有账号? <a class="tap-a" href="#" @click.prevent="showRegisterForm">现在注册!</a></p>
        </div>

        <div v-if="registerFormVisible">
          <h2>注册</h2>
          <form class="user-info">
            <label class="user-info" for="email">账号:</label>
            <input id="email" v-model="username" class="user-info" type="email" name="email" placeholder="字母、数字和下划线的6-20个字符">

            <label class="user-info" for="password">密码:</label>
            <input id="password" v-model="password" class="user-info" type="password" name="password" placeholder="8-16个字符">

            <button class="user-info" type="submit" @click.prevent="registerAction">
              立即注册并登录
            </button>
          </form>

          <p class="user-info">
            已经有账户? <a class="tap-a user-info" href="#" @click.prevent="showLoginForm">立即登录!</a>
          </p>
        </div>
        <div>
          <img src="/src/assets/wechat_login.jpg" alt="">
        </div>
      </div>
    </NSpin>
  </div>
</template>

<style>
.modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.4);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.modal-content {
min-width: 300px;
background-color: white;
padding: 2rem;
border-radius: 10px;
box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.5);
position: relative;
}

.close-button {
position: absolute;
top: 0;
right: 0;
font-size: 1.5rem;
background: none;
border: none;
padding: 0.5rem;
cursor: pointer;
}

form.user-info {
display: flex;
flex-direction: column;
margin-top: 1rem;
}

label.user-info {
font-weight: bold;
margin-bottom: 0.25rem;
}

button[type='submit'].user-info {
padding: 10px;
background-color: #6AA1E7;
border-radius: 5px;
margin-bottom: 5px;
}

a.tap-a {
color: #6AA1E7;
/* 设置链接文本颜色 */
text-decoration: underline;
/* 给链接下划线 */
cursor: pointer;
/* 鼠标悬浮时更改光标形状 */
}

input[type="email"].user-info,
input[type="password"].user-info,
input[type="text"].user-info {
padding: 0.5rem;
margin-bottom: 1rem;
/* border: none; */
border: 0.125rem solid gray;
border-radius: 5px;
}

input::placeholder {
font-size: 12px;
}
</style>
