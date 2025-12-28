<template>
  <div class="profile-page">
    <h1 class="page-title">👤 个人中心</h1>

    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <el-card class="user-card">
        <div class="user-header">
          <div class="avatar-upload" @click="handleAvatarClick">
            <el-avatar
              :size="80"
              :src="getAvatarUrl()"
              :icon="UserFilled"
            />
            <div class="avatar-overlay">
              <el-icon><Camera /></el-icon>
              <div class="upload-text">上传头像</div>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarChange"
            />
          </div>
          <div class="user-info">
            <h2>{{ userInfo?.name }}</h2>
            <p class="username">@{{ userInfo?.username }}</p>
          </div>
        </div>
        <el-divider />
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatPrice(stats.totalSpent) }}</div>
            <div class="stat-label">累计消费</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.pendingCount }}</div>
            <div class="stat-label">待确认</div>
          </div>
        </div>
      </el-card>

      <!-- 个人资料编辑 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3>个人资料</h3>
            <el-button
              v-if="!isEditing"
              type="primary"
              text
              @click="handleEdit"
            >
              编辑
            </el-button>
          </div>
        </template>
        <el-form
          ref="formRef"
          :model="form"
          :rules="formRules"
          label-width="100px"
          :disabled="!isEditing"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" disabled />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="收货地址" prop="address">
            <el-input
              v-model="form.address"
              type="textarea"
              :rows="3"
              placeholder="请输入收货地址"
            />
          </el-form-item>
          <el-form-item v-if="isEditing">
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 修改密码 -->
      <el-card class="password-card">
        <template #header>
          <h3>修改密码</h3>
        </template>
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入原密码"
            />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码（6-20位）"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleChangePassword">
              修改密码
            </el-button>
            <el-button @click="handleResetPasswordForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 快捷操作 -->
      <el-card class="actions-card">
        <template #header>
          <h3>快捷操作</h3>
        </template>
        <div class="action-buttons">
          <el-button
            :icon="ShoppingCart"
            @click="$router.push('/cart')"
          >
            购物车
          </el-button>
          <el-button
            :icon="List"
            @click="$router.push('/order')"
          >
            我的订单
          </el-button>
          <el-button
            :icon="HomeFilled"
            @click="$router.push('/')"
          >
            返回首页
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  ShoppingCart,
  List,
  HomeFilled,
  Camera
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getOrderList } from '@/api/order'
import { formatPrice } from '@/utils'
import request from '@/api/request'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const isEditing = ref(false)
const formRef = ref(null)
const passwordFormRef = ref(null)
const avatarInput = ref(null)

// 用户统计数据
const stats = reactive({
  orderCount: 0,
  totalSpent: 0,
  pendingCount: 0
})

// 个人资料表单
const form = reactive({
  username: '',
  name: '',
  phone: '',
  address: ''
})

// 原始数据备份
let originalForm = {}

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' },
    { min: 5, max: 200, message: '地址长度为5-200个字符', trigger: 'blur' }
  ]
}

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 加载用户信息
const loadUserInfo = () => {
  if (userInfo.value) {
    form.username = userInfo.value.username
    form.name = userInfo.value.name
    form.phone = userInfo.value.phone
    form.address = userInfo.value.address
    originalForm = { ...form }
  }
}

// 加载用户统计
const loadUserStats = async () => {
  try {
    const res = await getOrderList({ limit: 1000 })
    const orders = res.data.list || []

    stats.orderCount = orders.length
    stats.totalSpent = orders
      .filter(order => order.status === 2)
      .reduce((sum, order) => sum + order.total_amount, 0)
    stats.pendingCount = orders.filter(order => order.status === 0).length
  } catch (error) {
    console.error('加载用户统计失败：', error)
  }
}

// 编辑个人资料
const handleEdit = () => {
  isEditing.value = true
}

// 保存个人资料
const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request({
          url: '/resident/profile',
          method: 'put',
          data: {
            name: form.name,
            phone: form.phone,
            address: form.address
          }
        })

        ElMessage.success('个人资料修改成功')
        isEditing.value = false
        originalForm = { ...form }

        // 重新获取用户信息
        await userStore.fetchUserInfo()
      } catch (error) {
        console.error('修改个人资料失败：', error)
      }
    }
  })
}

// 取消编辑
const handleCancel = () => {
  Object.assign(form, originalForm)
  isEditing.value = false
  formRef.value?.clearValidate()
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request({
          url: '/auth/change-password',
          method: 'put',
          data: {
            old_password: passwordForm.oldPassword,
            new_password: passwordForm.newPassword
          }
        })

        ElMessage.success('密码修改成功，请重新登录')
        handleResetPasswordForm()

        // 登出并跳转到登录页
        setTimeout(() => {
          userStore.logout()
        }, 1500)
      } catch (error) {
        console.error('修改密码失败：', error)
      }
    }
  })
}

// 重置密码表单
const handleResetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 头像上传相关
const handleAvatarClick = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持上传 JPG、PNG、GIF 格式的图片')
    return
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('头像大小不能超过 5MB')
    return
  }

  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const res = await request({
      url: '/upload/avatar',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // 更新用户头像
    await request({
      url: '/resident/profile',
      method: 'put',
      data: { avatar: res.data.url }
    })

    ElMessage.success('头像上传成功')

    // 重新获取用户信息
    await userStore.fetchUserInfo()

    // 清空文件选择
    event.target.value = ''
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}

const getAvatarUrl = () => {
  if (!userInfo.value?.avatar) return ''
  const serverURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'
  return `${serverURL}${userInfo.value.avatar}`
}

onMounted(() => {
  loadUserInfo()
  loadUserStats()
})
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.user-card {
  grid-column: 1 / -1;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
}

.username {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  padding: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.info-card {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.password-card {
  grid-column: 1 / -1;
}

.actions-card {
  grid-column: 1 / -1;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.avatar-upload {
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.avatar-upload:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .user-card,
  .info-card,
  .password-card,
  .actions-card {
    grid-column: 1;
  }
}
</style>
