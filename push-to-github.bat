@echo off
chcp 65001 >nul
echo ========================================
echo   GitHub 推送脚本
echo ========================================
echo.

REM 检查Git是否安装
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 未安装Git
    echo.
    echo 请先安装Git:
    echo 1. 访问 https://git-scm.com/downloads
    echo 2. 下载并安装Git
    echo 3. 重启命令行窗口
    echo.
    pause
    exit /b 1
)

echo ✅ Git已安装
echo.

REM 进入项目目录
cd /d e:\demo\my1\my1\my1
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 找不到项目目录
    pause
    exit /b 1
)

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
        echo ✅ 远程仓库添加成功
        echo.
    )
)

REM 查看状态
echo 🔍 查看仓库状态...
git status
echo.

REM 询问是否提交
set /p SHOULD_COMMIT="是否提交所有更改? (y/n): "
if /i "%SHOULD_COMMIT%"=="y" (
    echo.
    echo 📝 添加所有文件...
    git add .
    echo ✅ 文件已添加
    echo.

    REM 输入提交信息
    echo 📝 请输入提交信息 (直接回车使用默认信息):
    set /p COMMIT_MSG="提交信息: "

    if "%COMMIT_MSG%"=="" (
        set COMMIT_MSG=修复登录问题和学习模式功能
    )

    echo.
    echo 💾 提交更改...
    git commit -m "%COMMIT_MSG%"
    if %ERRORLEVEL% neq 0 (
        echo ❌ 提交失败
        pause
        exit /b 1
    )
    echo ✅ 提交成功
    echo.

    REM 推送到GitHub
    echo 🚀 推送到GitHub...
    git push -u origin master 2>nul || git push -u origin main
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ⚠️  推送失败，可能需要配置认证
        echo.
        echo 解决方法:
        echo 1. 使用GitHub个人访问令牌
        echo 2. 或使用SSH密钥
        echo.
        echo 详细信息请查看: https://docs.github.com/zh/authentication
        echo.
        pause
        exit /b 1
    )
    echo ✅ 推送成功！
    echo.
) else (
    echo 跳过提交
    echo.
)

echo ========================================
echo   完成！
echo ========================================
echo.

REM 显示仓库信息
echo 📊 仓库信息:
git remote -v
echo.

echo 🌐 访问GitHub查看:
if not exist ".git" goto end
for /f "tokens=2" %%a in ('git remote get-url origin 2^>nul') do (
    echo %%a
    goto end
)
echo 未配置远程仓库

:end
echo.
pause
