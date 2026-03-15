#!/bin/bash
# 恢复到3月10日备份

cd /root/myenglearn

# 解压备份
mkdir -p deploy-restore
cd deploy-restore
unzip -o ../deploy-backup.zip

# 恢复前端
rm -rf /root/myenglearn/client/dist/*
cp -r frontend/* /root/myenglearn/client/dist/

# 恢复后端
cp -r backend/* /root/myenglearn/server/

# 重启后端
pm2 restart backend

echo "恢复完成！"