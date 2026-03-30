/**
 * JSON 批量导入功能测试脚本
 */

import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const API_BASE = 'http://localhost:3000/api';

// 创建 cookie jar 来保持 session
const jar = new CookieJar();
const client = wrapper(axios.create({
  baseURL: API_BASE,
  jar,
  withCredentials: true
}));

// 测试数据
const testData = {
  category: "测试分类",
  lessons: [
    {
      lesson: 1,
      words: [
        { en: "test", cn: "测试" },
        { en: "import", cn: "导入" },
        { en: "function", cn: "函数" }
      ]
    },
    {
      lesson: 2,
      words: [
        { en: "database", cn: "数据库" },
        { en: "server", cn: "服务器" }
      ]
    }
  ]
};

// 无效的测试数据（缺少必需字段）
const invalidData = {
  category: "测试分类",
  lessons: [
    {
      lesson: 1,
      words: [
        { en: "test" } // 缺少 cn 字段
      ]
    }
  ]
};

// 创建 axios 实例（使用支持 cookie 的 client）
const api = client;

/**
 * 登录管理员账号
 */
async function login() {
  try {
    console.log('🔐 正在登录管理员账号...');
    const response = await api.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ 登录成功');
      return true;
    } else {
      console.error('❌ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 登录错误:', error.response?.data || error.message);
    return false;
  }
}

/**
 * 测试直接 JSON 导入（不需要文件上传）
 */
async function testDirectImport() {
  console.log('\n📝 测试 1: 直接 JSON 导入（有效数据）');
  try {
    const response = await api.post('/admin/import-json-direct', testData);
    
    if (response.data.success) {
      console.log('✅ 导入成功!');
      console.log('   分类:', response.data.category);
      console.log('   分类ID:', response.data.categoryId);
      console.log('   创建课程数:', response.data.lessonsCreated);
      console.log('   总单词数:', response.data.totalWords);
      console.log('   课程详情:', JSON.stringify(response.data.lessons, null, 2));
    } else {
      console.error('❌ 导入失败:', response.data.message);
    }
  } catch (error) {
    console.error('❌ 导入错误:', error.response?.data || error.message);
  }
}

/**
 * 测试无效数据导入
 */
async function testInvalidImport() {
  console.log('\n📝 测试 2: 导入无效数据（应该失败）');
  try {
    const response = await api.post('/admin/import-json-direct', invalidData);
    
    if (response.data.success) {
      console.error('❌ 测试失败: 应该拒绝无效数据');
    } else {
      console.log('✅ 正确拒绝了无效数据');
      console.log('   错误信息:', response.data.message);
    }
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 正确拒绝了无效数据');
      console.log('   错误信息:', error.response.data.message);
    } else {
      console.error('❌ 意外错误:', error.response?.data || error.message);
    }
  }
}

/**
 * 测试文件上传导入
 */
async function testFileImport() {
  console.log('\n📝 测试 3: 文件上传导入');
  try {
    // 创建临时 JSON 文件
    const tempFile = 'temp-import.json';
    await fs.writeFile(tempFile, JSON.stringify(testData, null, 2));
    
    // 创建 FormData
    const form = new FormData();
    const fileBuffer = await fs.readFile(tempFile);
    form.append('file', fileBuffer, {
      filename: 'test-data.json',
      contentType: 'application/json'
    });
    
    // 发送请求
    const response = await api.post('/admin/import-json', form, {
      headers: form.getHeaders()
    });
    
    if (response.data.success) {
      console.log('✅ 文件导入成功!');
      console.log('   分类:', response.data.category);
      console.log('   创建课程数:', response.data.lessonsCreated);
      console.log('   总单词数:', response.data.totalWords);
    } else {
      console.error('❌ 文件导入失败:', response.data.message);
    }
    
    // 清理临时文件
    await fs.unlink(tempFile);
  } catch (error) {
    console.error('❌ 文件导入错误:', error.response?.data || error.message);
  }
}

/**
 * 验证导入的数据
 */
async function verifyImportedData() {
  console.log('\n📝 测试 4: 验证导入的数据');
  try {
    // 获取所有分类
    const categoriesResponse = await api.get('/categories');
    const categories = categoriesResponse.data.categories;
    
    const testCategory = categories.find(c => c.name === '测试分类');
    if (!testCategory) {
      console.error('❌ 未找到测试分类');
      return;
    }
    
    console.log('✅ 找到测试分类, ID:', testCategory.id);
    
    // 获取该分类的课程
    const lessonsResponse = await api.get(`/categories/${testCategory.id}/lessons`);
    const lessons = lessonsResponse.data.lessons;
    
    console.log('✅ 找到', lessons.length, '个课程');
    
    // 获取第一个课程的单词
    if (lessons.length > 0) {
      const wordsResponse = await api.get(`/lessons/${lessons[0].id}/words`);
      const words = wordsResponse.data.words;
      
      console.log('✅ 第一个课程有', words.length, '个单词');
      console.log('   单词列表:', words.map(w => w.english).join(', '));
    }
  } catch (error) {
    console.error('❌ 验证错误:', error.response?.data || error.message);
  }
}

/**
 * 清理测试数据
 */
async function cleanup() {
  console.log('\n🧹 清理测试数据...');
  try {
    // 获取测试分类
    const categoriesResponse = await api.get('/categories');
    const categories = categoriesResponse.data.categories;
    
    const testCategory = categories.find(c => c.name === '测试分类');
    if (testCategory) {
      // 删除测试分类（级联删除所有课程和单词）
      await api.delete(`/admin/categories/${testCategory.id}`);
      console.log('✅ 测试数据已清理');
    } else {
      console.log('ℹ️  没有需要清理的测试数据');
    }
  } catch (error) {
    console.error('❌ 清理错误:', error.response?.data || error.message);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试 JSON 批量导入功能\n');
  console.log('=' .repeat(60));
  
  // 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n❌ 无法继续测试，登录失败');
    return;
  }
  
  // 运行测试
  await testDirectImport();
  await testInvalidImport();
  await testFileImport();
  await verifyImportedData();
  
  // 清理
  await cleanup();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ 所有测试完成!');
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});
