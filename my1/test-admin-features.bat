@echo off
echo ========================================
echo 管理员功能测试
echo ========================================
echo.

echo 管理员账户信息：
echo 用户名: admin
echo 密码: admin123
echo.

echo 测试步骤：
echo.
echo 1. 登录管理员账户
echo    - 访问: http://localhost:5173/login
echo    - 输入: admin / admin123
echo    - 点击登录
echo.
echo 2. 验证"进入后台"按钮
echo    - 登录成功后，检查顶部导航栏
echo    - 应该看到蓝色的"进入后台"按钮
echo    - 普通用户登录时不显示此按钮
echo.
echo 3. 进入管理后台
echo    - 点击"进入后台"按钮
echo    - 或访问: http://localhost:5173/admin/users
echo.
echo 4. 测试用户管理功能
echo    a) 查看用户列表
echo       - 应显示所有用户信息
echo       - 包含 ID、用户名、剩余天数、状态等
echo.
echo    b) 修改用户名
echo       - 选择一个用户（如 testuser）
echo       - 点击"修改用户名"
echo       - 输入新用户名（如 testuser2）
echo       - 确认修改
echo       - 验证列表中用户名已更新
echo.
echo    c) 重置密码
echo       - 选择一个用户
echo       - 点击"重置密码"
echo       - 输入新密码（至少6字符）
echo       - 确认密码
echo       - 提交修改
echo       - 使用新密码登录验证
echo.
echo    d) 增加天数
echo       - 选择一个用户
echo       - 点击"加天数"
echo       - 输入天数（如 30）
echo       - 确认
echo       - 验证剩余天数已增加
echo.
echo    e) 启用/禁用账号
echo       - 选择一个用户
echo       - 点击"禁用"按钮
echo       - 确认操作
echo       - 验证状态变为"禁用"
echo       - 尝试用该账号登录（应失败）
echo       - 点击"启用"恢复
echo.
echo 5. 测试"返回主页"按钮
echo    - 在管理后台左侧菜单顶部
echo    - 点击"返回主页"按钮
echo    - 应跳转到分类首页 (/categories)
echo.
echo 6. 测试普通用户
echo    - 退出管理员账户
echo    - 使用普通用户登录: testuser / test123
echo    - 验证导航栏不显示"进入后台"按钮
echo    - 尝试访问: http://localhost:5173/admin/users
echo    - 应自动跳转到分类首页（无权限）
echo.

echo 详细文档请查看: ADMIN-ACCOUNT-INFO.md
echo.

echo 按任意键打开浏览器...
pause > nul

start http://localhost:5173/login

echo.
echo 浏览器已打开，请按照上述步骤进行测试
echo.
pause
