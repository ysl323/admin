# 管理后台模块实现说明

## 已完成功能

### 一、配置管理模块 ✅

#### 功能特性
1. **火山引擎 TTS 配置**
   - AppID 配置
   - API Key（密码输入，支持显示/隐藏）
   - API Secret（密码输入，支持显示/隐藏）
   - 接口地址（默认：https://openspeech.bytedance.com/api/v1/tts）
   - 默认音色选择（通用女声/男声、英文女声/男声）
   - 语言选择（中文/英文）

2. **谷歌 TTS 配置**
   - API Key（密码输入，支持显示/隐藏）
   - 默认语言（美式英语/英式英语/中文普通话/中文粤语）
   - 音色名称（如：en-US-Wavenet-D）
   - 语速调节（0.25-4.0，滑块+输入框）

3. **表单验证**
   - 必填项验证
   - URL 格式验证
   - 实时错误提示

4. **操作功能**
   - 保存配置（加密存储）
   - 重置表单
   - Tab 切换

#### 文件位置
- 前端：`frontend/src/views/admin/ConfigManagement.vue`
- API：`frontend/src/services/admin.js` (getTTSConfig, saveTTSConfig)

### 二、内容管理模块 ✅

#### 1. 分类管理
**功能：**
- 查看所有分类列表
- 新增分类（名称）
- 编辑分类（修改名称）
- 删除分类（级联删除课程和单词，二次确认）
- 搜索分类（按名称）
- 显示课程数量

**表格列：**
- ID
- 分类名称
- 课程数量
- 操作（编辑/删除）

#### 2. 课程管理
**功能：**
- 查看所有课程列表
- 新增课程（选择分类、输入课程编号）
- 编辑课程（修改课程编号）
- 删除课程（级联删除单词，二次确认）
- 按分类筛选
- 显示单词数量

**表格列：**
- ID
- 所属分类
- 课程编号
- 单词数量
- 操作（编辑/删除）

#### 3. 单词管理
**功能：**
- 查看所有单词列表
- 新增单词（选择课程、输入英文、中文）
- 编辑单词（修改英文、中文）
- 删除单词（二次确认）
- 按课程筛选
- 搜索单词（英文或中文）

**表格列：**
- ID
- 英文
- 中文
- 所属课程
- 操作（编辑/删除）

#### 文件位置
- 前端：`frontend/src/views/admin/ContentManagement.vue`
- API：`frontend/src/services/admin.js`

## 需要补充的后端实现

### 1. 配置管理后端 API

#### 已实现
- `GET /api/admin/config/tts` - 获取 TTS 配置（部分实现）
- `PUT /api/admin/config/tts` - 保存 TTS 配置（部分实现）

#### 需要完善
```javascript
// backend/src/routes/admin.js

/**
 * GET /api/admin/config/tts
 * 获取 TTS 配置
 */
router.get('/config/tts', async (req, res) => {
  try {
    const config = await AdminService.getTTSConfig();
    res.json({
      success: true,
      config: {
        volcengine: config.volcengine || {},
        google: config.google || {}
      }
    });
  } catch (error) {
    logger.error('获取 TTS 配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败'
    });
  }
});

/**
 * PUT /api/admin/config/tts
 * 保存 TTS 配置
 */
router.put('/config/tts', async (req, res) => {
  try {
    const { provider, config } = req.body;
    
    if (!provider || !config) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }
    
    const result = await AdminService.saveTTSConfig(provider, config);
    res.json(result);
  } catch (error) {
    logger.error('保存 TTS 配置失败:', error);
    res.status(500).json({
      success: false,
      message: '保存配置失败'
    });
  }
});
```

### 2. 内容管理后端 API

#### 需要添加的路由

```javascript
// backend/src/routes/admin.js

// ========== 分类管理 ==========

/**
 * GET /api/admin/categories
 * 获取所有分类（含课程数量）
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await AdminService.getAllCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

// POST /api/admin/categories - 已实现
// PUT /api/admin/categories/:id - 已实现
// DELETE /api/admin/categories/:id - 已实现

// ========== 课程管理 ==========

/**
 * GET /api/admin/lessons
 * 获取所有课程（含分类名称和单词数量）
 */
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await AdminService.getAllLessons();
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    logger.error('获取课程列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
});

// POST /api/admin/lessons - 已实现
// PUT /api/admin/lessons/:id - 已实现
// DELETE /api/admin/lessons/:id - 已实现

// ========== 单词管理 ==========

/**
 * GET /api/admin/words
 * 获取所有单词（含课程信息）
 */
router.get('/words', async (req, res) => {
  try {
    const words = await AdminService.getAllWords();
    res.json({
      success: true,
      words
    });
  } catch (error) {
    logger.error('获取单词列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取单词列表失败'
    });
  }
});

/**
 * POST /api/admin/words
 * 创建单词
 */
router.post('/words', async (req, res) => {
  try {
    const { lessonId, english, chinese } = req.body;
    
    if (!lessonId || !english || !chinese) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }
    
    const result = await AdminService.createWord(lessonId, english, chinese);
    res.json(result);
  } catch (error) {
    logger.error('创建单词失败:', error);
    res.status(500).json({
      success: false,
      message: '创建单词失败'
    });
  }
});

/**
 * PUT /api/admin/words/:id
 * 更新单词
 */
router.put('/words/:id', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id, 10);
    const { english, chinese } = req.body;
    
    if (isNaN(wordId)) {
      return res.status(400).json({
        success: false,
        message: '无效的单词 ID'
      });
    }
    
    const result = await AdminService.updateWord(wordId, english, chinese);
    res.json(result);
  } catch (error) {
    logger.error('更新单词失败:', error);
    res.status(500).json({
      success: false,
      message: '更新单词失败'
    });
  }
});

/**
 * DELETE /api/admin/words/:id
 * 删除单词
 */
router.delete('/words/:id', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id, 10);
    
    if (isNaN(wordId)) {
      return res.status(400).json({
        success: false,
        message: '无效的单词 ID'
      });
    }
    
    const result = await AdminService.deleteWord(wordId);
    res.json(result);
  } catch (error) {
    logger.error('删除单词失败:', error);
    res.status(500).json({
      success: false,
      message: '删除单词失败'
    });
  }
});
```

### 3. AdminService 方法

需要在 `backend/src/services/AdminService.js` 中添加：

```javascript
/**
 * 获取所有分类（含课程数量）
 */
async getAllCategories() {
  const categories = await Category.findAll({
    include: [{
      model: Lesson,
      attributes: []
    }],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('Lessons.id')), 'lessonCount']
      ]
    },
    group: ['Category.id']
  });
  
  return categories;
}

/**
 * 获取所有课程（含分类名称和单词数量）
 */
async getAllLessons() {
  const lessons = await Lesson.findAll({
    include: [
      {
        model: Category,
        attributes: ['name']
      },
      {
        model: Word,
        attributes: []
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('Words.id')), 'wordCount']
      ]
    },
    group: ['Lesson.id', 'Category.id']
  });
  
  return lessons.map(lesson => ({
    id: lesson.id,
    categoryId: lesson.categoryId,
    categoryName: lesson.Category.name,
    lessonNumber: lesson.lessonNumber,
    wordCount: lesson.get('wordCount')
  }));
}

/**
 * 获取所有单词（含课程信息）
 */
async getAllWords() {
  const words = await Word.findAll({
    include: [{
      model: Lesson,
      include: [{
        model: Category,
        attributes: ['name']
      }],
      attributes: ['lessonNumber', 'categoryId']
    }]
  });
  
  return words.map(word => ({
    id: word.id,
    lessonId: word.lessonId,
    english: word.english,
    chinese: word.chinese,
    lessonInfo: `${word.Lesson.Category.name} - 第${word.Lesson.lessonNumber}课`
  }));
}

/**
 * 创建单词
 */
async createWord(lessonId, english, chinese) {
  const word = await Word.create({
    lessonId,
    english,
    chinese
  });
  
  return {
    success: true,
    message: '单词创建成功',
    word
  };
}

/**
 * 更新单词
 */
async updateWord(wordId, english, chinese) {
  const word = await Word.findByPk(wordId);
  
  if (!word) {
    throw new Error('单词不存在');
  }
  
  if (english) word.english = english;
  if (chinese) word.chinese = chinese;
  await word.save();
  
  return {
    success: true,
    message: '单词更新成功',
    word
  };
}

/**
 * 删除单词
 */
async deleteWord(wordId) {
  const word = await Word.findByPk(wordId);
  
  if (!word) {
    throw new Error('单词不存在');
  }
  
  await word.destroy();
  
  return {
    success: true,
    message: '单词删除成功'
  };
}
```

## 使用说明

### 访问配置管理
1. 使用管理员账户登录（admin / admin123）
2. 点击"进入后台"
3. 在左侧菜单点击"配置管理"
4. 选择要配置的 TTS 提供商（火山引擎/谷歌）
5. 填写配置信息
6. 点击"保存配置"

### 访问内容管理
1. 使用管理员账户登录
2. 点击"进入后台"
3. 在左侧菜单点击"内容管理"
4. 选择要管理的内容类型（分类/课程/单词）
5. 进行增删改查操作

### 分类管理流程
1. 点击"新增分类"
2. 输入分类名称
3. 点击"保存"
4. 分类创建成功后，可以在该分类下创建课程

### 课程管理流程
1. 点击"新增课程"
2. 选择所属分类
3. 输入课程编号
4. 点击"保存"
5. 课程创建成功后，可以在该课程下添加单词

### 单词管理流程
1. 点击"新增单词"
2. 选择所属课程
3. 输入英文单词
4. 输入中文翻译
5. 点击"保存"

## 安全特性

### 配置管理
- API Key 和 Secret 使用密码输入框
- 支持显示/隐藏密码
- 配置加密存储在数据库中
- 只有管理员可以访问

### 内容管理
- 删除操作需要二次确认
- 级联删除会提示影响范围
- 所有操作记录在日志中
- 只有管理员可以访问

## 数据验证

### 配置管理
- AppID：必填
- API Key：必填
- API Secret：必填
- 接口地址：必填，URL 格式验证

### 内容管理
- 分类名称：必填
- 课程编号：必填，数字类型
- 单词英文：必填
- 单词中文：必填

## 测试建议

### 配置管理测试
1. 测试保存火山引擎配置
2. 测试保存谷歌配置
3. 测试表单验证（空值、格式错误）
4. 测试重置功能
5. 测试 Tab 切换

### 内容管理测试
1. 测试创建分类
2. 测试创建课程（关联分类）
3. 测试创建单词（关联课程）
4. 测试编辑功能
5. 测试删除功能（含级联删除）
6. 测试搜索和筛选功能

## 后续优化建议

### 功能增强
1. 批量操作（批量删除、批量导入）
2. 数据导出（Excel、CSV）
3. 操作历史记录
4. 数据统计和图表
5. 配置测试功能（测试 TTS 连接）

### 用户体验
1. 分页功能（数据量大时）
2. 拖拽排序
3. 快捷键支持
4. 操作撤销功能
5. 数据预览

### 性能优化
1. 虚拟滚动（大数据量）
2. 懒加载
3. 缓存策略
4. 批量请求优化

## 相关文件

### 前端文件
- `frontend/src/views/admin/ConfigManagement.vue` - 配置管理页面
- `frontend/src/views/admin/ContentManagement.vue` - 内容管理页面
- `frontend/src/services/admin.js` - 管理员 API 服务

### 后端文件（需要补充）
- `backend/src/routes/admin.js` - 管理员路由
- `backend/src/services/AdminService.js` - 管理员服务
- `backend/src/models/Config.js` - 配置模型

## 注意事项

1. **后端 API 未完全实现**：前端页面已完成，但部分后端 API 需要补充实现
2. **数据库模型**：确保 Category、Lesson、Word 模型关系正确配置
3. **权限控制**：所有管理员路由都需要 authMiddleware 和 adminMiddleware
4. **错误处理**：需要完善错误处理和日志记录
5. **数据验证**：后端需要添加数据验证逻辑

## 开发状态

- ✅ 前端配置管理页面
- ✅ 前端内容管理页面
- ✅ 前端 API 服务方法
- ⚠️ 后端配置管理 API（部分实现）
- ⚠️ 后端内容管理 API（部分实现）
- ⚠️ AdminService 方法（需要补充）
- ⚠️ 数据库查询优化（需要补充）

## 下一步工作

1. 实现后端 API 路由
2. 实现 AdminService 方法
3. 测试前后端集成
4. 完善错误处理
5. 添加数据验证
6. 编写测试用例
