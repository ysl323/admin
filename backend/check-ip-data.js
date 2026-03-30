import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkIPData() {
  try {
    console.log('检查用户IP数据...\n');
    
    const [users] = await sequelize.query(`
      SELECT id, username, register_ip, last_login_ip 
      FROM users 
      ORDER BY id
    `);
    
    console.log('用户IP数据:');
    console.log('ID | 用户名 | 注册IP | 最后登录IP');
    console.log('---|--------|--------|----------');
    
    users.forEach(user => {
      console.log(`${user.id} | ${user.username} | ${user.register_ip || '(null)'} | ${user.last_login_ip || '(null)'}`);
    });
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    process.exit(1);
  }
}

checkIPData();
