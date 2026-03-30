# Test Volcengine TTS with Bearer token authentication
$baseUrl = "http://localhost:3000"

Write-Host "=== 测试火山引擎 TTS (Bearer Token 认证) ===" -ForegroundColor Cyan

# 1. 登录获取 token
Write-Host "`n1. 登录管理员账号..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "✓ 登录成功" -ForegroundColor Green

# 2. 保存火山引擎 TTS 配置
Write-Host "`n2. 保存火山引擎 TTS 配置..." -ForegroundColor Yellow
$ttsConfig = @{
    provider = "volcengine"
    volcengine = @{
        appId = "2128862431"
        apiKey = "eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq"
        voiceType = "BV001_streaming"
        cluster = "volcano_tts"
        endpoint = "https://openspeech.bytedance.com/api/v1/tts"
    }
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$saveResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/tts-config" -Method Post -Body $ttsConfig -Headers $headers
Write-Host "✓ 配置保存成功" -ForegroundColor Green

# 3. 测试火山引擎 TTS
Write-Host "`n3. 测试火山引擎 TTS..." -ForegroundColor Yellow
$testBody = @{
    provider = "volcengine"
    text = "Hello, this is a test."
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/test-tts" -Method Post -Body $testBody -Headers $headers
    
    if ($testResponse.success) {
        Write-Host "✓ 测试成功!" -ForegroundColor Green
        Write-Host "  消息: $($testResponse.message)" -ForegroundColor Green
        if ($testResponse.data) {
            Write-Host "  数据: $($testResponse.data | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ 测试失败" -ForegroundColor Red
        Write-Host "  消息: $($testResponse.message)" -ForegroundColor Red
        if ($testResponse.details) {
            Write-Host "  详情: $($testResponse.details | ConvertTo-Json)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ 请求失败" -ForegroundColor Red
    Write-Host "  错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
