import http from 'http';

const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: '/assets/index-CP9asWbP.css',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('=== 搜索CSS模式 ===\n');
    console.log(`文件大小: ${data.length} 字节\n`);

    // 搜索包含underline的类
    const underlineClasses = data.match(/\.[a-zA-Z0-9_-]*underline[a-zA-Z0-9_-]*[^{]*\{[^}]{0,500}\}/gi);
    if (underlineClasses) {
      console.log('找到包含"underline"的CSS类:\n');
      underlineClasses.forEach((css, i) => {
        console.log(`${i + 1}. ${css.substring(0, 200)}...\n`);
      });
    } else {
      console.log('未找到包含"underline"的CSS类\n');
    }

    // 搜索包含word-input的类
    const wordInputClasses = data.match(/\.[a-zA-Z0-9_-]*word-input[a-zA-Z0-9_-]*[^{]*\{[^}]{0,500}\}/gi);
    if (wordInputClasses) {
      console.log('找到包含"word-input"的CSS类:\n');
      wordInputClasses.forEach((css, i) => {
        console.log(`${i + 1}. ${css.substring(0, 200)}...\n`);
      });
    } else {
      console.log('未找到包含"word-input"的CSS类\n');
    }

    // 搜索gap: 0px
    if (data.includes('gap:0px') || data.includes('gap: 0px')) {
      console.log('✓ 找到 gap:0px\n');
      const gapMatches = data.match(/[^}]{0,100}gap:\s*0px[^}]{0,100}/gi);
      if (gapMatches) {
        gapMatches.slice(0, 3).forEach((match, i) => {
          console.log(`  ${i + 1}. ...${match}...\n`);
        });
      }
    } else {
      console.log('✗ 未找到 gap:0px\n');
    }
  });
});

req.on('error', (e) => {
  console.error(`错误: ${e.message}`);
});

req.end();
