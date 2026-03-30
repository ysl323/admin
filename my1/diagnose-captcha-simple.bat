@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     验证码问题诊断                                      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [检查 1/4] 后端服务器状态...
echo.
curl -s http://localhost:3000/api/captcha
echo.
if %errorlevel% neq 0 (
    echo ❌ 后端服务器未运行或验证码API失败
    echo.
    echo 解决方案:
    echo   cd backend
    echo   npm start
    echo.
    goto :end
) else (
    echo ✅ 后端验证码API正常
)
echo.

echo [检查 2/4] 前端服务器状态...
echo.
curl -s -I http://localhost:5173 | findstr "200"
if %errorlevel% neq 0 (
    echo ❌ 前端服务器未运行
    echo.
    echo 解决方案:
    echo   cd frontend
    echo   npm run dev
    echo.
    goto :end
) else (
    echo ✅ 前端服务器正常
)
echo.

echo [检查 3/4] 前端代理配置...
echo.
curl -s http://localhost:5173/api/captcha
echo.
if %errorlevel% neq 0 (
    echo ❌ 前端代理配置失败
    echo.
    echo 请检查 frontend/vite.config.js 中的 proxy 配置
    echo.
    goto :end
) else (
    echo ✅ 前端代理正常
)
echo.

echo [检查 4/4] 打开注册页面测试...
echo.
start http://localhost:5173/register
echo ✅ 已打开注册页面
echo.

:end
echo ════════════════════════════════════════════════════════
echo.
echo 📋 诊断完成
echo.
echo 如果注册页面仍显示"获取验证码失败":
echo   1. 按 F12 打开浏览器开发者工具
echo   2. 查看 Console 标签页的错误信息
echo   3. 查看 Network 标签页，找到 captcha 请求
echo   4. 检查请求的状态码和响应内容
echo.
echo 常见问题:
echo   - 如果看到 CORS 错误: 检查后端 CORS 配置
echo   - 如果看到 404: 检查 API 路径是否正确
echo   - 如果看到连接被拒绝: 后端未运行
echo.
pause
