#!/bin/bash
set -e

echo '========================================'
echo '开始部署...'
echo '========================================'
echo ''

# 获取部署包名称
DEPLOY_ZIP=$(ls -t /root/deploy-*.zip 2>/dev/null | head -1)
if [ -z "$DEPLOY_ZIP" ]; then
    echo '错误: 找不到部署包'
    exit 1
fi

DEPLOY_NAME=$(basename "$DEPLOY_ZIP" .zip)
echo "部署包: $DEPLOY_NAME"
echo ''

# 1. 停止后端服务
echo '[1/8] 停止后端服务...'
pm2 stop english-learning-backend 2>/dev/null || true
pm2 delete english-learning-backend 2>/dev/null || true
echo '✓ 后端服务已停止'
echo ''

# 2. 备份数据库
echo '[2/8] 备份数据库...'
if [ -f /root/english-learning/backend/database.sqlite ]; then
    BACKUP_FILE="/root/db-backup-$(date +%Y%m%d_%H%M%S).sqlite"
    cp /root/english-learning/backend/database.sqlite "$BACKUP_FILE"
    echo "✓ 数据库已备份到: $BACKUP_FILE"
else
    echo '- 没有找到数据库文件，跳过备份'
fi
echo ''

# 3. 清空旧文件
echo '[3/8] 清空旧文件...'
rm -rf /root/english-learning
echo '✓ 旧文件已清空'
echo ''

# 4. 创建目录结构
echo '[4/8] 创建目录结构...'
mkdir -p /root/english-learning/backend
mkdir -p /root/english-learning/frontend
echo '✓ 目录结构已创建'
echo ''

# 5. 解压新文件
echo '[5/8] 解压新文件...'
cd /root
unzip -q -o "$DEPLOY_ZIP" -d /root/temp-deploy/
echo '✓ 文件已解压'
echo ''

# 6. 移动文件到正确位置
echo '[6/8] 整理文件...'
cd /root/temp-deploy/$DEPLOY_NAME

if [ -d backend ]; then
    cp -r backend/* /root/english-learning/backend/
    echo '  - 后端文件已复制'
fi

if [ -d frontend ]; then
    cp -r frontend/* /root/english-learning/frontend/
    echo '  - 前端文件已复制'
fi

if [ -f .env ]; then
    cp .env /root/english-learning/
    echo '  - 环境配置已复制'
fi

if [ -f nginx-english-learning.conf ]; then
    cp nginx-english-learning.conf /root/english-learning/
    echo '  - Nginx配置已复制'
fi

cd /root
rm -rf /root/temp-deploy
rm -f "$DEPLOY_ZIP"
echo '✓ 文件整理完成'
echo ''

# 7. 恢复数据库
echo '[7/8] 恢复数据库...'
LATEST_DB=$(ls -t /root/db-backup-*.sqlite 2>/dev/null | head -1)
if [ -n "$LATEST_DB" ]; then
    cp "$LATEST_DB" /root/english-learning/backend/database.sqlite
    echo "✓ 数据库已恢复: $LATEST_DB"
else
    echo '- 没有找到备份数据库'
fi
echo ''

# 8. 安装依赖并启动
echo '[8/8] 安装依赖并启动服务...'
cd /root/english-learning/backend
npm install --production --quiet
echo '  - 依赖安装完成'

# 更新nginx配置
if [ -f /root/english-learning/nginx-english-learning.conf ]; then
    cp /root/english-learning/nginx-english-learning.conf /etc/nginx/conf.d/
    nginx -t && nginx -s reload
    echo '  - Nginx配置已更新'
fi

# 启动后端
pm2 start src/server.js --name english-learning-backend
pm2 save
echo '  - 后端服务已启动'
echo ''

echo '========================================'
echo '✓ 部署完成！'
echo '========================================'
echo ''
pm2 list
echo ''
echo '访问地址: http://47.97.185.117'
echo ''
