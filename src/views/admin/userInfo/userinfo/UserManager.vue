<script lang='ts'>
import {
  NCard,
  NDatePicker,
  NDrawer,
  NInput,
  NSpace,
  NSpin,
  NTable,
  useMessage,
} from 'naive-ui'
import moment from 'moment'
import {
  addOrUpdateUserInfo,
  changeOpenApi,
  deleteUserInfo,
  getUserInfo,
} from '@/api'
import { SvgIcon } from '@/components/common'

interface UserInfo {
  userid: number
  username: string
  password: string
  usagecount: number
  currentPage: number
  pageSize: number
  usecount: number
  vipendday?: string
}

export default {
  components: {
    NSpin,
    NTable,
    NCard,
    NInput,
    SvgIcon,
    NDrawer,
    NDatePicker,
    NSpace,
  },
  data() {
    return {
      users: [
        // 添加更多假数据
      ] as UserInfo[],
      ms: useMessage(),
      cuInfo: { userid: -1, username: '', password: '', usagecount: 0, usecount: 0, vipendday: '' },
      loading: false,
      currentPage: 1,
      pageSize: 10,
      openapi: '',
      queryname: '',
      active: false,
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
    timestamp: {
      get() {
        if (this.cuInfo && this.cuInfo.vipendday)
          return moment(this.cuInfo.vipendday).valueOf()
        return moment().valueOf()
      },
      set(value) {
        if (this.cuInfo) {
          if (value)
            this.cuInfo.vipendday = moment(value).format('YYYY-MM-DD HH:mm:ss')
          else
            this.cuInfo.vipendday = ''
        }
      },
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
    makeaEmptyUser() {
      return { userid: -1, username: '', password: '', usagecount: 0, usecount: 0, vipendday: '' }
    },
    handleTime(value) {
      if (value)
        return moment(value).format('YYYY-MM-DD HH:mm:ss')

      return ''
    },
    async addUser() {
      this.active = true
      const newUser = {
        ...this.cuInfo,
      }
      try {
        this.loading = true
        const {
          message,
        } = await addOrUpdateUserInfo(this.cuInfo, false)
        this.ms.success(message ?? '')
        this.users.push(newUser)
        this.cuInfo = this.makeaEmptyUser()
        this.active = false
      }
      catch (error: any) {
        this.ms.error(error.message ?? '')
      }
      finally {
        this.loading = false
      }
    },
    async deleteUser(user: UserInfo) {
      try {
        this.loading = true
        const {
          message,
        } = await deleteUserInfo(user)
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
    editUser(user: UserInfo) {
      this.active = true
      this.cuInfo = { ...user }
      this.users = this.users.filter((item: any) => user.username !== item.username)
    },
    showAddUser(user: UserInfo) {
      this.active = true
    },
    drawerStateUpdate(show: boolean) {
      if (!show && this.cuInfo.userid > 0) {
        this.users.unshift({ ...this.cuInfo })
        this.cuInfo = this.makeaEmptyUser()
      }
      this.active = show
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
      <NDrawer v-model:show="active" :on-update:show="drawerStateUpdate" :width="502" placement="right">
        <NCard class="form">
          <NSpace vertical>
            <div class="row-content">
              <span class="centered">用户名：</span><input v-model="cuInfo.username" placeholder="用户名">
            </div>
            <div class="row-content">
              <span class="centered">用户密码：</span><input v-model="cuInfo.password" placeholder="用户密码">
            </div>
            <div class="row-content">
              <span class="centered">总字数(单位万)：</span><input
                v-model.number="cuInfo.usagecount" placeholder="总字数"
                type="number"
              >
            </div>
            <div class="row-content">
              <span class="centered">会员到期时间</span>
              <NDatePicker v-model:value="timestamp" type="datetime" clearable />
            </div>
            <button style="width: 100%;" @click="addUser">
              确定
            </button>
          </NSpace>
        </NCard>
      </NDrawer>

      <button style="margin-bottom: 10px;" @click="showAddUser">
        添加用户
      </button>
      <NInput v-model:value="queryname" placeholder="输入用户名查询">
        <template #suffix>
          <SvgIcon icon="ic:baseline-search" />
        </template>
      </NInput>

      <NCard
        :bordered="false"
        :title="`用户信息(总数：${users.length})` "
        class="mt-4 proCard"
        size="small"
        :segmented="{ content: true }"
      >
        <NTable :bordered="true" :single-line="false">
          <thead>
            <tr>
              <th>用户名</th>
              <th>总字数</th>
              <th>已用字数</th>
              <th>用户密码</th>
              <th>会员到期时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in displayedUsers" :key="index">
              <td>{{ user.username }}</td>
              <td>{{ user.usagecount }}</td>
              <td>{{ user.usecount }}</td>
              <td>{{ user.password }}</td>
              <td>{{ handleTime(user.vipendday) }}</td>
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

.centered {
  display: flex;
  align-items: center;
}

.form {
display: flex;
flex-direction: column;
justify-content: center;
margin-bottom: 20px;
}
.row-content {
display: flex;
flex-direction: row;
justify-content: space-between;
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
