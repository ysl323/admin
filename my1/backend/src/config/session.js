import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Session 配置
 */
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 改为 false，因为服务器使用 HTTP 而不是 HTTPS
    httpOnly: true, // 防止 XSS 攻击
    maxAge: 24 * 60 * 60 * 1000, // 24 小时
    sameSite: 'lax' // 改为 lax，strict 太严格会导致跨站问题
  },
  name: 'sessionId' // 自定义 cookie 名称
};

// 生产环境使用 Redis 存储 Session
if (process.env.NODE_ENV === 'production' && process.env.REDIS_HOST) {
  try {
    // 动态导入 Redis 相关模块（仅在需要时）
    const { createClient } = await import('redis');
    const RedisStore = (await import('connect-redis')).default;

    const redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis 连接错误:', err);
    });

    await redisClient.connect();

    sessionConfig.store = new RedisStore({
      client: redisClient,
      prefix: 'sess:'
    });

    console.log('✅ Session 存储: Redis');
  } catch (error) {
    console.warn('⚠️  Redis 连接失败，使用内存存储 Session:', error.message);
    console.log('✅ Session 存储: Memory (开发环境)');
  }
} else {
  console.log('✅ Session 存储: Memory (开发环境)');
}

export default session(sessionConfig);
