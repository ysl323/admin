import http from 'http';

const url = 'http://47.97.185.117/assets/LearningPage-BCbr4oLG.css';

http.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('=== 检查 CSS 文件 ===\n');
    
    // 查找gap相关的CSS
    const gapPattern = /gap:\s*-?\d+px/g;
    const gapMatches = [...data.matchAll(gapPattern)];
    
    if (gapMatches.length > 0) {
      console.log('找到 gap 样式:');
      gapMatches.forEach(match => {
        console.log(`  ${match[0]}`);
      });
    } else {
      console.log('未找到 gap 样式');
    }
    
    // 查找word-input-container相关的样式
    const containerPattern = /word-input-container[^}]{50,200}/gi;
    const containerMatches = [...data.matchAll(containerPattern)];
    
    if (containerMatches.length > 0) {
      console.log('\n找到 word-input-container 样式:');
      containerMatches.forEach(match => {
        console.log(match[0]);
      });
    }
    
    console.log('\n=== CSS 验证完成 ===');
  });
}).on('error', (err) => {
  console.error('请求失败:', err.message);
});
