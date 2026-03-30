import http from 'http';

// 获取服务器上的LearningPage JS文件
http.get('http://47.97.185.117', (res) => {
  let html = '';
  res.on('data', (chunk) => html += chunk);
  res.on('end', () => {
    // 从HTML中提取LearningPage的JS文件名
    const match = html.match(/LearningPage-[a-zA-Z0-9_-]+\.js/);
    if (!match) {
      console.log('❌ 未找到LearningPage JS文件');
      return;
    }
    
    const jsFile = match[0];
    console.log(`✓ 找到JS文件: ${jsFile}`);
    
    // 获取JS文件内容
    http.get(`http://47.97.185.117/assets/${jsFile}`, (jsRes) => {
      let jsContent = '';
      jsRes.on('data', (chunk) => jsContent += chunk);
      jsRes.on('end', () => {
        console.log('\n=== 验证下划线逻辑 ===');
        
        // 检查是否使用currentLength（BUG13逻辑）
        const hasCurrentLength = jsContent.includes('currentLength') || 
                                 jsContent.includes('input?.length') ||
                                 jsContent.includes('userAnswer.value?.length');
        
        // 检查是否移除了targetLength逻辑
        const hasTargetLength = jsContent.includes('targetLength') && 
                               jsContent.includes('remainingLength');
        
        // 检查Array().fill('_').join(' ')模式
        const arrayFillPattern = /Array\([^)]*\)\.fill\(['"]_['"]\)\.join\(/g;
        const matches = jsContent.match(arrayFillPattern);
        
        console.log(`✓ 使用currentLength逻辑: ${hasCurrentLength ? '是' : '否'}`);
        console.log(`✓ 移除targetLength逻辑: ${!hasTargetLength ? '是' : '否'}`);
        console.log(`✓ 找到Array().fill('_').join()调用: ${matches ? matches.length : 0}次`);
        
        if (hasCurrentLength && !hasTargetLength && matches && matches.length >= 2) {
          console.log('\n✅ BUG13逻辑已正确部署！');
          console.log('   - 下划线将随输入增多而增多');
          console.log('   - 输入前：无下划线');
          console.log('   - 输入中：下划线数量 = 已输入字符数');
        } else {
          console.log('\n⚠️ 代码可能未正确部署');
          if (!hasCurrentLength) console.log('   - 未找到currentLength逻辑');
          if (hasTargetLength) console.log('   - 仍然存在targetLength逻辑');
          if (!matches || matches.length < 2) console.log('   - Array().fill调用次数不足');
        }
        
        // 检查CSS gap
        console.log('\n=== 验证CSS间距 ===');
        http.get(`http://47.97.185.117`, (cssRes) => {
          let cssHtml = '';
          cssRes.on('data', (chunk) => cssHtml += chunk);
          cssRes.on('end', () => {
            const cssMatch = cssHtml.match(/LearningPage-[a-zA-Z0-9_-]+\.css/);
            if (!cssMatch) {
              console.log('❌ 未找到LearningPage CSS文件');
              return;
            }
            
            const cssFile = cssMatch[0];
            console.log(`✓ 找到CSS文件: ${cssFile}`);
            
            http.get(`http://47.97.185.117/assets/${cssFile}`, (cssContentRes) => {
              let cssContent = '';
              cssContentRes.on('data', (chunk) => cssContent += chunk);
              cssContentRes.on('end', () => {
                const hasGapNegative = cssContent.includes('gap:-10px') || 
                                      cssContent.includes('gap: -10px');
                
                console.log(`✓ CSS包含gap:-10px: ${hasGapNegative ? '是' : '否'}`);
                
                if (hasGapNegative) {
                  console.log('\n✅ CSS间距已正确部署！');
                  console.log('   - 下划线将更靠近字母');
                } else {
                  console.log('\n⚠️ CSS可能未正确部署');
                }
              });
            });
          });
        });
      });
    });
  });
});
