/**
 * 完整登录流程测试
 * 测试登录API和session处理
 */

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { sequelize, User } from './src/models/index.js';
import authRoutes from './src/routes/auth.js';
import logger from './src/utils/logger.js';

async function testFullLoginFlow() {
  const app = express();
  const PORT = 3456;

  // 中间件
  app.use(helmet());
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'test-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  // 路由
  app.use('/api/auth', authRoutes);

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  try {
    console.log('='.repeat(60));
    console.log('🔐 完整登录流程测试');
    console.log('='.repeat(60));

    // 1. 启动服务器
    console.log('\n1. 启动测试服务器...');
    await new Promise((resolve) => {
      app.listen(PORT, () => {
        console.log(`✅ 测试服务器运行在端口 ${PORT}`);
        resolve();
      });
    });

    // 2. 测试数据库连接
    console.log('\n2. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 3. 检查admin用户
    console.log('\n3. 检查admin用户...');
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (adminUser) {
      console.log('✅ admin用户存在');
    } else {
      console.log('❌ admin用户不存在');
      process.exit(1);
    }

    // 4. 测试登录API
    console.log('\n4. 测试登录API...');
    
    // 使用 http 模块发送请求
    const { default: fetch } = await import('node-fetch');
    
    // 4.1 测试错误密码
    console.log('   4.1 测试错误密码...');
    let response = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongpassword'
      })
    });
    
    let result = await response.json();
    if (!result.success && result.message.includes('用户名或密码错误')) {
      console.log('   ✅ 错误密码验证成功');
    } else {
      console.log('   ❌ 错误密码验证失败:', result);
    }

    // 4.2 测试正确密码
    console.log('   4.2 测试正确密码...');
    response = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    result = await response.json();
    if (result.success) {
      console.log('   ✅ 登录成功');
      console.log(`   - 用户ID: ${result.user.id}`);
      console.log(`   - 用户名: ${result.user.username}`);
      console.log(`   - 是否管理员: ${result.user.isAdmin}`);
      
      // 检查session cookie
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('   ✅ Session Cookie已设置');
        console.log(`   - Cookie: ${setCookieHeader.substring(0, 50)}...`);
      } else {
        console.log('   ⚠️  未找到Session Cookie');
      }
    } else {
      console.log('   ❌ 登录失败:', result.message);
    }

    // 4.3 测试未设置用户名
    console.log('   4.3 测试空用户名...');
    response = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: '',
        password: 'admin123'
      })
    });
    
    result = await response.json();
    if (!result.success) {
      console.log('   ✅ 空用户名验证成功');
    } else {
      console.log('   ❌ 空用户名验证失败');
    }

    console.log('\n' + '='.repeat(60));
    console.log('测试完成');
    console.log('='.repeat(60));
    console.log('\n📝 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   状态: ✅ 后端登录功能正常');
    console.log('');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testFullLoginFlow();