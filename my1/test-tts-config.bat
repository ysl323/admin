@echo off
echo ========================================
echo TTS 配置测试脚本
echo ========================================
echo.
echo 测试步骤：
echo 1. 打开浏览器访问 http://localhost:5173
echo 2. 使用管理员账号登录（admin / admin123）
echo 3. 点击右上角"进入后台"按钮
echo 4. 在左侧菜单选择"配置管理"
echo 5. 测试火山引擎 TTS 配置
echo.
echo ========================================
echo 火山引擎 TTS 测试流程
echo ========================================
echo.
echo 【简单模式测试】
echo 1. 选择"简单模式"
echo 2. 填写核心配置：
echo    - AppID: 8594935941
echo    - Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
echo    - Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
echo 3. 点击"保存配置"
echo 4. 点击"测试配置"
echo 5. 在弹出的对话框中输入测试文本（如：Excuse me!）
echo 6. 点击"开始测试"
echo 7. 验证是否显示"测试成功"消息
echo.
echo 【复杂模式测试】
echo 1. 选择"复杂模式"
echo 2. 填写完整配置：
echo    - AppID: 8594935941
echo    - Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
echo    - Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
echo    - 接口地址: https://openspeech.bytedance.com/api/v1/tts
echo    - 默认音色: 英文女声 (BV700_streaming)
echo    - 语言: 英文 (en-US)
echo 3. 点击"保存配置"
echo 4. 点击"测试配置"
echo 5. 在弹出的对话框中输入测试文本（如：Hello, this is a test.）
echo 6. 点击"开始测试"
echo 7. 验证是否显示"测试成功"消息
echo.
echo 【错误配置测试】
echo 1. 故意填写错误的 Access Token
echo 2. 点击"测试配置"
echo 3. 验证是否显示清晰的错误提示
echo.
echo ========================================
echo 预期结果
echo ========================================
echo ✅ 简单模式和复杂模式都能正常保存配置
echo ✅ 测试按钮能实际调用火山引擎 API
echo ✅ 配置正确时显示"测试成功"
echo ✅ 配置错误时显示清晰的错误提示
echo ✅ 两种模式的测试结果一致
echo.
echo 按任意键打开浏览器...
pause > nul
start http://localhost:5173
