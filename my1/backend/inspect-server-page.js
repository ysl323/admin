import http from 'http';

console.log('=== 检查服务器实际渲染的HTML ===\n');

// 获取实际的学习页面HTML
const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('HTML内容:\n');
    console.log(data);
    console.log('\n\n=== 分析 ===');
    
    // 检查是否引用了正确的CSS文件
    const cssMatch = data.match(/href="([^"]*\.css)"/g);
    if (cssMatch) {
      console.log('\n找到的CSS引用:');
      cssMatch.forEach(match => console.log('  ' + match));
    }
    
    // 检查是否引用了正确的JS文件
    const jsMatch = data.match(/src="([^"]*\.js)"/g);
    if (jsMatch) {
      console.log('\n找到的JS引用:');
      jsMatch.forEach(match => console.log('  ' + match));
    }
  });
});

req.on('error', (e) => {
  console.error(`错误: ${e.message}`);
});

req.end();
