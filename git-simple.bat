@echo off
cd /d e:\demo\my1\my1\my1

echo Starting Git initialization...
git init
echo.

echo Setting user config...
git config user.name "Admin"
git config user.email "admin@example.com"
echo.

echo Adding remote repository...
set REPO=https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo Please enter your GitHub repository URL:
set /p REPO="Repository URL: "
git remote add origin %REPO%
echo.

echo Adding all files...
git add .
echo.

echo Committing changes...
git commit -m "Initial commit - English learning system with login fix"
echo.

echo Pushing to GitHub...
git push -u origin master
echo.

pause
