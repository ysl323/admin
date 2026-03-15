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

async function checkWordsTable() {
  try {
    const [columns] = await sequelize.query(`PRAGMA table_info(words)`);
    
    console.log('Words 表结构:');
    columns.forEach(col => {
      console.log(`  ${col.name} (${col.type})`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

checkWordsTable();
