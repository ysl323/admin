#!/bin/bash
# 服务器端更新脚本 - 更新导出功能

set -e

APP_PATH="/root/my1-english-learning"
BACKUP_PATH="/root/my1-backup-$(date +%Y%m%d_%H%M%S)"
FRONTEND_DIST="$APP_PATH/frontend-dist.zip"
BACKEND_SRC="$APP_PATH/backend-src.zip"

echo "=========================================="
echo "开始更新服务器应用"
echo "=========================================="

# 1. 备份现有代码
echo ""
echo "[1/5] 备份现有代码..."
mkdir -p "$BACKUP_PATH"
cp -r "$APP_PATH/public" "$BACKUP_PATH/" 2>/dev/null || true
cp -r "$APP_PATH/backend/src" "$BACKUP_PATH/" 2>/dev/null || true
echo "✓ 备份完成: $BACKUP_PATH"

# 2. 检查更新文件
echo ""
echo "[2/5] 检查更新文件..."

if [ ! -f "$FRONTEND_DIST" ]; then
    echo "✗ 前端压缩文件不存在: $FRONTEND_DIST"
    echo "  请上传 frontend-dist.zip 到服务器"
    exit 1
fi

if [ ! -f "$BACKEND_SRC" ]; then
    echo "✗ 后端压缩文件不存在: $BACKEND_SRC"
    echo "  请上传 backend-src.zip 到服务器"
    exit 1
fi

echo "✓ 更新文件检查完成"

# 3. 更新前端
echo ""
echo "[3/5] 更新前端..."
mkdir -p "$APP_PATH/public"
rm -rf "$APP_PATH/public"/*
unzip -o "$FRONTEND_DIST" -d "$APP_PATH/public/"
echo "✓ 前端更新完成"

# 4. 更新后端
echo ""
echo "[4/5] 更新后端..."
rm -rf "$APP_PATH/backend/src.new"
mkdir -p "$APP_PATH/backend/src.new"
unzip -o "$BACKEND_SRC" -d "$APP_PATH/backend/src.new/"

# 重命名
rm -rf "$APP_PATH/backend/src"
mv "$APP_PATH/backend/src.new" "$APP_PATH/backend/src"

echo "✓ 后端更新完成"

# 5. 重启服务
echo ""
echo "[5/5] 重启服务..."
cd "$APP_PATH/backend"

# 检查并重启PM2进程
if pm2 list | grep -q "my1-backend"; then
    pm2 restart my1-backend
    echo "✓ 服务重启完成 (PM2)"
else
    # 如果PM2中没有，尝试启动
    echo "ℹ 未找到PM2进程，尝试启动..."
    pm2 start index.js --name my1-backend || node index.js &
fi

# 等待服务启动
sleep 3

# 检查服务状态
if pm2 list | grep -q "my1-backend"; then
    echo ""
    echo "=========================================="
    echo "✓ 更新成功完成！"
    echo "=========================================="
    echo "前端地址: http://47.97.185.117"
    echo "管理后台: http://47.97.185.117/admin"
    echo ""
    echo "PM2 状态:"
    pm2 list | grep my1-backend
else
    echo ""
    echo "=========================================="
    echo "⚠ 更新完成，但服务状态未知"
    echo "=========================================="
    echo "请检查服务状态: pm2 list"
    echo "或查看日志: pm2 logs my1-backend"
fi
