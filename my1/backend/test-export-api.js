const axios = require('axios');

async function testExportAPI() {
  try {
    console.log('测试导出 API...\n');

    // 测试导出端点
    const response = await axios.get('http://localhost:3000/api/audio-cache/export', {
      withCredentials: true,
      headers: {
        'Cookie': 'connect.sid=s%3AyourSessionId.signature' // 需要实际的 session
      }
    });

    console.log('✓ 导出成功');
    console.log('状态码:', response.status);
    console.log('返回数据:', JSON.stringify(response.data, null, 2));
    console.log('记录数量:', response.data.count);

  } catch (error) {
    console.error('✗ 导出失败');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
  }
}

testExportAPI();
