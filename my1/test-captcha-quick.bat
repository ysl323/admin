@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     快速测试验证码功能                                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/3] 测试后端验证码API...
echo.
echo 请求: GET http://localhost:3000/api/captcha
echo.
curl -X GET http://localhost:3000/api/captcha
echo.
echo.

echo [2/3] 测试验证码验证...
echo.
echo 首先获取验证码...
for /f "tokens=*" %%i in ('curl -s http://localhost:3000/api/captcha') do set RESPONSE=%%i
echo 响应: %RESPONSE%
echo.

echo [3/3] 打开浏览器测试...
echo.
echo 请在浏览器中打开: http://localhost:5173/register
echo.
echo 如果看到"获取验证码失败"，请:
echo   1. 按 F12 打开开发者工具
echo   2. 查看 Console 标签页的错误信息
echo   3. 查看 Network 标签页的请求详情
echo.
echo 常见问题:
echo   - 后端未运行: 运行 start-all.bat
echo   - CORS 错误: 检查后端 CORS 配置
echo   - 端口冲突: 确认后端在 3000 端口，前端在 5173 端口
echo.

pause
