#!/bin/bash

# ============================================
# 从GitHub拉取并部署学习模式功能
# ============================================

set -e

echo "=========================================="
echo "  学习模式功能部署"
echo "=========================================="
echo ""

# 进入项目目录
cd /root/english-learning/my1

# 步骤1: 拉取最新代码
echo "步骤 1: 拉取最新代码..."
git pull origin master
echo "✓ 代码拉取完成"
echo ""

# 步骤2: 备份当前数据
echo "步骤 2: 备份当前数据..."
BACKUP_DIR="/root/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r backend frontend "$BACKUP_DIR/" 2>/dev/null || true
cp backend/database.sqlite "$BACKUP_DIR/" 2>/dev/null || true
echo "✓ 备份完成: $BACKUP_DIR"
echo ""

# 步骤3: 数据库迁移
echo "步骤 3: 数据库迁移..."
cd backend
sqlite3 database.sqlite <<EOF
DROP INDEX IF EXISTS unique_user_word_mastery;
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_lesson_word_mastery
ON word_mastery (userId, lessonId, wordId);
EOF
echo "✓ 数据库迁移完成"
echo ""

# 步骤4: 安装后端依赖
echo "步骤 4: 安装后端依赖..."
npm install --production
echo "✓ 后端依赖安装完成"
echo ""

# 步骤5: 初始化数据库
echo "步骤 5: 初始化数据库..."
npm run db:init
echo "✓ 数据库初始化完成"
echo ""

# 步骤6: 构建前端
echo "步骤 6: 构建前端..."
cd ../frontend
npm install
npm run build
echo "✓ 前端构建完成"
echo ""

# 步骤7: 重启服务
echo "步骤 7: 重启服务..."
cd ..
pm2 restart english-backend
nginx -s reload
echo "✓ 服务重启完成"
echo ""

# 步骤8: 检查服务状态
echo "步骤 8: 检查服务状态..."
sleep 3
pm2 status
echo ""

# 测试API
echo "步骤 9: 测试API..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
if [ "$API_TEST" = "200" ]; then
    echo "✓ API服务正常"
else
    echo "⚠ API返回状态码: $API_TEST"
fi
echo ""

echo "=========================================="
echo "✓ 部署完成!"
echo "=========================================="
echo ""
echo "备份位置: $BACKUP_DIR"
echo "网站地址: http://47.97.185.117"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs english-backend"
echo "  查看状态: pm2 status"
echo "  重启服务: pm2 restart english-backend"
echo ""
echo "=========================================="
