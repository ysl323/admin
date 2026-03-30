import UserService from './src/services/UserService.js';

async function testUserAPI() {
  try {
    console.log('测试用户API返回的数据...\n');
    
    const users = await UserService.getAllUsers();
    
    console.log('返回的用户数据:');
    console.log(JSON.stringify(users, null, 2));
    
    console.log('\n检查IP字段:');
    users.forEach(user => {
      console.log(`用户 ${user.username}:`);
      console.log(`  lastLoginIp: "${user.lastLoginIp}"`);
    });
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.error(error);
  }
}

testUserAPI();
