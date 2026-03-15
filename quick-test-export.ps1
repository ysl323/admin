# 快速测试导出功能
$Server = "http://47.97.185.117"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试导出功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 登录
Write-Host "`n[1/3] 登录系统..." -ForegroundColor Yellow

$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$Server/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"

    if ($loginResponse.success) {
        $token = $loginResponse.token
        Write-Host "✓ 登录成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 登录失败: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. 测试导出所有数据
Write-Host "`n[2/3] 测试导出所有数据..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    $exportResponse = Invoke-RestMethod -Uri "$Server/api/admin/export/all" -Method GET -Headers $headers

    if ($exportResponse.success) {
        Write-Host "✓ 导出成功" -ForegroundColor Green

        $stats = $exportResponse.stats
        Write-Host "  - 分类数量: $($stats.categories)" -ForegroundColor White
        Write-Host "  - 课程数量: $($stats.lessons)" -ForegroundColor White
        Write-Host "  - 单词数量: $($stats.words)" -ForegroundColor White

        # 保存到文件
        $filename = "export-data-$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $exportResponse | ConvertTo-Json -Depth 10 | Out-File -FilePath $filename -Encoding UTF8
        Write-Host "  ✓ 数据已保存到: $filename" -ForegroundColor Green
    } else {
        Write-Host "✗ 导出失败: $($exportResponse.message)" -ForegroundColor Red
    }
} catch {
    $errorMsg = $_.Exception.Message
    if ($errorMsg -match "404") {
        Write-Host "✗ 导出API不存在 (404)" -ForegroundColor Red
        Write-Host "  后端代码可能还未部署，需要更新服务器" -ForegroundColor Yellow
    } else {
        Write-Host "✗ 导出失败: $errorMsg" -ForegroundColor Red
    }
}

# 3. 测试前端导出按钮
Write-Host "`n[3/3] 检查前端..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "$Server/admin" -Method GET
    $content = $frontendResponse.Content

    if ($content -match "一键导出课程") {
        Write-Host "✓ 前端包含导出按钮" -ForegroundColor Green
    } else {
        Write-Host "✗ 前端未包含导出按钮" -ForegroundColor Red
        Write-Host "  前端代码可能还未部署" -ForegroundColor Yellow
    }
} catch {
    Write-Host "! 无法检查前端: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
