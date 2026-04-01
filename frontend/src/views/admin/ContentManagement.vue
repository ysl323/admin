<template>
  <div class="content-management">
    <h2>内容管理</h2>

    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>
        <a @click="navigateToCategories" :class="{ active: currentView === 'categories' }">
          分类管理
        </a>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentView === 'lessons' || currentView === 'words'">
        <a @click="navigateToLessons" :class="{ active: currentView === 'lessons' }">
          {{ selectedCategory?.name }} - 课程管理
        </a>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentView === 'words'">
        <span class="active">第{{ selectedLesson?.lessonNumber }}课 - 单词管理</span>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 分类管理视图 -->
    <div v-if="currentView === 'categories'" class="view-container">
      <div class="tab-header">
        <div>
          <el-button type="primary" @click="showAddCategoryDialog">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
          <el-button type="success" @click="showImportDialog">
            <el-icon><Upload /></el-icon>
            一键导入课程
          </el-button>
          <el-button type="warning" @click="handleExportTxtZip">
            <el-icon><Download /></el-icon>
            导出TXT(ZIP)
          </el-button>
        </div>
        <el-input 
          v-model="categorySearch" 
          placeholder="搜索分类名称" 
          style="width: 300px"
          clearable
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table :data="filteredCategories" stripe @row-click="selectCategory" class="clickable-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称">
          <template #default="{ row }">
            <span class="clickable-cell">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lessonCount" label="课程数量" width="120" />
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button link size="small" @click.stop="editCategory(row)">编辑</el-button>
            <el-button link size="small" type="success" @click.stop="exportCategory(row)">导出</el-button>
            <el-button link size="small" type="danger" @click.stop="deleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 课程管理视图 -->
    <div v-if="currentView === 'lessons'" class="view-container">
      <div class="tab-header">
        <el-button type="primary" @click="showAddLessonDialog">
          <el-icon><Plus /></el-icon>
          新增课程
        </el-button>
      </div>

      <el-table :data="filteredLessons" stripe @row-click="selectLesson" class="clickable-table">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="lessonNumber" label="课程编号" width="120">
          <template #default="{ row }">
            <span class="clickable-cell">第{{ row.lessonNumber }}课</span>
          </template>
        </el-table-column>
        <el-table-column prop="wordCount" label="单词数量" width="120" />
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button link size="small" @click.stop="editLesson(row)">编辑</el-button>
            <el-button link size="small" type="success" @click.stop="exportLesson(row)">导出</el-button>
            <el-button link size="small" type="danger" @click.stop="deleteLesson(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 单词管理视图 -->
    <div v-if="currentView === 'words'" class="view-container">
      <div class="tab-header">
        <div>
          <el-button type="primary" @click="showAddWordDialog">
            <el-icon><Plus /></el-icon>
            新增单词
          </el-button>
        </div>
        <el-input 
          v-model="wordSearch" 
          placeholder="搜索英文或中文" 
          style="width: 300px"
          clearable
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table :data="filteredWords" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="english" label="英文" width="200" />
        <el-table-column prop="chinese" label="中文" width="200" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link size="small" @click="editWord(row)">编辑</el-button>
            <el-button link size="small" type="danger" @click="deleteWord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分类对话框 -->
    <el-dialog v-model="categoryDialog" :title="categoryDialogTitle" width="500px">
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 课程对话框 -->
    <el-dialog v-model="lessonDialog" :title="lessonDialogTitle" width="500px">
      <el-form :model="lessonForm" :rules="lessonRules" ref="lessonFormRef" label-width="100px">
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="lessonForm.categoryId" placeholder="请选择分类">
            <el-option 
              v-for="cat in categories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程编号" prop="lessonNumber">
          <el-input-number v-model="lessonForm.lessonNumber" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="lessonDialog = false">取消</el-button>
        <el-button type="primary" @click="saveLesson" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 单词对话框 -->
    <el-dialog v-model="wordDialog" :title="wordDialogTitle" width="500px">
      <el-form :model="wordForm" :rules="wordRules" ref="wordFormRef" label-width="100px">
        <el-form-item label="所属课程" prop="lessonId">
          <el-select 
            v-model="wordForm.lessonId" 
            placeholder="请选择课程"
            filterable
            style="width: 100%"
          >
            <el-option-group
              v-for="cat in categoriesWithLessons"
              :key="cat.id"
              :label="cat.name"
            >
              <el-option 
                v-for="lesson in cat.lessons" 
                :key="lesson.id" 
                :label="`第${lesson.lessonNumber}课`" 
                :value="lesson.id" 
              />
            </el-option-group>
          </el-select>
          <div v-if="categoriesWithLessons.length === 0" class="empty-tip">
            <el-alert type="warning" :closable="false" show-icon>
              <template #title>
                还没有课程，请先创建分类和课程后再添加单词
              </template>
            </el-alert>
          </div>
        </el-form-item>
        <el-form-item label="英文" prop="english">
          <el-input v-model="wordForm.english" placeholder="请输入英文单词" />
        </el-form-item>
        <el-form-item label="中文" prop="chinese">
          <el-input v-model="wordForm.chinese" placeholder="请输入中文翻译" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="wordDialog = false">取消</el-button>
        <el-button type="primary" @click="saveWord" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 一键导入对话框 -->
    <el-dialog v-model="importDialog" title="一键导入课程" width="700px">
      <el-form :model="importForm" :rules="importRules" ref="importFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-select 
            v-model="importForm.categoryName" 
            filterable 
            allow-create 
            default-first-option
            placeholder="选择已有分类或输入新分类名称"
          >
            <el-option 
              v-for="cat in categories" 
              :key="cat.id" 
              :label="cat.name" 
              :value="cat.name" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="导入方式">
          <el-radio-group v-model="importMethod">
            <el-radio value="text">粘贴 JSON 数据</el-radio>
            <el-radio value="file">上传 JSON 文件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="importMethod === 'text'" label="JSON 数据">
          <el-input 
            v-model="importForm.jsonData" 
            type="textarea" 
            :rows="12"
            placeholder='请粘贴 JSON 数据，格式：[{"lesson":1,"question":1,"english":"Excuse me!","chinese":"打扰一下！"}]'
          />
        </el-form-item>
        <el-form-item v-if="importMethod === 'file'" label="JSON 文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".json,.txt"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .json 和 .txt 文件（UTF-8 编码）</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-alert 
          title="数据格式说明" 
          type="info" 
          :closable="false"
          style="margin-bottom: 10px"
        >
          <template #default>
            <div style="font-size: 12px; line-height: 1.6;">
              <p><strong>必填字段：</strong>question（序号）、english（英文）、chinese（中文）</p>
              <p><strong>可选字段：</strong>lesson（课时号，有则按课时分组，无则全部内容在一起）</p>
              <p><strong>文件格式：</strong>支持 .json 和 .txt 文件，文件编码必须是 UTF-8</p>
              <p><strong>示例：</strong></p>
              <code style="display: block; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 5px;">
                [{"lesson":1,"question":1,"english":"Hello","chinese":"你好"}]
              </code>
              <p style="margin-top: 8px; color: #e6a23c;">
                <strong>注意：</strong>如果上传后中文显示乱码，请确保文件保存为 UTF-8 编码格式
              </p>
            </div>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="importDialog = false">取消</el-button>
        <el-button type="primary" @click="importLesson" :loading="importing">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Upload, Download } from '@element-plus/icons-vue';
import adminService from '../../services/admin';

// 视图状态
const currentView = ref('categories'); // 'categories' | 'lessons' | 'words'
const selectedCategory = ref(null);
const selectedLesson = ref(null);

const saving = ref(false);
const importing = ref(false);

// 分类数据
const categories = ref([]);
const categorySearch = ref('');
const categoryDialog = ref(false);
const categoryDialogTitle = ref('新增分类');
const categoryFormRef = ref(null);
const categoryForm = ref({ id: null, name: '' });
const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};

// 课程数据
const lessons = ref([]);
const lessonDialog = ref(false);
const lessonDialogTitle = ref('新增课程');
const lessonFormRef = ref(null);
const lessonForm = ref({ id: null, categoryId: null, lessonNumber: 1 });
const lessonRules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  lessonNumber: [{ required: true, message: '请输入课程编号', trigger: 'blur' }]
};

// 单词数据
const words = ref([]);
const wordSearch = ref('');
const wordDialog = ref(false);
const wordDialogTitle = ref('新增单词');
const wordFormRef = ref(null);
const wordForm = ref({ id: null, lessonId: null, english: '', chinese: '' });
const wordRules = {
  lessonId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  english: [{ required: true, message: '请输入英文单词', trigger: 'blur' }],
  chinese: [{ required: true, message: '请输入中文翻译', trigger: 'blur' }]
};

// 导入数据
const importDialog = ref(false);
const importFormRef = ref(null);
const importForm = ref({ categoryName: '', jsonData: '' });
const importMethod = ref('text'); // 'text' | 'file'
const fileList = ref([]);
const uploadRef = ref(null);
const importRules = {
  categoryName: [{ required: true, message: '请选择或输入分类名称', trigger: 'change' }]
};

// 计算属性
const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value;
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.value.toLowerCase())
  );
});

// 按分类组织的课程列表（用于单词对话框的课程选择）
const categoriesWithLessons = computed(() => {
  return categories.value.map(cat => ({
    ...cat,
    lessons: lessons.value.filter(lesson => lesson.categoryId === cat.id)
  })).filter(cat => cat.lessons.length > 0);
});

const filteredLessons = computed(() => {
  if (!selectedCategory.value) return [];
  return lessons.value.filter(lesson => lesson.categoryId === selectedCategory.value.id);
});

const filteredWords = computed(() => {
  let result = words.value;
  if (selectedLesson.value) {
    result = result.filter(word => word.lessonId === selectedLesson.value.id);
  }
  if (wordSearch.value) {
    const search = wordSearch.value.toLowerCase();
    result = result.filter(word => 
      word.english.toLowerCase().includes(search) || 
      word.chinese.includes(wordSearch.value)
    );
  }
  return result;
});

// 导航方法
const navigateToCategories = () => {
  currentView.value = 'categories';
  selectedCategory.value = null;
  selectedLesson.value = null;
};

const navigateToLessons = () => {
  currentView.value = 'lessons';
  selectedLesson.value = null;
};

const selectCategory = (row) => {
  selectedCategory.value = row;
  currentView.value = 'lessons';
  loadLessons();
};

const selectLesson = (row) => {
  selectedLesson.value = row;
  currentView.value = 'words';
  loadWords();
};

onMounted(() => {
  loadCategories();
  loadLessons();
  loadWords();
});

// 加载数据
const loadCategories = async () => {
  try {
    const response = await adminService.getCategories();
    if (response.success) {
      categories.value = response.categories || [];
    }
  } catch (error) {
    ElMessage.error('加载分类失败');
  }
};

const loadLessons = async () => {
  try {
    const response = await adminService.getLessons();
    if (response.success) {
      lessons.value = response.lessons || [];
    }
  } catch (error) {
    ElMessage.error('加载课程失败');
  }
};

const loadWords = async () => {
  try {
    const response = await adminService.getWords();
    if (response.success) {
      words.value = response.words || [];
    }
  } catch (error) {
    ElMessage.error('加载单词失败');
  }
};

// 分类操作
const showAddCategoryDialog = () => {
  categoryForm.value = { id: null, name: '' };
  categoryDialogTitle.value = '新增分类';
  categoryDialog.value = true;
};

const editCategory = (row) => {
  categoryForm.value = { ...row };
  categoryDialogTitle.value = '编辑分类';
  categoryDialog.value = true;
};

const saveCategory = async () => {
  if (!categoryFormRef.value) return;
  
  try {
    await categoryFormRef.value.validate();
    saving.value = true;
    
    const response = categoryForm.value.id
      ? await adminService.updateCategory(categoryForm.value.id, categoryForm.value.name)
      : await adminService.createCategory(categoryForm.value.name);
    
    if (response.success) {
      ElMessage.success(categoryForm.value.id ? '更新成功' : '创建成功');
      categoryDialog.value = false;
      loadCategories();
      loadLessons();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '操作失败');
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？这将同时删除该分类下的所有课程和单词！`,
      '警告',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    
    const response = await adminService.deleteCategory(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      loadCategories();
      loadLessons();
      loadWords();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除失败');
  }
};

// 课程操作
const showAddLessonDialog = () => {
  lessonForm.value = { 
    id: null, 
    categoryId: selectedCategory.value?.id || null, 
    lessonNumber: 1 
  };
  lessonDialogTitle.value = '新增课程';
  lessonDialog.value = true;
};

const editLesson = (row) => {
  lessonForm.value = { ...row };
  lessonDialogTitle.value = '编辑课程';
  lessonDialog.value = true;
};

const saveLesson = async () => {
  if (!lessonFormRef.value) return;
  
  try {
    await lessonFormRef.value.validate();
    saving.value = true;
    
    const response = lessonForm.value.id
      ? await adminService.updateLesson(lessonForm.value.id, lessonForm.value.lessonNumber)
      : await adminService.createLesson(lessonForm.value.categoryId, lessonForm.value.lessonNumber);
    
    if (response.success) {
      ElMessage.success(lessonForm.value.id ? '更新成功' : '创建成功');
      lessonDialog.value = false;
      loadLessons();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '操作失败');
  } finally {
    saving.value = false;
  }
};

const deleteLesson = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${row.categoryName} - 第${row.lessonNumber}课"吗？这将同时删除该课程下的所有单词！`,
      '警告',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    
    const response = await adminService.deleteLesson(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      loadLessons();
      loadWords();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除失败');
  }
};

// 单词操作
const showAddWordDialog = () => {
  wordForm.value = { 
    id: null, 
    lessonId: selectedLesson.value?.id || null, 
    english: '', 
    chinese: '' 
  };
  wordDialogTitle.value = '新增单词';
  wordDialog.value = true;
};

const editWord = (row) => {
  wordForm.value = { ...row };
  wordDialogTitle.value = '编辑单词';
  wordDialog.value = true;
};

const saveWord = async () => {
  if (!wordFormRef.value) return;
  
  try {
    await wordFormRef.value.validate();
    saving.value = true;
    
    const response = wordForm.value.id
      ? await adminService.updateWord(wordForm.value.id, wordForm.value)
      : await adminService.createWord(wordForm.value);
    
    if (response.success) {
      ElMessage.success(wordForm.value.id ? '更新成功' : '创建成功');
      wordDialog.value = false;
      loadWords();
    } else {
      ElMessage.error(response.message || '操作失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '操作失败');
  } finally {
    saving.value = false;
  }
};

const deleteWord = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除单词"${row.english} (${row.chinese})"吗？`,
      '警告',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    
    const response = await adminService.deleteWord(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      loadWords();
    } else {
      ElMessage.error(response.message || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error(error.message || '删除失败');
  }
};

// 一键导入操作
const showImportDialog = () => {
  importForm.value = { categoryName: '', jsonData: '' };
  importMethod.value = 'text';
  fileList.value = [];
  importDialog.value = true;
};

const handleFileChange = (file) => {
  // 更新文件列表
  fileList.value = [file];
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let content = e.target.result;
      
      // 尝试检测和修复编码问题
      // 如果内容包含乱码字符，尝试使用 UTF-8 解码
      if (content.includes('鎵')) {
        // 检测到可能的编码问题，尝试重新读取
        const blob = file.raw;
        const reReader = new FileReader();
        reReader.onload = (reEvent) => {
          importForm.value.jsonData = reEvent.target.result;
        };
        reReader.readAsText(blob, 'UTF-8');
      } else {
        importForm.value.jsonData = content;
      }
    } catch (error) {
      ElMessage.error('文件读取失败');
    }
  };
  reader.readAsText(file.raw, 'UTF-8');
};

const handleFileRemove = () => {
  importForm.value.jsonData = '';
  fileList.value = [];
};

const importLesson = async () => {
  try {
    // 验证分类名称
    if (!importForm.value.categoryName) {
      ElMessage.error('请输入分类名称');
      return;
    }

    // 验证数据
    if (importMethod.value === 'file') {
      // 文件上传模式：检查是否有文件内容（而不是检查 fileList）
      if (!importForm.value.jsonData) {
        ElMessage.error('请选择要上传的文件');
        return;
      }
    } else {
      // 文本模式：检查是否输入了数据
      if (!importForm.value.jsonData) {
        ElMessage.error('请输入 JSON 数据');
        return;
      }
    }
    
    // 解析 JSON
    let data;
    try {
      data = JSON.parse(importForm.value.jsonData);
    } catch (error) {
      // 提取错误位置信息
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const start = Math.max(0, pos - 30);
        const end = Math.min(importForm.value.jsonData.length, pos + 30);
        const snippet = importForm.value.jsonData.substring(start, end);
        ElMessage.error(`JSON 格式错误，位置 ${pos} 附近: ...${snippet}...`);
      } else {
        ElMessage.error('JSON 格式错误: ' + error.message);
      }
      return;
    }
    
    if (!Array.isArray(data)) {
      ElMessage.error('JSON 数据必须是数组格式');
      return;
    }
    
    importing.value = true;
    const response = await adminService.importSimpleLesson(data, importForm.value.categoryName);
    
    if (response.success) {
      const hasLesson = response.hasLessonField ? '按课时分组' : '全部内容';
      ElMessage.success(
        `导入成功！分类：${response.category}，课程：${response.lessonsCreated} 个，单词：${response.totalWords} 个（${hasLesson}）`
      );
      importDialog.value = false;
      loadCategories();
      loadLessons();
      loadWords();
    } else {
      ElMessage.error(response.message || '导入失败');
    }
  } catch (error) {
    if (error.errors) return;
    ElMessage.error(error.message || '导入失败');
  } finally {
    importing.value = false;
  }
};

// 导出TXT ZIP
const handleExportTxtZip = async () => {
  try {
    ElMessage.info('正在生成ZIP文件，请稍候...');
    
    const response = await fetch('/api/admin/export/txt-zip', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('导出失败');
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `lessons-export-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    ElMessage.success('导出成功！');
  } catch (error) {
    ElMessage.error(error.message || '导出失败');
  }
};

const exportCategory = async (category) => {
  try {
    ElMessage.info(`正在导出"${category.name}"的数据...`);

    const response = await adminService.exportCategoryData(category.id);

    if (response.success) {
      // 导出格式：[{lesson, question, english, phonetic, chinese}]
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${category.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      ElMessage.success(
        `导出成功！${response.stats.lessons} 个课程，${response.stats.words} 个单词`
      );
    } else {
      ElMessage.error(response.message || '导出失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '导出失败');
  }
};

const exportLesson = async (lesson) => {
  try {
    ElMessage.info(`正在导出第${lesson.lessonNumber}课...`);

    const response = await adminService.exportLessonData(lesson.id);
    
    if (response.success) {
      // 导出格式：[{lesson, question, english, phonetic, chinese}]
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lesson${lesson.lessonNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      ElMessage.success(`导出成功！${response.stats.words} 个单词`);
    } else {
      ElMessage.error(response.message || '导出失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '导出失败');
  }
};
</script>

<style scoped>
.content-management {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb a {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #66b1ff;
}

.breadcrumb .active {
  color: #303133;
  font-weight: 500;
  cursor: default;
}

.view-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header > div {
  display: flex;
  gap: 10px;
}

.clickable-table :deep(.el-table__row) {
  cursor: pointer;
}

.clickable-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.clickable-cell {
  color: #409eff;
  font-weight: 500;
}

.clickable-cell:hover {
  text-decoration: underline;
}

.empty-tip {
  margin-top: 10px;
}
</style>
