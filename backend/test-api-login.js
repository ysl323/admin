// 测试登录API
async function testLoginAPI() {
  try {
    console.log('🔍 测试登录API...\n');

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();

    console.log(`状态码: ${response.status}`);
    console.log(`响应数据:`, JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ 登录成功！');
      console.log(`用户: ${data.user.username}`);
      console.log(`管理员: ${data.user.isAdmin}`);
      console.log(`超级管理员: ${data.user.isSuperAdmin}`);

      // 测试认证检查
      console.log('\n🔍 测试认证检查...');
      const checkResponse = await fetch('http://localhost:3000/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      });

      const checkData = await checkResponse.json();
      console.log(`认证状态:`, JSON.stringify(checkData, null, 2));
    } else {
      console.log(`\n❌ 登录失败: ${data.message}`);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行测试
testLoginAPI();
