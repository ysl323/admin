import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import { sequelize } from './models/index.js';
import { syncDatabase } from './utils/dbSync.js';
import sessionMiddleware from './config/session.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import learningRoutes from './routes/learning.js';
import wordMasteryRoutes from './routes/wordMastery.js';
import ttsRoutes from './routes/tts.js';
import audioCacheRoutes from './routes/audioCache.js';
import captchaRoutes from './routes/captcha.js';
import dailyTasks from './jobs/dailyTasks.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 解析请求体（增加大小限制以支持大文件导入）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session 中间件
app.use(sessionMiddleware);

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/word-mastery', wordMasteryRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/audio-cache', audioCacheRoutes);
app.use('/api/captcha', captchaRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 测试数据库连接
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, message: '数据库连接成功' });
  } catch (error) {
    logger.error('数据库连接失败:', error);
    res.status(500).json({ success: false, message: '数据库连接失败' });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  logger.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    // 同步数据库（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase({ alter: true });
      logger.info('数据库同步完成');
    }

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`数据库: ${process.env.DB_DIALECT || 'sqlite'}`);

      // 启动定时任务
      dailyTasks.start();
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

export default app;
