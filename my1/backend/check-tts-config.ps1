# Check current TTS configuration
Write-Host "=== Check TTS Config ===" -ForegroundColor Cyan

# Setup request parameters
$baseUrl = "http://localhost:3000"
$loginUrl = "$baseUrl/api/auth/login"
$configUrl = "$baseUrl/api/admin/config/tts"

# Admin login
Write-Host "`n1. Admin login..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

# Get TTS config
Write-Host "`n2. Get TTS config..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $configResponse = Invoke-RestMethod -Uri $configUrl -Method Get -Headers $headers
    
    Write-Host "Get config successful" -ForegroundColor Green
    Write-Host "`nCurrent config:" -ForegroundColor Cyan
    Write-Host "Provider: $($configResponse.config.provider)" -ForegroundColor White
    Write-Host "`nVolcengine config:" -ForegroundColor Cyan
    Write-Host "  AppID: $($configResponse.config.volcengine.appId)" -ForegroundColor White
    Write-Host "  Access Token: $($configResponse.config.volcengine.apiKey)" -ForegroundColor White
    Write-Host "  Endpoint: $($configResponse.config.volcengine.endpoint)" -ForegroundColor White
    Write-Host "  Voice Type: $($configResponse.config.volcengine.voiceType)" -ForegroundColor White
    Write-Host "  Cluster: $($configResponse.config.volcengine.cluster)" -ForegroundColor White
    Write-Host "  Mode: $($configResponse.config.volcengine.mode)" -ForegroundColor White
    
    # Check if credentials match documentation
    Write-Host "`n3. Verify credentials..." -ForegroundColor Yellow
    $correctAppId = "2128862431"
    
    if ($configResponse.config.volcengine.appId -eq $correctAppId) {
        Write-Host "AppID is correct" -ForegroundColor Green
    } else {
        Write-Host "AppID is incorrect" -ForegroundColor Red
        Write-Host "  Current: $($configResponse.config.volcengine.appId)" -ForegroundColor Gray
        Write-Host "  Should be: $correctAppId" -ForegroundColor Gray
    }
    
    Write-Host "  Access Token (masked): $($configResponse.config.volcengine.apiKey)" -ForegroundColor Gray
    
} catch {
    Write-Host "Get config failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Check complete ===" -ForegroundColor Cyan
