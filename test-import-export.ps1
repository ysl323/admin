# 测试导入功能

# 服务器信息
$SERVER = "http://47.97.185.117"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试导入功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 测试登录
Write-Host "[1/4] 测试登录..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$SERVER/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -SessionVariable session
    Write-Host "✓ 登录成功" -ForegroundColor Green
} catch {
    Write-Host "✗ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. 测试简化导入
Write-Host "`n[2/4] 测试简化导入..." -ForegroundColor Yellow

$testData = @(
    @{
        lesson = 99
        question = 1
        english = "test1"
        chinese = "测试1"
    },
    @{
        lesson = 99
        question = 2
        english = "test2"
        chinese = "测试2"
    }
) | ConvertTo-Json

$importBody = @{
    data = $testData | ConvertFrom-Json
    categoryName = "测试导入分类"
} | ConvertTo-Json

try {
    $importResponse = Invoke-RestMethod -Uri "$SERVER/api/admin/import-simple-lesson" -Method POST -Body $importBody -ContentType "application/json" -WebSession $session
    Write-Host "✓ 导入成功" -ForegroundColor Green
    Write-Host "  分类: $($importResponse.category)" -ForegroundColor Gray
    Write-Host "  课程数: $($importResponse.lessonsCreated)" -ForegroundColor Gray
    Write-Host "  单词数: $($importResponse.totalWords)" -ForegroundColor Gray
} catch {
    Write-Host "✗ 导入失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        $errorDetails = $_.ErrorDetails | ConvertFrom-Json
        Write-Host "  错误详情: $($errorDetails.message)" -ForegroundColor Red
    }
}

# 3. 测试导出功能
Write-Host "`n[3/4] 测试导出功能..." -ForegroundColor Yellow

try {
    $exportResponse = Invoke-RestMethod -Uri "$SERVER/api/admin/export/all" -Method GET -WebSession $session
    Write-Host "✓ 导出成功" -ForegroundColor Green
    Write-Host "  分类数: $($exportResponse.stats.categories)" -ForegroundColor Gray
    Write-Host "  课程数: $($exportResponse.stats.lessons)" -ForegroundColor Gray
    Write-Host "  单词数: $($exportResponse.stats.words)" -ForegroundColor Gray
} catch {
    Write-Host "✗ 导出失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        $errorDetails = $_.ErrorDetails | ConvertFrom-Json
        Write-Host "  错误详情: $($errorDetails.message)" -ForegroundColor Red
    }
}

# 4. 清理测试数据
Write-Host "`n[4/4] 清理测试数据..." -ForegroundColor Yellow

try {
    # 获取所有分类
    $categories = Invoke-RestMethod -Uri "$SERVER/api/admin/categories" -Method GET -WebSession $session
    
    # 查找测试分类
    $testCategory = $categories.categories | Where-Object { $_.name -eq "测试导入分类" }
    
    if ($testCategory) {
        $deleteResponse = Invoke-RestMethod -Uri "$SERVER/api/admin/categories/$($testCategory.id)" -Method DELETE -WebSession $session
        Write-Host "✓ 清理完成: 已删除测试分类" -ForegroundColor Green
    } else {
        Write-Host "ℹ 未找到测试分类，无需清理" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ 清理失败: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
