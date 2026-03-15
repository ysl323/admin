import http from 'http';

console.log('=== 验证新部署 ===\n');

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
    console.log('1. 获取index.html\n');
    const html = await getFile('/');
    
    // 提取新的JS文件名
    const jsMatch = html.match(/src="([^"]*LearningPage[^"]*\.js)"/);
    if (jsMatch) {
      const jsPath = jsMatch[1];
      console.log(`✓ 找到LearningPage JS文件: ${jsPath}\n`);
      
      console.log('2. 获取JavaScript文件\n');
      const js = await getFile(jsPath);
      console.log(`✓ 文件大小: ${js.length} 字节\n`);
      
      console.log('3. 检查新的代码模式\n');
      
      // 检查是否使用了Array().fill('_').join(' ')
      const newPattern1 = /Array\([^)]+\)\.fill\(['"]_['"]\)\.join\(['"]\s['"]\)/;
      const hasNewPattern = newPattern1.test(js);
      
      console.log(`使用Array().fill('_').join(' '): ${hasNewPattern ? '✓ 是' : '✗ 否'}`);
      
      if (hasNewPattern) {
        console.log('\n✓ 新代码已成功部署！');
        console.log('\n现在下划线应该是空格分隔的，例如: "_ _ _ _ _"');
        console.log('这样每个下划线字符都清晰可见！');
      } else {
        // 检查旧模式
        const oldPattern = /"_"\.repeat\(/;
        const hasOldPattern = oldPattern.test(js);
        
        console.log(`使用"_".repeat(): ${hasOldPattern ? '✓ 是' : '✗ 否'}`);
        
        if (hasOldPattern) {
          console.log('\n⚠️ 警告: 仍在使用旧的.repeat()方法');
          console.log('可能需要清除浏览器缓存');
        } else {
          console.log('\n✗ 未找到下划线生成代码！');
        }
      }
      
      // 提取相关代码片段
      console.log('\n4. 提取代码片段\n');
      const arrayFillPattern = /Array\([^)]+\)\.fill\(['"]_['"]\)\.join\([^)]+\)/g;
      const matches = js.match(arrayFillPattern);
      
      if (matches) {
        console.log('找到的代码片段:');
        matches.forEach((match, i) => {
          console.log(`  ${i + 1}. ${match}`);
        });
      }
      
    } else {
      console.log('✗ 未找到LearningPage JS文件引用');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
