import http from 'http';

console.log('=== 检查服务器上的CSS文件 ===\n');

const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: '/assets/index.css',
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
    console.log(`HTTP状态码: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      // 查找underline相关的CSS
      const underlineMatches = data.match(/\.underline[^{]*\{[^}]*\}/g);
      
      if (underlineMatches) {
        console.log('找到的下划线相关CSS:\n');
        underlineMatches.forEach((match, index) => {
          console.log(`${index + 1}. ${match}\n`);
        });
      } else {
        console.log('未找到任何下划线相关的CSS');
      }
      
      // 查找word-input-container
      const containerMatches = data.match(/\.word-input-container[^{]*\{[^}]*\}/g);
      if (containerMatches) {
        console.log('\n找到的word-input-container CSS:\n');
        containerMatches.forEach((match, index) => {
          console.log(`${index + 1}. ${match}\n`);
        });
      }
      
      // 检查文件大小
      console.log(`\nCSS文件大小: ${data.length} 字节`);
      
      // 检查是否包含Vue相关的CSS
      if (data.includes('data-v-')) {
        console.log('✓ 包含Vue scoped CSS');
      } else {
        console.log('✗ 未找到Vue scoped CSS');
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`请求失败: ${e.message}`);
});

req.end();
