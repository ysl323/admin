@echo off
setlocal

echo Pushing to GitHub...
echo.

REM Temporarily disable Git credential manager
set GIT_ASKPASS=echo
set GIT_TERMINAL_PROMPT=1

cd /d e:\demo\my1\my1

echo Removing old remotes...
git remote remove origin 2>nul
git remote remove github 2>nul

echo Adding new remote...
git config --local remote.origin.url https://github.com/ysl323/admin.git
git config --local remote.origin.fetch +refs/heads/*:refs/remotes/origin/*

echo Current remote configuration:
git remote -v
echo.

echo Attempting to push...
echo Note: You may be prompted for GitHub username and token
echo.

git push https://github.com/ysl323/admin.git master

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Push failed. Please check your GitHub credentials.
    echo You may need to use a Personal Access Token instead of password.
    echo.
    echo Get token from: https://github.com/settings/tokens
    echo.
) else (
    echo.
    echo Push successful!
)

pause
