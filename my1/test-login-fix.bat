@echo off
echo ========================================
echo 登录跳转功能测试
echo ========================================
echo.

echo 测试步骤：
echo 1. 打开浏览器访问: http://localhost:5173/login
echo 2. 输入测试账号:
echo    用户名: testuser
echo    密码: test123
echo 3. 点击"登录"按钮
echo 4. 验证是否自动跳转到分类首页 (/categories)
echo.

echo 预期结果：
echo ✓ 显示"登录成功"提示
echo ✓ 自动跳转到分类首页
echo ✓ 显示所有分类列表
echo ✓ 顶部导航栏显示用户名
echo.

echo 如果仍然无法跳转，请检查浏览器控制台是否有错误信息
echo.

echo 按任意键打开浏览器...
pause > nul

start http://localhost:5173/login

echo.
echo 浏览器已打开，请按照上述步骤进行测试
echo.
pause
