# Test TTS Configuration

$serverIP = "47.97.185.117"
$baseUrl = "http://$serverIP"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing TTS Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Login
    Write-Host "1. Logging in..." -ForegroundColor Yellow
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -UseBasicParsing

    if ($loginResponse.StatusCode -eq 200) {
        Write-Host "   Login successful" -ForegroundColor Green
    } else {
        throw "Login failed"
    }

    # Step 2: Get TTS Config
    Write-Host "`n2. Getting TTS configuration..." -ForegroundColor Yellow
    $configResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/tts-config" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing

    if ($configResponse.StatusCode -eq 200) {
        $config = $configResponse.Content | ConvertFrom-Json
        Write-Host "   TTS Config retrieved" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Provider: $($config.provider)" -ForegroundColor White
        Write-Host ""
        Write-Host "   Volcengine TTS:" -ForegroundColor Cyan
        Write-Host "     APP ID: $($config.volcengine.appId)" -ForegroundColor Gray
        Write-Host "     Endpoint: $($config.volcengine.endpoint)" -ForegroundColor Gray
        Write-Host "     Voice Type: $($config.volcengine.voiceType)" -ForegroundColor Gray
        Write-Host "     Language: $($config.volcengine.language)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Google TTS:" -ForegroundColor Cyan
        Write-Host "     Language: $($config.google.languageCode)" -ForegroundColor Gray
        Write-Host "     Voice: $($config.google.voiceName)" -ForegroundColor Gray
    } else {
        throw "Failed to get TTS config"
    }

    # Step 3: Test Volcengine TTS
    Write-Host "`n3. Testing Volcengine TTS..." -ForegroundColor Yellow
    $testBody = @{
        text = "Hello, this is a test."
    } | ConvertTo-Json

    $testResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/test-tts/volcengine" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -WebSession $session `
        -UseBasicParsing

    if ($testResponse.StatusCode -eq 200) {
        $testResult = $testResponse.Content | ConvertFrom-Json
        if ($testResult.success) {
            Write-Host "   Volcengine TTS test: PASSED" -ForegroundColor Green
            Write-Host "   Message: $($testResult.message)" -ForegroundColor Gray
        } else {
            Write-Host "   Volcengine TTS test: FAILED" -ForegroundColor Red
            Write-Host "   Message: $($testResult.message)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   Volcengine TTS test: ERROR" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Test Complete!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Visit: http://47.97.185.117/admin" -ForegroundColor Gray
    Write-Host "  2. Go to Configuration Management" -ForegroundColor Gray
    Write-Host "  3. Test TTS in the learning page" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host ""
}
