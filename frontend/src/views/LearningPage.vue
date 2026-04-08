<template>
  <div class="learning-page">
    <NavBar />
    
    <div class="content">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/categories' }">
          <el-icon><HomeFilled /></el-icon>
          学习分类
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="lessonInfo.categoryName" :to="{ path: `/categories/${lessonInfo.categoryId}/lessons` }">
          {{ lessonInfo.categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>第 {{ lessonInfo.lessonNumber }} 课</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 学习内容 -->
      <div v-else-if="words.length > 0" class="learning-container">
        <!-- 课程信息卡片 -->
        <el-card class="lesson-info-card" shadow="hover">
          <div class="lesson-header">
            <h2>{{ lessonInfo.categoryName }} - 第 {{ lessonInfo.lessonNumber }} 课</h2>
            <div class="progress-info">
              <span class="progress-text">第 {{ currentIndex + 1 }} / {{ words.length }} 题</span>
              <el-progress
                :percentage="progressPercentage"
                :stroke-width="8"
                style="width: 200px; margin-left: 15px;"
              />
            </div>
          </div>
        </el-card>

        <!-- 学习模式和进度显示超紧凑合并卡片 -->
        <el-card class="mode-progress-ultra-compact-card" shadow="hover">
          <div class="ultra-compact-row">
            <div class="compact-mode-section">
              <LearningModeSelector
                :current-display-mode="learningStore.displayMode"
                :current-sequence-mode="learningStore.sequenceMode"
                :disabled="learningStore.isLoading"
                @display-mode-change="handleDisplayModeChange"
                @sequence-mode-change="handleSequenceModeChange"
                :compact="true"
              />
            </div>
            <div class="compact-review-section" @click.stop @click.prevent>
              <ReviewLessonSelector
                v-model="reviewLessonIds"
                :current-lesson-id="lessonId"
                :all-lessons="allLessons"
                :disabled="learningStore.isLoading"
                @change="handleReviewChange"
              />
            </div>
            <div class="compact-progress-section">
              <ProgressDisplay
                :mode="learningStore.displayMode"
                :progress="learningStore.progress"
                :session-duration="learningStore.sessionDuration"
                :show-performance="true"
                :compact="true"
              />
            </div>
          </div>
        </el-card>

        <!-- 单词学习卡片 -->
        <el-card class="word-learning-card" shadow="hover">
          <div class="word-learning-content">
            <!-- 单词类型标签 -->
            <div v-if="currentWord.isReview" class="word-type-badge review-badge">
              <el-tag type="warning" size="small" effect="plain">复习</el-tag>
              <span class="review-lesson">第{{ getReviewLessonNumber(currentWord.lessonId) }}课</span>
            </div>

            <!-- 中文提示 -->
            <div class="chinese-hint">
              <el-icon :size="24"><ChatDotRound /></el-icon>
              <span>{{ currentWord.chinese }}</span>
            </div>

            <!-- 英文单词（小白模式下：未掌握显示，已掌握隐藏；答对或显示答案后显示） -->
            <div v-if="showEnglish" class="english-word">
              <h1 v-html="highlightedAnswer"></h1>
              <p v-if="currentWord.phonetic" class="phonetic">{{ currentWord.phonetic }}</p>
            </div>

            <!-- 答案输入框 - 支持多单词 -->
            <div class="answer-input">
              <!-- 单个单词输入 -->
              <div v-if="wordParts.length === 1" class="word-input-wrapper">
                <input
                  ref="answerInputRef"
                  v-model="userAnswer"
                  type="text"
                  class="solid-underline-input"
                  :disabled="isChecking || showAnswer"
                  :style="{ width: `${(wordParts[0]?.length || 5) * 25}px` }"
                  @keydown.space.prevent="handleSubmit"
                  @keyup.enter="handleSubmit"
                  @input="handleSingleWordInput"
                />
              </div>
              
              <!-- 多单词输入 -->
              <div v-else class="multi-word-input">
                <div 
                  v-for="(part, index) in wordParts" 
                  :key="index"
                  class="word-part"
                >
                  <input
                    :ref="el => wordInputRefs[index] = el"
                    v-model="wordInputs[index]"
                    type="text"
                    class="solid-underline-input"
                    :class="{ 'error': wordErrors[index] }"
                    :disabled="isChecking || showAnswer"
                    :style="{ width: `${(part?.length || 3) * 25}px` }"
                    @keydown.space.prevent="handleWordComplete(index)"
                    @keyup.enter="handleWordComplete(index)"
                    @input="handleWordInput(index)"
                  />
                </div>
              </div>
            </div>

            <!-- 反馈信息 -->
            <transition name="fade">
              <div v-if="feedback.show" class="feedback" :class="feedback.type">
                <el-icon :size="28">
                  <SuccessFilled v-if="feedback.type === 'correct'" />
                  <CircleCloseFilled v-else />
                </el-icon>
                <span>{{ feedback.message }}</span>
              </div>
            </transition>
          </div>
        </el-card>

        <!-- 控制按钮卡片 -->
        <el-card class="control-buttons-card" shadow="hover">
          <div class="control-buttons">
            <el-button @click="goBackToLessons">
              <el-icon><Back /></el-icon>
              返回课程列表
            </el-button>

            <el-button :disabled="currentIndex === 0" @click="handlePrevious">
              <el-icon><ArrowLeft /></el-icon>
              上一题
            </el-button>

            <!-- 掌握按钮：仅小白模式显示 -->
            <el-button
              v-if="learningStore.isBeginnerMode"
              :type="isCurrentPageWordMastered ? 'info' : 'success'"
              :loading="learningStore.masteryLoading"
              @click="handleMarkAsMastered"
            >
              <el-icon><CircleCheckFilled /></el-icon>
              {{ isCurrentPageWordMastered ? '取消掌握' : '掌握' }}
            </el-button>

            <el-button type="primary" :loading="isPlaying" @click="handlePlayAudio">
              <el-icon><VideoPlay /></el-icon>
              播放发音
            </el-button>

            <el-button @click="handleShowAnswer">
              <el-icon><View /></el-icon>
              显示答案
            </el-button>

            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重新开始
            </el-button>

            <el-button :disabled="currentIndex === words.length - 1" @click="handleNext">
              下一题
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>

        <!-- 完成提示 -->
        <el-dialog
          v-model="showCompleteDialog"
          title="恭喜完成！"
          width="400px"
          :close-on-click-modal="false"
        >
          <div class="complete-content">
            <el-icon :size="64" color="#67c23a"><CircleCheckFilled /></el-icon>
            <p>您已完成本课程的所有单词学习！</p>
            <p class="stats">共 {{ words.length }} 个单词</p>
          </div>
          <template #footer>
            <el-button @click="goBackToLessons">返回课程列表</el-button>
            <el-button type="primary" @click="handleRestart">重新学习</el-button>
          </template>
        </el-dialog>

        <!-- 设置对话框 -->
        <el-dialog
          v-model="showSettingsDialog"
          title="设置"
          width="500px"
          :close-on-click-modal="false"
          @close="closeSettings"
        >
          <div class="settings-content">
            <!-- 快捷键设置 -->
            <div class="settings-section">
              <h3 class="section-title">快捷键设置</h3>
              <p class="section-desc">点击快捷键区域，然后按下组合键进行设置</p>
              
              <div class="shortcut-list">
                <div 
                  v-for="(config, action) in settings.shortcuts" 
                  :key="action"
                  class="shortcut-item"
                >
                  <span class="shortcut-label">{{ config.label }}</span>
                  <div 
                    class="shortcut-value"
                    :class="{ 'editing': editingShortcut === action }"
                    @click="startEditShortcut(action)"
                    @keydown="handleShortcutKeydown"
                    :tabindex="editingShortcut === action ? 0 : -1"
                    ref="shortcutInputRef"
                  >
                    <template v-if="editingShortcut === action">
                      <span class="editing-hint">{{ pressedKeys.length > 0 ? formatShortcut(pressedKeys) : '请按下组合键...' }}</span>
                    </template>
                    <template v-else>
                      {{ formatShortcut(config.keys) }}
                    </template>
                  </div>
                  <el-button 
                    v-if="editingShortcut === action"
                    type="info" 
                    size="small"
                    @click="cancelEditShortcut"
                  >
                    取消
                  </el-button>
                </div>
              </div>

              <div class="shortcut-actions">
                <el-button @click="resetToDefaultShortcuts">恢复默认</el-button>
              </div>
            </div>
          </div>
          
          <template #footer>
            <el-button @click="closeSettings">取消</el-button>
            <el-button type="primary" :loading="settingsLoading" @click="saveSettings">
              保存设置
            </el-button>
          </template>
        </el-dialog>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="该课程暂无单词"
        :image-size="200"
      >
        <el-button type="primary" @click="goBackToLessons">返回课程列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  HomeFilled,
  ChatDotRound,
  SuccessFilled,
  CircleCloseFilled,
  ArrowLeft,
  ArrowRight,
  VideoPlay,
  View,
  RefreshLeft,
  CircleCheckFilled,
  Back
} from '@element-plus/icons-vue';
import NavBar from '../components/NavBar.vue';
import LearningModeSelector from '../components/LearningModeSelector.vue';
import ReviewLessonSelector from '../components/ReviewLessonSelector.vue';
import ProgressDisplay from '../components/ProgressDisplay.vue';
import learningService from '../services/learning';
import ttsService from '../services/tts';
import AudioManager from '../utils/AudioManager';
import { useLearningStore } from '../stores/learning';
import userSettingsService from '../services/userSettings';
import eventBus from '../utils/eventBus';
import vowelHighlighter from '../utils/vowelHighlighter';

const router = useRouter();
const route = useRoute();
const learningStore = useLearningStore();

// 数据状态
const loading = ref(true);
const words = ref([]);
const currentIndex = ref(0);
const userAnswer = ref('');
const showAnswer = ref(false);
const isChecking = ref(false);
const isPlaying = ref(false);
const showCompleteDialog = ref(false);
const answerInputRef = ref(null);

// 复习相关
const reviewLessonIds = ref([]);
const allLessons = ref([]);

// 多单词输入相关
const wordParts = ref([]);
const wordInputs = ref([]);
const wordInputRefs = ref([]);
const currentWordIndex = ref(0);
const wordErrors = ref([]);

// 设置相关
const showSettingsDialog = ref(false);
const settingsLoading = ref(false);
const settings = reactive({
  shortcuts: {}
});
const editingShortcut = ref(null);
const pressedKeys = ref([]);

// 按住快捷键显示答案相关
const showAnswerWhenHolding = ref(false);
const isShortcutKeyPressed = ref(false);

// 处理显示模式切换（小白/进阶）
const handleDisplayModeChange = async (newDisplayMode) => {
  try {
    await learningStore.switchDisplayMode(newDisplayMode);
    ElMessage.success(`已切换到${newDisplayMode === 'beginner' ? '小白模式' : '进阶模式'}`);
  } catch (error) {
    ElMessage.error('切换显示模式失败: ' + error.message);
  }
};

// 处理顺序模式切换
const handleSequenceModeChange = async (newSequenceMode) => {
  try {
    await learningStore.switchSequenceMode(newSequenceMode);
    
    // 获取新模式下的当前单词
    const storeCurrentWord = learningStore.currentWord;
    if (storeCurrentWord) {
      // 找到对应的单词索引
      const wordIndex = words.value.findIndex(w => w.id === storeCurrentWord.id);
      if (wordIndex !== -1) {
        currentIndex.value = wordIndex;
      }
    }
    
    // 重新初始化输入
    showAnswer.value = false;
    feedback.value.show = false;
    initWordInputs();
    await playAudio(2);
    
    ElMessage.success(`已切换到${learningStore.currentModeDisplayName}`);
  } catch (error) {
    ElMessage.error('切换学习模式失败: ' + error.message);
  }
};


// 获取下一个单词（基于学习模式）
const getNextWordFromStore = async () => {
  try {
    const nextWord = await learningStore.loadNextWord();
    if (nextWord) {
      // 找到对应的单词索引
      const wordIndex = words.value.findIndex(w => w.id === nextWord.id);
      if (wordIndex !== -1) {
        currentIndex.value = wordIndex;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to get next word from store:', error);
    return false;
  }
};

// 课程信息
const lessonInfo = ref({
  categoryId: null,
  categoryName: '',
  lessonNumber: null
});

// 反馈信息
const feedback = ref({
  show: false,
  type: 'correct', // 'correct' or 'wrong'
  message: ''
});

// 计算属性
const lessonId = computed(() => parseInt(route.params.id));
const currentWord = computed(() => words.value[currentIndex.value] || {});
const progressPercentage = computed(() => {
  if (words.value.length === 0) return 0;
  return Math.round(((currentIndex.value + 1) / words.value.length) * 100);
});

// 带元音高亮的答案（用于显示）
const highlightedAnswer = computed(() => {
  if (currentWord.value?.english) {
    return vowelHighlighter.highlightText(currentWord.value.english);
  }
  return '';
});

// 英文显示逻辑：根据模式、掌握状态和是否显示答案决定
const showEnglish = computed(() => {
  // 如果手动显示了答案，始终显示
  if (showAnswer.value) {
    return true;
  }

  // 小白模式下，根据掌握状态决定
  if (learningStore.isBeginnerMode) {
    // 使用当前页面实际显示的单词ID来判断，而不是store的currentWord
    // 这样可以确保每个单词独立判断，不会影响其他单词
    const wordId = currentWord.value?.id;
    if (!wordId) {
      return false;
    }
    // 如果当前单词已掌握，则隐藏英文
    return !learningStore.masteredWords.includes(wordId);
  }

  // 其他模式下，不显示英文（需要听写）
  return false;
});

// 生命周期
onMounted(async () => {
  // 初始化学习状态管理
  learningStore.initialize();

  // 加载用户设置
  await loadUserSettings();

  // 添加全局键盘监听
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('keyup', handleGlobalKeyup);

  await loadWords();
  if (words.value.length > 0) {
    // 启动学习会话
    await learningStore.startSession(lessonId.value, words.value);
    initWordInputs();
    await playAudio(2); // 自动播放2遍
  }

  // 监听键盘弹出，自动滚动到输入框
  if (window.visualViewport) {
    const handleResize = () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'INPUT') {
        setTimeout(() => {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window._viewportHandler = handleResize;
  }
});

onUnmounted(() => {
  AudioManager.stop();
  // 移除键盘监听
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('keyup', handleGlobalKeyup);
  // 移除事件监听
  eventBus.off('openSettings', openSettings);
  if (window.visualViewport && window._viewportHandler) {
    window.visualViewport.removeEventListener('resize', window._viewportHandler);
  }
});

// 加载单词列表
const loadWords = async () => {
  loading.value = true;
  try {
    const response = await learningService.getWordsByLesson(lessonId.value);
    if (response.success) {
      words.value = response.words || [];
      // 后端返回的数据结构是 { lesson: {...}, words: [...] }
      lessonInfo.value = {
        categoryId: response.lesson?.categoryId || response.categoryId,
        categoryName: response.lesson?.categoryName || response.categoryName,
        lessonNumber: response.lesson?.lessonNumber || response.lessonNumber
      };

      // 加载当前分类的所有课程，用于复习选择
      if (lessonInfo.value.categoryId) {
        await loadAllLessons(lessonInfo.value.categoryId);
      }
    } else {
      ElMessage.error(response.message || '获取单词列表失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '获取单词列表失败');
    setTimeout(() => {
      router.push('/categories');
    }, 2000);
  } finally {
    loading.value = false;
  }
};

// 加载当前分类的所有课程
const loadAllLessons = async (categoryId) => {
  try {
    const response = await learningService.getLessonsByCategory(categoryId);
    if (response.success) {
      allLessons.value = response.lessons || [];
    }
  } catch (error) {
    console.error('Failed to load all lessons:', error);
  }
};

// 处理复习课程变化
const handleReviewChange = async (selectedIds) => {
  console.log('[LearningPage] handleReviewChange called with:', selectedIds);
  try {
    if (selectedIds.length === 0) {
      console.log('[LearningPage] No review lessons selected, clearing review');
      // 清除复习，只保留当前课程单词
      const currentWords = words.value.filter(w => !w.isReview);
      words.value = currentWords.map(w => ({ ...w, isReview: false }));
      console.log('[LearningPage] Cleared review words, remaining:', words.value.length);
      if (words.value.length > 0) {
        await learningStore.startSession(lessonId.value, words.value);
        initWordInputs();
      }
      return;
    }

    console.log('[LearningPage] Loading review words for lessons:', selectedIds);
    // 加载复习课程的单词
    const reviewWordsPromises = selectedIds.map(async (id) => {
      const response = await learningService.getWordsByLesson(id);
      const lesson = allLessons.value.find(l => l.id === id);
      return {
        lessonId: id,
        lessonNumber: lesson?.lessonNumber || '?',
        words: response.words || [],
        success: response.success,
        message: response.message
      };
    });

    const responses = await Promise.all(reviewWordsPromises);
    console.log('[LearningPage] Review words loaded:', responses);

    // 检查哪些课程没有单词
    const emptyLessons = responses.filter(r => r.words.length === 0 && r.success);
    if (emptyLessons.length > 0) {
      const lessonNumbers = emptyLessons.map(l => `第${l.lessonNumber}课`).join('、');
      ElMessage.warning(`${lessonNumbers} 暂无单词`);
    }

    // 合并复习单词
    const reviewWords = responses.flatMap(r =>
      r.words.map(w => ({ ...w, lessonId: r.lessonId, isReview: true }))
    );
    console.log('[LearningPage] Merged review words:', reviewWords.length);

    // 合并到当前单词列表（传入当前单词列表作为参数）
    const currentWords = words.value.filter(w => !w.isReview); // 获取当前课程单词
    const mergedWords = learningStore.mergeReviewWords(currentWords, reviewWords);
    words.value = mergedWords;
    console.log('[LearningPage] Total words after merge:', words.value?.length || 0);

    // 重启学习会话
    if (words.value.length > 0) {
      await learningStore.startSession(lessonId.value, words.value);
      initWordInputs();
      await playAudio(2);
    }

    if (reviewWords.length > 0) {
      ElMessage.success(`已添加 ${reviewWords.length} 个复习单词`);
    }
  } catch (error) {
    console.error('[LearningPage] 加载复习单词失败:', error);
    ElMessage.error('加载复习单词失败: ' + error.message);
  }
};

// 获取复习课程的课程号
const getReviewLessonNumber = (lessonId) => {
  const lesson = allLessons.value.find(l => l.id === lessonId);
  return lesson ? lesson.lessonNumber : '?';
};

// 初始化单词输入
const initWordInputs = () => {
  const english = currentWord.value.english || '';
  wordParts.value = english.split(' ').filter(part => part.length > 0);
  wordInputs.value = new Array(wordParts.value.length).fill('');
  wordErrors.value = new Array(wordParts.value.length).fill(false);
  currentWordIndex.value = 0;
  userAnswer.value = '';

  // 聚焦到第一个输入框并滚动到可视区域
  nextTick(() => {
    let inputEl = null;
    if (wordParts.value.length === 1) {
      inputEl = answerInputRef.value;
    } else if (wordInputRefs.value[0]) {
      inputEl = wordInputRefs.value[0];
    }

    if (inputEl) {
      inputEl.focus();
      // 移动端：滚动到输入框位置
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  });
};

// 处理单个单词输入
const handleSingleWordInput = () => {
  // 验证并过滤输入，只允许英文字母和标点符号
  userAnswer.value = validateEnglishInput(userAnswer.value);
  // 播放键盘敲击声音
  playTypingSound();
};

// 处理单词输入
const handleWordInput = (index) => {
  // 验证并过滤输入，只允许英文字母和标点符号
  wordInputs.value[index] = validateEnglishInput(wordInputs.value[index]);
  // 播放键盘敲击声音
  playTypingSound();
  
  // 清除错误状态
  if (wordErrors.value[index]) {
    wordErrors.value[index] = false;
  }
  
  // 不需要手动更新placeholder和width，computed属性会自动处理
};

// 验证英文输入，只允许字母、标点符号和空格
const validateEnglishInput = (input) => {
  // 正则表达式：只匹配英文字母、常见标点符号和空格
  // 匹配：a-z, A-Z, 空格, ! ? . , ; : - ' " 等
  const englishPattern = /^[a-zA-Z\s\.\?!\,\;:\-'"`]+$/;
  
  // 逐个字符验证并过滤
  return input.split('').filter(char => {
    return englishPattern.test(char);
  }).join('');
};

// 播放键盘敲击声音
const playTypingSound = () => {
  try {
    // 创建简单的键盘敲击声音
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    // 静默失败
  }
};

// 处理单词完成（按空格切换到下一个输入框）
const handleWordComplete = async (index) => {
  const input = wordInputs.value[index].trim();
  
  if (!input) {
    ElMessage.warning('请输入单词');
    return;
  }
  
  // 查找下一个空的输入框（被清空的错误单词）
  let nextEmptyIndex = -1;
  for (let i = index + 1; i < wordParts.value.length; i++) {
    if (!wordInputs.value[i] || wordInputs.value[i].trim() === '') {
      nextEmptyIndex = i;
      break;
    }
  }
  
  // 如果找到空的输入框，切换到那里
  if (nextEmptyIndex !== -1) {
    currentWordIndex.value = nextEmptyIndex;
    await nextTick();
    wordInputRefs.value[nextEmptyIndex]?.focus();
  } else {
    // 没有空的输入框了，说明所有单词都已输入，提交验证
    await handleMultiWordSubmit();
  }
};

// 智能标点符号校对（前端版本，用于多单词输入）
const checkWithSmartPunctuation = (userInput, correctAnswer) => {
  const input = userInput.trim();
  const answer = correctAnswer.trim();

  const inputLastChar = input.slice(-1);
  const answerLastChar = answer.slice(-1);

  const punctuation = /[.!?。，！？,;:;:"'""'']|!|！|\?|？|\.|。|,|，|;|；|:|：|"|"|'|'|'/;

  const inputHasPunctuation = punctuation.test(inputLastChar);
  const answerHasPunctuation = punctuation.test(answerLastChar);

  if (inputHasPunctuation && answerHasPunctuation) {
    return input.toLowerCase() === answer.toLowerCase();
  }

  const inputWithoutPunct = input.replace(punctuation, '').trim();
  const answerWithoutPunct = answer.replace(punctuation, '').trim();

  return inputWithoutPunct.toLowerCase() === answerWithoutPunct.toLowerCase();
};

// 提交多单词答案（所有单词输入完成后验证）
const handleMultiWordSubmit = async () => {
  if (isChecking.value || showAnswer.value) return;

  isChecking.value = true;

  try {
    // 逐个验证每个单词
    let allCorrect = true;
    const correctWords = [];

    for (let i = 0; i < wordParts.value.length; i++) {
      const userInput = wordInputs.value[i];
      const correctWord = wordParts.value[i];

      if (checkWithSmartPunctuation(userInput, correctWord)) {
        correctWords.push(true);
        wordErrors.value[i] = false;
      } else {
        correctWords.push(false);
        wordErrors.value[i] = true;
        allCorrect = false;
      }
    }

    if (allCorrect) {
      // 所有单词都正确
      // 先保存当前单词 ID，避免在 setTimeout 回调中获取时已经变化
      const currentWordId = currentWord.value.id;
      
      feedback.value = {
        show: true,
        type: 'correct',
        message: '正确！'
      };
      showAnswer.value = true;
      playFeedbackSound(true); // 播放正确音效
      playFeedbackSound(true); // 播放正确音效

      // 1秒后自动跳转到下一题
      setTimeout(async () => {
        feedback.value.show = false;
        
        // 提交答案到学习状态管理（内部会调用 loadNextWord）
        await learningStore.submitAnswer(currentWordId, true);
        
        // 检查是否有下一个单词（submitAnswer 内部已更新 currentWord）
        const nextWord = learningStore.currentWord;
        
        if (nextWord) {
          // 找到对应的单词索引
          const wordIndex = words.value.findIndex(w => w.id === nextWord.id);
          if (wordIndex !== -1) {
            currentIndex.value = wordIndex;
          }
          
          // 停止当前播放的音频
          AudioManager.stop();
          isPlaying.value = false;
          
          showAnswer.value = false;
          initWordInputs();
          await playAudio(2); // 自动播放2遍
        } else {
          // 完成所有单词
          showCompleteDialog.value = true;
        }
      }, 1000);
    } else {
      // 有单词错误 - 只清空错误的单词
      const correctCount = correctWords.filter(Boolean).length;
      feedback.value = {
        show: true,
        type: 'wrong',
        message: `${correctCount}/${wordParts.value.length} 个单词正确`
      };
      playFeedbackSound(false); // 播放错误音效
      
      // 提交错误答案到学习状态管理
      await learningStore.submitAnswer(currentWord.value.id, false);
      
      // 播放音频
      await playAudio(1);

      setTimeout(() => {
        feedback.value.show = false;
        
        // 只清空错误的单词，保留正确的单词
        for (let i = 0; i < wordParts.value.length; i++) {
          if (wordErrors.value[i]) {
            wordInputs.value[i] = '';
          }
        }
        
        // 聚焦到第一个错误的输入框
        nextTick(() => {
          const firstErrorIndex = wordErrors.value.findIndex(error => error);
          if (firstErrorIndex !== -1 && wordInputRefs.value[firstErrorIndex]) {
            wordInputRefs.value[firstErrorIndex].focus();
          }
        });
      }, 1500);
    }
  } catch (error) {
    ElMessage.error(error.message || '检查答案失败');
  } finally {
    isChecking.value = false;
  }
};

// 音效缓存（使用 AudioBuffer 缓存）
const soundBufferCache = {
  correct: null,
  wrong: null
};

// 共享的 AudioContext
let sharedAudioContext = null;

// 获取或创建 AudioContext
const getAudioContext = () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioContext;
};

// 生成正确音效的 AudioBuffer
const createCorrectSoundBuffer = (audioContext) => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.35; // 秒
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // 风铃和弦音：C5, E5, G5, C6
  const frequencies = [523.25, 659.25, 783.99, 1046.50];
  const delays = [0, 0.05, 0.1, 0.15];
  const durations = [0.3, 0.25, 0.2, 0.15];
  
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    let value = 0;
    
    for (let j = 0; j < frequencies.length; j++) {
      if (t >= delays[j] && t < delays[j] + durations[j]) {
        const localT = t - delays[j];
        const envelope = 0.3 * Math.exp(-localT * 8); // 快速衰减
        value += envelope * Math.sin(2 * Math.PI * frequencies[j] * t);
      }
    }
    
    data[i] = value;
  }
  
  return buffer;
};

// 生成错误音效的 AudioBuffer
const createWrongSoundBuffer = (audioContext) => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.4; // 秒
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    
    // 低频锯齿波，从150Hz降到100Hz
    const freq = 150 - (50 * t / duration);
    
    // 包络
    let envelope = 0.2;
    if (t < 0.15) {
      envelope = 0.2;
    } else {
      envelope = 0.2 - (0.05 * (t - 0.15) / 0.25);
    }
    envelope = Math.max(0.01, envelope);
    
    // 锯齿波
    const sawtooth = 2 * ((freq * t) % 1) - 1;
    data[i] = envelope * sawtooth;
  }
  
  return buffer;
};

// 播放反馈音效（带缓存）
const playFeedbackSound = (isCorrect) => {
  try {
    const audioContext = getAudioContext();
    
    // 获取或创建缓存
    const cacheKey = isCorrect ? 'correct' : 'wrong';
    if (!soundBufferCache[cacheKey]) {
      soundBufferCache[cacheKey] = isCorrect 
        ? createCorrectSoundBuffer(audioContext)
        : createWrongSoundBuffer(audioContext);
      console.log(`[音效缓存] 生成: ${cacheKey}`);
    }
    
    // 播放缓存的 AudioBuffer
    const source = audioContext.createBufferSource();
    source.buffer = soundBufferCache[cacheKey];
    source.connect(audioContext.destination);
    source.start(0);
    
  } catch (error) {
    console.warn('音效播放失败:', error);
  }
};

// 播放音频
const playAudio = async (times = 1) => {
  // 先停止当前播放的音频
  AudioManager.stop();
  
  if (isPlaying.value) return;
  
  isPlaying.value = true;
  try {
    // 使用火山引擎TTS
    const response = await ttsService.speak(currentWord.value.english);
    
    if (response.success && response.audioUrl) {
      // 使用AudioManager播放
      await AudioManager.play(response.audioUrl, times);
    } else {
      // 降级到浏览器Speech Synthesis API
      console.warn('TTS服务不可用，使用浏览器语音合成');
      const utterance = new SpeechSynthesisUtterance(currentWord.value.english);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      
      for (let i = 0; i < times; i++) {
        await new Promise((resolve) => {
          utterance.onend = resolve;
          window.speechSynthesis.speak(utterance);
        });
        
        if (i < times - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  } catch (error) {
    console.error('音频播放失败:', error);
    ElMessage.error('音频播放失败');
  } finally {
    isPlaying.value = false;
  }
};

// 提交答案（单个单词）
const handleSubmit = async () => {
  if (isChecking.value || showAnswer.value) return;
  
  // 如果是多单词，不应该到这里
  if (wordParts.value.length > 1) {
    return;
  }
  
  const trimmedAnswer = userAnswer.value.trim();
  if (!trimmedAnswer) {
    ElMessage.warning('请输入答案');
    return;
  }

  isChecking.value = true;
  
  try {
    const response = await learningService.checkAnswer(
      currentWord.value.id,
      trimmedAnswer
    );

    if (response.correct) {
      // 答案正确
      // 先保存当前单词 ID，避免在 setTimeout 回调中获取时已经变化
      const currentWordId = currentWord.value.id;
      
      feedback.value = {
        show: true,
        type: 'correct',
        message: '正确！'
      };
      showAnswer.value = true;
      playFeedbackSound(true); // 播放正确音效
      playFeedbackSound(true); // 播放正确音效

      // 1秒后自动跳转到下一题
      setTimeout(async () => {
        feedback.value.show = false;
        
        // 提交答案到学习状态管理（内部会调用 loadNextWord）
        await learningStore.submitAnswer(currentWordId, true);
        
        // 检查是否有下一个单词（submitAnswer 内部已更新 currentWord）
        const nextWord = learningStore.currentWord;
        
        if (nextWord) {
          // 找到对应的单词索引
          const wordIndex = words.value.findIndex(w => w.id === nextWord.id);
          if (wordIndex !== -1) {
            currentIndex.value = wordIndex;
          }
          
          // 停止当前播放的音频
          AudioManager.stop();
          isPlaying.value = false;
          
          showAnswer.value = false;
          initWordInputs();
          await playAudio(2); // 自动播放2遍
        } else {
          // 完成所有单词
          showCompleteDialog.value = true;
        }
      }, 1000);
    } else {
      // 答案错误 - 清空整个输入
      feedback.value = {
        show: true,
        type: 'wrong',
        message: '错误'
      };
      playFeedbackSound(false); // 播放错误音效
      
      // 提交错误答案到学习状态管理
      await learningStore.submitAnswer(currentWord.value.id, false);
      
      // 播放音频
      await playAudio(1);

      // 1.5秒后隐藏反馈并清空输入
      setTimeout(() => {
        feedback.value.show = false;
        
        // 清空整个输入
        userAnswer.value = '';
        
        nextTick(() => {
          answerInputRef.value?.focus();
        });
      }, 1500);
    }
  } catch (error) {
    ElMessage.error(error.message || '检查答案失败');
  } finally {
    isChecking.value = false;
  }
};

// 上一题
const handlePrevious = async () => {
  if (currentIndex.value > 0) {
    // 停止当前播放的音频
    AudioManager.stop();
    isPlaying.value = false;
    
    currentIndex.value--;
    showAnswer.value = false;
    feedback.value.show = false;
    initWordInputs();
    await playAudio(2);
  }
};

// 下一题
const handleNext = async () => {
  if (currentIndex.value < words.value.length - 1) {
    // 停止当前播放的音频
    AudioManager.stop();
    isPlaying.value = false;
    
    currentIndex.value++;
    showAnswer.value = false;
    feedback.value.show = false;
    initWordInputs();
    await playAudio(2);
  }
};

// 播放当前单词
const handlePlayAudio = () => {
  playAudio(1);
};

// 显示答案
const handleShowAnswer = () => {
  showAnswer.value = true;
  feedback.value = {
    show: true,
    type: 'wrong',
    message: '查看答案'
  };

  setTimeout(() => {
    feedback.value.show = false;
  }, 2000);
};

// 重新本题
const handleReset = async () => {
  showAnswer.value = false;
  feedback.value.show = false;
  initWordInputs();
  await playAudio(2);
};

// 标记当前单词为已掌握（支持切换）
const handleMarkAsMastered = async () => {
  try {
    const wordId = currentWord.value?.id;
    if (!wordId) {
      ElMessage.warning('当前没有单词');
      return;
    }

    // 检查当前页面显示的单词是否已掌握（而不是 store 的 currentWord）
    const isMastered = learningStore.masteredWords.includes(wordId);

    let result;
    if (isMastered) {
      // 已掌握，取消掌握
      result = await learningStore.unmarkAsMastered(wordId);
      if (result) {
        ElMessage.success('已取消掌握，英文已显示');
      }
    } else {
      // 未掌握，标记为掌握
      result = await learningStore.markAsMastered(wordId);
      if (result.success) {
        ElMessage.success('已标记为掌握，英文已隐藏');
      }
    }

    // 重置输入框和反馈
    userAnswer.value = '';
    wordInputs.value = wordParts.value.map(() => '');
    wordErrors.value = [];
    feedback.value.show = false;

    await nextTick();

    // 聚焦输入框
    if (wordInputRefs.value[0]) {
      wordInputRefs.value[0].focus();
    } else if (answerInputRef.value) {
      answerInputRef.value.focus();
    }
  } catch (error) {
    ElMessage.error('操作失败：' + error.message);
  }
};

// 当前页面显示的单词是否已掌握（用于按钮文字显示）
const isCurrentPageWordMastered = computed(() => {
  const wordId = currentWord.value?.id;
  return wordId ? learningStore.masteredWords.includes(wordId) : false;
});

// 返回课程列表
const goBackToLessons = () => {
  router.push(`/categories/${lessonInfo.value.categoryId}/lessons`);
};

// 重新开始
const handleRestart = async () => {
  showCompleteDialog.value = false;
  currentIndex.value = 0;
  showAnswer.value = false;
  feedback.value.show = false;
  
  // 重新初始化 learningStore 的策略，确保能正确获取下一个单词
  if (learningStore.strategy && words.value.length > 0) {
    learningStore.strategy.initialize(words.value);
    learningStore.progress = {
      ...learningStore.progress,
      currentIndex: 0,
      learnedCount: 0,
      loopCount: 0
    };
    learningStore.status = 'active';
    
    // 重新加载第一个单词
    await learningStore.loadNextWord();
  }
  
  initWordInputs();
  await playAudio(2);
};

// 监听顺序模式切换，重置相关状态
watch(() => learningStore.sequenceMode, async () => {
  // 切换顺序模式时重置showAnswer，让computed属性重新计算
  showAnswer.value = false;
  feedback.value.show = false;

  // 等待DOM更新后聚焦输入框
  await nextTick();
  if (wordInputRefs.value[0]) {
    wordInputRefs.value[0].focus();
  } else if (answerInputRef.value) {
    answerInputRef.value.focus();
  }
});

// ==================== 设置相关方法 ====================

// 加载用户设置
const loadUserSettings = async () => {
  try {
    const loadedSettings = await userSettingsService.syncFromServer();
    Object.assign(settings, loadedSettings);
    console.log('User settings loaded:', settings);
    
    // 加载按住显示答案功能设置
    showAnswerWhenHolding.value = loadedSettings.showAnswerWhenHolding !== false;
  } catch (error) {
    console.error('Failed to load user settings:', error);
  }
};

// 全局键盘监听
const handleGlobalKeydown = (event) => {
  // 如果正在编辑快捷键，不处理
  if (editingShortcut.value) {
    return;
  }

  // 如果正在加载或显示完成对话框，不处理
  if (loading.value || showCompleteDialog.value || showSettingsDialog.value) {
    return;
  }

  // 获取当前按下的键
  const pressedKey = [];
  if (event.altKey) pressedKey.push('Alt');
  if (event.ctrlKey) pressedKey.push('Ctrl');
  if (event.shiftKey) pressedKey.push('Shift');
  if (event.metaKey) pressedKey.push('Meta');

  // 添加主键（排除修饰键）
  const mainKey = event.key;
  if (!['Alt', 'Control', 'Shift', 'Meta'].includes(mainKey)) {
    // 特殊键名映射
    const keyMap = {
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      ' ': 'Space',
      'Enter': 'Enter',
      'Escape': 'Esc'
    };
    pressedKey.push(keyMap[mainKey] || mainKey.toUpperCase());
  }

  // 调试信息
  console.log('按键检测:', pressedKey);

  // 检查是否匹配 showAnswer 快捷键（按住显示答案功能）
  const showAnswerShortcut = settings.shortcuts?.showAnswer;
  if (showAnswerShortcut?.keys && arraysEqual(showAnswerShortcut.keys, pressedKey)) {
    console.log('按住显示答案');
    event.preventDefault();
    isShortcutKeyPressed.value = true;
    // 如果启用了按住显示答案功能，则启用按住显示
    if (settings.showAnswerWhenHolding !== false) {
      showAnswer.value = true;
      feedback.value.show = false; // 隐藏反馈
    }
    return;
  }

  // 检查是否匹配其他快捷键
  const shortcuts = settings.shortcuts;
  for (const [action, config] of Object.entries(shortcuts)) {
    if (action === 'showAnswer') continue; // 跳过 showAnswer，已经单独处理
    if (config.keys && arraysEqual(config.keys, pressedKey)) {
      console.log('匹配快捷键:', action, config.keys);
      event.preventDefault();
      executeShortcutAction(action);
      break;
    }
  }
};

// 全局键盘松开监听
const handleGlobalKeyup = (event) => {
  // 如果正在编辑快捷键，不处理
  if (editingShortcut.value) {
    return;
  }

  // 获取松开的键
  const pressedKey = [];
  if (event.altKey) pressedKey.push('Alt');
  if (event.ctrlKey) pressedKey.push('Ctrl');
  if (event.shiftKey) pressedKey.push('Shift');
  if (event.metaKey) pressedKey.push('Meta');

  // 添加主键（排除修饰键）
  const mainKey = event.key;
  if (!['Alt', 'Control', 'Shift', 'Meta'].includes(mainKey)) {
    // 特殊键名映射
    const keyMap = {
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      ' ': 'Space',
      'Enter': 'Enter',
      'Escape': 'Esc'
    };
    pressedKey.push(keyMap[mainKey] || mainKey.toUpperCase());
  }

  // 检查是否是 showAnswer 快捷键松开
  const showAnswerShortcut = settings.shortcuts?.showAnswer;
  if (showAnswerShortcut?.keys && arraysEqual(showAnswerShortcut.keys, pressedKey)) {
    console.log('松开显示答案');
    if (isShortcutKeyPressed.value) {
      isShortcutKeyPressed.value = false;
      // 如果启用了按住显示答案功能，则隐藏答案
      if (settings.showAnswerWhenHolding !== false) {
        showAnswer.value = false;
      }
    }
  }
};

// 比较数组是否相等
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

// 执行快捷键动作
const executeShortcutAction = (action) => {
  switch (action) {
    case 'previous':
      handlePrevious();
      break;
    case 'mastered':
      if (learningStore.isBeginnerMode) {
        handleMarkAsMastered();
      }
      break;
    case 'play':
      handlePlayAudio();
      break;
    case 'next':
      handleNext();
      break;
    case 'showAnswer':
      handleShowAnswer();
      break;
    case 'restart':
      handleReset();
      break;
  }
};

// 打开设置对话框
const openSettings = () => {
  showSettingsDialog.value = true;
  editingShortcut.value = null;
  pressedKeys.value = [];
};

// 监听全局打开设置事件
eventBus.on('openSettings', openSettings);

// 关闭设置对话框
const closeSettings = () => {
  showSettingsDialog.value = false;
  editingShortcut.value = null;
  pressedKeys.value = [];
};

// 开始编辑快捷键
const startEditShortcut = (action) => {
  editingShortcut.value = action;
  pressedKeys.value = [];
};

// 取消编辑快捷键
const cancelEditShortcut = () => {
  editingShortcut.value = null;
  pressedKeys.value = [];
};

// 重置为默认快捷键
const resetToDefaultShortcuts = () => {
  settings.shortcuts = { ...userSettingsService.constructor.DEFAULT_SHORTCUTS };
  ElMessage.success('已重置为默认快捷键');
};

// 保存设置
const saveSettings = async () => {
  settingsLoading.value = true;
  try {
    // 保存到本地
    userSettingsService.saveToLocal(settings);
    
    // 同步到服务器
    await userSettingsService.syncToServer(settings);
    
    showSettingsDialog.value = false;
    ElMessage.success('设置已保存');
  } catch (error) {
    console.error('Failed to save settings:', error);
    ElMessage.warning('设置已保存到本地，但同步到服务器失败');
  } finally {
    settingsLoading.value = false;
  }
};

// 快捷键输入监听
const handleShortcutKeydown = (event) => {
  if (!editingShortcut.value) return;

  event.preventDefault();
  event.stopPropagation();

  // 收集按下的键
  const keys = [];
  if (event.altKey) keys.push('Alt');
  if (event.ctrlKey) keys.push('Ctrl');
  if (event.shiftKey) keys.push('Shift');
  if (event.metaKey) keys.push('Meta');

  // 添加主键
  const mainKey = event.key;
  if (!['Alt', 'Control', 'Shift', 'Meta'].includes(mainKey)) {
    const keyMap = {
      'ArrowLeft': 'Left',
      'ArrowRight': 'Right',
      'ArrowUp': 'Up',
      'ArrowDown': 'Down',
      ' ': 'Space',
      'Enter': 'Enter',
      'Escape': 'Esc'
    };
    keys.push(keyMap[mainKey] || mainKey.toUpperCase());

    // 必须是组合键（至少两个键）
    if (keys.length >= 2) {
      pressedKeys.value = keys;
      settings.shortcuts[editingShortcut.value].keys = keys;
      
      // 短暂延迟后关闭编辑状态
      setTimeout(() => {
        editingShortcut.value = null;
        pressedKeys.value = [];
      }, 300);
    }
  }
};

// 格式化快捷键显示
const formatShortcut = (keys) => {
  if (!keys || keys.length === 0) return '未设置';
  return keys.join(' + ');
};
</script>

<style scoped>
.learning-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.loading-container {
  max-width: 800px;
  margin: 0 auto;
}

.learning-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.learning-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* 课程信息卡片 */
.lesson-info-card {
  margin-bottom: 0;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.lesson-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-text {
  font-size: 16px;
  color: #606266;
  white-space: nowrap;
}

/* 超紧凑学习模式和进度显示合并卡片 */
.mode-progress-ultra-compact-card {
  margin-bottom: 0;
}

.mode-progress-ultra-compact-card .el-card__body {
  padding: 8px 16px !important;
}

.ultra-compact-row {
  display: flex;
  align-items: center;
  height: 60px;
  gap: 16px;
  justify-content: flex-start;
}

.compact-mode-section {
  flex: 0 0 auto;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.compact-review-section {
  flex: 1 1 auto;
  min-width: 150px;
  max-width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
}

.compact-progress-section {
  flex: 0 0 auto;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

/* 单词学习卡片 */
.word-learning-card {
  margin-bottom: 0;
  min-height: 400px;
}

.word-learning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 40px 20px;
  min-height: 350px;
  position: relative;
}

.word-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-badge .review-lesson {
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.chinese-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  color: #606266;
  font-weight: 500;
}

.english-word h1 {
  margin: 0;
  font-size: 42px;
  color: #303133;
  font-weight: bold;
  text-align: center;
}

.english-word .phonetic {
  margin: 8px 0 0 0;
  font-size: 18px;
  color: #909399;
  text-align: center;
}

.answer-input {
  display: flex;
  justify-content: center;
  width: 100%;
}

.word-input-wrapper {
  display: inline-block;
}

/* 多单词输入容器 */
.multi-word-input {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.word-part {
  display: inline-block;
}

/* 实线下划线输入框样式 */
.solid-underline-input {
  border: none;
  border-bottom: 3px solid #409eff;
  outline: none !important;
  font-size: 28px;
  text-align: center;
  padding: 10px 8px;
  background: transparent;
  color: #303133;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.solid-underline-input:focus {
  border-bottom-color: #66b1ff;
  box-shadow: none !important;
  outline: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
}

.solid-underline-input:disabled {
  color: #909399;
  border-bottom-color: #dcdfe6;
  cursor: not-allowed;
}

.solid-underline-input.error {
  color: #f56c6c;
  border-bottom-color: #f56c6c;
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

/* 反馈信息 */
.feedback {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feedback.correct {
  background-color: #f0f9ff;
  color: #67c23a;
  border: 2px solid #b3e19d;
}

.feedback.wrong {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 2px solid #f5b2b2;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 控制按钮卡片 */
.control-buttons-card {
  margin-bottom: 0;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
  padding: 8px 0;
  overflow-x: auto;
}

.control-buttons .el-button {
  min-width: 80px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

/* 完成对话框 */
.complete-content {
  text-align: center;
  padding: 30px;
}

.complete-content p {
  margin: 20px 0;
  font-size: 18px;
  color: #606266;
}

.complete-content .stats {
  font-size: 16px;
  color: #909399;
}

/* 设置对话框 */
.settings-content {
  padding: 10px 0;
}

.settings-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.section-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 16px 0;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.shortcut-label {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.shortcut-value {
  min-width: 140px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.shortcut-value:hover {
  border-color: #409eff;
  color: #409eff;
}

.shortcut-value.editing {
  border-color: #409eff;
  background: #ecf5ff;
  animation: pulse 1s infinite;
}

.editing-hint {
  color: #409eff;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.shortcut-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .learning-page {
    padding-bottom: 140px; /* 为底部按钮留出空间 */
  }

  .content {
    padding: 12px;
    padding-bottom: 20px;
  }

  .breadcrumb {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .lesson-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .lesson-header h2 {
    font-size: 18px;
  }

  .progress-info {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .progress-text {
    font-size: 13px;
  }

  .progress-info .el-progress {
    flex: 1;
    max-width: 150px;
    margin-left: 10px !important;
  }

  .ultra-compact-row {
    flex-direction: column;
    height: auto;
    gap: 8px;
    padding: 4px 0;
  }

  .compact-mode-section,
  .compact-progress-section {
    height: auto;
  }

  .word-learning-content {
    padding: 20px 15px;
    gap: 16px;
    min-height: auto;
  }

  .chinese-hint {
    font-size: 18px;
  }

  .chinese-hint :deep(.el-icon) {
    font-size: 20px;
  }

  .english-word h1 {
    font-size: 32px;
  }

  .english-word .phonetic {
    font-size: 16px;
  }

  .solid-underline-input {
    font-size: 24px;
    min-width: 120px;
    padding: 10px 8px;
  }

  .multi-word-input {
    gap: 12px;
    flex-wrap: wrap;
  }

  /* 底部固定按钮栏 */
  .control-buttons-card {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    border-radius: 0;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
    background: #fff;
    margin: 0;
  }

  .control-buttons-card :deep(.el-card__body) {
    padding: 8px 12px !important;
  }

  .control-buttons {
    gap: 6px;
    padding: 0;
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .control-buttons::-webkit-scrollbar {
    display: none;
  }

  .control-buttons .el-button {
    min-width: auto;
    padding: 6px 10px;
    font-size: 11px;
    white-space: nowrap;
  }

  .control-buttons .el-button :deep(.el-icon) {
    margin-right: 4px;
  }

  .feedback {
    font-size: 16px;
    padding: 12px 16px;
    border-radius: 8px;
  }

  /* 隐藏次要按钮 */
  .secondary-btn {
    display: none;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 8px;
  }

  .lesson-info-card {
    margin-bottom: 12px;
  }

  .lesson-header h2 {
    font-size: 16px;
  }

  .progress-text {
    font-size: 12px;
  }

  .progress-info .el-progress {
    max-width: 100px;
  }

  .mode-progress-ultra-compact-card {
    margin-bottom: 12px;
    padding: 8px 12px;
  }

  .word-learning-content {
    padding: 20px 12px;
    gap: 16px;
    min-height: 240px;
  }

  .chinese-hint {
    font-size: 16px;
  }

  .chinese-hint :deep(.el-icon) {
    font-size: 18px;
  }

  .english-word h1 {
    font-size: 28px;
  }

  .english-word .phonetic {
    font-size: 14px;
  }

  .solid-underline-input {
    font-size: 20px;
    min-width: 100px;
    padding: 8px 6px;
  }

  .multi-word-input {
    gap: 10px;
  }

  .control-buttons {
    gap: 6px;
  }

  .control-buttons .el-button {
    min-width: 60px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .feedback {
    font-size: 14px;
    padding: 10px 12px;
  }
}

/* ==================== 触摸优化 ==================== */

@media (max-width: 768px) {
  .el-button:active {
    transform: scale(0.95);
    transition: transform 0.1s;
  }

  .solid-underline-input {
    font-size: 24px;
    /* 确保输入框足够大以便触摸 */
  }
}

@media (max-width: 480px) {
  .solid-underline-input {
    font-size: 20px;
    padding: 12px 8px;
  }
}

/* ==================== 横屏优化 ==================== */

@media (max-width: 768px) and (orientation: landscape) {
  .word-learning-content {
    min-height: 200px;
    padding: 15px;
  }

  .chinese-hint {
    font-size: 14px;
  }

  .english-word h1 {
    font-size: 24px;
  }
}

/* ==================== 安全区域适配 ==================== */

@supports (padding: max(0px)) {
  @media (max-width: 768px) {
    .content {
      padding-left: max(12px, env(safe-area-inset-left));
      padding-right: max(12px, env(safe-area-inset-right));
      padding-bottom: max(12px, env(safe-area-inset-bottom));
    }
  }
}
</style>

<!-- 非scoped样式，用于v-html渲染的元音高亮 -->
<style>
.english-word h1 .vowel-highlight {
  color: #e63946 !important;
  text-decoration: underline !important;
  text-decoration-color: #e63946 !important;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-block;
  position: relative;
}

.english-word h1 .vowel-highlight:hover {
  color: #d62828 !important;
  text-decoration-color: #d62828 !important;
  text-decoration-thickness: 3px;
  background-color: rgba(230, 57, 70, 0.1);
  border-radius: 3px;
  padding: 0 2px;
}
</style>
