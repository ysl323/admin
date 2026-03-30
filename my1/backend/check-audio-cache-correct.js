import { AudioCache } from './src/models/index.js';

async function checkAudioCache() {
  try {
    const caches = await AudioCache.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log('音频缓存记录数量:', caches.length);
    console.log('\n最近的缓存记录:');
    
    if (caches.length === 0) {
      console.log('  (无记录)');
    } else {
      caches.forEach((cache, index) => {
        console.log(`\n${index + 1}. 缓存 ID: ${cache.id}`);
        console.log(`   文本: ${cache.text}`);
        console.log(`   缓存键: ${cache.cacheKey}`);
        console.log(`   文件路径: ${cache.filePath}`);
        console.log(`   文件大小: ${cache.fileSize} 字节`);
        console.log(`   提供商: ${cache.provider}`);
        console.log(`   命中次数: ${cache.hitCount}`);
        console.log(`   最后访问: ${cache.lastAccessedAt}`);
        console.log(`   创建时间: ${cache.createdAt}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkAudioCache();
