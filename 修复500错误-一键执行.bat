@echo off
chcp 65001 >nul
echo ========================================
echo 首页500错误 - 自动诊断和修复
echo ========================================
echo.

echo [步骤1] 上传修复脚本到服务器...
scp e:\demo\my1\quick-fix-500.sh root@47.97.185.117:/tmp/
echo.

echo [步骤2] 执行修复脚本...
ssh root@47.97.185.117 "chmod +x /tmp/quick-fix-500.sh && /tmp/quick-fix-500.sh"
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 请立即访问测试:
echo   首页: http://47.97.185.117
echo   后台: http://47.97.185.117/admin
echo.
echo 如果仍有问题，请查看详细诊断:
echo   运行: e:\demo\my1\diagnose-and-fix.bat
echo.
pause
