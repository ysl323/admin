@echo off
chcp 65001 >nul
echo ========================================
echo JSON Import Function Test
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

echo Step 2: Import JSON data...
curl -s -b cookies.txt -X POST %BASE_URL%/admin/import-json-direct -H "Content-Type: application/json" -d @test-data.json > import.json
findstr /C:"\"success\":true" import.json >nul
if %errorlevel%==0 (
    echo [OK] Import successful
    type import.json
) else (
    echo [FAIL] Import failed
    type import.json
)
echo.

echo Step 3: Verify imported data...
curl -s -b cookies.txt -X GET %BASE_URL%/learning/categories > categories.json
findstr /C:"Test Import Category" categories.json >nul
if %errorlevel%==0 (
    echo [OK] Found test category
) else (
    echo [FAIL] Test category not found
)
echo.

echo Step 4: Test invalid data (should fail)...
echo {"category":"Invalid","lessons":[{"lesson":1,"words":[{"en":"test"}]}]} > invalid.json
curl -s -b cookies.txt -X POST %BASE_URL%/admin/import-json-direct -H "Content-Type: application/json" -d @invalid.json > invalid-result.json
findstr /C:"\"success\":false" invalid-result.json >nul
if %errorlevel%==0 (
    echo [OK] Correctly rejected invalid data
) else (
    echo [FAIL] Should reject invalid data
)
echo.

echo ========================================
echo [OK] All tests completed!
echo ========================================

del login.json import.json categories.json invalid.json invalid-result.json cookies.txt 2>nul
