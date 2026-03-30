-- ============================================
-- 学习模式功能数据库迁移脚本
-- 版本: 1.1.0
-- 日期: 2026-03-30
-- 说明: 更新word_mastery表的唯一索引
-- ============================================

-- 1. 创建备份表(可选,建议生产环境执行)
CREATE TABLE IF NOT EXISTS word_mastery_backup_20260330 AS
SELECT * FROM word_mastery;

-- 2. 检查并删除旧索引
-- 注意: 如果表中有重复数据,删除索引前需要先清理
DROP INDEX IF EXISTS unique_user_word_mastery ON word_mastery;

-- 3. 清理重复数据(如果存在)
-- 保留每条(userId, lessonId, wordId)组合的最新记录
DELETE FROM word_mastery
WHERE id NOT IN (
    SELECT MIN(id)
    FROM word_mastery
    GROUP BY userId, lessonId, wordId
);

-- 4. 创建新的唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_lesson_word_mastery
ON word_mastery (userId, lessonId, wordId);

-- 5. 验证索引
-- 如果查询返回结果,说明索引创建成功
SELECT
    name as index_name,
    sql as index_definition
FROM sqlite_master
WHERE type = 'index'
  AND tbl_name = 'word_mastery'
  AND name = 'unique_user_lesson_word_mastery';

-- 6. 查看索引列表(用于验证)
SELECT
    name as index_name,
    sql as index_definition
FROM sqlite_master
WHERE type = 'index'
  AND tbl_name = 'word_mastery'
ORDER BY name;

-- ============================================
-- 回滚脚本(如果需要撤销迁移)
-- ============================================
/*
-- 回滚步骤:
-- 1. 删除新索引
DROP INDEX IF EXISTS unique_user_lesson_word_mastery;

-- 2. 创建旧索引
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_word_mastery
ON word_mastery (userId, wordId);

-- 3. 恢复备份(如果需要)
DROP TABLE IF EXISTS word_mastery;
CREATE TABLE word_mastery AS SELECT * FROM word_mastery_backup_20260330;
*/
