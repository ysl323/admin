@echo off
echo ========================================
echo 测试 TTS POST /speak 路由
echo ========================================
echo.

echo 测试 POST /api/tts/speak...
echo.

curl -X POST http://localhost:3000/api/tts/speak ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -d "{\"text\":\"Hello World\"}" ^
  --output test-audio.mp3 ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 如果成功，应该生成 test-audio.mp3 文件
echo.
pause
