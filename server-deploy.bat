@echo off
echo ================================
echo    Server Deploy Script
echo ================================
echo.

cd /d /root/english-learning

echo Pulling latest code from GitHub...
git pull origin master

echo.
echo Building frontend...
cd frontend
npm run build
cd ..

echo.
echo Restarting services...
pm2 restart all

echo.
echo Testing website...
curl -s -o nul -s -w "%%{http_code}" http://localhost/

echo.
echo ================================
echo    Deploy Complete!
echo ================================
pause
