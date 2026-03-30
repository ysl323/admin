@echo off
echo ========================================
echo 诊断并修复导出功能
echo ========================================
echo.

echo 步骤 1: 检查后端服务状态...
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [成功] 后端服务正在运行
    echo.
    echo 步骤 2: 测试导出功能...
    cd backend
    node test-export-detailed.js
    cd ..
) else (
    echo [失败] 后端服务未运行！
    echo.
    echo 步骤 2: 启动后端服务...
    echo 正在重启所有服务...
    call emergency-fix.bat
    
    echo.
    echo 等待 10 秒让服务完全启动...
    timeout /t 10 /nobreak
    
    echo.
    echo 步骤 3: 重新测试导出功能...
    cd backend
    node test-export-detailed.js
    cd ..
)

echo.
echo ========================================
echo 诊断完成
echo ========================================
pause
