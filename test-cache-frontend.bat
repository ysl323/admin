@echo off
chcp 65001 >nul
echo ========================================
echo 测试音频缓存功能
echo ========================================
echo.

echo 请按照以下步骤测试:
echo.
echo 1. 确保后端服务正在运行 (端口 3000)
echo 2. 确保前端服务正在运行 (端口 5173)
echo.
echo 3. 打开浏览器访问: http://localhost:5173/login
echo 4. 使用管理员账号登录:
echo    用户名: admin
echo    密码: admin123
echo.
echo 5. 登录后，访问: http://localhost:5173/admin/cache
echo.
echo 6. 如果看不到缓存记录，请:
echo    a) 打开浏览器开发者工具 (F12)
echo    b) 查看 Console 标签页的错误信息
echo    c) 查看 Network 标签页的 API 请求
echo.
echo 7. 测试播放音频:
echo    a) 访问: http://localhost:5173/categories
echo    b) 选择 "Programming Basics" 或 "Web Development"
echo    c) 点击任意课程
echo    d) 点击单词旁边的播放按钮
echo.
echo 8. 播放音频后，返回缓存管理页面刷新，应该能看到新的缓存记录
echo.

pause
