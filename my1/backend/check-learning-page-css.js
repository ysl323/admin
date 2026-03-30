import http from 'http';

const cssPath = '/assets/LearningPage-Cp-Ou-8G.css';

const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: cssPath,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('=== LearningPage CSS文件 ===\n');
    console.log(`路径: ${cssPath}`);
    console.log(`状态码: ${res.statusCode}`);
    console.log(`文件大小: ${data.length} 字节\n`);

    if (res.statusCode === 200) {
      // 搜索关键CSS
      const patterns = [
        'underline-placeholder',
        'word-input-container',
        'gap',
        'min-height',
        'line-height'
      ];

      console.log('=== 搜索关键词 ===\n');
      patterns.forEach(pattern => {
        const found = data.includes(pattern);
        console.log(`${found ? '✓' : '✗'} ${pattern}: ${found ? '找到' : '未找到'}`);
      });

      // 显示完整内容（如果不太大）
      if (data.length < 10000) {
        console.log('\n=== 完整CSS内容 ===\n');
        console.log(data);
      } else {
        console.log('\n文件太大，不显示完整内容');
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`错误: ${e.message}`);
});

req.end();
