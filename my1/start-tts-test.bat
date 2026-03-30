@echo off
echo ========================================
echo 火山引擎 TTS 配置功能测试
echo ========================================
echo.
echo 正在检查服务状态...
echo.

curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 后端服务运行中: http://localhost:3000
) else (
    echo [ERROR] 后端服务未运行
    echo 请先启动后端服务: cd backend ^&^& npm start
    pause
    exit /b 1
)

curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] 前端服务运行中: http://localhost:5173
) else (
    echo [ERROR] 前端服务未运行
    echo 请先启动前端服务: cd frontend ^&^& npm run dev
    pause
    exit /b 1
)

echo.
echo ========================================
echo 服务状态正常
echo ========================================
echo.
echo 接下来的测试步骤：
echo.
echo 1. 浏览器将自动打开 http://localhost:5173
echo 2. 使用管理员账号登录：
echo    用户名: admin
echo    密码: admin123
echo 3. 点击右上角"进入后台"按钮
echo 4. 左侧菜单选择"配置管理"
echo 5. 按照 FINAL-TTS-TEST-GUIDE.md 进行测试
echo.
echo ========================================
echo 测试文档位置
echo ========================================
echo.
echo - FINAL-TTS-TEST-GUIDE.md (推荐阅读)
echo - TTS-CONFIG-COMPLETE-GUIDE.md
echo - TTS-IMPLEMENTATION-STATUS.md
echo - TTS-FEATURE-COMPLETION-SUMMARY.md
echo.
echo 按任意键打开浏览器和测试指南...
pause > nul

start http://localhost:5173
start FINAL-TTS-TEST-GUIDE.md

echo.
echo 浏览器和测试指南已打开
echo 祝测试顺利！
echo.
