import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'programming_english',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
};
let sequelize;
if (dbConfig.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: dbConfig.logging,
    dialectOptions: { enableForeignKeys: true }
  });
  sequelize.afterConnect(async (conn) => { await conn.run('PRAGMA foreign_keys = ON'); });
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password,
    { host: dbConfig.host, port: dbConfig.port, dialect: dbConfig.dialect, logging: dbConfig.logging, pool: dbConfig.pool });
}
export { sequelize };
