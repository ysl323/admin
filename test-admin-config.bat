@echo off
echo ========================================
echo 测试管理员配置和内容管理功能
echo ========================================
echo.

echo 1. 测试获取分类列表（带课程数量）
curl -X GET http://localhost:3000/api/admin/categories ^
  -H "Content-Type: application/json" ^
  -b cookies.txt
echo.
echo.

echo 2. 测试获取课程列表（带分类名称和单词数量）
curl -X GET http://localhost:3000/api/admin/lessons ^
  -H "Content-Type: application/json" ^
  -b cookies.txt
echo.
echo.

echo 3. 测试获取单词列表（带课程和分类信息）
curl -X GET http://localhost:3000/api/admin/words ^
  -H "Content-Type: application/json" ^
  -b cookies.txt
echo.
echo.

echo 4. 测试获取 TTS 配置（脱敏显示）
curl -X GET http://localhost:3000/api/admin/config/tts ^
  -H "Content-Type: application/json" ^
  -b cookies.txt
echo.
echo.

echo 5. 测试保存火山引擎 TTS 配置
curl -X PUT http://localhost:3000/api/admin/config/tts ^
  -H "Content-Type: application/json" ^
  -b cookies.txt ^
  -d "{\"provider\":\"volcengine\",\"config\":{\"appId\":\"8594935941\",\"apiKey\":\"sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL\",\"apiSecret\":\"hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR\",\"endpoint\":\"https://openspeech.bytedance.com/api/v1/tts\",\"voiceType\":\"BV700_streaming\",\"language\":\"en-US\"}}"
echo.
echo.

echo 6. 测试添加新分类
curl -X POST http://localhost:3000/api/admin/categories ^
  -H "Content-Type: application/json" ^
  -b cookies.txt ^
  -d "{\"name\":\"测试分类\"}"
echo.
echo.

echo 7. 测试添加新单词
curl -X POST http://localhost:3000/api/admin/words ^
  -H "Content-Type: application/json" ^
  -b cookies.txt ^
  -d "{\"lessonId\":1,\"english\":\"test\",\"chinese\":\"测试\"}"
echo.
echo.

echo ========================================
echo 测试完成
echo ========================================
pause
