@echo off
echo ========================================
echo 修复课程编号显示为0的问题
echo ========================================
echo.

echo 步骤1: 检查课程编号
echo.
cd backend
node check-lesson-numbers.js

echo.
echo ========================================
echo.
echo 是否要修复课程编号？(Y/N)
set /p FIX=

if /i "%FIX%"=="Y" (
    echo.
    echo 步骤2: 修复课程编号
    echo.
    node fix-lesson-numbers.js
    
    echo.
    echo ========================================
    echo 修复完成！
    echo ========================================
    echo.
    echo 前端已自动修复显示逻辑
    echo 即使数据库中是0，也会显示正确的序号
    echo.
    echo 请刷新浏览器测试
    echo.
) else (
    echo.
    echo 已取消修复
    echo.
    echo 注意：前端已修复显示逻辑
    echo 即使数据库中是0，也会显示正确的序号
    echo.
)

pause
