@echo off
echo ========================================
echo   在服务器上执行打包
echo ========================================
echo.

echo 执行打包命令...
ssh -o StrictHostKeyChecking=no root@47.97.185.117 "cd /root && rm -rf english-backup && mkdir english-backup && cp /root/english-learning/my1/backend/database.sqlite english-backup/ && cp -r /root/english-learning/my1/backend english-backup/ && cp -r /root/english-learning/my1/frontend english-backup/ && cp /etc/nginx/sites-available/english-learning english-backup/nginx.conf && tar -czvf english-backup.tar.gz english-backup && rm -rf english-backup && ls -lh english-backup.tar.gz && echo '' && echo '打包完成！文件: /root/english-backup.tar.gz'"

echo.
echo ========================================
echo 现在可以下载备份文件：
echo scp root@47.97.185.117:/root/english-backup.tar.gz .
echo ========================================
pause
