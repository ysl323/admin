@echo off
chcp 65001 >nul
echo ========================================
echo Frontend Login Test
echo ========================================
echo.

set BASE_URL=http://localhost:3000/api

echo Step 1: Test user registration...
curl -s -c cookies.txt -X POST %BASE_URL%/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"test123\"}" > register.json
findstr /C:"\"success\":true" register.json >nul
if %errorlevel%==0 (
    echo [OK] Registration successful
) else (
    echo [INFO] User may already exist
    type register.json
)
echo.

echo Step 2: Test user login...
curl -s -c cookies.txt -X POST %BASE_URL%/auth/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"test123\"}" > login.json
findstr /C:"\"success\":true" login.json >nul
if %errorlevel%==0 (
    echo [OK] Login successful
    type login.json
) else (
    echo [FAIL] Login failed
    type login.json
)
echo.

echo Step 3: Test auth check...
curl -s -b cookies.txt -X GET %BASE_URL%/auth/check > check.json
findstr /C:"\"success\":true" check.json >nul
if %errorlevel%==0 (
    echo [OK] Auth check successful
    type check.json
) else (
    echo [FAIL] Auth check failed
    type check.json
)
echo.

echo Step 4: Test logout...
curl -s -b cookies.txt -X POST %BASE_URL%/auth/logout > logout.json
findstr /C:"\"success\":true" logout.json >nul
if %errorlevel%==0 (
    echo [OK] Logout successful
) else (
    echo [FAIL] Logout failed
    type logout.json
)
echo.

echo ========================================
echo [OK] All tests completed!
echo ========================================
echo.
echo You can now test the frontend at:
echo http://localhost:5173/login
echo.
echo Test credentials:
echo Username: testuser
echo Password: test123
echo.
echo Admin credentials:
echo Username: admin
echo Password: admin123
echo.

del register.json login.json check.json logout.json cookies.txt 2>nul
