@echo off
echo ========================================
echo 导出缓存 500 错误 - 自动诊断和修复
echo ========================================
echo.

echo 步骤1: 检查后端服务状态
echo ----------------------------------------
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo [OK] 后端服务正在运行
    echo.
    
    echo 步骤2: 测试导出功能
    echo ----------------------------------------
    cd my1\backend
    node test-export-with-auth.js
    cd ..\..
    echo.
    
    echo 步骤3: 分析结果
    echo ----------------------------------------
    echo 请查看上面的测试结果:
    echo.
    echo - 如果看到 "500错误" → 后端代码有问题，需要重启
    echo - 如果看到 "401错误" → 认证问题，需要重新登录
    echo - 如果看到 "请求成功" → 功能正常，可能是前端缓存问题
    echo.
    
    echo 是否需要重启后端服务？
    echo 警告: 这将停止当前运行的后端服务
    echo.
    choice /C YN /M "是否继续"
    if errorlevel 2 goto :end
    if errorlevel 1 goto :restart
) else (
    echo [错误] 后端服务未运行
    echo.
    echo 正在启动后端服务...
    goto :start
)

:restart
echo.
echo 正在重启后端服务...
echo ----------------------------------------
echo 1. 查找后端进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 2. 停止进程 %%a...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
goto :start

:start
echo 3. 启动后端服务...
echo.
echo 请在新窗口中运行以下命令:
echo cd my1\backend
echo npm start
echo.
echo 等待后端完全启动后（看到"服务器运行在端口 3000"），
echo 再次运行此脚本进行测试。
echo.
start cmd /k "cd my1\backend && npm start"
timeout /t 5 /nobreak >nul
goto :end

:end
echo.
echo ========================================
echo 诊断完成
echo ========================================
echo.
echo 下一步:
echo 1. 确保后端服务正在运行
echo 2. 在浏览器中重新登录管理员账号
echo 3. 进入缓存管理页面
echo 4. 点击"导出缓存"按钮测试
echo.
echo 如果仍然有问题，请查看: EXPORT-500-ERROR-FIX.md
echo.
pause
