@echo off
chcp 65001 >nul
echo ========================================
echo 测试音频文件导出功能
echo ========================================
echo.

echo 1. 登录获取 token...
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}" ^
  -c cookies.txt ^
  -s | jq -r ".token" > token.txt

set /p TOKEN=<token.txt

echo Token: %TOKEN%
echo.

echo 2. 导出音频文件（ZIP格式）...
echo 正在下载 ZIP 文件...
curl -X GET http://localhost:3000/api/audio-cache/export-files ^
  -H "Authorization: Bearer %TOKEN%" ^
  -o audio-cache-export.zip ^
  -w "\n下载完成！\n状态码: %%{http_code}\n文件大小: %%{size_download} 字节\n"

echo.
echo ========================================
echo 测试完成！
echo 导出的文件: audio-cache-export.zip
echo ========================================
pause
