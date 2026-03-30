import fs from 'fs';
import readline from 'readline';

async function fixJSONFile(filePath) {
  console.log('正在分析JSON文件...\n');

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;
  let charCount = 0;
  let errorFound = null;

  for await (const line of rl) {
    lineNumber++;
    const lineLength = line.length;

    // 检查位置123848附近的行
    const startPos = 123800;
    const endPos = 123900;

    if (charCount >= startPos && charCount <= endPos) {
      console.log(`位置 ${charCount}-${charCount + lineLength} (第${lineNumber}行):`);
      console.log(line.substring(0, 100));
      console.log('...\n');
    }

    if (charCount > endPos) {
      break;
    }

    charCount += lineLength + 1; // +1 for newline
  }

  console.log(`\n文件分析完成，总共读取了 ${charCount} 个字符`);
}

// 使用示例
console.log('请提供JSON文件路径（例如：test.json）:');
// 用户需要手动编辑这个文件并运行

export { fixJSONFile };
