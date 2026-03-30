#!/bin/bash

# ============================================
# 学习模式功能部署脚本 - 服务器端执行
# ============================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  学习模式功能部署"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/root/english-learning/my1"

# 步骤1: 备份当前代码和数据库
echo "步骤 1: 备份当前状态..."
BACKUP_DIR="/root/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$PROJECT_DIR/backend" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$PROJECT_DIR/frontend" "$BACKUP_DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/backend/database.sqlite" "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ 备份完成: $BACKUP_DIR${NC}"
echo ""

# 步骤2: 检查Git仓库
echo "步骤 2: 检查Git仓库..."
cd "$PROJECT_DIR"
if [ -d ".git" ]; then
    echo "检测到Git仓库,准备拉取最新代码..."
    git fetch origin
    git pull origin master
    echo -e "${GREEN}✓ 代码拉取完成${NC}"
else
    echo -e "${YELLOW}⚠ 未检测到Git仓库${NC}"
    echo "如果需要从GitHub克隆,请运行:"
    echo "  cd /root/english-learning"
    echo "  git clone https://github.com/your-username/your-repo.git my1"
    echo ""
    echo "或手动上传代码到服务器"
    exit 1
fi
echo ""

# 步骤3: 数据库迁移
echo "步骤 3: 数据库迁移..."
cd "$PROJECT_DIR/backend"

# 检查是否需要迁移
echo "检查表结构..."
sqlite3 database.sqlite ".schema word_mastery" | grep "unique_user_lesson_word_mastery" && {
    echo -e "${YELLOW}⚠ 数据库索引已是最新,跳过迁移${NC}"
} || {
    echo "执行数据库迁移..."
    sqlite3 database.sqlite <<EOF
-- 备份现有数据
CREATE TABLE IF NOT EXISTS word_mastery_backup AS SELECT * FROM word_mastery;

-- 删除旧索引
DROP INDEX IF EXISTS unique_user_word_mastery;

-- 创建新索引
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_lesson_word_mastery
ON word_mastery (userId, lessonId, wordId);

-- 验证
SELECT '迁移完成' as status;
EOF
    echo -e "${GREEN}✓ 数据库迁移完成${NC}"
}
echo ""

# 步骤4: 更新后端依赖
echo "步骤 4: 安装后端依赖..."
cd "$PROJECT_DIR/backend"
if [ -f "package.json" ]; then
    npm install --production
    echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
else
    echo -e "${RED}✗ 错误: 未找到 package.json${NC}"
    exit 1
fi
echo ""

# 步骤5: 初始化数据库
echo "步骤 5: 初始化数据库..."
npm run db:init
echo -e "${GREEN}✓ 数据库初始化完成${NC}"
echo ""

# 步骤6: 更新前端依赖并构建
echo "步骤 6: 构建前端..."
cd "$PROJECT_DIR/frontend"
if [ -f "package.json" ]; then
    npm install
    npm run build
    echo -e "${GREEN}✓ 前端构建完成${NC}"
else
    echo -e "${RED}✗ 错误: 未找到 frontend/package.json${NC}"
    exit 1
fi
echo ""

# 步骤7: 重启后端服务
echo "步骤 7: 重启后端服务..."
cd "$PROJECT_DIR"

if pm2 list | grep -q "english-backend"; then
    echo "重启现有服务..."
    pm2 restart english-backend
    echo -e "${GREEN}✓ 后端服务已重启${NC}"
else
    echo "启动新服务..."
    pm2 start "$PROJECT_DIR/backend/src/index.js" --name english-backend
    pm2 save
    pm2 startup
    echo -e "${GREEN}✓ 后端服务已启动${NC}"
fi
echo ""

# 步骤8: 检查服务状态
echo "步骤 8: 检查服务状态..."
sleep 3
pm2 status

# 检查是否有错误
if pm2 jlist | grep -q '"status":"errored"'; then
    echo -e "${RED}✗ 检测到服务错误,查看日志:${NC}"
    pm2 logs english-backend --lines 50 --err
    exit 1
fi

echo ""
echo "步骤 9: 测试API..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
if [ "$API_TEST" = "200" ]; then
    echo -e "${GREEN}✓ API服务正常${NC}"
else
    echo -e "${YELLOW}⚠ API返回状态码: $API_TEST${NC}"
fi

echo ""
echo "步骤 10: 检查Nginx..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx运行正常${NC}"
else
    echo -e "${YELLOW}⚠ Nginx未运行,正在启动...${NC}"
    systemctl start nginx
fi

# 部署完成
echo ""
echo "=========================================="
echo -e "${GREEN}✓ 部署完成!${NC}"
echo "=========================================="
echo ""
echo "服务信息:"
echo "  后端状态: $(pm2 list | grep english-backend | awk '{print $10}')"
echo "  Nginx状态: $(systemctl is-active nginx)"
echo "  网站地址: http://47.97.185.117"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs english-backend"
echo "  查看状态: pm2 status"
echo "  重启服务: pm2 restart english-backend"
echo "  停止服务: pm2 stop english-backend"
echo ""
echo "备份位置: $BACKUP_DIR"
echo "=========================================="
