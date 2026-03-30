@echo off
chcp 65001 >nul
echo ========================================
echo   登录问题一键修复脚本
echo ========================================
echo.

echo [1/4] 修复数据库表结构...
cd e:\demo\my1\my1\my1\backend
call node fix-user-table.js
if errorlevel 1 (
    echo ❌ 数据库修复失败
    pause
    exit /b 1
)
echo ✅ 数据库修复完成
echo.

echo [2/4] 重置admin密码...
call node reset-admin-password.js
if errorlevel 1 (
    echo ❌ 密码重置失败
    pause
    exit /b 1
)
echo ✅ 密码重置完成
echo.

echo [3/4] 测试登录功能...
call node test-full-login.js
if errorlevel 1 (
    echo ❌ 登录测试失败
    pause
    exit /b 1
)
echo ✅ 登录测试完成
echo.

echo [4/4] 检查服务状态...
echo 检查后端服务...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ 后端服务正常' } catch { Write-Host '❌ 后端服务未响应' }"
echo 检查前端服务...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ 前端服务正常' } catch { Write-Host '❌ 前端服务未响应' }"
echo.

echo ========================================
echo   ✅ 修复完成！
echo ========================================
echo.
echo 登录凭据:
echo   用户名: admin
echo   密码: admin123
echo.
echo 请访问以下地址测试登录:
echo   前端: http://localhost:5173
echo   测试页面: file:///E:/demo/my1/my1/my1/登录测试页面.html
echo.
pause
