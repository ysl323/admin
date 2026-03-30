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
                :current-mode="learningStore.mode"
                :disabled="learningStore.isLoading"
                @mode-change="handleModeChange"
                :compact="true"
              />
            </div>
            <div class="compact-progress-section">
              <ProgressDisplay
                :mode="learningStore.mode"
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
            <!-- 中文提示 -->
            <div class="chinese-hint">
              <el-icon :size="24"><ChatDotRound /></el-icon>
              <span>{{ currentWord.chinese }}</span>
            </div>

            <!-- 英文单词（小白模式下：未掌握显示，已掌握隐藏；答对或显示答案后显示） -->
            <div v-if="showEnglish" class="english-word">
              <h1>{{ currentWord.english }}</h1>
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
              type="success"
              :loading="learningStore.masteryLoading"
              @click="handleMarkAsMastered"
            >
              <el-icon><CircleCheckFilled /></el-icon>
              {{ learningStore.isCurrentWordMastered ? '已掌握' : '掌握' }}
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
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
import ProgressDisplay from '../components/ProgressDisplay.vue';
import learningService from '../services/learning';
import ttsService from '../services/tts';
import AudioManager from '../utils/AudioManager';
import { useLearningStore } from '../stores/learning';

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

// 多单词输入相关
const wordParts = ref([]);
const wordInputs = ref([]);
const wordInputRefs = ref([]);
const currentWordIndex = ref(0);
const wordErrors = ref([]);

// 处理学习模式切换
const handleModeChange = async (newMode) => {
  try {
    await learningStore.switchMode(newMode);
    
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

// 英文显示逻辑：根据模式、掌握状态和是否显示答案决定
const showEnglish = computed(() => {
  // 如果手动显示了答案，始终显示
  if (showAnswer.value) {
    return true;
  }

  // 小白模式下，根据掌握状态决定
  if (learningStore.isBeginnerMode) {
    return learningStore.shouldShowEnglishForCurrentWord;
  }

  // 其他模式下，不显示英文（需要听写）
  return false;
});

// 生命周期
onMounted(async () => {
  // 初始化学习状态管理
  learningStore.initialize();

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
  // 播放键盘敲击声音
  playTypingSound();
};

// 处理单词输入
const handleWordInput = (index) => {
  // 播放键盘敲击声音
  playTypingSound();
  
  // 清除错误状态
  if (wordErrors.value[index]) {
    wordErrors.value[index] = false;
  }
  
  // 不需要手动更新placeholder和width，computed属性会自动处理
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

// 提交多单词答案（所有单词输入完成后验证）
const handleMultiWordSubmit = async () => {
  if (isChecking.value || showAnswer.value) return;
  
  isChecking.value = true;
  
  try {
    // 逐个验证每个单词
    let allCorrect = true;
    const correctWords = [];
    
    for (let i = 0; i < wordParts.value.length; i++) {
      const userInput = wordInputs.value[i].trim().toLowerCase();
      const correctWord = wordParts.value[i].toLowerCase();
      
      if (userInput === correctWord) {
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
      feedback.value = {
        show: true,
        type: 'correct',
        message: '正确！'
      };
      showAnswer.value = true;

      // 1秒后自动跳转到下一题
      setTimeout(async () => {
        feedback.value.show = false;
        
        // 提交答案到学习状态管理
        await learningStore.submitAnswer(currentWord.value.id, true);
        
        // 获取下一个单词（基于学习模式）
        const hasNext = await getNextWordFromStore();
        
        if (hasNext) {
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
      feedback.value = {
        show: true,
        type: 'correct',
        message: '正确！'
      };
      showAnswer.value = true;

      // 1秒后自动跳转到下一题
      setTimeout(async () => {
        feedback.value.show = false;
        
        // 提交答案到学习状态管理
        await learningStore.submitAnswer(currentWord.value.id, true);
        
        // 获取下一个单词（基于学习模式）
        const hasNext = await getNextWordFromStore();
        
        if (hasNext) {
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

// 标记当前单词为已掌握
const handleMarkAsMastered = async () => {
  try {
    if (!currentWord.value.id) {
      ElMessage.warning('当前没有单词');
      return;
    }

    const isMastered = learningStore.isCurrentWordMastered;

    if (isMastered) {
      // 已掌握，提示用户
      ElMessage.info('该单词已经掌握');
      return;
    }

    // 标记为已掌握
    const result = await learningStore.markAsMastered(currentWord.value.id);

    if (result.success) {
      if (result.isNew) {
        ElMessage.success('已标记为掌握，英文已隐藏');
      } else {
        ElMessage.info('该单词已经是掌握状态');
      }

      // 重置输入框和反馈
      userAnswer.value = '';
      wordInputs.value = wordParts.value.map(() => '');
      wordErrors.value = [];
      feedback.value.show = false;

      // 小白模式下，标记为掌握后立即隐藏英文
      // showEnglish computed属性会自动响应store状态变化
      // 但我们需要确保输入框可以正常使用
      await nextTick();

      // 聚焦输入框
      if (wordInputRefs.value[0]) {
        wordInputRefs.value[0].focus();
      } else if (answerInputRef.value) {
        answerInputRef.value.focus();
      }
    }
  } catch (error) {
    ElMessage.error('标记失败：' + error.message);
  }
};

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
  initWordInputs();
  await playAudio(2);
};

// 监听模式切换，重置相关状态
watch(() => learningStore.mode, async () => {
  // 切换模式时重置showAnswer，让computed属性重新计算
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
