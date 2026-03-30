import http from 'http';

const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('=== index.html内容 ===\n');
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(`错误: ${e.message}`);
});

req.end();
