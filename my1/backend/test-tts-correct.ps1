# 使用正确配置的 TTS API 测试脚本
# Token 认证方式

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "火山引擎 TTS API 测试（Token 认证）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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

# 保存正确的配置（Token 认证）
Write-Host "2. 保存正确的配置（Token 认证）..." -ForegroundColor Yellow
$configBody = @'
{
  "provider": "volcengine",
  "config": {
    "appId": "2128862431",
    "apiKey": "eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq",
    "endpoint": "https://openspeech.bytedance.com/api/v1/tts",
    "voiceType": "BV001_streaming",
    "language": "zh-CN",
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
    Write-Host "      Access Token: $($getResponse.config.volcengine.apiKey)" -ForegroundColor Gray
    Write-Host "      Mode: $($getResponse.config.volcengine.mode)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ 配置获取失败" -ForegroundColor Red
}

Write-Host ""

# 测试 TTS（中文）
Write-Host "4. 测试 TTS（中文）..." -ForegroundColor Yellow
$testBody = '{"provider":"volcengine","text":"你好，这是一个测试。"}'

try {
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/test-tts" -Method POST -Body $testBody -ContentType "application/json" -WebSession $session
    
    if ($testResponse.success) {
        Write-Host "   ✅ TTS 测试成功（中文）" -ForegroundColor Green
        Write-Host "      消息: $($testResponse.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ TTS 测试失败: $($testResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ TTS 测试失败: $_" -ForegroundColor Red
}

Write-Host ""

# 测试 TTS（英文）
Write-Host "5. 测试 TTS（英文）..." -ForegroundColor Yellow
$testBody2 = '{"provider":"volcengine","text":"Hello, this is a test."}'

try {
    $testResponse2 = Invoke-RestMethod -Uri "$baseUrl/api/admin/test-tts" -Method POST -Body $testBody2 -ContentType "application/json" -WebSession $session
    
    if ($testResponse2.success) {
        Write-Host "   ✅ TTS 测试成功（英文）" -ForegroundColor Green
        Write-Host "      消息: $($testResponse2.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ TTS 测试失败: $($testResponse2.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ TTS 测试失败: $_" -ForegroundColor Red
}

Write-Host ""

# 测试复杂模式
Write-Host "6. 保存配置（复杂模式）..." -ForegroundColor Yellow
$configBodyAdvanced = @'
{
  "provider": "volcengine",
  "config": {
    "appId": "2128862431",
    "apiKey": "eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq",
    "endpoint": "https://openspeech.bytedance.com/api/v1/tts",
    "voiceType": "BV002_streaming",
    "language": "zh-CN",
    "mode": "advanced"
  }
}
'@

$saveResponse2 = Invoke-RestMethod -Uri "$baseUrl/api/admin/config/tts" -Method PUT -Body $configBodyAdvanced -ContentType "application/json" -WebSession $session

if ($saveResponse2.success) {
    Write-Host "   ✅ 配置保存成功（复杂模式）" -ForegroundColor Green
} else {
    Write-Host "   ❌ 配置保存失败" -ForegroundColor Red
}

Write-Host ""

# 测试复杂模式的 TTS
Write-Host "7. 测试 TTS（复杂模式）..." -ForegroundColor Yellow
$testBody3 = '{"provider":"volcengine","text":"测试复杂模式"}'

try {
    $testResponse3 = Invoke-RestMethod -Uri "$baseUrl/api/admin/test-tts" -Method POST -Body $testBody3 -ContentType "application/json" -WebSession $session
    
    if ($testResponse3.success) {
        Write-Host "   ✅ TTS 测试成功（复杂模式）" -ForegroundColor Green
        Write-Host "      消息: $($testResponse3.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ TTS 测试失败: $($testResponse3.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ TTS 测试失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "配置信息：" -ForegroundColor Yellow
Write-Host "  AppID: 2128862431" -ForegroundColor Gray
Write-Host "  Access Token: eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq" -ForegroundColor Gray
Write-Host "  认证方式: Token 认证（不需要 Secret Key）" -ForegroundColor Gray
Write-Host ""
