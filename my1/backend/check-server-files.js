import http from 'http';

console.log('=== 检查服务器文件 ===\n');

const paths = [
  '/',
  '/assets/index.css',
  '/assets/index.js'
];

let completed = 0;

paths.forEach(path => {
  const options = {
    hostname: '47.97.185.117',
    port: 80,
    path: path,
    method: 'HEAD',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`${path}:`);
    console.log(`  状态码: ${res.statusCode}`);
    console.log(`  Content-Length: ${res.headers['content-length'] || 'N/A'}`);
    console.log(`  Last-Modified: ${res.headers['last-modified'] || 'N/A'}`);
    console.log('');
    
    completed++;
    if (completed === paths.length) {
      console.log('检查完成');
    }
  });

  req.on('error', (e) => {
    console.error(`${path}: 错误 - ${e.message}\n`);
    completed++;
  });

  req.end();
});
