@echo off
echo ========================================
echo 诊断导出功能问题
echo ========================================
echo.

echo 步骤1: 测试数据库查询
echo ----------------------------------------
cd my1\backend
node test-export-direct.js
echo.

echo 步骤2: 检查后端进程
echo ----------------------------------------
echo 查找运行在端口3000的进程...
netstat -ano | findstr :3000
echo.

echo 步骤3: 提示
echo ----------------------------------------
echo 如果看到端口3000被占用，请:
echo 1. 关闭后端服务 (Ctrl+C)
echo 2. 重新启动后端: cd my1\backend ^&^& npm start
echo 3. 等待服务完全启动后再测试
echo.
echo 如果数据库查询成功但前端仍报500错误:
echo - 确认后端已完全重启
echo - 检查后端控制台的错误日志
echo - 尝试直接访问: http://localhost:3000/api/audio-cache/export
echo.

pause
