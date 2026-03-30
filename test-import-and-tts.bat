@echo off
chcp 65001 >nul
echo ========================================
echo 测试一键导入和 TTS 配置功能
echo ========================================
echo.

echo [1/4] 测试导入有课时号的数据...
echo.
curl -X POST http://localhost:3000/api/admin/import-simple-lesson ^
  -H "Content-Type: application/json" ^
  -H "Cookie: connect.sid=YOUR_SESSION_ID" ^
  -d @backend/new-concept-lesson1-3.json ^
  --data-urlencode "categoryName=新概念英语第一册测试"
echo.
echo.

echo [2/4] 测试导入无课时号的数据...
echo.
curl -X POST http://localhost:3000/api/admin/import-simple-lesson ^
  -H "Content-Type: application/json" ^
  -H "Cookie: connect.sid=YOUR_SESSION_ID" ^
  -d @backend/new-concept-no-lesson.json ^
  --data-urlencode "categoryName=新概念核心知识点测试"
echo.
echo.

echo [3/4] 测试火山引擎 TTS 配置...
echo.
curl -X POST http://localhost:3000/api/admin/test-tts ^
  -H "Content-Type: application/json" ^
  -H "Cookie: connect.sid=YOUR_SESSION_ID" ^
  -d "{\"provider\":\"volcengine\",\"text\":\"Hello, this is a test.\"}"
echo.
echo.

echo [4/4] 测试谷歌 TTS 配置...
echo.
curl -X POST http://localhost:3000/api/admin/test-tts ^
  -H "Content-Type: application/json" ^
  -H "Cookie: connect.sid=YOUR_SESSION_ID" ^
  -d "{\"provider\":\"google\",\"text\":\"Hello, this is a test.\"}"
echo.
echo.

echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 注意：
echo 1. 请先登录管理员账户获取 Session ID
echo 2. 将上面的 YOUR_SESSION_ID 替换为实际的 Session ID
echo 3. 或者直接在浏览器中测试
echo.
pause
