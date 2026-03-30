# 多单词输入功能改进

## 📅 实现时间
2026-03-09

## 🎯 功能需求

用户要求改进多单词短语的输入体验：

1. **多单词显示**: 如果内容是几个单词组成的短语，应该用下划线分隔显示多个输入框
2. **空格切换**: 输入完一个单词后按空格键切换到下一个单词
3. **错误处理**: 如果输入错误，清空当前单词并重新播放音频，等待再次输入
4. **逐词验证**: 输入完一个单词立即验证，错误时不能继续下一个
5. **最终提交**: 所有单词输入完成后再进行最终验证

---

## ✨ 实现的功能

### 1. 智能输入模式切换

**单个单词**:
- 显示一个输入框
- 按空格或回车提交答案

**多个单词** (例如: "hello world"):
- 显示多个输入框，用空格分隔
- 每个输入框宽度根据单词长度自动调整
- 占位符显示下划线（例如: `_____` 表示5个字母）

### 2. 逐词输入流程

```
1. 用户输入第一个单词
2. 按空格键 → 验证第一个单词
   - ✅ 正确: 自动聚焦到第二个输入框
   - ❌ 错误: 清空当前输入框，播放音频，等待重新输入
3. 重复步骤1-2，直到所有单词输入完成
4. 最后一个单词按空格或回车 → 提交完整答案
```

### 3. 视觉反馈

**正常状态**:
- 蓝色下划线
- 当前可输入的框有聚焦效果

**错误状态**:
- 红色下划线
- 抖动动画
- 显示错误提示

**禁用状态**:
- 灰色下划线
- 已输入或未到达的单词框禁用

---

## 🔧 技术实现

### 核心数据结构

```javascript
// 单词分割
const wordParts = ref([]);  // ['hello', 'world']

// 每个单词的输入值
const wordInputs = ref([]);  // ['', '']

// 输入框引用
const wordInputRefs = ref([]);

// 当前输入的单词索引
const currentWordIndex = ref(0);  // 0, 1, 2...

// 每个单词的错误状态
const wordErrors = ref([]);  // [false, false]
```

### 关键函数

#### 1. 初始化输入框
```javascript
const initWordInputs = () => {
  const english = currentWord.value.english || '';
  wordParts.value = english.split(' ').filter(part => part.length > 0);
  wordInputs.value = new Array(wordParts.value.length).fill('');
  wordErrors.value = new Array(wordParts.value.length).fill(false);
  currentWordIndex.value = 0;
  
  // 聚焦到第一个输入框
  nextTick(() => {
    if (wordParts.value.length === 1) {
      answerInputRef.value?.focus();
    } else {
      wordInputRefs.value[0]?.focus();
    }
  });
};
```

#### 2. 处理单词完成
```javascript
const handleWordComplete = async (index) => {
  const input = wordInputs.value[index].trim();
  const expected = wordParts.value[index];
  
  if (input.toLowerCase() === expected.toLowerCase()) {
    // ✅ 正确 - 移动到下一个单词
    if (index < wordParts.value.length - 1) {
      currentWordIndex.value = index + 1;
      wordInputRefs.value[index + 1]?.focus();
    } else {
      // 所有单词完成 - 提交答案
      await handleMultiWordSubmit();
    }
  } else {
    // ❌ 错误 - 清空并重新播放
    wordErrors.value[index] = true;
    wordInputs.value[index] = '';
    await playAudio(1);
    
    setTimeout(() => {
      wordErrors.value[index] = false;
      wordInputRefs.value[index]?.focus();
    }, 1000);
  }
};
```

#### 3. 提交多单词答案
```javascript
const handleMultiWordSubmit = async () => {
  const fullAnswer = wordInputs.value.join(' ').trim();
  const response = await learningService.checkAnswer(
    currentWord.value.id,
    fullAnswer
  );
  
  if (response.correct) {
    // 显示正确反馈，1秒后跳转下一题
    // ...
  }
};
```

---

## 🎨 UI 设计

### 模板结构

```vue
<div class="answer-input">
  <!-- 单个单词 -->
  <input v-if="wordParts.length === 1" ... />
  
  <!-- 多个单词 -->
  <div v-else class="multi-word-input">
    <div v-for="(part, index) in wordParts" class="word-part">
      <input
        :ref="el => wordInputRefs[index] = el"
        v-model="wordInputs[index]"
        :disabled="currentWordIndex !== index"
        :class="{ 'error': wordErrors[index] }"
        :style="{ width: `${Math.max(part.length * 20, 60)}px` }"
        @keydown.space.prevent="handleWordComplete(index)"
      />
    </div>
  </div>
</div>
```

### CSS 样式

```css
.multi-word-input {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.underline-input.error {
  border-bottom-color: #f56c6c;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

---

## 📊 用户体验流程

### 示例: 输入 "hello world"

```
步骤 1: 播放音频 "hello world" (2遍)
       显示: [_____] [_____]
              ↑ 聚焦

步骤 2: 用户输入 "hello"
       显示: [hello] [_____]
              ↑ 输入中

步骤 3: 用户按空格
       验证: "hello" ✅ 正确
       显示: [hello] [_____]
                      ↑ 自动聚焦

步骤 4: 用户输入 "word" (错误)
       显示: [hello] [word]
                      ↑ 输入中

步骤 5: 用户按空格
       验证: "word" ❌ 错误
       动作: 
         - 显示红色下划线 + 抖动动画
         - 播放音频 "hello world" (1遍)
         - 清空输入框
       显示: [hello] [_____]
                      ↑ 重新聚焦

步骤 6: 用户输入 "world"
       显示: [hello] [world]
                      ↑ 输入中

步骤 7: 用户按空格
       验证: "world" ✅ 正确
       动作: 提交完整答案 "hello world"
       结果: ✅ 正确！1秒后自动跳转下一题
```

---

## 🔄 与现有功能的集成

### 1. 保持兼容性
- 单个单词仍使用原有逻辑
- 多个单词使用新的逐词验证逻辑

### 2. 统一的导航
- "上一题"、"下一题" 按钮正常工作
- "重新本题" 重置所有输入框
- "显示答案" 显示完整短语

### 3. 音频播放
- 初始播放完整短语 (2遍)
- 输入错误时播放完整短语 (1遍)
- 手动播放按钮播放完整短语 (1遍)

---

## ✅ 测试场景

### 场景 1: 单个单词
- 输入: "hello"
- 预期: 显示一个输入框，按空格提交

### 场景 2: 两个单词
- 输入: "hello world"
- 预期: 显示两个输入框，逐词验证

### 场景 3: 三个单词
- 输入: "good morning everyone"
- 预期: 显示三个输入框，逐词验证

### 场景 4: 输入错误
- 输入第一个单词错误
- 预期: 清空，播放音频，重新输入

### 场景 5: 中途错误
- 第一个单词正确，第二个单词错误
- 预期: 第一个单词保持，第二个清空并重新输入

---

## 📝 代码变更

### 修改的文件
- `my1/frontend/src/views/LearningPage.vue`

### 新增的功能
1. 多单词输入框渲染
2. 逐词验证逻辑
3. 错误处理和音频重播
4. 动态输入框宽度
5. 错误状态动画

### 新增的数据
- `wordParts`: 单词分割数组
- `wordInputs`: 每个单词的输入值
- `wordInputRefs`: 输入框引用数组
- `currentWordIndex`: 当前输入位置
- `wordErrors`: 错误状态数组

### 新增的方法
- `initWordInputs()`: 初始化输入框
- `handleWordInput()`: 处理输入事件
- `handleWordComplete()`: 处理单词完成
- `handleMultiWordSubmit()`: 提交多单词答案

---

## 🚀 部署步骤

### 1. 构建前端
```bash
cd my1/frontend
npm run build
```

### 2. 上传到服务器
```powershell
# 使用部署脚本
.\my1\deploy-frontend-only.ps1
```

### 3. 测试
- 访问: http://47.97.185.117
- 选择一个包含多单词短语的课程
- 测试逐词输入功能

---

## 💡 未来改进建议

### 1. 更智能的提示
- 显示每个单词的字母数量
- 提供首字母提示

### 2. 更丰富的反馈
- 正确时显示绿色对勾
- 错误时显示具体错在哪里

### 3. 键盘快捷键
- Tab 键切换到下一个单词
- Shift+Tab 返回上一个单词

### 4. 进度保存
- 记录每个单词的输入历史
- 统计每个单词的错误次数

---

## 📞 相关文档

- 原始需求: 用户反馈
- 实现文件: `my1/frontend/src/views/LearningPage.vue`
- 测试指南: 本文档 "测试场景" 部分

---

**实现人员**: AI Assistant  
**实现日期**: 2026-03-09  
**功能状态**: ✅ 已实现，待部署测试
