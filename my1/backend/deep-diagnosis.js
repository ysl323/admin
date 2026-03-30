import http from 'http';

console.log('=== 深度诊断：下划线不显示问题 ===\n');

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
    console.log('步骤1: 获取LearningPage JavaScript文件\n');
    const js = await getFile('/assets/LearningPage-DdUgPYYA.js');
    console.log(`文件大小: ${js.length} 字节\n`);
    
    // 查找computed属性的完整定义
    console.log('步骤2: 查找placeholders computed属性\n');
    
    // 搜索ne=z(()=>h.value.map...
    const placeholdersPattern = /ne=z\(\(\)=>h\.value\.map\([^)]+\)=>{[^}]+return"_"\.repeat\([^)]+\)\}\)\)/;
    const placeholdersMatch = js.match(placeholdersPattern);
    
    if (placeholdersMatch) {
      console.log('✓ 找到placeholders定义:');
      console.log(placeholdersMatch[0]);
      console.log('');
    } else {
      console.log('✗ 未找到placeholders定义');
      console.log('尝试搜索其他模式...\n');
      
      // 尝试更宽松的搜索
      const loosePattern = /"_"\.repeat\(/g;
      const matches = js.match(loosePattern);
      if (matches) {
        console.log(`找到 ${matches.length} 处 "_".repeat( 调用`);
        
        // 提取上下文
        const contexts = [];
        let index = 0;
        while ((index = js.indexOf('"_".repeat(', index)) !== -1) {
          const start = Math.max(0, index - 200);
          const end = Math.min(js.length, index + 200);
          contexts.push(js.substring(start, end));
          index += 1;
        }
        
        console.log('\n上下文:');
        contexts.forEach((ctx, i) => {
          console.log(`\n${i + 1}. ...${ctx}...`);
        });
      }
    }
    
    console.log('\n步骤3: 查找singleWordPlaceholder computed属性\n');
    
    const singlePattern = /re=z\(\(\)=>{[^}]+return"_"\.repeat\([^)]+\)\}\)/;
    const singleMatch = js.match(singlePattern);
    
    if (singleMatch) {
      console.log('✓ 找到singleWordPlaceholder定义:');
      console.log(singleMatch[0]);
      console.log('');
    } else {
      console.log('✗ 未找到singleWordPlaceholder定义\n');
    }
    
    console.log('步骤4: 检查模板中的placeholder引用\n');
    
    // 搜索模板中使用placeholder的地方
    const templatePatterns = [
      /underline-placeholder[^>]*>.*?ne\.value/,
      /underline-placeholder[^>]*>.*?re\.value/,
      /class:"underline-placeholder"/g
    ];
    
    templatePatterns.forEach((pattern, i) => {
      const match = js.match(pattern);
      if (match) {
        console.log(`✓ 模式${i + 1}找到:`);
        console.log(match[0]);
      } else {
        console.log(`✗ 模式${i + 1}未找到`);
      }
    });
    
    console.log('\n步骤5: 检查是否有条件渲染问题\n');
    
    // 搜索v-if或条件判断
    const conditionalPattern = /underline-placeholder[^}]{0,500}/g;
    const conditionals = js.match(conditionalPattern);
    
    if (conditionals) {
      console.log('找到相关代码片段:');
      conditionals.forEach((c, i) => {
        console.log(`\n${i + 1}. ${c.substring(0, 300)}...`);
      });
    }
    
    console.log('\n步骤6: 检查CSS文件\n');
    const css = await getFile('/assets/LearningPage-Cp-Ou-8G.css');
    
    // 提取underline-placeholder的完整CSS
    const cssPattern = /\.underline-placeholder\[data-v-[^\]]+\]{[^}]+}/;
    const cssMatch = css.match(cssPattern);
    
    if (cssMatch) {
      console.log('✓ CSS定义:');
      console.log(cssMatch[0]);
    } else {
      console.log('✗ 未找到CSS定义');
    }
    
    console.log('\n=== 诊断总结 ===\n');
    
    const hasRepeat = js.includes('"_".repeat(');
    const hasPlaceholderClass = js.includes('underline-placeholder');
    const hasCss = css.includes('underline-placeholder');
    
    console.log(`JavaScript包含"_".repeat(): ${hasRepeat ? '✓' : '✗'}`);
    console.log(`JavaScript包含underline-placeholder: ${hasPlaceholderClass ? '✓' : '✗'}`);
    console.log(`CSS包含underline-placeholder: ${hasCss ? '✓' : '✗'}`);
    
    if (hasRepeat && hasPlaceholderClass && hasCss) {
      console.log('\n所有必要代码都存在！');
      console.log('\n可能的问题:');
      console.log('1. Vue响应式系统未触发更新');
      console.log('2. computed属性返回空字符串');
      console.log('3. wordParts数组为空');
      console.log('4. 模板条件渲染阻止了显示');
      console.log('5. CSS被其他样式覆盖');
    } else {
      console.log('\n发现缺失的代码！需要重新部署。');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
