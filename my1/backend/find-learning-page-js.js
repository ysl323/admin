import http from 'http';

console.log('=== 查找LearningPage组件JS文件 ===\n');

// 获取所有assets目录下的文件
const getAssetsList = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '47.97.185.117',
      port: 80,
      path: '/assets/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
};

// 获取JS文件内容
const getJsFile = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '47.97.185.117',
      port: 80,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ path, content: data, size: data.length });
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// 主函数
(async () => {
  try {
    // 尝试常见的文件名模式
    const possibleFiles = [
      '/assets/LearningPage-DdUgPYYA.js',
      '/assets/LearningPage.js',
      '/assets/index-C1OEmgMk.js',
      '/assets/vendor-D3p_bh-b.js'
    ];
    
    console.log('尝试获取可能的JS文件...\n');
    
    for (const file of possibleFiles) {
      try {
        console.log(`检查: ${file}`);
        const result = await getJsFile(file);
        console.log(`  ✓ 文件存在，大小: ${result.size} 字节`);
        
        // 搜索关键代码
        const hasPlaceholders = result.content.includes('placeholders');
        const hasSingleWord = result.content.includes('singleWordPlaceholder');
        const hasUnderscore = result.content.includes('"_"') || result.content.includes("'_'");
        const hasRepeat = result.content.includes('.repeat(');
        
        console.log(`  - placeholders: ${hasPlaceholders ? '✓' : '✗'}`);
        console.log(`  - singleWordPlaceholder: ${hasSingleWord ? '✓' : '✗'}`);
        console.log(`  - 下划线字符: ${hasUnderscore ? '✓' : '✗'}`);
        console.log(`  - .repeat(): ${hasRepeat ? '✓' : '✗'}`);
        
        if (hasPlaceholders || hasSingleWord || hasUnderscore || hasRepeat) {
          console.log('\n  ⭐ 这个文件包含LearningPage的代码！\n');
          
          // 提取相关代码片段
          if (hasRepeat) {
            const repeatMatches = result.content.match(/.{0,100}\.repeat\(.{0,100}/g);
            if (repeatMatches) {
              console.log('  找到的.repeat()调用:');
              repeatMatches.forEach((match, i) => {
                console.log(`    ${i + 1}. ${match.substring(0, 150)}...`);
              });
            }
          }
        }
        
        console.log('');
      } catch (error) {
        console.log(`  ✗ 文件不存在或无法访问\n`);
      }
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
