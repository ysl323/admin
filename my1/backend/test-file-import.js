import fs from 'fs';
import path from 'path';
import axios from 'axios';

// 读取文件
const filePath = 'C:\\Users\\Administrator\\Documents\\新概念2.txt';

console.log('正在读取文件:', filePath);

try {
  // 读取文件内容
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  console.log('文件大小:', (fileContent.length / 1024).toFixed(2), 'KB');
  console.log('文件前100个字符:', fileContent.substring(0, 100));
  
  // 尝试解析 JSON
  let data;
  try {
    data = JSON.parse(fileContent);
    console.log('✓ JSON 格式正确');
    console.log('数据条数:', data.length);
    
    if (data.length > 0) {
      console.log('第一条数据:', JSON.stringify(data[0], null, 2));
    }
  } catch (error) {
    console.error('✗ JSON 解析失败:', error.message);
    console.log('文件内容可能不是有效的 JSON 格式');
    process.exit(1);
  }
  
  // 测试导入 API
  console.log('\n正在测试导入 API...');
  
  const testImport = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/admin/import-simple-lesson', {
        data: data,
        categoryName: '新概念英语第二册测试'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('✓ 导入成功!');
      console.log('响应:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('✗ 导入失败:');
      if (error.response) {
        console.error('状态码:', error.response.status);
        console.error('错误信息:', error.response.data);
      } else {
        console.error('错误:', error.message);
      }
    }
  };
  
  testImport();
  
} catch (error) {
  console.error('读取文件失败:', error.message);
  process.exit(1);
}
