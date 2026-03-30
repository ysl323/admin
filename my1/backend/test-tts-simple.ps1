# 简化的 TTS API 测试脚本

Write-Host "TTS API 测试" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# 登录
Write-Host "1. 登录..." -ForegroundColor Yellow
$loginBody = '{"username":"admin","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable session

if ($loginResponse.success) {
    Write-Host "   ✅ 登录成功" -ForegroundColor Green
} else {
    Write-Host "   ❌ 登录失败" -ForegroundColor Red
    exit
}

Write-Host ""

# 保存配置
Write-Host "2. 保存配置（简单模式）..." -ForegroundColor Yellow
$configBody = @'
{
  "provider": "volcengine",
  "config": {
    "appId": "8594935941",
    "apiKey": "sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL",
    "apiSecret": "hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR",
    "endpoint": "https://openspeech.bytedance.com/api/v1/tts",
    "voiceType": "BV700_streaming",
    "language": "en-US",
    "mode": "simple"
  }
}
'@

$saveResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/config/tts" -Method PUT -Body $configBody -ContentType "application/json" -WebSession $session

if ($saveResponse.success) {
    Write-Host "   ✅ 配置保存成功" -ForegroundColor Green
} else {
    Write-Host "   ❌ 配置保存失败: $($saveResponse.message)" -ForegroundColor Red
}

Write-Host ""

# 获取配置
Write-Host "3. 获取配置..." -ForegroundColor Yellow
$getResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/config/tts" -Method GET -WebSession $session

if ($getResponse.success) {
    Write-Host "   ✅ 配置获取成功" -ForegroundColor Green
    Write-Host "      AppID: $($getResponse.config.volcengine.appId)" -ForegroundColor Gray
    Write-Host "      Mode: $($getResponse.config.volcengine.mode)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ 配置获取失败" -ForegroundColor Red
}

Write-Host ""

# 测试 TTS
Write-Host "4. 测试 TTS..." -ForegroundColor Yellow
$testBody = '{"provider":"volcengine","text":"Hello, this is a test."}'

try {
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/test-tts" -Method POST -Body $testBody -ContentType "application/json" -WebSession $session
    
    if ($testResponse.success) {
        Write-Host "   ✅ TTS 测试成功" -ForegroundColor Green
        Write-Host "      消息: $($testResponse.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ TTS 测试失败: $($testResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ TTS 测试失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "测试完成" -ForegroundColor Cyan
