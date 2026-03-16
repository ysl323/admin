@echo off
chcp 65001 >nul
echo ========================================
echo 首页500错误 - 快速诊断和修复
echo ========================================
echo.

echo 正在连接服务器并执行诊断...
echo.

:: 创建临时脚本文件
echo cd /root/my1-english-learning > temp_diagnose.sh
echo pm2 list >> temp_diagnose.sh
echo pm2 logs my1-backend --lines 30 --nostream >> temp_diagnose.sh
echo systemctl status nginx ^| head -10 >> temp_diagnose.sh
echo netstat -tlnp ^| grep -E ':(3000^|80) ' ^|^| echo Ports not found >> temp_diagnose.sh
echo ps aux ^| grep node ^| grep -v grep ^|^| echo No Node process >> temp_diagnose.sh
echo ls -lh /var/www/html/learning/ ^|^| echo Frontend dir not found >> temp_diagnose.sh

:: 上传并执行
scp temp_diagnose.sh root@47.97.185.117:/tmp/
ssh root@47.97.185.117 "chmod +x /tmp/temp_diagnose.sh && /tmp/temp_diagnose.sh"

:: 清理
del temp_diagnose.sh

echo.
echo ========================================
echo 诊断完成
echo ========================================
echo.
echo 根据输出结果，执行以下修复:
echo.
echo 1. 如果PM2停止: pm2 start my1-backend ^&^& pm2 save
echo 2. 如果Nginx停止: systemctl start nginx ^&^& systemctl reload nginx
echo 3. 如果后端报错: cd /root/my1-english-learning/backend ^&^& npm install ^&^& pm2 restart my1-backend
echo 4. 如果前端缺失: 需要重新上传前端文件
echo.
pause
