import http from 'http';

async function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  try {
    console.log('测试后端健康检查...');
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('响应状态:', res.statusCode);
        console.log('响应数据:', data);
      });
    });

    req.on('error', (error) => {
      console.error('请求错误:', error.message);
    });

    req.end();
  } catch (error) {
    console.error('错误:', error.message);
  }
}

testAPI();
