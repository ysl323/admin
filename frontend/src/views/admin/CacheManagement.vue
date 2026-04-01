<template>
  <div class="cache-management">
    <h2>音频缓存管理</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">缓存总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatSize(stats.totalSize) }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalHits }}</div>
              <div class="stat-label">总命中次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.hitRate }}</div>
              <div class="stat-label">平均命中率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div>
        <el-button 
          type="danger" 
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button 
          type="warning" 
          @click="handleClearAll"
        >
          <el-icon><Delete /></el-icon>
          清空所有缓存
        </el-button>
        <el-button 
          type="success" 
          @click="handleExport"
        >
          <el-icon><Download /></el-icon>
          导出记录(JSON)
        </el-button>
        <el-button 
          type="success" 
          @click="handleExportFiles"
        >
          <el-icon><Download /></el-icon>
          导出音频文件(ZIP)
        </el-button>
        <el-button 
          type="primary" 
          @click="handleImport"
        >
          <el-icon><Upload /></el-icon>
          导入记录(JSON)
        </el-button>
        <el-button 
          type="primary" 
          @click="handleImportFiles"
        >
          <el-icon><Upload /></el-icon>
          导入音频文件(ZIP)
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <el-input
        v-model="searchText"
        placeholder="搜索文本内容"
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInputRef" 
      type="file" 
      accept=".json" 
      style="display: none" 
      @change="handleFileSelect"
    />
    <input 
      ref="zipFileInputRef" 
      type="file" 
      accept=".zip" 
      style="display: none" 
      @change="handleZipFileSelect"
    />

    <!-- 缓存列表 -->
    <el-table
      :data="caches"
      stripe
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="text" label="文本内容" min-width="300">
        <template #default="{ row }">
          <el-tooltip :content="row.text" placement="top">
            <span class="text-ellipsis">{{ row.text }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="provider" label="提供商" width="120">
        <template #default="{ row }">
          <el-tag :type="row.provider === 'volcengine' ? 'primary' : 'success'">
            {{ row.provider === 'volcengine' ? '火山引擎' : '谷歌' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fileSize" label="文件大小" width="120">
        <template #default="{ row }">
          {{ formatSize(row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="hitCount" label="命中次数" width="100" />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button 
            link 
            size="small" 
            @click="handlePlay(row)"
            :disabled="playingId === row.id"
          >
            <el-icon v-if="playingId === row.id"><Loading /></el-icon>
            <el-icon v-else><VideoPlay /></el-icon>
            {{ playingId === row.id ? '播放中' : '播放' }}
          </el-button>
          <el-button 
            link 
            size="small" 
            type="danger" 
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[20, 50, 100, 200]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Document, FolderOpened, View, TrendCharts, Delete, Refresh, 
  Search, VideoPlay, Loading, Download, Upload
} from '@element-plus/icons-vue';
import audioCacheService from '../../services/audioCache';
import AudioManager from '../../utils/AudioManager';

// 数据
const caches = ref([]);
const stats = ref({
  totalCount: 0,
  totalSize: 0,
  totalHits: 0,
  hitRate: 0,
  byProvider: []
});
const loading = ref(false);
const searchText = ref('');
const selectedIds = ref([]);
const playingId = ref(null);
const fileInputRef = ref(null);
const zipFileInputRef = ref(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(50);
const total = ref(0);

onMounted(() => {
  loadData();
  loadStatistics();
});

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const response = await audioCacheService.getCacheList({
      search: searchText.value,
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    });

    if (response && response.success) {
      caches.value = response.caches || [];
      total.value = response.total || 0;
    }
  } catch (error) {
    console.error('加载缓存列表失败:', error);
    ElMessage.error('加载缓存列表失败，请确保已登录管理员账号');
  } finally {
    loading.value = false;
  }
};

// 加载统计信息
const loadStatistics = async () => {
  try {
    const response = await audioCacheService.getStatistics();
    if (response && response.success) {
      stats.value = response.stats;
    }
  } catch (error) {
    console.error('加载统计信息失败:', error);
    ElMessage.error('加载统计信息失败，请确保已登录管理员账号');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id);
};

// 播放音频
const handlePlay = async (row) => {
  try {
    playingId.value = row.id;
    const audioUrl = audioCacheService.getAudioUrl(row.id);
    await AudioManager.play(audioUrl);
    playingId.value = null;
  } catch (error) {
    playingId.value = null;
    ElMessage.error('播放失败');
  }
};

// 删除单个
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除缓存"${row.text.substring(0, 50)}..."吗？`,
      '确认删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    const response = await audioCacheService.deleteCache(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      loadData();
      loadStatistics();
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除失败');
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个缓存吗？`,
      '确认批量删除',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    const response = await audioCacheService.batchDeleteCaches(selectedIds.value);
    if (response.success) {
      ElMessage.success(response.message);
      selectedIds.value = [];
      loadData();
      loadStatistics();
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '批量删除失败');
  }
};

// 清空所有
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有缓存吗？此操作不可恢复！',
      '警告',
      { 
        confirmButtonText: '确定清空', 
        cancelButtonText: '取消', 
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    );

    const response = await audioCacheService.clearAllCaches();
    if (response.success) {
      ElMessage.success(response.message);
      loadData();
      loadStatistics();
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '清空失败');
  }
};

// 分页变化
const handleSizeChange = () => {
  currentPage.value = 1;
  loadData();
};

const handlePageChange = () => {
  loadData();
};

// 导出缓存
const handleExport = async () => {
  try {
    const response = await audioCacheService.exportCaches();
    if (response.success) {
      // 创建下载链接
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-cache-export-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      ElMessage.success(`成功导出 ${response.count} 条缓存记录`);
    }
  } catch (error) {
    ElMessage.error(error.message || '导出失败');
  }
};

// 导出音频文件
const handleExportFiles = async () => {
  try {
    ElMessage.info('正在打包音频文件，请稍候...');
    
    const response = await audioCacheService.exportAudioFiles();
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-cache-${new Date().getTime()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    ElMessage.success('音频文件导出成功');
  } catch (error) {
    console.error('导出音频文件失败:', error);
    ElMessage.error(error.message || '导出音频文件失败');
  }
};

// 导入缓存
const handleImport = () => {
  fileInputRef.value?.click();
};

// 导入音频文件
const handleImportFiles = () => {
  zipFileInputRef.value?.click();
};

// 处理文件选择
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    const response = await audioCacheService.importCaches(data);
    if (response.success) {
      ElMessage.success(`成功导入 ${response.imported} 条缓存记录`);
      loadData();
      loadStatistics();
    }
  } catch (error) {
    ElMessage.error(error.message || '导入失败');
  } finally {
    // 清空文件输入
    event.target.value = '';
  }
};

// 处理ZIP文件选择
const handleZipFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    ElMessage.info('正在导入音频文件，请稍候...');
    
    const response = await audioCacheService.importAudioFiles(file);
    if (response.success) {
      const { result } = response;
      ElMessage.success(
        `导入完成！成功: ${result.imported}, 跳过: ${result.skipped}, 失败: ${result.errors.length}`
      );
      
      // 如果有错误，显示详细信息
      if (result.errors.length > 0) {
        console.error('导入错误:', result.errors);
      }
      
      loadData();
      loadStatistics();
    }
  } catch (error) {
    console.error('导入音频文件失败:', error);
    ElMessage.error(error.message || '导入音频文件失败');
  } finally {
    // 清空文件输入
    event.target.value = '';
  }
};

// 格式化文件大小
const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
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
</script>

<style scoped>
.cache-management {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar > div {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.text-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .cache-management {
    padding: 10px;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  /* 统计卡片：每行2个 */
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50%;
    margin-bottom: 10px;
  }

  .stat-card {
    margin-bottom: 0;
  }

  .stat-content {
    gap: 10px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 16px;
  }

  .stat-label {
    font-size: 12px;
  }

  /* 工具栏：按钮缩小，换行 */
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .toolbar .el-button {
    padding: 6px 10px;
    font-size: 12px;
  }

  .toolbar .el-button .el-icon {
    margin-right: 2px;
  }

  .toolbar .el-input {
    width: 100% !important;
    margin-top: 10px;
  }

  /* 表格：横向滚动 */
  .el-table {
    font-size: 12px;
  }

  .el-table .el-button--small {
    padding: 2px 6px;
    font-size: 11px;
  }

  /* 分页简化 */
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination :deep(.el-pagination__sizes),
  .pagination :deep(.el-pagination__jump) {
    display: none;
  }
}

@media (max-width: 480px) {
  .cache-management {
    padding: 8px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .stat-value {
    font-size: 14px;
  }

  .stat-label {
    font-size: 11px;
  }

  .toolbar .el-button {
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>
