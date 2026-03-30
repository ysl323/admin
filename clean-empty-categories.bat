@echo off
echo ========================================
echo 清理空分类
echo ========================================
echo.
echo 此脚本将删除所有没有课程的分类
echo.
pause
echo.
echo 正在检查并删除空分类...
echo.

cd backend
node delete-empty-categories.js

echo.
echo ========================================
echo 操作完成
echo ========================================
echo.
echo 请刷新浏览器查看结果
echo.
pause
