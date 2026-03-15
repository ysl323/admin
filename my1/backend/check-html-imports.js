import http from 'http';

console.log('=== 检查HTML文件引用 ===\n');

const getHtml = () => {
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

(async () => {
  try {
    const html = await getHtml();
    
    console.log('HTML内容:\n');
    console.log(html);
    console.log('\n\n=== 分析 ===\n');
    
    // 提取所有script标签
    const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>|<script[^>]*\/>/g);
    if (scriptMatches) {
      console.log('找到的script标签:');
      scriptMatches.forEach((match, i) => {
        console.log(`\n${i + 1}. ${match}`);
      });
    }
    
    // 提取所有link标签
    const linkMatches = html.match(/<link[^>]*>/g);
    if (linkMatches) {
      console.log('\n\n找到的link标签:');
      linkMatches.forEach((match, i) => {
        console.log(`\n${i + 1}. ${match}`);
      });
    }
    
    // 检查是否引用了LearningPage-DdUgPYYA.js
    const hasLearningPageJs = html.includes('LearningPage-DdUgPYYA.js');
    console.log(`\n\n是否引用LearningPage-DdUgPYYA.js: ${hasLearningPageJs ? '✓ 是' : '✗ 否'}`);
    
    if (!hasLearningPageJs) {
      console.log('\n⚠️ 警告: index.html没有引用LearningPage-DdUgPYYA.js！');
      console.log('这可能是因为Vite使用了代码分割(code splitting)');
      console.log('LearningPage组件会在运行时动态加载');
    }
    
  } catch (error) {
    console.error('错误:', error.message);
  }
})();
