@echo off
chcp 65001 >nul
title 一键清空服务器并部署

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🚀 一键清空并部署                          ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  服务器: 47.97.185.117                                       ║
echo ║  功能: 完全清空服务器并部署最新代码                            ║
echo ║  包含: 所有最新修复和功能                                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 检查必要文件...
if not exist "frontend" (
    echo ❌ 错误: 未找到 frontend 目录
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ 错误: 未找到 backend 目录
    pause
    exit /b 1
)

echo ✅ 文件检查通过
echo.

echo ⚠️  警告: 此操作将完全清空服务器上的应用！
echo.
echo 📋 将要执行的操作:
echo   1. 构建最新前端代码
echo   2. 打包所有文件
echo   3. 上传到服务器
echo   4. 清空服务器应用
echo   5. 部署新代码
echo   6. 启动服务
echo.

set /p confirm="🤔 确认继续吗？(输入 y 继续): "
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.
echo 🚀 开始部署...
echo.

REM 调用详细的部署脚本
call "清空服务器并重新部署.bat"

echo.
echo 🎉 部署流程完成！
echo.
echo 📱 快速访问:
echo   网站: http://47.97.185.117
echo   管理: admin / admin123
echo.
pause