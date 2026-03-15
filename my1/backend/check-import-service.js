/**
 * 检查导入服务是否正常工作
 */

const SimpleLessonImportService = require('./src/services/SimpleLessonImportService.js');

// 测试数据
const testData = [
  {
    lesson: 1,
    question: 1,
    english: 'hello',
    chinese: '你好'
  },
  {
    lesson: 1,
    question: 2,
    english: 'world',
    chinese: '世界'
  },
  {
    lesson: 2,
    question: 1,
    english: 'test',
    chinese: '测试'
  }
];

async function testImport() {
  try {
    console.log('开始测试导入服务...');
    console.log('测试数据:', JSON.stringify(testData, null, 2));

    // 测试JSON验证
    const validation = SimpleLessonImportService.validateJSON(testData);
    console.log('\n验证结果:', validation);

    if (!validation.valid) {
      console.error('验证失败:', validation.errors);
      return;
    }

    console.log('\n验证成功，数据格式正确');
    console.log('包含lesson字段:', SimpleLessonImportService.hasLessonField(testData));

    // 测试分组
    const grouped = SimpleLessonImportService.groupByLesson(testData);
    console.log('\n分组结果:', grouped);

    console.log('\n导入服务检查完成！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testImport();
