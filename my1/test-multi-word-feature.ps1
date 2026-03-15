# Test Multi-Word Input Feature
Write-Host "=== Testing Multi-Word Input Feature ===" -ForegroundColor Cyan

Write-Host "`n📋 Test Instructions:" -ForegroundColor Yellow
Write-Host "1. Open browser and go to: http://47.97.185.117" -ForegroundColor White
Write-Host "2. Login with: admin / admin123" -ForegroundColor White
Write-Host "3. Navigate to a lesson with multi-word phrases" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Test Scenarios:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Scenario 1: Single Word (e.g., 'hello')" -ForegroundColor Cyan
Write-Host "  - Should show: One input box" -ForegroundColor Gray
Write-Host "  - Press space or enter to submit" -ForegroundColor Gray
Write-Host ""
Write-Host "Scenario 2: Two Words (e.g., 'hello world')" -ForegroundColor Cyan
Write-Host "  - Should show: Two input boxes separated by space" -ForegroundColor Gray
Write-Host "  - Type 'hello' → Press space → Validates first word" -ForegroundColor Gray
Write-Host "  - If correct: Auto-focus to second box" -ForegroundColor Gray
Write-Host "  - If wrong: Clear input, play audio, wait for re-input" -ForegroundColor Gray
Write-Host "  - Type 'world' → Press space → Submits complete answer" -ForegroundColor Gray
Write-Host ""
Write-Host "Scenario 3: Three Words (e.g., 'good morning everyone')" -ForegroundColor Cyan
Write-Host "  - Should show: Three input boxes" -ForegroundColor Gray
Write-Host "  - Same logic as Scenario 2, but with 3 words" -ForegroundColor Gray
Write-Host ""
Write-Host "Scenario 4: Error Handling" -ForegroundColor Cyan
Write-Host "  - Type wrong word → Press space" -ForegroundColor Gray
Write-Host "  - Should see: Red underline + shake animation" -ForegroundColor Gray
Write-Host "  - Should hear: Audio replay" -ForegroundColor Gray
Write-Host "  - Input box should: Clear and wait for re-input" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Expected Behavior:" -ForegroundColor Green
Write-Host "  ✓ Each word validated immediately on space press" -ForegroundColor Gray
Write-Host "  ✓ Wrong word clears and replays audio" -ForegroundColor Gray
Write-Host "  ✓ Correct word moves to next input box" -ForegroundColor Gray
Write-Host "  ✓ Last word submission validates complete phrase" -ForegroundColor Gray
Write-Host "  ✓ Input box width adjusts to word length" -ForegroundColor Gray
Write-Host "  ✓ Placeholder shows underscores (_____)" -ForegroundColor Gray
Write-Host ""

# Check if server is accessible
Write-Host "🔍 Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://47.97.185.117" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://47.97.185.117"

Write-Host "`n=== Test Ready ===" -ForegroundColor Green
Write-Host "Browser opened. Please follow the test instructions above." -ForegroundColor White
