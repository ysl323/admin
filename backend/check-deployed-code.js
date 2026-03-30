import http from 'http';

const url = 'http://47.97.185.117/assets/LearningPage-BDYRP4aq.js';

http.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('=== 检查部署的代码 ===\n');
    
    // 查找placeholder相关的代码片段
    const placeholderMatch = data.match(/placeholder[^}]{100,300}/gi);
    if (placeholderMatch) {
      console.log('找到 placeholder 相关代码:');
      placeholderMatch.forEach((match, i) => {
        console.log(`\n片段 ${i + 1}:`);
        console.log(match.substring(0, 200));
      });
    }
    
    // 查找Array相关的代码
    const arrayMatch = data.match(/Array\([^)]+\)[^;]{20,100}/gi);
    if (arrayMatch) {
      console.log('\n\n找到 Array 相关代码:');
      arrayMatch.slice(0, 5).forEach((match, i) => {
        console.log(`\n片段 ${i + 1}:`);
        console.log(match);
      });
    }
    
    // 查找gap相关的CSS
    const gapMatch = data.match(/gap[^,;]{10,50}/gi);
    if (gapMatch) {
      console.log('\n\n找到 gap 相关CSS:');
      gapMatch.forEach((match, i) => {
        console.log(`片段 ${i + 1}: ${match}`);
      });
    }
  });
}).on('error', (err) => {
  console.error('请求失败:', err.message);
});
