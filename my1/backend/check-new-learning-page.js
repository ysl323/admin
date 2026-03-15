import http from 'http';

console.log('=== 检查新的LearningPage文件 ===\n');

const getFile = (path) => {
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
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
};

(async () => {
  try {
    // 尝试新的文件名
    const newFile = '/assets/LearningPage-P0GG89S9.js';
    console.log(`尝试获取: ${newFile}\n`);
    
    const js = await getFile(newFile);
    console.log(`✓ 文件存在，大小: ${js.length} 字节\n`);
    
    console.log('检查代码模式:\n');
    
    // 检查新模式: Array().fill('_').join(' ')
    const newPattern = /Array\([^)]+\)\.fill\(['"]_['"]\)\.join\(/;
    const hasNew = newPattern.test(js);
    console.log(`1. Array().fill('_').join(): ${hasNew ? '✓ 找到' : '✗ 未找到'}`);
    
    // 检查旧模式: "_".repeat()
    const oldPattern = /"_"\.repeat\(/;
    const hasOld = oldPattern.test(js);
    console.log(`2. "_".repeat(): ${hasOld ? '✓ 找到' : '✗ 未找到'}`);
    
    if (hasNew) {
      console.log('\n✅ 成功！新代码已部署！\n');
      
      // 提取代码片段
      const matches = js.match(/Array\([^)]+\)\.fill\(['"]_['"]\)\.join\([^)]+\)/g);
      if (matches) {
        console.log('找到的代码片段:');
        matches.forEach((match, i) => {
          console.log(`  ${i + 1}. ${match}`);
        });
      }
      
      console.log('\n现在下划线应该显示为: "_ _ _ _ _" (空格分隔)');
      console.log('每个下划线字符都清晰可见！');
      
    } else if (hasOld) {
      console.log('\n⚠️ 仍在使用旧代码');
      console.log('可能是缓存问题或部署未完成');
    } else {
      console.log('\n❌ 未找到下划线生成代码');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
