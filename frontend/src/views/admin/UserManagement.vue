<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="success" size="default" @click="handleCreateUser">
          <el-icon><Plus /></el-icon>
          <span class="btn-text">创建用户</span>
        </el-button>
        <el-button type="primary" size="default" @click="loadUsers">
          <el-icon><Refresh /></el-icon>
          <span class="btn-text">刷新</span>
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- PC端表格视图 -->
    <el-table v-else :data="users" stripe class="pc-table">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="username" label="用户名" min-width="100" />
      <el-table-column prop="accessDays" label="天数" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.isAdmin" type="success" size="small">永久</el-tag>
          <el-tag v-else :type="row.accessDays > 7 ? 'success' : row.accessDays > 0 ? 'warning' : 'danger'" size="small">
            {{ row.accessDays }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isSuperAdmin" label="超管" width="70">
        <template #default="{ row }">
          <el-tag v-if="row.isSuperAdmin" type="danger" size="small">是</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="isAdmin" label="管理员" width="70">
        <template #default="{ row }">
          <el-tag v-if="row.isAdmin" type="success" size="small">是</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态" width="70">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
            {{ row.isActive ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="240">
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="handleSetPermissions(row)">权限</el-button>
          <el-button link size="small" @click="handleEditUsername(row)">改名</el-button>
          <el-button link size="small" type="warning" @click="handleResetPassword(row)">改密</el-button>
          <el-button link size="small" :type="row.isActive ? 'danger' : 'success'" @click="handleToggleStatus(row)">
            {{ row.isActive ? '禁用' : '启用' }}
          </el-button>
          <el-button link size="small" type="danger" @click="handleDeleteUser(row)" :disabled="row.isSuperAdmin">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动端卡片视图 -->
    <div v-if="!loading" class="mobile-cards">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="card-header">
          <span class="username">{{ user.username }}</span>
          <el-tag v-if="user.isSuperAdmin" type="danger" size="small">超管</el-tag>
          <el-tag v-else-if="user.isAdmin" type="success" size="small">管理员</el-tag>
          <el-tag :type="user.isActive ? 'success' : 'danger'" size="small">
            {{ user.isActive ? '启用' : '禁用' }}
          </el-tag>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">剩余天数:</span>
            <el-tag v-if="user.isAdmin" type="success" size="small">永久</el-tag>
            <span v-else :class="user.accessDays <= 7 ? 'warning-text' : ''">{{ user.accessDays }} 天</span>
          </div>
          <div class="info-row">
            <span class="label">最后登录:</span>
            <span>{{ user.lastLoginIp || '-' }}</span>
          </div>
        </div>
        <div class="card-actions">
          <el-button size="small" type="primary" @click="handleSetPermissions(user)">权限</el-button>
          <el-button size="small" @click="handleEditUsername(user)">改名</el-button>
          <el-button size="small" type="warning" @click="handleResetPassword(user)">改密</el-button>
          <el-button size="small" :type="user.isActive ? 'danger' : 'success'" @click="handleToggleStatus(user)">
            {{ user.isActive ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteUser(user)" :disabled="user.isSuperAdmin">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 创建用户对话框 -->
    <el-dialog v-model="createUserDialog" title="创建新用户" width="400px">
      <el-form :model="createUserForm" :rules="createUserRules" ref="createUserFormRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createUserForm.username" placeholder="3-20字符" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createUserForm.password" type="password" placeholder="至少6字符" show-password clearable />
        </el-form-item>
        <el-form-item label="访问天数">
          <el-input-number v-model="createUserForm.accessDays" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="管理员">
          <el-switch v-model="createUserForm.isAdmin" />
          <span class="hint">管理员永久有效</span>
        </el-form-item>
        <el-form-item label="超级管理员">
          <el-switch v-model="createUserForm.isSuperAdmin" />
          <span class="hint">最高权限</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createUserDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateUser" :loading="submitting">创建</el-button>
      </template>
    </el-dialog>

    <!-- 设置权限对话框 -->
    <el-dialog v-model="permissionsDialog" title="设置用户权限" width="400px">
      <el-form :model="permissionsForm" ref="permissionsFormRef" label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="permissionsForm.username" disabled />
        </el-form-item>
        <el-form-item label="管理员">
          <el-switch v-model="permissionsForm.isAdmin" />
          <span class="hint">永久有效</span>
        </el-form-item>
        <el-form-item label="超级管理员">
          <el-switch v-model="permissionsForm.isSuperAdmin" />
          <span class="hint">最高权限</span>
        </el-form-item>
        <el-form-item label="访问天数" v-if="!permissionsForm.isAdmin">
          <el-input-number v-model="permissionsForm.accessDays" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionsDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmPermissions" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改用户名对话框 -->
    <el-dialog v-model="editUsernameDialog" title="修改用户名" width="400px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="当前用户">
          <el-input v-model="editForm.currentUsername" disabled />
        </el-form-item>
        <el-form-item label="新用户名" prop="newUsername">
          <el-input v-model="editForm.newUsername" placeholder="3-20字符" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editUsernameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEditUsername" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog v-model="resetPasswordDialog" title="重置密码" width="400px">
      <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="resetForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetForm.newPassword" type="password" placeholder="至少6字符" show-password clearable />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetForm.confirmPassword" type="password" placeholder="再次输入" show-password clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Edit, Key, Plus, Setting } from '@element-plus/icons-vue';
import adminService from '../../services/admin';

const loading = ref(false);
const submitting = ref(false);
const users = ref([]);

// 创建用户
const createUserDialog = ref(false);
const createUserFormRef = ref(null);
const createUserForm = ref({
  username: '',
  password: '',
  accessDays: 30,
  isAdmin: false,
  isSuperAdmin: false
});
const createUserRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' }
  ]
};

// 设置权限
const permissionsDialog = ref(false);
const permissionsFormRef = ref(null);
const permissionsForm = ref({
  userId: null,
  username: '',
  isAdmin: false,
  isSuperAdmin: false,
  accessDays: 0
});

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
    if (error.errors) return;
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
    if (error.errors) return;
    ElMessage.error(error.message || '密码重置失败');
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
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
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

// 创建用户
const handleCreateUser = () => {
  createUserForm.value = {
    username: '',
    password: '',
    accessDays: 30,
    isAdmin: false,
    isSuperAdmin: false
  };
  createUserDialog.value = true;
};

const confirmCreateUser = async () => {
  if (!createUserFormRef.value) return;
  
  try {
    await createUserFormRef.value.validate();
    
    submitting.value = true;
    const response = await adminService.createUser(createUserForm.value);
    
    if (response.success) {
      ElMessage.success('用户创建成功');
      createUserDialog.value = false;
      loadUsers();
    } else {
      ElMessage.error(response.message || '创建用户失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '创建用户失败');
  } finally {
    submitting.value = false;
  }
};

// 设置权限
const handleSetPermissions = (user) => {
  permissionsForm.value = {
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin || false,
    isSuperAdmin: user.isSuperAdmin || false,
    accessDays: user.accessDays || 0
  };
  permissionsDialog.value = true;
};

const confirmPermissions = async () => {
  submitting.value = true;
  try {
    const response = await adminService.updatePermissions(
      permissionsForm.value.userId,
      {
        isAdmin: permissionsForm.value.isAdmin,
        isSuperAdmin: permissionsForm.value.isSuperAdmin,
        accessDays: permissionsForm.value.accessDays
      }
    );
    
    if (response.success) {
      ElMessage.success('权限更新成功');
      permissionsDialog.value = false;
      loadUsers();
    } else {
      ElMessage.error(response.message || '更新权限失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '更新权限失败');
  } finally {
    submitting.value = false;
  }
};

// 删除用户
const handleDeleteUser = async (user) => {
  if (user.isSuperAdmin) {
    ElMessage.warning('不能删除超级管理员');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    const response = await adminService.deleteUser(user.id);
    
    if (response.success) {
      ElMessage.success('用户已删除');
      loadUsers();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除失败');
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
  flex-wrap: wrap;
  gap: 10px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.warning-text {
  color: #e6a23c;
}

/* PC端表格 - 默认显示 */
.pc-table {
  display: table;
}

/* 移动端卡片 - 默认隐藏 */
.mobile-cards {
  display: none;
}

.user-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.card-header .username {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-row .label {
  color: #909399;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .user-management {
    padding: 10px;
  }

  .header h2 {
    font-size: 18px;
  }

  .btn-text {
    display: none;
  }

  .pc-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }
}

/* 对话框移动端适配 */
@media screen and (max-width: 480px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
  }

  :deep(.el-form-item__label) {
    float: none;
    text-align: left;
    padding-bottom: 5px;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>
