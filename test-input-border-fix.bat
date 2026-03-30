@echo off
echo 正在打开输入框边框修复测试页面...
echo.
echo 测试说明：
echo 1. 点击输入框，检查是否还有半透明边框
echo 2. 应该只看到蓝色的下划线，没有其他边框或阴影
echo 3. 如果问题已解决，输入框应该完全没有半透明边框
echo.
start "" "%~dp0test-input-border-fix.html"
echo 测试页面已打开，请检查输入框的视觉效果
pause