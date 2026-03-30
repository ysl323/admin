import fs from 'fs';

/**
 * 修复JSON文件中常见的格式错误
 */
async function repairJSON(filePath) {
  console.log(`正在修复文件: ${filePath}\n`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('原始文件大小:', content.length, '字符');

    // 简单修复：查找错误位置
    const errorPos = 123848;
    const contextLength = 200;
    const startPos = Math.max(0, errorPos - contextLength);
    const endPos = Math.min(content.length, errorPos + contextLength);

    console.log('\n错误位置附近的内容:');
    console.log('='.repeat(80));
    console.log(content.substring(startPos, endPos));
    console.log('='.repeat(80));

    // 尝试找出问题
    const beforeError = content.substring(startPos, errorPos);
    const lastQuote = beforeError.lastIndexOf('"chinese"');

    if (lastQuote > -1) {
      console.log('\n可能的问题:');
      console.log('发现 "chinese" 字段，检查是否正确转义引号或闭合字符串');
    }

    console.log('\n建议：');
    console.log('1. 使用在线JSON编辑器查看完整错误');
    console.log('2. 检查中文字段中是否有未转义的引号');
    console.log('3. 确保所有字符串都正确闭合');

    return false;

  } catch (error) {
    console.error('❌ 读取文件失败:', error.message);
    return false;
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.log('使用方法: node repair-json.js <JSON文件路径>');
  process.exit(1);
}

repairJSON(filePath);
