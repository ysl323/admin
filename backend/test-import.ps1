# JSON 批量导入功能测试脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JSON 批量导入功能测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# 步骤 1: 登录管理员账号
Write-Host "步骤 1: 登录管理员账号..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -UseBasicParsing
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    if ($loginData.success) {
        Write-Host "✅ 登录成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 登录失败: $($loginData.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 登录错误: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 2: 测试直接 JSON 导入
Write-Host "步骤 2: 测试直接 JSON 导入..." -ForegroundColor Yellow
$testData = Get-Content "test-data.json" -Raw

try {
    $importResponse = Invoke-WebRequest -Uri "$baseUrl/admin/import-json-direct" `
        -Method POST `
        -Body $testData `
        -ContentType "application/json" `
        -WebSession $session `
        -UseBasicParsing
    
    $importData = $importResponse.Content | ConvertFrom-Json
    if ($importData.success) {
        Write-Host "✅ 导入成功!" -ForegroundColor Green
        Write-Host "   分类: $($importData.category)" -ForegroundColor Gray
        Write-Host "   分类ID: $($importData.categoryId)" -ForegroundColor Gray
        Write-Host "   创建课程数: $($importData.lessonsCreated)" -ForegroundColor Gray
        Write-Host "   总单词数: $($importData.totalWords)" -ForegroundColor Gray
    } else {
        Write-Host "❌ 导入失败: $($importData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 导入错误: $_" -ForegroundColor Red
    Write-Host "响应内容: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host ""

# 步骤 3: 验证导入的数据
Write-Host "步骤 3: 验证导入的数据..." -ForegroundColor Yellow

try {
    # 获取所有分类
    $categoriesResponse = Invoke-WebRequest -Uri "$baseUrl/categories" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing
    
    $categoriesData = $categoriesResponse.Content | ConvertFrom-Json
    $testCategory = $categoriesData.categories | Where-Object { $_.name -eq "测试导入分类" }
    
    if ($testCategory) {
        Write-Host "✅ 找到测试分类, ID: $($testCategory.id)" -ForegroundColor Green
        
        # 获取该分类的课程
        $lessonsResponse = Invoke-WebRequest -Uri "$baseUrl/categories/$($testCategory.id)/lessons" `
            -Method GET `
            -WebSession $session `
            -UseBasicParsing
        
        $lessonsData = $lessonsResponse.Content | ConvertFrom-Json
        Write-Host "✅ 找到 $($lessonsData.lessons.Count) 个课程" -ForegroundColor Green
        
        # 获取第一个课程的单词
        if ($lessonsData.lessons.Count -gt 0) {
            $firstLesson = $lessonsData.lessons[0]
            $wordsResponse = Invoke-WebRequest -Uri "$baseUrl/lessons/$($firstLesson.id)/words" `
                -Method GET `
                -WebSession $session `
                -UseBasicParsing
            
            $wordsData = $wordsResponse.Content | ConvertFrom-Json
            Write-Host "✅ 第一个课程有 $($wordsData.words.Count) 个单词" -ForegroundColor Green
            
            $wordList = ($wordsData.words | ForEach-Object { $_.english }) -join ", "
            Write-Host "   单词列表: $wordList" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ 未找到测试分类" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 验证错误: $_" -ForegroundColor Red
}

Write-Host ""

# 步骤 4: 测试无效数据（应该失败）
Write-Host "步骤 4: 测试无效数据导入（应该失败）..." -ForegroundColor Yellow
$invalidData = @{
    category = "无效分类"
    lessons = @(
        @{
            lesson = 1
            words = @(
                @{ en = "test" }  # 缺少 cn 字段
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $invalidResponse = Invoke-WebRequest -Uri "$baseUrl/admin/import-json-direct" `
        -Method POST `
        -Body $invalidData `
        -ContentType "application/json" `
        -WebSession $session `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "❌ 测试失败: 应该拒绝无效数据" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ 正确拒绝了无效数据" -ForegroundColor Green
        $errorContent = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   错误信息: $($errorContent.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ 意外错误: $_" -ForegroundColor Red
    }
}

Write-Host ""

# 步骤 5: 清理测试数据
Write-Host "步骤 5: 清理测试数据..." -ForegroundColor Yellow

try {
    $categoriesResponse = Invoke-WebRequest -Uri "$baseUrl/categories" `
        -Method GET `
        -WebSession $session `
        -UseBasicParsing
    
    $categoriesData = $categoriesResponse.Content | ConvertFrom-Json
    $testCategory = $categoriesData.categories | Where-Object { $_.name -eq "测试导入分类" }
    
    if ($testCategory) {
        $deleteResponse = Invoke-WebRequest -Uri "$baseUrl/admin/categories/$($testCategory.id)" `
            -Method DELETE `
            -WebSession $session `
            -UseBasicParsing
        
        Write-Host "✅ 测试数据已清理" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  没有需要清理的测试数据" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 清理错误: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 所有测试完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
