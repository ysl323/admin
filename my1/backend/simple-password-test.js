import bcryptjs from 'bcryptjs';

async function testPassword() {
  const password = 'admin123';
  const hash = '$2a$10$Q7wm1JTIuWSKKAxtKKMJ8uJEGAYZnVJzZe1U3ZnwaSfMuSm8Iv0qq';
  
  console.log('测试密码:', password);
  console.log('哈希值:', hash);
  
  try {
    const isValid = await bcryptjs.compare(password, hash);
    console.log('验证结果:', isValid ? '✅ 正确' : '❌ 错误');
  } catch (error) {
    console.error('验证失败:', error);
  }
}

testPassword();