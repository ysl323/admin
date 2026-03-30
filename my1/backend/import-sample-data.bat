@echo off
chcp 65001 >nul
echo ========================================
echo Import Sample Data
echo ========================================
echo.

set BASE_URL=http://localhost:3000/api

echo Step 1: Login as admin...
curl -s -c cookies.txt -X POST %BASE_URL%/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" > login.json
findstr /C:"\"success\":true" login.json >nul
if %errorlevel%==0 (
    echo [OK] Login successful
) else (
    echo [FAIL] Login failed
    type login.json
    exit /b 1
)
echo.

echo Step 2: Import Programming Basics...
curl -s -b cookies.txt -X POST %BASE_URL%/admin/import-json-direct -H "Content-Type: application/json" -d @sample-data.json > import1.json
findstr /C:"\"success\":true" import1.json >nul
if %errorlevel%==0 (
    echo [OK] Programming Basics imported
    type import1.json
) else (
    echo [FAIL] Import failed
    type import1.json
)
echo.

echo Step 3: Import Web Development...
curl -s -b cookies.txt -X POST %BASE_URL%/admin/import-json-direct -H "Content-Type: application/json" -d @sample-data2.json > import2.json
findstr /C:"\"success\":true" import2.json >nul
if %errorlevel%==0 (
    echo [OK] Web Development imported
    type import2.json
) else (
    echo [FAIL] Import failed
    type import2.json
)
echo.

echo ========================================
echo [OK] Sample data import completed!
echo ========================================
echo.
echo You can now test the frontend at:
echo http://localhost:5173/categories
echo.

del login.json import1.json import2.json cookies.txt 2>nul
