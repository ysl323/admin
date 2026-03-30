const request = require('supertest');
const express = require('express');

// Mock the models
const mockLearningSession = {
  findByUserAndLesson: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findAndCountAll: jest.fn()
};

const mockLearningRecord = {
  create: jest.fn(),
  destroy: jest.fn()
};

const mockWord = {
  findAll: jest.fn(),
  findOne: jest.fn()
};

const mockLesson = {
  findByPk: jest.fn()
};

// Mock the modules
jest.mock('../models/LearningSession', () => mockLearningSession);
jest.mock('../models/LearningRecord', () => mockLearningRecord);
jest.mock('../models/Word', () => mockWord);
jest.mock('../models/Lesson', () => mockLesson);

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
};

jest.mock('../middleware/auth', () => ({
  authenticateToken: mockAuthMiddleware
}));

const learningSessionRouter = require('../learningSession');

describe('Learning Session API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/learning', learningSessionRouter);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/learning/sessions', () => {
    const mockWords = [
      { id: 1, english: 'hello', chinese: '你好' },
      { id: 2, english: 'world', chinese: '世界' }
    ];

    const mockLesson = { id: 1, lessonNumber: 1, categoryId: 1 };

    beforeEach(() => {
      mockLesson.findByPk.mockResolvedValue(mockLesson);
      mockWord.findAll.mockResolvedValue(mockWords);
      mockLearningSession.findByUserAndLesson.mockResolvedValue(null);
    });

    it('should create a new learning session successfully', async () => {
      const mockSession = {
        id: 'session_123',
        userId: 1,
        lessonId: 1,
        mode: 'sequential',
        status: 'active',
        sessionState: {
          wordSequence: [1, 2],
          currentIndex: 0,
          learnedWords: [],
          loopCount: 0
        },
        progressData: {
          currentIndex: 0,
          totalWords: 2,
          learnedCount: 0,
          loopCount: 0,
          sessionStartTime: new Date()
        }
      };

      mockLearningSession.create.mockResolvedValue(mockSession);

      const response = await request(app)
        .post('/api/learning/sessions')
        .send({
          lessonId: 1,
          mode: 'sequential'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.session.sessionId).toBe('session_123');
      expect(response.body.session.mode).toBe('sequential');
      expect(response.body.words).toHaveLength(2);
    });

    it('should return 404 if lesson does not exist', async () => {
      mockLesson.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/learning/sessions')
        .send({
          lessonId: 999,
          mode: 'sequential'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('课程不存在');
    });

    it('should return 400 if lesson has no words', async () => {
      mockWord.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/learning/sessions')
        .send({
          lessonId: 1,
          mode: 'sequential'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('该课程没有单词');
    });

    it('should resume existing active session', async () => {
      const existingSession = {
        id: 'existing_session',
        status: 'active',
        mode: 'random',
        progressData: { learnedCount: 1 },
        sessionState: { currentIndex: 1 },
        resume: jest.fn().mockResolvedValue()
      };

      mockLearningSession.findByUserAndLesson.mockResolvedValue(existingSession);

      const response = await request(app)
        .post('/api/learning/sessions')
        .send({
          lessonId: 1,
          mode: 'random'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('恢复现有学习会话');
      expect(existingSession.resume).toHaveBeenCalled();
    });

    it('should validate request parameters', async () => {
      const response = await request(app)
        .post('/api/learning/sessions')
        .send({
          lessonId: 'invalid',
          mode: 'invalid_mode'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请求参数验证失败');
    });
  });

  describe('GET /api/learning/sessions/:sessionId', () => {
    it('should get session successfully', async () => {
      const mockSession = {
        id: 'session_123',
        userId: 1,
        lessonId: 1,
        mode: 'sequential',
        status: 'active',
        progressData: { learnedCount: 1 },
        sessionState: { currentIndex: 1 },
        lesson: { id: 1, lessonNumber: 1, categoryId: 1 }
      };

      const mockWords = [
        { id: 1, english: 'hello', chinese: '你好' },
        { id: 2, english: 'world', chinese: '世界' }
      ];

      mockLearningSession.findOne.mockResolvedValue(mockSession);
      mockWord.findAll.mockResolvedValue(mockWords);

      const response = await request(app)
        .get('/api/learning/sessions/session_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session.sessionId).toBe('session_123');
      expect(response.body.words).toHaveLength(2);
    });

    it('should return 404 if session not found', async () => {
      mockLearningSession.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/learning/sessions/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('学习会话不存在');
    });
  });

  describe('PUT /api/learning/sessions/:sessionId/progress', () => {
    const mockSession = {
      id: 'session_123',
      userId: 1,
      lessonId: 1,
      mode: 'sequential',
      progressData: {
        currentIndex: 0,
        totalWords: 2,
        learnedCount: 0,
        loopCount: 0
      },
      sessionState: {
        wordSequence: [1, 2],
        currentIndex: 0,
        learnedWords: [],
        loopCount: 0
      },
      updateProgress: jest.fn().mockResolvedValue(),
      updateState: jest.fn().mockResolvedValue(),
      markCompleted: jest.fn().mockResolvedValue()
    };

    const mockWord = {
      id: 1,
      english: 'hello',
      chinese: '你好',
      lessonId: 1
    };

    beforeEach(() => {
      mockLearningSession.findOne.mockResolvedValue(mockSession);
      mockWord.findOne.mockResolvedValue(mockWord);
      mockWord.findAll.mockResolvedValue([
        { id: 1, english: 'hello', chinese: '你好' },
        { id: 2, english: 'world', chinese: '世界' }
      ]);
      mockLearningRecord.create.mockResolvedValue({});
    });

    it('should update progress successfully', async () => {
      const response = await request(app)
        .put('/api/learning/sessions/session_123/progress')
        .send({
          wordId: 1,
          correct: true,
          timeSpent: 5000,
          userAnswer: 'hello'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockLearningRecord.create).toHaveBeenCalledWith({
        sessionId: 'session_123',
        wordId: 1,
        userId: 1,
        correct: true,
        timeSpent: 5000,
        userAnswer: 'hello',
        correctAnswer: 'hello',
        attempts: 1,
        mode: 'sequential'
      });
    });

    it('should return next word for sequential mode', async () => {
      const response = await request(app)
        .put('/api/learning/sessions/session_123/progress')
        .send({
          wordId: 1,
          correct: true
        });

      expect(response.status).toBe(200);
      expect(response.body.nextWord).toBeTruthy();
      expect(response.body.nextWord.id).toBe(2);
    });

    it('should validate word belongs to lesson', async () => {
      mockWord.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/learning/sessions/session_123/progress')
        .send({
          wordId: 999,
          correct: true
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('单词不属于该课程');
    });
  });

  describe('PUT /api/learning/sessions/:sessionId/pause', () => {
    it('should pause session successfully', async () => {
      const mockSession = {
        id: 'session_123',
        userId: 1,
        status: 'active',
        pause: jest.fn().mockResolvedValue()
      };

      mockLearningSession.findOne.mockResolvedValue(mockSession);

      const response = await request(app)
        .put('/api/learning/sessions/session_123/pause');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('学习会话已暂停');
      expect(mockSession.pause).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/learning/sessions/:sessionId', () => {
    it('should delete session successfully', async () => {
      const mockSession = {
        id: 'session_123',
        userId: 1,
        destroy: jest.fn().mockResolvedValue()
      };

      mockLearningSession.findOne.mockResolvedValue(mockSession);
      mockLearningRecord.destroy.mockResolvedValue();

      const response = await request(app)
        .delete('/api/learning/sessions/session_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('学习会话已删除');
      expect(mockLearningRecord.destroy).toHaveBeenCalledWith({
        where: { sessionId: 'session_123' }
      });
      expect(mockSession.destroy).toHaveBeenCalled();
    });
  });
});