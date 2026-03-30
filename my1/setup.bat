@echo off
echo ================================
echo 编程英语单词学习系统 - 项目初始化
echo ================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo 请先安装 Node.js 18 或更高版本
    pause
    exit /b 1
)

echo ✅ Node.js 版本:
node -v
echo.

REM 创建环境变量文件
if not exist .env (
    echo 创建环境变量文件...
    copy .env.example .env
    echo ✅ .env 文件已创建
    echo ⚠️  请编辑 .env 文件，设置必要的配置（SESSION_SECRET、ENCRYPTION_KEY）
) else (
    echo ✅ .env 文件已存在
)
echo.

REM 安装后端依赖
echo 安装后端依赖...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 后端依赖安装成功
cd ..
echo.

REM 安装前端依赖
echo 安装前端依赖...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✅ 前端依赖安装成功
cd ..
echo.

REM 创建必要的目录
echo 创建必要的目录...
if not exist backend\logs mkdir backend\logs
if not exist backend\cache\audio mkdir backend\cache\audio
if not exist backend\uploads mkdir backend\uploads
echo ✅ 目录创建完成
echo.

echo ================================
echo ✅ 项目初始化完成！
echo ================================
echo.
echo 下一步：
echo 1. 编辑 .env 文件，设置必要的配置
echo 2. 启动后端: cd backend ^&^& npm run dev
echo 3. 启动前端: cd frontend ^&^& npm run dev
echo 4. 访问应用: http://localhost:5173
echo.
pause
