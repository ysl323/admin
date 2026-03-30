# 测试简化课程导入功能

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试简化课程导入功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 读取测试数据
$testDataJson = Get-Content -Path "test-upload-data.json" -Raw
$testData = $testDataJson | ConvertFrom-Json

# 准备请求体
$requestBody = @{
    data = @($testData)
    categoryName = "测试分类-新概念英语"
}
$body = $requestBody | ConvertTo-Json -Depth 10

Write-Host "发送导入请求..." -ForegroundColor Yellow
Write-Host ""

try {
    # 发送请求（不需要认证的测试）
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/import-simple-lesson" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $body `
        -SessionVariable session

    Write-Host "✅ 导入成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "导入结果：" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "❌ 导入失败！" -ForegroundColor Red
    Write-Host ""
    Write-Host "错误信息：" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
