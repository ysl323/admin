@echo off
echo ========================================
echo 学习页面功能测试
echo ========================================
echo.

echo 测试环境检查...
echo 后端服务器: http://localhost:3000
echo 前端服务器: http://localhost:5173
echo.

echo 测试步骤：
echo 1. 打开浏览器访问: http://localhost:5173
echo 2. 使用测试账号登录:
echo    用户名: testuser
echo    密码: test123
echo 3. 选择分类 "Programming Basics"
echo 4. 选择 "第 1 课"
echo 5. 进入学习页面测试以下功能：
echo.

echo ✓ 自动播放音频 2 遍
echo ✓ 显示中文提示
echo ✓ 输入答案并按空格键提交
echo ✓ 正确答案：显示"正确"，1秒后自动跳转
echo ✓ 错误答案：显示"错误"，保留最长公共前缀
echo ✓ 导航按钮：上一题、下一题、播放、显示答案、重新本题
echo ✓ 进度显示：第 X 题 / 共 Y 题，进度条
echo ✓ 完成提示：答完所有题后显示完成对话框
echo.

echo 详细测试清单请查看: LEARNING-PAGE-TEST.md
echo.

echo 按任意键打开浏览器...
pause > nul

start http://localhost:5173

echo.
echo 浏览器已打开，请按照上述步骤进行测试
echo.
pause
