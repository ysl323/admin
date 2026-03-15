@echo off
echo ========================================
echo 测试最新修复
echo ========================================
echo.

echo 本脚本将帮助你测试最新的修复：
echo 1. 课程列表显示修复
echo 2. TTS API 404错误修复
echo 3. 返回按钮功能
echo.

echo 请确保服务正在运行...
echo.

echo 检查服务状态...
call check-services.bat

echo.
echo ========================================
echo 测试步骤
echo ========================================
echo.

echo 1. 打开浏览器访问: http://localhost:5173
echo 2. 登录系统 (admin / admin123)
echo 3. 点击任意分类进入课程列表
echo 4. 检查：
echo    - 分类名称是否正确显示（不是"未知分类"）
echo    - 单词数量是否正确显示（不是"0个单词"）
echo 5. 点击任意课程进入学习页面
echo 6. 打开浏览器开发者工具 (F12)
echo 7. 切换到"网络"标签
echo 8. 点击播放按钮测试TTS
echo 9. 检查：
echo    - 是否有声音
echo    - 网络请求是否返回200（不是404）
echo    - 是否有"返回课程"按钮
echo 10. 点击"返回课程"按钮测试导航
echo.

echo ========================================
echo 详细测试指南
echo ========================================
echo.
echo 请查看 LATEST-FIXES-TEST.md 获取详细测试步骤
echo.

pause

echo.
echo 是否要打开浏览器？(Y/N)
set /p OPEN_BROWSER=

if /i "%OPEN_BROWSER%"=="Y" (
    echo 正在打开浏览器...
    start http://localhost:5173
)

echo.
echo 测试完成后，请检查：
echo - 所有功能是否正常
echo - 是否有错误信息
echo - 用户体验是否良好
echo.

pause
