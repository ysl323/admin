import fs from 'fs';

// 从命令行参数获取文件路径
const filePath = process.argv[2];

if (!filePath) {
  console.log('使用方法: node find-json-error.js <文件路径>');
  console.log('例如: node find-json-error.js ../data/my-data.json');
  process.exit(1);
}

try {
  console.log(`正在分析文件: ${filePath}\n`);

  const content = fs.readFileSync(filePath, 'utf8');

  // 查找位置123848附近的内容
  const errorPos = 123848;
  const contextLength = 300;

  const startPos = Math.max(0, errorPos - contextLength);
  const endPos = Math.min(content.length, errorPos + contextLength);

  console.log('='.repeat(80));
  console.log(`错误位置附近的内容 (位置 ${errorPos} 左右):`);
  console.log('='.repeat(80));
  console.log('');

  const beforeError = content.substring(startPos, errorPos);
  const afterError = content.substring(errorPos, endPos);

  console.log('错误位置之前的内容:');
  console.log(beforeError);
  console.log('');
  console.log('↑ 错误可能在这里 ↑'.padStart(50));
  console.log('');
  console.log('错误位置之后的内容:');
  console.log(afterError);
  console.log('');
  console.log('='.repeat(80));

  // 尝试找出常见问题
  console.log('\n可能的问题分析:');
  console.log('='.repeat(80));

  // 检查未转义的引号
  const unescapedQuotes = beforeError.match(/"chinese":\s*"[^"]*"[^"]*"[^"]*"/g);
  if (unescapedQuotes && unescapedQuotes.length > 0) {
    console.log('⚠️  发现可能的未转义引号:');
    console.log(unescapedQuotes);
  }

  // 检查字符串未闭合
  const unclosedString = beforeError.match(/"chinese":\s*"[^"]*$/g);
  if (unclosedString) {
    console.log('⚠️  发现未闭合的字符串:');
    console.log(unclosedString);
  }

  // 检查中文翻译
  const chinesePattern = /"chinese":\s*"([^"]*)"/g;
  let match;
  while ((match = chinesePattern.exec(beforeError)) !== null) {
    const chinese = match[1];
    if (chinese.includes('"') || chinese.includes('\\')) {
      console.log(`⚠️  中文翻译包含特殊字符: "${chinese}"`);
    }
  }

  console.log('='.repeat(80));

} catch (error) {
  console.error('错误:', error.message);
  process.exit(1);
}
