# TTS API 测试脚本
# 用于测试火山引擎 TTS 配置和测试接口

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TTS API 测试脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试配置
$baseUrl = "http://localhost:3000"
$username = "admin"
$password = "admin123"

# 步骤 1: 登录获取 Cookie
Write-Host "步骤 1: 登录管理员账号..." -ForegroundColor Yellow
$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    if ($loginData.success) {
        Write-Host "✅ 登录成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 登录失败: $($loginData.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 登录请求失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 2: 保存火山引擎配置（简单模式）
Write-Host "步骤 2: 保存火山引擎 TTS 配置（简单模式）..." -ForegroundColor Yellow
$configBody = @{
    provider = "volcengine"
    config = @{
        appId = "8594935941"
        apiKey = "sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL"
        apiSecret = "hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR"
        endpoint = "https://openspeech.bytedance.com/api/v1/tts"
        voiceType = "BV700_streaming"
        language = "en-US"
        mode = "simple"
    }
} | ConvertTo-Json -Depth 10

try {
    $saveResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/config/tts" `
        -Method PUT `
        -Body $configBody `
        -ContentType "application/json" `
        -WebSession $session
    
    $saveData = $saveResponse.Content | ConvertFrom-Json
    if ($saveData.success) {
        Write-Host "✅ 配置保存成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 配置保存失败: $($saveData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 保存配置请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 3: 获取配置（验证保存）
Write-Host "步骤 3: 获取 TTS 配置（验证保存）..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/config/tts" `
        -Method GET `
        -WebSession $session
    
    $getData = $getResponse.Content | ConvertFrom-Json
    if ($getData.success) {
        Write-Host "✅ 配置获取成功" -ForegroundColor Green
        Write-Host "   - AppID: $($getData.config.volcengine.appId)" -ForegroundColor Gray
        Write-Host "   - Access Token: $($getData.config.volcengine.apiKey)" -ForegroundColor Gray
        Write-Host "   - Secret Key: $($getData.config.volcengine.apiSecret)" -ForegroundColor Gray
        Write-Host "   - Mode: $($getData.config.volcengine.mode)" -ForegroundColor Gray
    } else {
        Write-Host "❌ 配置获取失败: $($getData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 获取配置请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 4: 测试火山引擎 TTS（简单模式）
Write-Host "步骤 4: 测试火山引擎 TTS（简单模式）..." -ForegroundColor Yellow
$testBody = @{
    provider = "volcengine"
    text = "Hello, this is a test."
} | ConvertTo-Json

try {
    $testResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/test-tts" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -WebSession $session
    
    $testData = $testResponse.Content | ConvertFrom-Json
    if ($testData.success) {
        Write-Host "✅ TTS 测试成功" -ForegroundColor Green
        Write-Host "   - 消息: $($testData.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ TTS 测试失败: $($testData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ TTS 测试请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 5: 保存火山引擎配置（复杂模式）
Write-Host "步骤 5: 保存火山引擎 TTS 配置（复杂模式）..." -ForegroundColor Yellow
$configBodyAdvanced = @{
    provider = "volcengine"
    config = @{
        appId = "8594935941"
        apiKey = "sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL"
        apiSecret = "hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR"
        endpoint = "https://openspeech.bytedance.com/api/v1/tts"
        voiceType = "BV701_streaming"
        language = "en-US"
        mode = "advanced"
    }
} | ConvertTo-Json -Depth 10

try {
    $saveResponse2 = Invoke-WebRequest -Uri "$baseUrl/api/admin/config/tts" `
        -Method PUT `
        -Body $configBodyAdvanced `
        -ContentType "application/json" `
        -WebSession $session
    
    $saveData2 = $saveResponse2.Content | ConvertFrom-Json
    if ($saveData2.success) {
        Write-Host "✅ 配置保存成功（复杂模式）" -ForegroundColor Green
    } else {
        Write-Host "❌ 配置保存失败: $($saveData2.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 保存配置请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 6: 测试火山引擎 TTS（复杂模式）
Write-Host "步骤 6: 测试火山引擎 TTS（复杂模式）..." -ForegroundColor Yellow
$testBody2 = @{
    provider = "volcengine"
    text = "Excuse me!"
} | ConvertTo-Json

try {
    $testResponse2 = Invoke-WebRequest -Uri "$baseUrl/api/admin/test-tts" `
        -Method POST `
        -Body $testBody2 `
        -ContentType "application/json" `
        -WebSession $session
    
    $testData2 = $testResponse2.Content | ConvertFrom-Json
    if ($testData2.success) {
        Write-Host "✅ TTS 测试成功（复杂模式）" -ForegroundColor Green
        Write-Host "   - 消息: $($testData2.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ TTS 测试失败: $($testData2.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ TTS 测试请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 7: 测试错误配置
Write-Host "步骤 7: 测试错误配置（验证错误提示）..." -ForegroundColor Yellow
$configBodyWrong = @{
    provider = "volcengine"
    config = @{
        appId = "8594935941"
        apiKey = "wrong_token_12345"
        apiSecret = "wrong_secret_12345"
        endpoint = "https://openspeech.bytedance.com/api/v1/tts"
        voiceType = "BV700_streaming"
        language = "en-US"
        mode = "simple"
    }
} | ConvertTo-Json -Depth 10

try {
    $saveResponse3 = Invoke-WebRequest -Uri "$baseUrl/api/admin/config/tts" `
        -Method PUT `
        -Body $configBodyWrong `
        -ContentType "application/json" `
        -WebSession $session
    
    $saveData3 = $saveResponse3.Content | ConvertFrom-Json
    if ($saveData3.success) {
        Write-Host "✅ 错误配置保存成功（预期行为）" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ 保存配置请求失败: $_" -ForegroundColor Red
}

$testBody3 = @{
    provider = "volcengine"
    text = "Test"
} | ConvertTo-Json

try {
    $testResponse3 = Invoke-WebRequest -Uri "$baseUrl/api/admin/test-tts" `
        -Method POST `
        -Body $testBody3 `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $testData3 = $testResponse3.Content | ConvertFrom-Json
    if ($testData3.success) {
        Write-Host "❌ 错误配置测试成功（不应该成功）" -ForegroundColor Red
    } else {
        Write-Host "✅ 错误配置测试失败（预期行为）" -ForegroundColor Green
        Write-Host "   - 错误消息: $($testData3.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✅ 错误配置测试失败（预期行为）" -ForegroundColor Green
    Write-Host "   - 异常: $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请检查以上测试结果，确保所有功能正常。" -ForegroundColor Yellow
Write-Host ""
