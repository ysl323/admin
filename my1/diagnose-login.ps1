# 登录问题诊断脚本

Write-Host "=== 登录问题诊断 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 测试健康检查
Write-Host "1. 测试健康检查..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://47.97.185.117/health" -Method Get
    Write-Host "✅ 健康检查成功" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json)
}
catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
}

Write-Host ""

# 2. 测试登录 API
Write-Host "2. 测试登录 API..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "http://47.97.185.117/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -UseBasicParsing

    Write-Host "✅ 登录成功" -ForegroundColor Green
    Write-Host "状态码: $($loginResponse.StatusCode)"
    Write-Host "响应内容:"
    Write-Host ($loginResponse.Content | ConvertFrom-Json | ConvertTo-Json)
    
    Write-Host "`nCookies:"
    $session.Cookies.GetCookies("http://47.97.185.117") | ForEach-Object {
        Write-Host "  $($_.Name) = $($_.Value)"
    }

    # 3. 测试认证状态
    Write-Host "`n3. 测试认证状态..." -ForegroundColor Yellow
    try {
        $authResponse = Invoke-WebRequest -Uri "http://47.97.185.117/api/auth/check" `
            -Method Get `
            -WebSession $session `
            -UseBasicParsing

        Write-Host "✅ 认证检查成功" -ForegroundColor Green
        Write-Host ($authResponse.Content | ConvertFrom-Json | ConvertTo-Json)
    }
    catch {
        Write-Host "❌ 认证检查失败: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "状态码: $($_.Exception.Response.StatusCode.value__)"
        }
    }
}
catch {
    Write-Host "❌ 登录失败: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "状态码: $($_.Exception.Response.StatusCode.value__)"
    }
}

Write-Host "`n=== 诊断完成 ===" -ForegroundColor Cyan
