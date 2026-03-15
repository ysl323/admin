# Simple TTS Test

$serverIP = "47.97.185.117"

Write-Host "Testing TTS Configuration on $serverIP" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "1. Login..." -ForegroundColor Yellow
$loginResult = curl -X POST "http://$serverIP/api/auth/login" `
    -H "Content-Type: application/json" `
    -d '{\"username\":\"admin\",\"password\":\"admin123\"}' `
    -c cookies.txt `
    -s

Write-Host "   Done" -ForegroundColor Green

# Get TTS Config
Write-Host "`n2. Get TTS Config..." -ForegroundColor Yellow
$configResult = curl -X GET "http://$serverIP/api/admin/tts-config" `
    -b cookies.txt `
    -s

Write-Host $configResult
Write-Host ""

# Test Volcengine TTS
Write-Host "3. Test Volcengine TTS..." -ForegroundColor Yellow
$testResult = curl -X POST "http://$serverIP/api/admin/test-tts/volcengine" `
    -H "Content-Type: application/json" `
    -d '{\"text\":\"Hello, this is a test.\"}' `
    -b cookies.txt `
    -s

Write-Host $testResult
Write-Host ""

# Cleanup
Remove-Item cookies.txt -ErrorAction SilentlyContinue

Write-Host "Done!" -ForegroundColor Green
