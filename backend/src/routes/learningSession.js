const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const LearningSession = require('../models/LearningSession');
const LearningRecord = require('../models/LearningRecord');
const Word = require('../models/Word');
const Lesson = require('../models/Lesson');
const { authenticateToken } = require('../middleware/auth');

// 验证中间件
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errors.array()
    });
  }
  next();
};

// 创建学习会话
router.post('/sessions',
  authenticateToken,
  [
    body('lessonId').isInt({ min: 1 }).withMessage('课程ID必须是正整数'),
    body('mode').isIn(['sequential', 'random', 'loop', 'random_loop']).withMessage('学习模式无效')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { lessonId, mode } = req.body;
      const userId = req.user.id;

      // 检查课程是否存在
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: '课程不存在'
        });
      }

      // 获取课程单词
      const words = await Word.findAll({
        where: { lessonId },
        order: [['id', 'ASC']]
      });

      if (words.length === 0) {
        return res.status(400).json({
          success: false,
          message: '该课程没有单词'
        });
      }

      // 检查是否已有活跃会话
      const existingSession = await LearningSession.findByUserAndLesson(userId, lessonId, mode);
      if (existingSession && ['active', 'paused'].includes(existingSession.status)) {
        // 恢复现有会话
        await existingSession.resume();
        
        return res.json({
          success: true,
          message: '恢复现有学习会话',
          session: {
            sessionId: existingSession.id,
            mode: existingSession.mode,
            status: existingSession.status,
            progress: existingSession.progressData,
            state: existingSession.sessionState
          },
          words: words.map(word => ({
            id: word.id,
            english: word.english,
            chinese: word.chinese
          }))
        });
      }

      // 创建新会话
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const initialState = {
        wordSequence: words.map(w => w.id),
        currentIndex: 0,
        learnedWords: [],
        loopCount: 0
      };

      const initialProgress = {
        currentIndex: 0,
        totalWords: words.length,
        learnedCount: 0,
        loopCount: 0,
        sessionStartTime: new Date()
      };

      const session = await LearningSession.create({
        id: sessionId,
        userId,
        lessonId,
        mode,
        status: 'active',
        sessionState: initialState,
        progressData: initialProgress
      });

      res.status(201).json({
        success: true,
        message: '学习会话创建成功',
        session: {
          sessionId: session.id,
          mode: session.mode,
          status: session.status,
          progress: session.progressData,
          state: session.sessionState
        },
        words: words.map(word => ({
          id: word.id,
          english: word.english,
          chinese: word.chinese
        }))
      });

    } catch (error) {
      console.error('创建学习会话失败:', error);
      res.status(500).json({
        success: false,
        message: '创建学习会话失败',
        error: error.message
      });
    }
  }
);

// 获取学习会话
router.get('/sessions/:sessionId',
  authenticateToken,
  [
    param('sessionId').notEmpty().withMessage('会话ID不能为空')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await LearningSession.findOne({
        where: { id: sessionId, userId },
        include: [{
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'lessonNumber', 'categoryId']
        }]
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: '学习会话不存在'
        });
      }

      // 获取课程单词
      const words = await Word.findAll({
        where: { lessonId: session.lessonId },
        order: [['id', 'ASC']]
      });

      res.json({
        success: true,
        session: {
          sessionId: session.id,
          mode: session.mode,
          status: session.status,
          progress: session.progressData,
          state: session.sessionState,
          lesson: session.lesson
        },
        words: words.map(word => ({
          id: word.id,
          english: word.english,
          chinese: word.chinese
        }))
      });

    } catch (error) {
      console.error('获取学习会话失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学习会话失败',
        error: error.message
      });
    }
  }
);

// 更新学习进度
router.put('/sessions/:sessionId/progress',
  authenticateToken,
  [
    param('sessionId').notEmpty().withMessage('会话ID不能为空'),
    body('wordId').isInt({ min: 1 }).withMessage('单词ID必须是正整数'),
    body('correct').isBoolean().withMessage('正确性必须是布尔值'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('学习时间必须是非负整数'),
    body('userAnswer').optional().isString().withMessage('用户答案必须是字符串'),
    body('attempts').optional().isInt({ min: 1 }).withMessage('尝试次数必须是正整数')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { wordId, correct, timeSpent = 0, userAnswer = '', attempts = 1 } = req.body;
      const userId = req.user.id;

      const session = await LearningSession.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: '学习会话不存在'
        });
      }

      // 验证单词属于该课程
      const word = await Word.findOne({
        where: { id: wordId, lessonId: session.lessonId }
      });

      if (!word) {
        return res.status(400).json({
          success: false,
          message: '单词不属于该课程'
        });
      }

      // 记录学习记录
      await LearningRecord.create({
        sessionId,
        wordId,
        userId,
        correct,
        timeSpent,
        userAnswer,
        correctAnswer: word.english,
        attempts,
        mode: session.mode
      });

      // 更新会话进度
      const currentProgress = session.progressData;
      const currentState = session.sessionState;

      // 更新已学习单词列表
      if (correct && !currentState.learnedWords.includes(wordId)) {
        currentState.learnedWords.push(wordId);
      }

      // 更新进度数据
      const updatedProgress = {
        ...currentProgress,
        learnedCount: currentState.learnedWords.length
      };

      await session.updateProgress(updatedProgress);
      await session.updateState(currentState);

      // 根据学习模式确定下一个单词
      let nextWord = null;
      const words = await Word.findAll({
        where: { lessonId: session.lessonId },
        order: [['id', 'ASC']]
      });

      switch (session.mode) {
        case 'sequential':
          if (currentState.currentIndex < words.length - 1) {
            currentState.currentIndex++;
            nextWord = words[currentState.currentIndex];
          }
          break;

        case 'random':
          const unlearnedWords = words.filter(w => !currentState.learnedWords.includes(w.id));
          if (unlearnedWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * unlearnedWords.length);
            nextWord = unlearnedWords[randomIndex];
          }
          break;

        case 'loop':
        case 'random_loop':
          currentState.currentIndex = (currentState.currentIndex + 1) % words.length;
          if (currentState.currentIndex === 0) {
            currentState.loopCount++;
            if (session.mode === 'random_loop') {
              // 重新打乱顺序
              currentState.wordSequence = words
                .map(w => w.id)
                .sort(() => Math.random() - 0.5);
            }
          }
          
          const nextWordId = session.mode === 'random_loop' 
            ? currentState.wordSequence[currentState.currentIndex]
            : words[currentState.currentIndex].id;
          nextWord = words.find(w => w.id === nextWordId);
          break;
      }

      // 更新状态
      if (nextWord) {
        updatedProgress.currentIndex = currentState.currentIndex;
        updatedProgress.loopCount = currentState.loopCount;
        
        await session.updateProgress(updatedProgress);
        await session.updateState(currentState);
      } else {
        // 会话完成
        await session.markCompleted();
      }

      res.json({
        success: true,
        message: '进度更新成功',
        nextWord: nextWord ? {
          id: nextWord.id,
          english: nextWord.english,
          chinese: nextWord.chinese
        } : null,
        progress: session.progressData,
        completed: !nextWord
      });

    } catch (error) {
      console.error('更新学习进度失败:', error);
      res.status(500).json({
        success: false,
        message: '更新学习进度失败',
        error: error.message
      });
    }
  }
);

// 暂停学习会话
router.put('/sessions/:sessionId/pause',
  authenticateToken,
  [
    param('sessionId').notEmpty().withMessage('会话ID不能为空')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await LearningSession.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: '学习会话不存在'
        });
      }

      await session.pause();

      res.json({
        success: true,
        message: '学习会话已暂停',
        session: {
          sessionId: session.id,
          status: session.status
        }
      });

    } catch (error) {
      console.error('暂停学习会话失败:', error);
      res.status(500).json({
        success: false,
        message: '暂停学习会话失败',
        error: error.message
      });
    }
  }
);

// 恢复学习会话
router.put('/sessions/:sessionId/resume',
  authenticateToken,
  [
    param('sessionId').notEmpty().withMessage('会话ID不能为空')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await LearningSession.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: '学习会话不存在'
        });
      }

      await session.resume();

      res.json({
        success: true,
        message: '学习会话已恢复',
        session: {
          sessionId: session.id,
          status: session.status
        }
      });

    } catch (error) {
      console.error('恢复学习会话失败:', error);
      res.status(500).json({
        success: false,
        message: '恢复学习会话失败',
        error: error.message
      });
    }
  }
);

// 删除学习会话
router.delete('/sessions/:sessionId',
  authenticateToken,
  [
    param('sessionId').notEmpty().withMessage('会话ID不能为空')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const session = await LearningSession.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: '学习会话不存在'
        });
      }

      // 删除相关的学习记录
      await LearningRecord.destroy({
        where: { sessionId }
      });

      // 删除会话
      await session.destroy();

      res.json({
        success: true,
        message: '学习会话已删除'
      });

    } catch (error) {
      console.error('删除学习会话失败:', error);
      res.status(500).json({
        success: false,
        message: '删除学习会话失败',
        error: error.message
      });
    }
  }
);

// 获取用户的学习会话列表
router.get('/sessions',
  authenticateToken,
  [
    query('status').optional().isIn(['idle', 'active', 'paused', 'completed']).withMessage('状态值无效'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('限制数量必须在1-100之间'),
    query('offset').optional().isInt({ min: 0 }).withMessage('偏移量必须是非负整数')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const sessions = await LearningSession.findAndCountAll({
        where,
        include: [{
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'lessonNumber', 'categoryId']
        }],
        order: [['lastActivityTime', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        sessions: sessions.rows.map(session => ({
          sessionId: session.id,
          lessonId: session.lessonId,
          mode: session.mode,
          status: session.status,
          progress: session.progressData,
          startTime: session.startTime,
          lastActivityTime: session.lastActivityTime,
          lesson: session.lesson
        })),
        total: sessions.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('获取学习会话列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取学习会话列表失败',
        error: error.message
      });
    }
  }
);

module.exports = router;