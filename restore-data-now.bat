@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     立即恢复课程数据                                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd backend

echo 正在恢复数据...
echo.

node src/scripts/import-lessons.js sample-data.json

if %errorlevel% equ 0 (
    echo.
    echo ✅ 数据恢复成功！
    echo.
    node check-all-data.js
) else (
    echo.
    echo ❌ 数据恢复失败
)

cd ..
pause
