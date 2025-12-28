<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">社区团购管理平台 - 团长端</h2>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
          >
            登录系统
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span class="forgot-password">忘记密码？</span>
      </div>

      <!-- 测试账号快速填充 -->
      <div class="test-accounts">
        <div class="test-accounts-title">
          <el-icon><User /></el-icon>
          <span>测试账号 (点击快速填充)</span>
        </div>
        <div
          class="test-account-card"
          @click="fillAdminAccount"
        >
          <div class="account-name">👨‍💼 管理员</div>
          <div class="account-info">admin / 123456</div>
        </div>
      </div>
    </div>

    <div class="copyright">© 2025 社区团购管理平台</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
};

// 快速填充管理员账号
const fillAdminAccount = () => {
  loginForm.username = 'admin';
  loginForm.password = '123456';
  ElMessage.success('已填充管理员账号信息');
};

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate();

    loading.value = true;
    await userStore.login(loginForm);

    ElMessage.success('登录成功');
    router.push('/dashboard');
  } catch (error) {
    if (error !== false) {
      console.error('登录失败:', error);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 15px;
}

.forgot-password {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #409eff;
}

.copyright {
  margin-top: 30px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 测试账号样式 */
.test-accounts {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.test-accounts-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.test-account-card {
  padding: 15px;
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
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.account-info {
  font-size: 13px;
  color: #909399;
}
</style>
