@echo off
chcp 65001 >nul
echo ========================================
echo 专家团队全面诊断系统
echo ========================================
echo.
echo 正在进行10个维度的全面检查...
echo.

set ERROR_COUNT=0
set SUCCESS_COUNT=0

echo [检查 1/10] 检查后端服务状态
echo ----------------------------------------
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 后端服务正在运行
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 后端服务未运行
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 2/10] 检查前端服务状态
echo ----------------------------------------
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 前端服务正在运行
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 前端服务未运行
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 3/10] 检查数据库文件
echo ----------------------------------------
if exist "backend\database.sqlite" (
    echo [✓] 数据库文件存在
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 数据库文件不存在
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 4/10] 检查后端依赖
echo ----------------------------------------
if exist "backend\node_modules" (
    echo [✓] 后端依赖已安装
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 后端依赖未安装
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 5/10] 检查前端依赖
echo ----------------------------------------
if exist "frontend\node_modules" (
    echo [✓] 前端依赖已安装
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 前端依赖未安装
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 6/10] 检查关键后端文件
echo ----------------------------------------
set BACKEND_FILES_OK=1
if not exist "backend\src\routes\audioCache.js" set BACKEND_FILES_OK=0
if not exist "backend\src\models\AudioCache.js" set BACKEND_FILES_OK=0
if not exist "backend\src\services\AudioCacheService.js" set BACKEND_FILES_OK=0
if %BACKEND_FILES_OK% equ 1 (
    echo [✓] 关键后端文件完整
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 关键后端文件缺失
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 7/10] 检查关键前端文件
echo ----------------------------------------
set FRONTEND_FILES_OK=1
if not exist "frontend\src\services\audioCache.js" set FRONTEND_FILES_OK=0
if not exist "frontend\src\views\admin\CacheManagement.vue" set FRONTEND_FILES_OK=0
if %FRONTEND_FILES_OK% equ 1 (
    echo [✓] 关键前端文件完整
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 关键前端文件缺失
    set /a ERROR_COUNT+=1
)
echo.

echo [检查 8/10] 测试数据库连接
echo ----------------------------------------
cd backend
node -e "import('./src/models/index.js').then(() => console.log('OK')).catch(e => {console.error('FAIL'); process.exit(1);})" >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 数据库连接正常
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 数据库连接失败
    set /a ERROR_COUNT+=1
)
cd ..
echo.

echo [检查 9/10] 测试 AudioCache 模型
echo ----------------------------------------
cd backend
node -e "import('./src/models/index.js').then(m => {console.log(m.AudioCache ? 'OK' : 'FAIL'); process.exit(m.AudioCache ? 0 : 1);}).catch(() => {console.error('FAIL'); process.exit(1);})" >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] AudioCache 模型可用
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] AudioCache 模型不可用
    set /a ERROR_COUNT+=1
)
cd ..
echo.

echo [检查 10/10] 测试后端健康检查
echo ----------------------------------------
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 后端健康检查通过
    set /a SUCCESS_COUNT+=1
) else (
    echo [✗] 后端健康检查失败
    set /a ERROR_COUNT+=1
)
echo.

echo ========================================
echo 诊断结果汇总
echo ========================================
echo 通过检查: %SUCCESS_COUNT%/10
echo 失败检查: %ERROR_COUNT%/10
echo.

if %ERROR_COUNT% gtr 0 (
    echo [警告] 发现 %ERROR_COUNT% 个问题，需要修复
    echo.
    echo 是否执行自动修复？
    choice /C YN /M "继续"
    if errorlevel 2 goto :end
    if errorlevel 1 goto :fix
) else (
    echo [成功] 所有检查通过！
    echo.
    echo 系统状态良好，现在测试导出功能...
    goto :test_export
)

:fix
echo.
echo ========================================
echo 执行自动修复
echo ========================================
echo.

netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [修复 1] 启动后端服务...
    start "Backend Server" cmd /k "cd backend && npm start"
    echo 等待后端启动...
    timeout /t 10 /nobreak >nul
)

netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo [修复 2] 启动前端服务...
    start "Frontend Server" cmd /k "cd frontend && npm run dev"
    echo 等待前端启动...
    timeout /t 5 /nobreak >nul
)

if not exist "backend\node_modules" (
    echo [修复 3] 安装后端依赖...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo [修复 4] 安装前端依赖...
    cd frontend
    call npm install
    cd ..
)

echo.
echo 修复完成！等待服务稳定...
timeout /t 5 /nobreak >nul
goto :test_export

:test_export
echo.
echo ========================================
echo 测试导出功能
echo ========================================
echo.

cd backend
echo 运行导出功能测试...
node test-export-with-auth.js
cd ..

echo.
echo ========================================
echo 最终建议
echo ========================================
echo.
echo 1. 确保后端和前端服务都在运行
echo 2. 在浏览器中访问: http://localhost:5173
echo 3. 使用管理员账号登录: admin / admin123
echo 4. 进入"缓存管理"页面
echo 5. 点击"导出缓存"按钮
echo.
echo 如果仍然有问题，请提供:
echo - 后端控制台的错误日志
echo - 浏览器控制台的错误信息
echo - 本次诊断的完整输出
echo.

:end
pause
