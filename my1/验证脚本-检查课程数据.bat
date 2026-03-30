@echo off
echo ========================================
echo 课程数据验证脚本
echo ========================================
echo.

cd /d e:\demo\my1\my1\my1\backend

echo [1/3] 检查后端服务...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing -TimeoutSec 5; Write-Host '    ✅ 后端服务正常 (状态码: ' $response.StatusCode ')' } catch { Write-Host '    ❌ 后端服务未运行' }"
echo.

echo [2/3] 检查数据库数据...
node test-db-connection.js
echo.

echo [3/3] 检查分类和课程详情...
node check-categories-detail.js
echo.

echo ========================================
echo 验证完成！
echo ========================================
echo.
echo 预期结果：
echo - 后端服务: 正常运行
echo - 分类: 2个（新概念3、esp32-idf）
echo - 课程: 8个（全部可显示）
echo - 单词: 106个
echo.
pause
