import bcryptjs from 'bcryptjs';

const password = 'admin123';
const hash = '$2a$10$Q7wm1JTIuWSKKAxtKKMJ8uJEGAYZnVJzZe1U3ZnwaSfMuSm8Iv0qq';

console.log('开始测试...');
console.log('密码:', password);
console.log('哈希:', hash);

// 同步测试
try {
  const syncResult = bcryptjs.compareSync(password, hash);
  console.log('同步验证结果:', syncResult);
} catch (error) {
  console.error('同步验证错误:', error);
}

// 异步测试
bcryptjs.compare(password, hash)
  .then(result => {
    console.log('异步验证结果:', result);
  })
  .catch(error => {
    console.error('异步验证错误:', error);
  });