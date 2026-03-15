# 学习页面重新设计文档

## 概述

本设计文档描述了学习页面的重新设计方案，旨在创建一个更加优雅、直观且功能完整的用户界面。设计将采用现代化的布局原则，同时保持所有现有功能的完整性。

## 架构

### 整体布局架构

学习页面将采用以下层次结构：

```
LearningPage
├── NavBar (顶部导航)
├── Breadcrumb (面包屑导航)
├── LoadingState (加载状态)
└── MainContent
    ├── HeaderSection (页面头部)
    ├── LearningModeSection (学习模式选择)
    ├── ProgressSection (进度显示)
    ├── WordLearningSection (核心学习区域)
    ├── ControlSection (控制按钮)
    └── CompletionDialog (完成对话框)
```

### 布局策略

1. **分离关注点**: 每个功能区域独立成卡片，便于维护和扩展
2. **响应式设计**: 支持桌面、平板和移动设备
3. **视觉层次**: 通过间距、阴影和颜色建立清晰的视觉层次
4. **一致性**: 所有组件遵循统一的设计语言

## 组件和接口

### 1. HeaderSection 组件

**职责**: 显示课程信息和整体进度

**接口**:
```typescript
interface HeaderSectionProps {
  lessonInfo: {
    categoryName: string;
    lessonNumber: number;
  };
  currentIndex: number;
  totalWords: number;
}
```

**设计特点**:
- 渐变背景突出重要信息
- 进度条显示整体完成度
- 响应式文字大小

### 2. LearningModeSection 组件

**职责**: 学习模式选择和切换

**接口**:
```typescript
interface LearningModeSectionProps {
  currentMode: LearningMode;
  disabled: boolean;
  onModeChange: (mode: LearningMode) => void;
}
```

**设计特点**:
- 卡片式布局，独立显示
- 图标 + 文字的模式按钮
- 活跃状态的视觉反馈

### 3. ProgressSection 组件

**职责**: 显示详细的学习进度和统计

**接口**:
```typescript
interface ProgressSectionProps {
  mode: LearningMode;
  progress: LearningProgress;
  sessionDuration: number;
  showPerformance: boolean;
}
```

**设计特点**:
- 独立卡片显示
- 多维度进度指标
- 实时更新动画

### 4. WordLearningSection 组件

**职责**: 核心学习交互区域

**接口**:
```typescript
interface WordLearningSectionProps {
  currentWord: Word;
  showAnswer: boolean;
  feedback: FeedbackState;
  onAnswerSubmit: (answer: string) => void;
  onPlayAudio: () => void;
}
```

**设计特点**:
- 最大的视觉权重
- 居中对齐的学习内容
- 清晰的输入反馈
- 动态下划线输入框

### 5. ControlSection 组件

**职责**: 学习流程控制

**接口**:
```typescript
interface ControlSectionProps {
  currentIndex: number;
  totalWords: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayAudio: () => void;
  onShowAnswer: () => void;
  onReset: () => void;
  onGoBack: () => void;
}
```

**设计特点**:
- 水平排列的按钮组
- 一致的按钮样式
- 禁用状态的视觉提示

## 数据模型

### LearningPageState

```typescript
interface LearningPageState {
  // 基础数据
  loading: boolean;
  words: Word[];
  currentIndex: number;
  lessonInfo: LessonInfo;
  
  // 交互状态
  userAnswer: string;
  showAnswer: boolean;
  isChecking: boolean;
  isPlaying: boolean;
  showCompleteDialog: boolean;
  
  // 多单词输入
  wordParts: string[];
  wordInputs: string[];
  wordErrors: boolean[];
  currentWordIndex: number;
  
  // 反馈状态
  feedback: {
    show: boolean;
    type: 'correct' | 'wrong';
    message: string;
  };
}
```

### 样式系统

```typescript
interface DesignTokens {
  colors: {
    primary: '#409eff';
    success: '#67c23a';
    warning: '#e6a23c';
    danger: '#f56c6c';
    background: '#f5f5f5';
    surface: '#ffffff';
    text: {
      primary: '#303133';
      secondary: '#606266';
      placeholder: '#c0c4cc';
    };
  };
  
  spacing: {
    xs: '4px';
    sm: '8px';
    md: '16px';
    lg: '24px';
    xl: '32px';
  };
  
  borderRadius: {
    sm: '4px';
    md: '8px';
    lg: '12px';
  };
  
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)';
    md: '0 2px 12px rgba(0, 0, 0, 0.1)';
    lg: '0 4px 20px rgba(0, 0, 0, 0.15)';
  };
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 布局响应性
*对于任何* 屏幕尺寸和设备类型，学习页面应该保持所有组件的可见性和可用性
**验证: 需求 2.3**

### 属性 2: 功能完整性
*对于任何* 用户操作，重新设计的页面应该提供与原始页面相同的功能响应
**验证: 需求 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### 属性 3: 状态一致性
*对于任何* 组件状态变化，所有相关的UI元素应该同步更新以反映新状态
**验证: 需求 4.1**

### 属性 4: 视觉一致性
*对于任何* 页面元素，应该遵循统一的设计语言和视觉规范
**验证: 需求 3.1**

### 属性 5: 性能保证
*对于任何* 用户交互，界面响应时间应该在可接受的范围内（<100ms开始响应）
**验证: 需求 5.4**

## 错误处理

### 加载错误
- 显示友好的错误信息
- 提供重试机制
- 自动重定向到安全页面

### 网络错误
- 缓存用户输入
- 显示离线状态
- 自动重连机制

### 音频播放错误
- 降级到浏览器TTS
- 显示播放失败提示
- 提供手动重试选项

## 测试策略

### 单元测试
- 组件渲染测试
- 用户交互测试
- 状态管理测试
- 错误边界测试

### 集成测试
- 组件间通信测试
- API集成测试
- 路由导航测试

### 端到端测试
- 完整学习流程测试
- 跨浏览器兼容性测试
- 响应式布局测试
- 可访问性测试

### 性能测试
- 页面加载时间测试
- 交互响应时间测试
- 内存使用测试
- 网络请求优化测试