@echo off
chcp 65001 >nul
title 一键部署到服务器

echo.
echo ╔════════════════════════════════════════╗
echo ║     编程英语学习系统 - 一键部署        ║
echo ║     服务器: 47.97.185.117             ║
echo ╚════════════════════════════════════════╝
echo.

echo 正在检查部署环境...
echo.

REM 检查前端构建
if not exist "frontend\dist" (
    echo [错误] 前端构建文件不存在！
    echo.
    echo 请先构建前端：
    echo   cd frontend
    echo   npm run build
    echo.
    pause
    exit /b 1
)
echo [✓] 前端构建文件存在

REM 检查 SSH 工具
where scp >nul 2>&1
if errorlevel 1 (
    echo [!] 未找到 SSH 工具
    echo.
    echo 请选择部署方式：
    echo   1. 安装 OpenSSH 客户端（推荐）
    echo   2. 使用 FTP 工具手动上传
    echo.
    echo 安装 OpenSSH：
    echo   以管理员身份运行 PowerShell，执行：
    echo   Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
    echo.
    echo 或查看 DEPLOY-NOW.md 了解手动部署步骤
    echo.
    pause
    exit /b 1
)
echo [✓] SSH 工具已安装

echo.
echo ════════════════════════════════════════
echo 开始部署流程
echo ════════════════════════════════════════
echo.

REM 使用 PowerShell 脚本部署
powershell -ExecutionPolicy Bypass -File "deploy-simple.ps1"

if errorlevel 1 (
    echo.
    echo [错误] 部署失败！
    echo.
    echo 请检查：
    echo   1. 网络连接是否正常
    echo   2. 服务器是否可访问
    echo   3. SSH 密码是否正确
    echo.
    echo 或查看 DEPLOY-NOW.md 了解手动部署步骤
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════
echo 部署完成！
echo ════════════════════════════════════════
echo.
echo 访问地址: http://47.97.185.117
echo 管理后台: http://47.97.185.117/admin
echo 默认账号: admin / admin123
echo.
echo 下一步：
echo   1. 访问网站测试功能
echo   2. 修改管理员密码
echo   3. 导入课程数据
echo.
pause
