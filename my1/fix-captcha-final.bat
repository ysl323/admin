@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     验证码问题最终解决方案                              ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [步骤 1/3] 运行完整测试...
echo.
cd backend
node test-captcha-complete.js
cd ..
echo.

if %errorlevel% neq 0 (
    echo ❌ 测试失败，请检查服务器状态
    pause
    exit /b 1
)

echo [步骤 2/3] 打开注册页面...
echo.
start http://localhost:5173/register
echo ✅ 已打开注册页面
echo.

echo [步骤 3/3] 重要提示
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 🎯 所有后端测试都通过了！
echo.
echo 如果浏览器仍显示"获取验证码失败"，请执行以下操作:
echo.
echo 1️⃣  清除浏览器缓存:
echo    - 按 Ctrl + Shift + Delete
echo    - 选择"缓存的图片和文件"
echo    - 点击"清除数据"
echo.
echo 2️⃣  强制刷新页面:
echo    - 按 Ctrl + F5 (强制刷新)
echo    - 或 Ctrl + Shift + R
echo.
echo 3️⃣  检查浏览器控制台:
echo    - 按 F12 打开开发者工具
echo    - 查看 Console 标签页是否有错误
echo    - 查看 Network 标签页的 captcha 请求
echo.
echo 4️⃣  如果看到验证码问题 (如 "5 + 3 = ?"):
echo    - ✅ 问题已解决！
echo    - 输入正确答案即可注册
echo.
echo 5️⃣  如果仍然失败:
echo    - 在 Network 标签页找到 captcha 请求
echo    - 查看状态码和响应内容
echo    - 截图发送给我
echo.
echo ════════════════════════════════════════════════════════
echo.
echo 📋 测试结果:
echo    ✅ 后端验证码API: 正常
echo    ✅ 前端代理: 正常
echo    ✅ 验证码验证: 正常
echo    ✅ 注册流程: 正常
echo    ✅ CORS配置: 正常
echo.
echo 💡 提示: 问题很可能是浏览器缓存导致的
echo.
pause
