@echo off
echo ========================================
echo 测试简化课程导入功能
echo ========================================
echo.

echo 测试 1: 使用测试数据导入
echo.
curl -X POST http://localhost:3000/api/admin/import-simple-lesson ^
  -H "Content-Type: application/json" ^
  -H "Cookie: connect.sid=YOUR_SESSION_ID" ^
  -d @test-upload-data.json

echo.
echo.
echo ========================================
echo 测试完成
echo ========================================
pause
