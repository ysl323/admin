import { User } from './src/models/index.js';
import PasswordService from './src/services/PasswordService.js';

async function resetAdminPassword() {
  try {
    console.log('=== 重置管理员密码 ===\n');

    // 查找管理员
    const admin = await User.findOne({ where: { username: 'admin' } });
    
    if (!admin) {
      console.log('❌ 管理员账户不存在');
      return;
    }

    console.log(`找到管理员: ${admin.username} (ID: ${admin.id})`);
    
    // 新密码
    const newPassword = 'admin123';
    
    // 生成新的密码哈希
    const newPasswordHash = await PasswordService.hash(newPassword);
    
    console.log(`\n旧密码哈希: ${admin.passwordHash}`);
    console.log(`新密码哈希: ${newPasswordHash}`);
    
    // 更新密码
    await admin.update({ passwordHash: newPasswordHash });
    
    console.log('\n✅ 密码重置成功！');
    console.log(`用户名: admin`);
    console.log(`新密码: ${newPassword}`);
    
    // 验证新密码
    const isValid = await PasswordService.verify(newPassword, newPasswordHash);
    console.log(`\n验证新密码: ${isValid ? '✅ 成功' : '❌ 失败'}`);

  } catch (error) {
    console.error('重置失败:', error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();
