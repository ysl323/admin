import http from 'http';

console.log('=== 检查正确的CSS文件 ===\n');

const cssPath = '/assets/index-CP9asWbP.css';

const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: cssPath,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`路径: ${cssPath}`);
    console.log(`状态码: ${res.statusCode}`);
    console.log(`文件大小: ${data.length} 字节\n`);
    
    if (res.statusCode === 200 && data.length > 10000) {
      // 检查关键CSS
      const checks = [
        { name: '下划线占位符CSS', pattern: /\.underline-placeholder/ },
        { name: 'word-input-container', pattern: /\.word-input-container/ },
        { name: 'gap: 0px', pattern: /gap:\s*0px/ },
        { name: 'min-height', pattern: /min-height:\s*40px/ },
        { name: 'line-height', pattern: /line-height:\s*40px/ }
      ];

      console.log('=== CSS检查结果 ===\n');
      checks.forEach(check => {
        const found = check.pattern.test(data);
        console.log(`${found ? '✓' : '✗'} ${check.name}: ${found ? '找到' : '未找到'}`);
      });

      // 提取underline-placeholder的完整CSS
      const match = data.match(/\.underline-placeholder[^{]*\{[^}]*\}/);
      if (match) {
        console.log('\n=== underline-placeholder CSS ===\n');
        console.log(match[0]);
      }

      // 提取word-input-container的完整CSS
      const containerMatch = data.match(/\.word-input-container[^{]*\{[^}]*\}/);
      if (containerMatch) {
        console.log('\n=== word-input-container CSS ===\n');
        console.log(containerMatch[0]);
      }
    } else {
      console.log('✗ CSS文件不存在或太小');
    }
  });
});

req.on('error', (e) => {
  console.error(`错误: ${e.message}`);
});

req.end();
