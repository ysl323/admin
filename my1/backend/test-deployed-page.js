import http from 'http';

console.log('=== 服务器CSS验证测试 ===\n');
console.log('正在检查部署的CSS文件...\n');

// 测试服务器上的CSS文件
const options = {
  hostname: '47.97.185.117',
  port: 80,
  path: '/assets/index.css',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✓ HTTP状态码: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      // 检查关键CSS规则
      const checks = [
        {
          name: '下划线占位符CSS存在',
          pattern: /\.underline-placeholder/,
          required: true
        },
        {
          name: 'gap设置为0px',
          pattern: /gap:\s*0px/,
          required: true
        },
        {
          name: '没有width:100%（BUG #10的原因）',
          pattern: /\.underline-placeholder[^}]*width:\s*100%/,
          required: false,
          shouldNotExist: true
        },
        {
          name: '没有overflow:hidden（BUG #10的原因）',
          pattern: /\.underline-placeholder[^}]*overflow:\s*hidden/,
          required: false,
          shouldNotExist: true
        },
        {
          name: 'min-height存在',
          pattern: /\.underline-placeholder[^}]*min-height/,
          required: true
        },
        {
          name: 'line-height存在',
          pattern: /\.underline-placeholder[^}]*line-height/,
          required: true
        }
      ];

      console.log('=== CSS检查结果 ===\n');
      
      let allPassed = true;
      checks.forEach(check => {
        const found = check.pattern.test(data);
        
        if (check.shouldNotExist) {
          if (!found) {
            console.log(`✓ ${check.name}: 通过（不存在）`);
          } else {
            console.log(`✗ ${check.name}: 失败（不应该存在但找到了）`);
            allPassed = false;
          }
        } else {
          if (found) {
            console.log(`✓ ${check.name}: 通过`);
          } else {
            console.log(`✗ ${check.name}: 失败（未找到）`);
            if (check.required) allPassed = false;
          }
        }
      });

      console.log('\n=== 总结 ===');
      if (allPassed) {
        console.log('✓ 所有检查通过！BUG #10修复已成功部署');
        console.log('\n修复内容:');
        console.log('- gap从5px改为0px（减少下划线距离）');
        console.log('- 移除了width:100%（这导致下划线被隐藏）');
        console.log('- 移除了overflow:hidden（这导致下划线被裁剪）');
        console.log('- 添加了min-height和line-height确保下划线可见');
      } else {
        console.log('✗ 部分检查失败，请查看上面的详细信息');
      }
      
    } else {
      console.log('✗ 无法获取CSS文件');
    }
  });
});

req.on('error', (e) => {
  console.error(`✗ 请求失败: ${e.message}`);
});

req.end();
