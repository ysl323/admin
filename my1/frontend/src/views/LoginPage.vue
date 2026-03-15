<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>编程英语单词学习系统</h2>
          <p>登录</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="80px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="footer-links">
            <span>还没有账号？</span>
            <el-link type="primary" @click="goToRegister">立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authService from '../services/auth';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    // 验证表单
    await loginFormRef.value.validate();

    loading.value = true;

    // 调用登录 API
    const response = await authService.login(
      loginForm.username,
      loginForm.password
    );

    if (response.success) {
      ElMessage.success('登录成功');
      
      // 跳转到分类首页
      router.push('/categories');
    } else {
      ElMessage.error(response.message || '登录失败');
    }
  } catch (error) {
    if (error.errors) {
      // 表单验证错误
      return;
    }
    
    // API 错误
    ElMessage.error(error.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 400px;
  max-width: 100%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.footer-links {
  width: 100%;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.footer-links span {
  margin-right: 8px;
}

/* ==================== 移动端优化 ==================== */

@media (max-width: 768px) {
  .login-container {
    padding: 12px;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
  }

  .login-card :deep(.el-card__header) {
    padding: 15px;
  }

  .login-card :deep(.el-card__body) {
    padding: 20px;
  }

  .card-header h2 {
    font-size: 20px;
  }

  .card-header p {
    font-size: 13px;
  }

  .el-form-item {
    margin-bottom: 16px;
  }

  .el-form-item :deep(.el-form-item__label) {
    font-size: 14px;
    padding-right: 8px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0;
    align-items: flex-start;
  }

  .login-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    margin-top: 10vh;
  }

  .card-header h2 {
    font-size: 18px;
  }

  .footer-links {
    font-size: 13px;
  }
}

/* ==================== 横屏优化 ==================== */

@media (max-width: 768px) and (orientation: landscape) {
  .login-container {
    padding: 10px;
  }

  .login-card {
    margin-top: 0;
  }
}
</style>
