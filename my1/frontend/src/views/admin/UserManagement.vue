<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="loadUsers">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 用户列表 -->
    <el-table v-else :data="users" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column prop="lastLoginIp" label="最后登录IP" width="140" />
      <el-table-column prop="accessDays" label="剩余天数" width="120">
        <template #default="{ row }">
          <el-tag :type="row.accessDays > 7 ? 'success' : row.accessDays > 0 ? 'warning' : 'danger'">
            {{ row.accessDays }} 天
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isAdmin" label="管理员" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isAdmin ? 'success' : 'info'">
            {{ row.isAdmin ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="300">
        <template #default="{ row }">
          <el-button link size="small" @click="handleEditUsername(row)">
            <el-icon><Edit /></el-icon>
            修改用户名
          </el-button>
          <el-button link size="small" type="warning" @click="handleResetPassword(row)">
            <el-icon><Key /></el-icon>
            重置密码
          </el-button>
          <el-button link size="small" type="primary" @click="handleAddDays(row)">
            <el-icon><Plus /></el-icon>
            加天数
          </el-button>
          <el-button 
            link
            size="small" 
            :type="row.isActive ? 'danger' : 'success'" 
            @click="handleToggleStatus(row)"
          >
            {{ row.isActive ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改用户名对话框 -->
    <el-dialog
      v-model="editUsernameDialog"
      title="修改用户名"
      width="400px"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="当前用户" prop="currentUsername">
          <el-input v-model="editForm.currentUsername" disabled />
        </el-form-item>
        <el-form-item label="新用户名" prop="newUsername">
          <el-input 
            v-model="editForm.newUsername" 
            placeholder="请输入新用户名（3-20字符）"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editUsernameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEditUsername" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialog"
      title="重置密码"
      width="400px"
    >
      <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="resetForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="resetForm.newPassword" 
            type="password"
            placeholder="请输入新密码（至少6字符）"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="resetForm.confirmPassword" 
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 增加天数对话框 -->
    <el-dialog
      v-model="addDaysDialog"
      title="增加访问天数"
      width="400px"
    >
      <el-form :model="addDaysForm" :rules="addDaysRules" ref="addDaysFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="addDaysForm.username" disabled />
        </el-form-item>
        <el-form-item label="当前天数">
          <el-input v-model="addDaysForm.currentDays" disabled />
        </el-form-item>
        <el-form-item label="增加天数" prop="days">
          <el-input-number 
            v-model="addDaysForm.days" 
            :min="1" 
            :max="365"
            placeholder="请输入要增加的天数"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDaysDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddDays" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Edit, Key, Plus } from '@element-plus/icons-vue';
import adminService from '../../services/admin';

const loading = ref(false);
const submitting = ref(false);
const users = ref([]);

// 修改用户名
const editUsernameDialog = ref(false);
const editFormRef = ref(null);
const editForm = ref({
  userId: null,
  currentUsername: '',
  newUsername: ''
});
const editRules = {
  newUsername: [
    { required: true, message: '请输入新用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' }
  ]
};

// 重置密码
const resetPasswordDialog = ref(false);
const resetFormRef = ref(null);
const resetForm = ref({
  userId: null,
  username: '',
  newPassword: '',
  confirmPassword: ''
});
const resetRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 增加天数
const addDaysDialog = ref(false);
const addDaysFormRef = ref(null);
const addDaysForm = ref({
  userId: null,
  username: '',
  currentDays: 0,
  days: 30
});
const addDaysRules = {
  days: [
    { required: true, message: '请输入要增加的天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '天数范围为 1-365', trigger: 'blur' }
  ]
};

onMounted(() => {
  loadUsers();
});

// 加载用户列表
const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await adminService.getUsers();
    if (response.success) {
      users.value = response.users || [];
    } else {
      ElMessage.error(response.message || '获取用户列表失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 修改用户名
const handleEditUsername = (user) => {
  editForm.value = {
    userId: user.id,
    currentUsername: user.username,
    newUsername: ''
  };
  editUsernameDialog.value = true;
};

const confirmEditUsername = async () => {
  if (!editFormRef.value) return;
  
  try {
    await editFormRef.value.validate();
    
    submitting.value = true;
    const response = await adminService.updateUsername(
      editForm.value.userId,
      editForm.value.newUsername
    );
    
    if (response.success) {
      ElMessage.success('用户名修改成功');
      editUsernameDialog.value = false;
      loadUsers();
    } else {
      ElMessage.error(response.message || '用户名修改失败');
    }
  } catch (error) {
    if (error.errors) return; // 表单验证错误
    ElMessage.error(error.message || '用户名修改失败');
  } finally {
    submitting.value = false;
  }
};

// 重置密码
const handleResetPassword = (user) => {
  resetForm.value = {
    userId: user.id,
    username: user.username,
    newPassword: '',
    confirmPassword: ''
  };
  resetPasswordDialog.value = true;
};

const confirmResetPassword = async () => {
  if (!resetFormRef.value) return;
  
  try {
    await resetFormRef.value.validate();
    
    submitting.value = true;
    const response = await adminService.resetPassword(
      resetForm.value.userId,
      resetForm.value.newPassword
    );
    
    if (response.success) {
      ElMessage.success('密码重置成功');
      resetPasswordDialog.value = false;
    } else {
      ElMessage.error(response.message || '密码重置失败');
    }
  } catch (error) {
    if (error.errors) return; // 表单验证错误
    ElMessage.error(error.message || '密码重置失败');
  } finally {
    submitting.value = false;
  }
};

// 增加天数
const handleAddDays = (user) => {
  addDaysForm.value = {
    userId: user.id,
    username: user.username,
    currentDays: user.accessDays,
    days: 30
  };
  addDaysDialog.value = true;
};

const confirmAddDays = async () => {
  if (!addDaysFormRef.value) return;
  
  try {
    await addDaysFormRef.value.validate();
    
    submitting.value = true;
    const response = await adminService.addAccessDays(
      addDaysForm.value.userId,
      addDaysForm.value.days
    );
    
    if (response.success) {
      ElMessage.success(`成功增加 ${addDaysForm.value.days} 天`);
      addDaysDialog.value = false;
      loadUsers();
    } else {
      ElMessage.error(response.message || '增加天数失败');
    }
  } catch (error) {
    if (error.errors) return; // 表单验证错误
    ElMessage.error(error.message || '增加天数失败');
  } finally {
    submitting.value = false;
  }
};

// 启用/禁用账号
const handleToggleStatus = async (user) => {
  try {
    const action = user.isActive ? '禁用' : '启用';
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await adminService.toggleUserStatus(user.id);
    
    if (response.success) {
      ElMessage.success(`${action}成功`);
      loadUsers();
    } else {
      ElMessage.error(response.message || `${action}失败`);
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '操作失败');
  }
};
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #303133;
}

.loading-container {
  padding: 20px;
}
</style>
