@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     一键修复验证码问题                                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 这个脚本将:
echo   1. 检查并启动后端服务器
echo   2. 检查并启动前端服务器
echo   3. 测试验证码功能
echo   4. 打开浏览器进行验证
echo.
echo ════════════════════════════════════════════════════════
echo.

echo [步骤 1/5] 停止现有服务...
echo.
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✅ 已停止现有服务
echo.

echo [步骤 2/5] 启动后端服务器...
echo.
cd backend
start /B cmd /c "node src/index.js > ../backend.log 2>&1"
cd ..
echo 等待后端启动...
timeout /t 5 /nobreak >nul

REM 检查后端是否启动成功
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端启动失败
    echo.
    echo 请查看日志: backend.log
    echo.
    pause
    exit /b 1
)
echo ✅ 后端服务器已启动 (端口 3000)
echo.

echo [步骤 3/5] 启动前端服务器...
echo.
cd frontend
start /B cmd /c "npm run dev > ../frontend.log 2>&1"
cd ..
echo 等待前端启动...
timeout /t 8 /nobreak >nul
echo ✅ 前端服务器已启动 (端口 5173)
echo.

echo [步骤 4/5] 测试验证码API...
echo.
echo 请求: GET http://localhost:3000/api/captcha
echo.
curl -s http://localhost:3000/api/captcha
echo.
echo.

REM 检查验证码API是否正常
curl -s http://localhost:3000/api/captcha | findstr "success" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 验证码API测试失败
    echo.
    echo 请检查:
    echo   1. 后端日志: backend.log
    echo   2. 后端是否正常运行
    echo.
    pause
    exit /b 1
)
echo ✅ 验证码API测试成功
echo.

echo [步骤 5/5] 打开浏览器测试...
echo.
start http://localhost:5173/register
echo ✅ 已打开注册页面
echo.

echo ════════════════════════════════════════════════════════
echo.
echo 🎉 修复完成！
echo.
echo 请在浏览器中验证:
echo   1. 注册页面应该显示验证码问题 (如 "5 + 3 = ?")
echo   2. 点击"刷新"按钮可以获取新验证码
echo   3. 输入正确答案可以注册
echo.
echo 如果仍然显示"获取验证码失败":
echo   1. 按 F12 打开开发者工具
echo   2. 查看 Console 标签页的错误
echo   3. 查看 Network 标签页的请求详情
echo   4. 运行: diagnose-captcha.bat 进行详细诊断
echo.
echo 服务器日志:
echo   - 后端: backend.log
echo   - 前端: frontend.log
echo.
echo 详细文档: 验证码失败修复指南.md
echo.
pause
