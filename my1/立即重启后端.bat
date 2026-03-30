@echo off
chcp 65001 >nul
echo ========================================
echo 立即重启后端服务
echo ========================================
echo.

echo 问题已修复！
echo 修复内容: 移除了不存在的 voiceType 字段
echo.

echo 正在停止后端服务...
taskkill /F /IM node.exe >nul 2>&1

echo 等待进程完全停止...
timeout /t 2 /nobreak >nul

echo.
echo 正在启动后端服务...
echo.
echo 请在新窗口中查看后端日志
echo 等待看到 "服务器运行在端口 3000" 后再测试
echo.

start "Backend Server - 已修复" cmd /k "cd backend && echo 后端服务启动中... && echo. && npm start"

echo.
echo ========================================
echo 下一步操作
echo ========================================
echo.
echo 1. 等待后端完全启动（约10秒）
echo 2. 在浏览器中刷新页面
echo 3. 进入"缓存管理"页面
echo 4. 点击"导出缓存"按钮
echo.
echo 预期结果: 自动下载 JSON 文件
echo.

pause
