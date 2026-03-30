@echo off
echo ========================================
echo 测试修复结果
echo ========================================
echo.

echo 1. 测试课程数量显示
echo ----------------------------------------
curl -X GET "http://localhost:3000/api/learning/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MDk3NjAwMDAsImV4cCI6MTcxMDM2NDgwMH0.test"
echo.
echo.

echo 2. 测试TTS播放
echo ----------------------------------------
curl -X POST "http://localhost:3000/api/tts/speak" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MDk3NjAwMDAsImV4cCI6MTcxMDM2NDgwMH0.test" ^
  -d "{\"text\":\"Hello\"}" ^
  --output test-audio.mp3
echo.
echo 音频已保存到 test-audio.mp3
echo.

echo 3. 测试后台内容管理API
echo ----------------------------------------
echo 获取所有分类（带课程数量）:
curl -X GET "http://localhost:3000/api/admin/categories" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MDk3NjAwMDAsImV4cCI6MTcxMDM2NDgwMH0.test"
echo.
echo.

echo 获取所有课程（带单词数量）:
curl -X GET "http://localhost:3000/api/admin/lessons" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MDk3NjAwMDAsImV4cCI6MTcxMDM2NDgwMH0.test"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
pause
