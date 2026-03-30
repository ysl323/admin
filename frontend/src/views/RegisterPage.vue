<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>编程英语单词学习系统</h2>
          <p>注册新账号</p>
        </div>
      </template>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="100px"
        @submit.prevent="handleRegister"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少6个字符）"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="验证码" prop="captchaAnswer">
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 16px; font-weight: bold;">{{ captchaQuestion }}</span>
            <el-input
              v-model="registerForm.captchaAnswer"
              placeholder="请输入答案"
              style="width: 120px;"
              clearable
            />
            <el-button @click="refreshCaptcha" :loading="captchaLoading">
              刷新
            </el-button>
          </div>
        </el-form-item>

        <el-alert
          title="注册成功后将获得 3 天试用期"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <el-form-item>
          <div class="footer-links">
            <span>已有账号？</span>
            <el-link type="primary" @click="goToLogin">立即登录</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authService from '../services/auth';
import api from '../services/api';

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);
const captchaLoading = ref(false);
const captchaId = ref('');
const captchaQuestion = ref('');

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captchaAnswer: ''
});

// 自定义验证规则
const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码长度至少为 6 个字符'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  captchaAnswer: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
};

// 获取验证码
const fetchCaptcha = async () => {
  captchaLoading.value = true;
  try {
    const response = await api.get('/captcha');
    // 响应拦截器已经返回了 response.data，所以直接访问 response.success
    if (response.success) {
      captchaId.value = response.captchaId;
      captchaQuestion.value = response.question;
    } else {
      ElMessage.error('获取验证码失败');
    }
  } catch (error) {
    console.error('获取验证码错误:', error);
    ElMessage.error('获取验证码失败');
  } finally {
    captchaLoading.value = false;
  }
};

// 刷新验证码
const refreshCaptcha = () => {
  registerForm.captchaAnswer = '';
  fetchCaptcha();
};

onMounted(() => {
  fetchCaptcha();
});

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  try {
    // 验证表单
    await registerFormRef.value.validate();

    loading.value = true;

    // 调用注册 API
    const response = await authService.register(
      registerForm.username,
      registerForm.password,
      captchaId.value,
      registerForm.captchaAnswer
    );

    if (response.success) {
      ElMessage.success('注册成功！请登录');
      
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      ElMessage.error(response.message || '注册失败');
      // 刷新验证码
      refreshCaptcha();
    }
  } catch (error) {
    if (error.errors) {
      // 表单验证错误
      return;
    }
    
    // API 错误
    const message = error.message || '注册失败';
    
    if (message.includes('用户名已存在') || message.includes('already exists')) {
      ElMessage.error('用户名已存在，请更换用户名');
    } else if (message.includes('验证码')) {
      ElMessage.error(message);
    } else {
      ElMessage.error(message);
    }
    
    // 刷新验证码
    refreshCaptcha();
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 450px;
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
  .register-container {
    padding: 12px;
  }

  .register-card {
    width: 100%;
    max-width: 360px;
  }

  .register-card :deep(.el-card__header) {
    padding: 15px;
  }

  .register-card :deep(.el-card__body) {
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

  /* 验证码区域优化 */
  .el-form-item .el-input {
    flex: 1;
  }

  .el-form-item .el-button {
    margin-left: 8px;
    padding: 8px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0;
    align-items: flex-start;
  }

  .register-card {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    margin-top: 5vh;
  }

  .card-header h2 {
    font-size: 18px;
  }

  .footer-links {
    font-size: 13px;
  }

  /* 验证码区域垂直排列 */
  .el-form-item > div {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .el-form-item .el-input {
    margin-bottom: 8px;
  }

  .el-form-item .el-button {
    margin-left: 0;
  }
}

/* ==================== 横屏优化 ==================== */

@media (max-width: 768px) and (orientation: landscape) {
  .register-container {
    padding: 10px;
  }

  .register-card {
    margin-top: 0;
  }
}
</style>
