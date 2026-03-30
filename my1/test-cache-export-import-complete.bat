@echo off
chcp 65001 >nul
echo ========================================
echo 测试音频缓存完整导出导入流程
echo ========================================
echo.

echo 1. 登录获取 token...
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" ^
  -s | jq -r ".token" > token.txt

set /p TOKEN=<token.txt
echo Token: %TOKEN%
echo.

echo 2. 导出音频文件（ZIP格式）...
curl -X GET http://localhost:3000/api/audio-cache/export-files ^
  -H "Authorization: Bearer %TOKEN%" ^
  -o test-export.zip ^
  -w "\n状态码: %%{http_code}\n文件大小: %%{size_download} 字节\n"

echo.
echo 3. 查看导出的ZIP文件信息...
if exist test-export.zip (
  echo ✓ ZIP文件已创建: test-export.zip
  dir test-export.zip
) else (
  echo ✗ ZIP文件创建失败
  goto :end
)

echo.
echo 4. 测试导入音频文件...
echo 注意: 这会跳过已存在的缓存
curl -X POST http://localhost:3000/api/audio-cache/import-files ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "file=@test-export.zip" ^
  -w "\n状态码: %%{http_code}\n"

echo.
echo ========================================
echo 测试完成！
echo 导出文件: test-export.zip
echo ========================================

:end
pause
