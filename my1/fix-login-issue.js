#!/usr/bin/env node

/**
 * 一键修复登录问题
 * 这个脚本会：
 * 1. 检查并创建管理员账户
 * 2. 验证后端服务
 * 3. 测试登录功能
 * 4. 提供访问链接
 */

import { sequelize } from './backend/src/models/index.js';
import User from './backend/src/models/User.js';
import bcryptjs from 'bcryptjs';

console.log('🔧 开始修复登录问题...\n');

async function fixLoginIssue() {
  try {
    // 1. 检查数据库连接
    console.log('1️⃣ 检查数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接正常\n');

    // 2. 确保管理员账户存在
    console.log('2️⃣ 检查管理员账户...');
    let admin = await User.findOne({ where: { username: 'admin' } });
    
    if (!admin) {
      console.log('❌ 管理员账户不存在，正在创建...');
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      admin = await User.create({
        username: 'admin',
        passwordHash: hashedPassword,
        accessDays: 999,
        isActive: true,
        isAdmin: true
      });
      console.log('✅ 管理员账户创建成功');
    } else {
      console.log('✅ 管理员账户已存在');
      
      // 确保密码正确
      const isPasswordCorrect = await bcryptjs.compare('admin123', admin.passwordHash);
      if (!isPasswordCorrect) {
        console.log('🔄 重置管理员密码...');
        const hashedPassword = await bcryptjs.hash('admin123', 10);
        await admin.update({ passwordHash: hashedPassword });
        console.log('✅ 密码已重置');
      }
    }

    console.log(`📋 管理员信息:`);
    console.log(`   用户名: admin`);
    console.log(`   密码: admin123`);
    console.log(`   权限: ${admin.isAdmin ? '管理员' : '普通用户'}`);
    console.log(`   状态: ${admin.isActive ? '启用' : '禁用'}`);
    console.log(`   天数: ${admin.accessDays}\n`);

    // 3. 测试后端API
    console.log('3️⃣ 测试后端API...');
    try {
      const { default: fetch } = await import('node-fetch');
      const healthResponse = await fetch('http://localhost:3000/health');
      if (healthResponse.ok) {
        console.log('✅ 后端服务运行正常');
      } else {
        console.log('❌ 后端服务异常');
        return;
      }
    } catch (error) {
      console.log('❌ 无法连接后端服务，请确保后端正在运行');
      console.log('   运行命令: cd my1 && node backend/src/index.js');
      return;
    }

    // 4. 测试登录API
    console.log('4️⃣ 测试登录功能...');
    try {
      const { default: fetch } = await import('node-fetch');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });

      const loginData = await loginResponse.json();
      if (loginData.success) {
        console.log('✅ 登录功能正常');
      } else {
        console.log('❌ 登录功能异常:', loginData.message);
        return;
      }
    } catch (error) {
      console.log('❌ 登录测试失败:', error.message);
      return;
    }

    // 5. 成功信息
    console.log('\n🎉 登录问题修复完成！\n');
    console.log('📱 现在你可以访问:');
    console.log('   前端: http://localhost:5173');
    console.log('   后端: http://localhost:3000');
    console.log('\n🔑 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('\n📝 如果前端未运行，请执行:');
    console.log('   cd my1/frontend && npm run dev');

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    process.exit();
  }
}

fixLoginIssue();