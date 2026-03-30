import ImportService from './src/services/ImportService.js';
import fs from 'fs/promises';

async function testImport() {
  try {
    console.log('读取 sample-data.json...');
    const data = JSON.parse(await fs.readFile('./sample-data.json', 'utf-8'));
    console.log('数据内容:', JSON.stringify(data, null, 2));
    
    console.log('\n开始导入...');
    const result = await ImportService.importFromJSON(data);
    console.log('导入成功:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

testImport();
