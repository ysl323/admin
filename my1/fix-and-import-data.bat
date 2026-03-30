@echo off
chcp 65001 >nul
echo ========================================
echo 修复数据库表结构并导入示例数据
echo ========================================
echo.

cd backend

echo Step 1: 修复 lessons 表结构...
node fix-lessons-table.js
if %errorlevel% neq 0 (
    echo [FAIL] 表结构修复失败
    pause
    exit /b 1
)
echo [OK] 表结构修复成功
echo.

echo Step 2: 导入示例数据...
call import-sample-data.bat
if %errorlevel% neq 0 (
    echo [FAIL] 数据导入失败
    pause
    exit /b 1
)
echo.

echo Step 3: 验证数据...
node check-data.js
echo.

echo ========================================
echo [OK] 修复和导入完成！
echo ========================================
echo.
echo 现在可以访问前端查看结果:
echo http://localhost:5173/categories
echo.

cd ..
pause
