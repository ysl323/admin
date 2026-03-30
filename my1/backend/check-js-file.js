import http from 'http';

console.log('=== 检查服务器JavaScript文件 ===\n');

// 从index.html获取JS文件名
const getIndexHtml = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '47.97.185.117',
      port: 80,
      path: '/',
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
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
};

// 主函数
(async () => {
  try {
    // 1. 获取index.html
    console.log('1. 获取index.html...');
    const html = await getIndexHtml();
    
    // 2. 提取JS文件路径
    const jsMatch = html.match(/src="([^"]*index[^"]*\.js)"/);
    if (!jsMatch) {
      console.error('❌ 未找到主JS文件引用');
      return;
    }
    
    const jsPath = jsMatch[1];
    console.log(`✓ 找到JS文件: ${jsPath}\n`);
    
    // 3. 获取JS文件内容
    console.log('2. 获取JS文件内容...');
    const jsContent = await getJsFile(jsPath);
    console.log(`✓ JS文件大小: ${jsContent.length} 字节\n`);
    
    // 4. 搜索关键代码
    console.log('3. 搜索关键代码:\n');
    
    const keywords = [
      'placeholders',
      'singleWordPlaceholder',
      'computed',
      'underline-placeholder',
      '_'.repeat(5)  // 搜索下划线字符
    ];
    
    keywords.forEach(keyword => {
      const found = jsContent.includes(keyword);
      console.log(`  ${found ? '✓' : '✗'} ${keyword}: ${found ? '找到' : '未找到'}`);
    });
    
    // 5. 搜索computed属性定义
    console.log('\n4. 搜索computed属性定义:\n');
    
    // 搜索placeholders的定义
    const placeholdersMatch = jsContent.match(/placeholders[^{]*{[^}]*}/);
    if (placeholdersMatch) {
      console.log('✓ 找到placeholders定义:');
      console.log(placeholdersMatch[0].substring(0, 200) + '...');
    } else {
      console.log('✗ 未找到placeholders定义');
    }
    
    console.log('');
    
    // 搜索singleWordPlaceholder的定义
    const singleMatch = jsContent.match(/singleWordPlaceholder[^{]*{[^}]*}/);
    if (singleMatch) {
      console.log('✓ 找到singleWordPlaceholder定义:');
      console.log(singleMatch[0].substring(0, 200) + '...');
    } else {
      console.log('✗ 未找到singleWordPlaceholder定义');
    }
    
    // 6. 检查是否有"_"字符的生成
    console.log('\n5. 检查下划线字符生成:\n');
    const underscorePattern = /"_"|'_'|`_`/g;
    const underscoreMatches = jsContent.match(underscorePattern);
    if (underscoreMatches) {
      console.log(`✓ 找到 ${underscoreMatches.length} 处下划线字符定义`);
    } else {
      console.log('✗ 未找到下划线字符定义');
    }
    
    // 7. 检查repeat方法
    const repeatPattern = /\.repeat\(/g;
    const repeatMatches = jsContent.match(repeatPattern);
    if (repeatMatches) {
      console.log(`✓ 找到 ${repeatMatches.length} 处.repeat()调用`);
    } else {
      console.log('✗ 未找到.repeat()调用');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
