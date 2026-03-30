<template>
  <div class="config-management">
    <h2>配置管理</h2>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 火山引擎 TTS 配置 -->
      <el-tab-pane label="火山引擎 TTS" name="volcengine">
        <el-alert 
          title="配置模式说明" 
          type="info" 
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #default>
            <div style="font-size: 13px; line-height: 1.6;">
              <p><strong>简单模式：</strong>只需填写核心密钥（AppID、Access Token），适合快速配置</p>
              <p><strong>复杂模式：</strong>可自定义接口地址、音色、语言等高级参数，适合精细化配置</p>
              <p style="color: #E6A23C; margin-top: 8px;"><strong>注意：</strong>当前使用 Token 认证方式，不需要 Secret Key</p>
            </div>
          </template>
        </el-alert>

        <el-form :model="volcengineForm" :rules="volcengineRules" ref="volcengineFormRef" label-width="120px">
          <el-form-item label="配置模式">
            <el-radio-group v-model="volcengineMode" @change="handleVolcengineModeChange">
              <el-radio value="simple">简单模式</el-radio>
              <el-radio value="advanced">复杂模式</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-divider />

          <!-- 简单模式和复杂模式都需要的核心字段 -->
          <el-form-item label="AppID" prop="appId">
            <el-input v-model="volcengineForm.appId" placeholder="请输入 AppID (例如: 2128862431)" />
          </el-form-item>
          
          <el-form-item label="Access Token" prop="apiKey">
            <el-input 
              v-model="volcengineForm.apiKey" 
              type="password"
              show-password
              placeholder="请输入 Access Token (例如: eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq)"
            />
          </el-form-item>

          <!-- 复杂模式的额外字段 -->
          <template v-if="volcengineMode === 'advanced'">
            <el-divider content-position="left">高级配置</el-divider>
            
            <el-form-item label="接口地址" prop="endpoint">
              <el-input v-model="volcengineForm.endpoint" placeholder="https://openspeech.bytedance.com/api/v1/tts" />
            </el-form-item>
            
            <el-form-item label="默认音色" prop="voiceType">
              <el-select v-model="volcengineForm.voiceType" placeholder="请选择音色">
                <el-option label="通用女声" value="BV001_streaming" />
                <el-option label="通用男声" value="BV002_streaming" />
                <el-option label="英文女声" value="BV700_streaming" />
                <el-option label="英文男声" value="BV701_streaming" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="语言" prop="language">
              <el-select v-model="volcengineForm.language">
                <el-option label="中文" value="zh-CN" />
                <el-option label="英文" value="en-US" />
              </el-select>
            </el-form-item>
          </template>
          
          <el-form-item>
            <el-button type="primary" @click="saveVolcengineConfig" :loading="saving">保存配置</el-button>
            <el-button @click="showVolcengineTestDialog" :loading="testing">测试配置</el-button>
            <el-button @click="resetVolcengineForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 谷歌 TTS 配置 -->
      <el-tab-pane label="谷歌 TTS" name="google">
        <el-form :model="googleForm" :rules="googleRules" ref="googleFormRef" label-width="120px">
          <el-form-item label="API Key" prop="apiKey">
            <el-input 
              v-model="googleForm.apiKey" 
              type="password"
              show-password
              placeholder="请输入 Google API Key"
            />
          </el-form-item>
          
          <el-form-item label="默认语言" prop="languageCode">
            <el-select v-model="googleForm.languageCode">
              <el-option label="美式英语" value="en-US" />
              <el-option label="英式英语" value="en-GB" />
              <el-option label="中文（普通话）" value="zh-CN" />
              <el-option label="中文（粤语）" value="zh-HK" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="音色" prop="voiceName">
            <el-input v-model="googleForm.voiceName" placeholder="en-US-Wavenet-D" />
          </el-form-item>
          
          <el-form-item label="语速" prop="speakingRate">
            <el-slider v-model="googleForm.speakingRate" :min="0.25" :max="4.0" :step="0.25" show-input />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveGoogleConfig" :loading="saving">保存配置</el-button>
            <el-button @click="showGoogleTestDialog" :loading="testing">测试配置</el-button>
            <el-button @click="resetGoogleForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 火山引擎 TTS 测试对话框 -->
    <el-dialog v-model="volcengineTestDialog" title="测试火山引擎 TTS 配置" width="600px">
      <el-form label-width="100px">
        <el-form-item label="测试文本">
          <el-input 
            v-model="volcengineTestText" 
            type="textarea"
            :rows="3"
            placeholder="请输入要测试的文本（例如：Hello, this is a test.）"
          />
        </el-form-item>
        <el-alert 
          title="提示" 
          type="info" 
          :closable="false"
          style="margin-bottom: 10px"
        >
          <template #default>
            <div style="font-size: 12px;">
              点击"开始测试"后，系统将调用火山引擎 TTS API 生成语音。如果配置正确，将返回成功消息并可播放音频。
            </div>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="volcengineTestDialog = false">取消</el-button>
        <el-button type="primary" @click="testVolcengineConfig" :loading="testing">开始测试</el-button>
      </template>
    </el-dialog>

    <!-- 谷歌 TTS 测试对话框 -->
    <el-dialog v-model="googleTestDialog" title="测试谷歌 TTS 配置" width="600px">
      <el-form label-width="100px">
        <el-form-item label="测试文本">
          <el-input 
            v-model="googleTestText" 
            type="textarea"
            :rows="3"
            placeholder="请输入要测试的文本（例如：Hello, this is a test.）"
          />
        </el-form-item>
        <el-alert 
          title="提示" 
          type="info" 
          :closable="false"
          style="margin-bottom: 10px"
        >
          <template #default>
            <div style="font-size: 12px;">
              点击"开始测试"后，系统将调用谷歌 TTS API 生成语音。如果配置正确，将返回成功消息并可播放音频。
            </div>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="googleTestDialog = false">取消</el-button>
        <el-button type="primary" @click="testGoogleConfig" :loading="testing">开始测试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import adminService from '../../services/admin';

const activeTab = ref('volcengine');
const saving = ref(false);
const testing = ref(false);

// 火山引擎模式
const volcengineMode = ref('simple'); // simple 或 advanced

// 测试对话框
const volcengineTestDialog = ref(false);
const volcengineTestText = ref('Hello, this is a test.');
const googleTestDialog = ref(false);
const googleTestText = ref('Hello, this is a test.');

// 火山引擎表单
const volcengineFormRef = ref(null);
const volcengineForm = ref({
  appId: '',
  apiKey: '',
  endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts',
  voiceType: 'BV001_streaming',
  language: 'zh-CN',
  mode: 'simple' // 保存模式信息
});

const volcengineRules = {
  appId: [{ required: true, message: '请输入 AppID', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入 Access Token', trigger: 'blur' }],
  endpoint: [
    { required: true, message: '请输入接口地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的 URL', trigger: 'blur' }
  ]
};

// 谷歌表单
const googleFormRef = ref(null);
const googleForm = ref({
  apiKey: '',
  languageCode: 'en-US',
  voiceName: 'en-US-Wavenet-D',
  speakingRate: 1.0
});

const googleRules = {
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }]
};

onMounted(() => {
  loadConfig();
});

// 加载配置
const loadConfig = async () => {
  try {
    const response = await adminService.getTTSConfig();
    if (response.success && response.config) {
      // 加载火山引擎配置
      if (response.config.volcengine) {
        Object.assign(volcengineForm.value, response.config.volcengine);
        // 加载模式
        volcengineMode.value = response.config.volcengine.mode || 'simple';
      }
      // 加载谷歌配置
      if (response.config.google) {
        Object.assign(googleForm.value, response.config.google);
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
};

// 处理火山引擎模式切换
const handleVolcengineModeChange = (mode) => {
  if (mode === 'simple') {
    // 切换到简单模式，使用默认值
    volcengineForm.value.endpoint = 'https://openspeech.bytedance.com/tts_middle_layer/tts';
    volcengineForm.value.voiceType = 'BV001_streaming';
    volcengineForm.value.language = 'zh-CN';
  }
  volcengineForm.value.mode = mode;
};

// 显示火山引擎测试对话框
const showVolcengineTestDialog = () => {
  volcengineTestDialog.value = true;
};

// 显示谷歌测试对话框
const showGoogleTestDialog = () => {
  googleTestDialog.value = true;
};

// 保存火山引擎配置
const saveVolcengineConfig = async () => {
  if (!volcengineFormRef.value) return;
  
  try {
    await volcengineFormRef.value.validate();
    
    saving.value = true;
    
    // 保存时包含模式信息
    const configToSave = {
      ...volcengineForm.value,
      mode: volcengineMode.value
    };
    
    const response = await adminService.saveTTSConfig({
      provider: 'volcengine',
      config: configToSave
    });
    
    if (response.success) {
      ElMessage.success('配置保存成功');
    } else {
      ElMessage.error(response.message || '配置保存失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '配置保存失败');
  } finally {
    saving.value = false;
  }
};

// 保存谷歌配置
const saveGoogleConfig = async () => {
  if (!googleFormRef.value) return;
  
  try {
    await googleFormRef.value.validate();
    
    saving.value = true;
    const response = await adminService.saveTTSConfig({
      provider: 'google',
      config: googleForm.value
    });
    
    if (response.success) {
      ElMessage.success('配置保存成功');
    } else {
      ElMessage.error(response.message || '配置保存失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '配置保存失败');
  } finally {
    saving.value = false;
  }
};

// 重置表单
const resetVolcengineForm = () => {
  volcengineFormRef.value?.resetFields();
  volcengineMode.value = 'simple';
  loadConfig();
};

const resetGoogleForm = () => {
  googleFormRef.value?.resetFields();
  loadConfig();
};

// 测试火山引擎配置
const testVolcengineConfig = async () => {
  if (!volcengineTestText.value.trim()) {
    ElMessage.warning('请输入测试文本');
    return;
  }
  
  testing.value = true;
  try {
    const response = await adminService.testTTSProvider('volcengine', volcengineTestText.value);
    if (response.success) {
      ElMessage.success(response.message || '配置测试成功！语音生成正常');
      volcengineTestDialog.value = false;
    } else {
      ElMessage.warning(response.message || '配置测试失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '配置测试失败');
  } finally {
    testing.value = false;
  }
};

// 测试谷歌配置
const testGoogleConfig = async () => {
  if (!googleTestText.value.trim()) {
    ElMessage.warning('请输入测试文本');
    return;
  }
  
  testing.value = true;
  try {
    const response = await adminService.testTTSProvider('google', googleTestText.value);
    if (response.success) {
      ElMessage.success(response.message || '配置测试成功！语音生成正常');
      googleTestDialog.value = false;
    } else {
      ElMessage.warning(response.message || '配置测试失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '配置测试失败');
  } finally {
    testing.value = false;
  }
};
</script>

<style scoped>
.config-management {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.el-tabs {
  box-shadow: none;
}
</style>
