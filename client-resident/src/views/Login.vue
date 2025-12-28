<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="title">🛒 社区团购管理平台</h1>

      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="用户名 / 手机号"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="真实姓名"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="手机号"
                prefix-icon="Phone"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="address">
              <el-input
                v-model="registerForm.address"
                placeholder="收货地址"
                prefix-icon="Location"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="loading"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="footer-links">
        <el-link type="primary" @click="$router.push('/')">返回首页</el-link>
      </div>

      <!-- 测试账号快速填充 -->
      <div v-if="activeTab === 'login'" class="test-accounts">
        <div class="test-accounts-title">
          <el-icon><User /></el-icon>
          <span>测试账号 (点击快速填充)</span>
        </div>
        <div class="test-accounts-grid">
          <div
            v-for="account in testAccounts"
            :key="account.username"
            class="test-account-card"
            @click="fillAccount(account)"
          >
            <div class="account-name">{{ account.name }}</div>
            <div class="account-info">{{ account.username }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="copyright">© 2025 社区团购管理平台</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { residentRegister } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  address: ''
})

// 测试账号列表
const testAccounts = [
  { username: 'zhangsan', password: '123456', name: '张三' },
  { username: 'lisi', password: '123456', name: '李四' },
  { username: 'wangwu', password: '123456', name: '王五' },
  { username: 'zhaoliu', password: '123456', name: '赵六' },
  { username: 'sunqi', password: '123456', name: '孙七' }
]

// 快速填充账号
const fillAccount = (account) => {
  loginForm.username = account.username
  loginForm.password = account.password
  ElMessage.success(`已填充 ${account.name} 的账号信息`)
}

// 登录验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 注册验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ]
}

// 登录
const handleLogin = async () => {
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      await userStore.login(loginForm)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (error) {
      console.error('登录失败：', error)
    } finally {
      loading.value = false
    }
  })
}

// 注册
const handleRegister = async () => {
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      const { confirmPassword, ...data } = registerForm
      await residentRegister(data)
      ElMessage.success('注册成功，请登录')
      activeTab.value = 'login'
      // 清空注册表单
      Object.keys(registerForm).forEach(key => {
        registerForm[key] = ''
      })
    } catch (error) {
      console.error('注册失败：', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 450px;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
  color: #409eff;
}

.login-tabs {
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
}

.footer-links {
  text-align: center;
  margin-top: 20px;
}

.copyright {
  margin-top: 30px;
  color: #fff;
  font-size: 14px;
}

/* 测试账号样式 */
.test-accounts {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.test-accounts-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.test-accounts-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.test-account-card {
  padding: 12px 8px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
}

.test-account-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.account-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.account-info {
  font-size: 12px;
  color: #909399;
}
</style>
