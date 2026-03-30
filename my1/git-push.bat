@echo off
chcp 65001 >nul
echo ========================================
echo   Git 推送到 GitHub
echo ========================================
echo.

cd /d e:\demo\my1\my1\my1

echo 📂 当前目录: %CD%
echo.

REM 检查是否是Git仓库
if not exist ".git" (
    echo 📝 初始化Git仓库...
    git init
    if %ERRORLEVEL% neq 0 (
        echo ❌ Git初始化失败
        pause
        exit /b 1
    )
    echo ✅ Git仓库初始化完成
    echo.

    REM 配置用户信息（如果需要）
    git config user.name "Administrator"
    git config user.email "admin@example.com"
    echo ✅ Git用户信息已配置
    echo.

    REM 询问是否添加远程仓库
    set /p ADD_REMOTE="是否添加GitHub远程仓库? (y/n): "
    if /i "%ADD_REMOTE%"=="y" (
        echo.
        set /p REPO_URL="请输入GitHub仓库URL (例如: https://github.com/user/repo.git): "
        git remote add origin %REPO_URL%
        if %ERRORLEVEL% neq 0 (
            echo ❌ 添加远程仓库失败
            pause
            exit /b 1
        )
        echo ✅ 远程仓库添加成功: %REPO_URL%
        echo.
    ) else (
        echo.
        echo ⚠️  跳过添加远程仓库
        echo    如果之后需要添加，请执行: git remote add origin <仓库URL>
        echo.
    )
) else (
    echo ✅ Git仓库已存在
    echo.
    git remote -v
    echo.
)

REM 查看状态
echo 🔍 查看仓库状态...
git status
echo.

REM 添加所有文件
echo 📝 添加所有文件...
git add .
if %ERRORLEVEL% neq 0 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✅ 文件已添加
echo.

REM 提交更改
echo 💾 提交更改...
set COMMIT_MSG=修复登录问题和完善学习模式功能

- 修复数据库表结构（添加is_super_admin列）
- 重置admin密码为admin123
- 设置admin为超级管理员
- 完善学习模式功能（6个模式全部可用）
- 添加106个单词和8个课程

git commit -m "%COMMIT_MSG%"
if %ERRORLEVEL% neq 0 (
    echo ❌ 提交失败
    pause
    exit /b 1
)
echo ✅ 提交成功
echo.

REM 检查是否有远程仓库
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⚠️  未配置远程仓库
    echo.
    echo 请先添加远程仓库:
    echo   git remote add origin ^<你的GitHub仓库URL^>
    echo.
    echo 然后执行:
    echo   git push -u origin master
    echo.
    pause
    exit /b 0
)

REM 推送到GitHub
echo 🚀 推送到GitHub...
echo.
echo 正在推送到: 
git remote get-url origin
echo.

git push -u origin master 2>nul || git push -u origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 可能的原因:
    echo 1. 仓库URL错误
    echo 2. 需要配置认证
    echo 3. 网络连接问题
    echo.
    echo 解决方法:
    echo 1. 检查GitHub仓库URL是否正确
    echo 2. 使用Personal Access Token进行认证
    echo 3. 确保网络连接正常
    echo.
    echo 访问: https://github.com/settings/tokens 生成Token
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ 推送成功！
echo ========================================
echo.

echo 📊 提交信息:
echo.
git log -1 --oneline
echo.

echo 🌐 访问GitHub查看:
git remote get-url origin
echo.

pause
