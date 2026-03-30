import http from 'http';

console.log('=== 检查最新的LearningPage文件 ===\n');

// 新文件名
const newFile = '/assets/LearningPage-DDjmuGMr.js';

console.log(`尝试获取: ${newFile}\n`);

const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: newFile,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`✓ 文件存在，大小: ${data.length} 字节\n`);
      
      console.log('检查代码模式:\n');
      
      // 检查新代码: Array(targetLength).fill('_').join(' ')
      const hasNewCode1 = data.includes('Array(') && data.includes('.fill("_")') && data.includes('.join(" ")');
      console.log(`1. Array().fill('_').join(' '): ${hasNewCode1 ? '✓ 找到' : '✗ 未找到'}`);
      
      // 检查是否移除了旧代码
      const hasOldCode = data.includes('"_".repeat(');
      console.log(`2. "_".repeat(): ${hasOldCode ? '✗ 仍存在(应该移除)' : '✓ 已移除'}`);
      
      // 检查是否有 remainingLength 变量(旧逻辑)
      const hasRemainingLength = data.includes('remainingLength');
      console.log(`3. remainingLength变量: ${hasRemainingLength ? '✗ 仍存在(应该移除)' : '✓ 已移除'}`);
      
      if (hasNewCode1 && !hasOldCode && !hasRemainingLength) {
        console.log('\n✓ 代码验证通过!');
      } else {
        console.log('\n❌ 代码验证失败');
      }
      
      // 显示相关代码片段
      console.log('\n=== 相关代码片段 ===');
      const lines = data.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('fill("_")') || line.includes('targetLength')) {
          console.log(`行 ${index + 1}: ${line.trim().substring(0, 100)}`);
        }
      });
      
    } else {
      console.log(`✗ 文件不存在，状态码: ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求失败: ${e.message}`);
});

req.end();
