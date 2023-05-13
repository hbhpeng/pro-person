<script lang='ts'>
import {
  NCard,
  NInput,
  NSpin,
  NTable,
  useMessage,
} from 'naive-ui'
import {
  addOrUpdateUserInfo,
  changeOpenApi,
  deleteUserInfo,
  getUserInfo,
} from '@/api'

export default {
  components: {
    NSpin,
    NTable,
    NCard,
    NInput,
  },
  data() {
    return {
      users: [
        // 添加更多假数据
      ] as any[],
      ms: useMessage(),
      loading: false,
      userid: -1,
      username: '',
      password: '',
      usagecount: 0,
      currentPage: 1,
      pageSize: 10,
      usecount: 0,
      openapi: '',
      queryname: '',
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.users.length / this.pageSize)
    },
    displayedUsers() {
      const searchStr = this.queryname.trim()
      if (searchStr.length > 0)
        return this.users.filter((item: any) => item.username.includes(searchStr))

      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.users.slice(start, end)
    },
  },
  mounted() {
    try {
      this.loading = true
      getUserInfo(1, 1000, '').then((res) => {
        this.users = JSON.parse(res.data as any)
        this.ms.success(res.message ?? '')
        this.loading = false
      }).catch((reason: any) => {
        this.ms.success(reason.message ?? '')
        this.loading = false
      })
    }
    catch (error: any) {
      this.ms.error(error.message ?? '')
      this.loading = false
    }
    finally {
      this.loading = false
    }
    // try {
    //   this.loading = true
    //   // const { message } = await getUserInfo(0, 1000, '123456')
    //   // ms.success(message ?? '')
    // }
    // catch (error: any) {
    //   // ms.error(error.message ?? '')
    // }
    // finally {
    //   // this.loading = false
    // }
  },
  methods: {
    async changeKey() {
      try {
        this.loading = true
        const {
          message,
        } = await changeOpenApi(this.openapi)
        this.ms.success(message ?? '')
      }
      catch (error: any) {
        this.ms.error(error.message ?? '')
      }
      finally {
        this.loading = false
      }
    },
    async addUser() {
      const newUser = {
        username: this.username,
        usagecount: this.usagecount,
        password: this.password,
        userid: this.userid,
        usecount: this.usecount,
      }
      try {
        this.loading = true
        const {
          message,
        } = await addOrUpdateUserInfo(this.username, this.password, this.usagecount, this.usecount, this.userid, '',
          false)
        this.ms.success(message ?? '')
        this.users.push(newUser)
        this.username = ''
        this.password = ''
        this.usagecount = 0
        this.usecount = 0
        this.userid = -1
      }
      catch (error: any) {
        this.ms.error(error.message ?? '')
      }
      finally {
        this.loading = false
      }
    },
    async deleteUser(user: any) {
      try {
        this.loading = true
        const {
          message,
        } = await deleteUserInfo(user.username, user.password, user
          .usagecount, user.usecount, user.userid, '')
        this.ms.success(message ?? '')
        this.users = this.users.filter((item: any) => user.username !== item.username)
      }
      catch (error: any) {
        this.ms.error(error.message ?? '')
      }
      finally {
        this.loading = false
      }
    },
    editUser(user: any) {
      this.userid = user.userid
      this.username = user.username
      this.usagecount = user.usagecount
      this.password = user.password
      this.usecount = user.usecount
      this.users = this.users.filter((item: any) => user.username !== item.username)
    },
    prevPage() {
      if (this.currentPage > 1)
        this.currentPage--
    },
    nextPage() {
      if (this.currentPage < this.totalPages)
        this.currentPage++
    },
  },
}
</script>

<template>
  <NSpin :show="loading">
    <div class="container">
      <NInput v-model:value="queryname" placeholder="用户名查询" />
      <div>
        <input v-model="openapi" placeholder="秘钥">
        <button @click="changeKey">
          更换
        </button>
      </div>
      <div class="form">
        <input v-model="username" placeholder="用户名">
        <input v-model="password" placeholder="用户密码">
        <span style="margin-top: 5px;">总字数(单位万)：</span><input
          v-model.number="usagecount" placeholder="使用次数"
          type="number"
        >
        <button @click="addUser">
          添加用户
        </button>
      </div>
      <NCard
        :bordered="false"
        title="用户信息"
        class="mt-4 proCard"
        size="small"
        :segmented="{ content: true }"
      >
        <NTable :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>用户名</th>
              <th>总字数</th>
              <th>已用字数</th>
              <th>用户密码</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in displayedUsers" :key="index">
              <td>{{ user.username }}</td>
              <td>{{ user.usagecount }}</td>
              <td>{{ user.usecount }}</td>
              <td>{{ user.password }}</td>
              <td>
                <button @click="editUser(user)">
                  编辑
                </button>
                <button style="margin-left: 10px;" @click="deleteUser(user)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </NTable>
      </NCard>
      <div class="pagination">
        <button :disabled="currentPage === 1" @click="prevPage">
          上一页
        </button>
        <span>{{ currentPage }}</span>
        <button :disabled="currentPage === totalPages" @click="nextPage">
          下一页
        </button>
      </div>
    </div>
  </NSpin>
</template>

<style scoped>
.container {
width: 100%;
margin: 20px auto;
font-family: Arial, sans-serif;
}

.form {
display: flex;
justify-content: space-between;
margin-bottom: 20px;
}

input {
padding: 5px;
border: 1px solid #ccc;
border-radius: 3px;
margin: 5px;
}

button {
padding: 5px 10px;
background-color: #007bff;
color: white;
border: none;
border-radius: 3px;
cursor: pointer;
margin: 5px;
}

button:disabled {
background-color: #ccc;
}

.pagination {
display: flex;
justify-content: center;
align-items: center;
}

.pagination span {
margin: 0 10px;
}
</style>
