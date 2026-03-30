# Test Volcengine TTS with session authentication
$baseUrl = "http://localhost:3000"

Write-Host "=== 测试火山引擎 TTS (Session 认证) ===" -ForegroundColor Cyan

# Create a session to maintain cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. 登录获取 session
Write-Host "`n1. 登录管理员账号..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -WebSession $session
    Write-Host "✓ 登录成功" -ForegroundColor Green
} catch {
    Write-Host "✗ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. 保存火山引擎 TTS 配置
Write-Host "`n2. 保存火山引擎 TTS 配置..." -ForegroundColor Yellow
$ttsConfig = @{
    provider = "volcengine"
    config = @{
        appId = "3554335541"
        apiKey = "aMVjJULQqyM47yryVgj4411cQXWAPLi"
        apiSecret = "HLNEgAWDWNgc-NHgZw4ePZwkbU_cRLcffR"
        voiceType = "BV001_streaming"
        cluster = "volcano_tts"
        endpoint = "https://openspeech.bytedance.com/tts_middle_layer/tts"
    }
} | ConvertTo-Json -Depth 10

try {
    $saveResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/config/tts" -Method Put -Body $ttsConfig -ContentType "application/json" -WebSession $session
    Write-Host "✓ 配置保存成功" -ForegroundColor Green
} catch {
    Write-Host "✗ 保存配置失败: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. 测试火山引擎 TTS
Write-Host "`n3. 测试火山引擎 TTS..." -ForegroundColor Yellow
$testBody = @{
    provider = "volcengine"
    text = "Hello, this is a test."
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/test-tts" -Method Post -Body $testBody -ContentType "application/json" -WebSession $session
    
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
        if ($testResponse.code) {
            Write-Host "  错误代码: $($testResponse.code)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ 请求失败" -ForegroundColor Red
    Write-Host "  错误: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  详情: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Cyan
