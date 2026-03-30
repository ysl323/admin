import http from 'http';

console.log('=== 测试实际渲染效果 ===\n');
console.log('这个测试模拟用户访问学习页面的过程\n');

// 步骤1: 获取index.html
console.log('步骤1: 获取index.html');
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

// 步骤2: 获取JS文件
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

(async () => {
  try {
    // 1. 获取index.html
    const html = await getIndexHtml();
    console.log('✓ 获取index.html成功\n');
    
    // 2. 检查LearningPage-DdUgPYYA.js是否存在
    console.log('步骤2: 检查LearningPage-DdUgPYYA.js');
    const learningPageJs = await getJsFile('/assets/LearningPage-DdUgPYYA.js');
    console.log(`✓ 文件存在，大小: ${learningPageJs.length} 字节\n`);
    
    // 3. 验证关键代码
    console.log('步骤3: 验证关键代码\n');
    
    const checks = [
      { name: '下划线字符 "_"', pattern: '"_"', found: learningPageJs.includes('"_"') },
      { name: '.repeat() 方法', pattern: '.repeat(', found: learningPageJs.includes('.repeat(') },
      { name: 'placeholders computed', pattern: /ne=z\(\(\)=>h\.value\.map/, found: /ne=z\(\(\)=>h\.value\.map/.test(learningPageJs) },
      { name: 'singleWordPlaceholder computed', pattern: /re=z\(\(\)=>{/, found: /re=z\(\(\)=>{/.test(learningPageJs) }
    ];
    
    checks.forEach(check => {
      console.log(`  ${check.found ? '✓' : '✗'} ${check.name}: ${check.found ? '找到' : '未找到'}`);
    });
    
    // 4. 提取.repeat()调用的上下文
    console.log('\n步骤4: 提取.repeat()调用的上下文\n');
    const repeatMatches = learningPageJs.match(/.{50}"_"\.repeat\(.{50}/g);
    if (repeatMatches) {
      repeatMatches.forEach((match, i) => {
        console.log(`  ${i + 1}. ${match}`);
      });
    }
    
    // 5. 检查CSS文件
    console.log('\n步骤5: 检查CSS文件');
    const css = await getJsFile('/assets/LearningPage-Cp-Ou-8G.css');
    console.log(`✓ CSS文件存在，大小: ${css.length} 字节\n`);
    
    const cssChecks = [
      { name: 'underline-placeholder', found: css.includes('underline-placeholder') },
      { name: 'gap:0px', found: css.includes('gap:0px') },
      { name: 'min-height:40px', found: css.includes('min-height:40px') },
      { name: 'line-height:40px', found: css.includes('line-height:40px') }
    ];
    
    cssChecks.forEach(check => {
      console.log(`  ${check.found ? '✓' : '✗'} ${check.name}: ${check.found ? '找到' : '未找到'}`);
    });
    
    // 6. 总结
    console.log('\n=== 总结 ===\n');
    
    const allJsChecks = checks.every(c => c.found);
    const allCssChecks = cssChecks.every(c => c.found);
    
    if (allJsChecks && allCssChecks) {
      console.log('✓ 所有代码都正确部署到服务器！');
      console.log('\n可能的问题:');
      console.log('1. 浏览器缓存 - 用户需要强制刷新 (Ctrl+Shift+R 或 Ctrl+F5)');
      console.log('2. Vue组件未正确挂载 - 检查浏览器控制台是否有JavaScript错误');
      console.log('3. 数据问题 - wordParts数组可能为空或undefined');
      console.log('\n建议用户:');
      console.log('1. 打开浏览器开发者工具 (F12)');
      console.log('2. 切换到Console标签');
      console.log('3. 强制刷新页面 (Ctrl+Shift+R)');
      console.log('4. 查看是否有JavaScript错误');
      console.log('5. 在Console中输入: document.querySelector(".underline-placeholder")');
      console.log('6. 查看该元素的textContent是否包含下划线字符');
    } else {
      console.log('✗ 发现问题:');
      if (!allJsChecks) {
        console.log('  - JavaScript代码不完整');
      }
      if (!allCssChecks) {
        console.log('  - CSS样式不完整');
      }
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
