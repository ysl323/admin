# 测试所有修复
# PowerShell脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试所有修复" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查服务是否运行
Write-Host "检查服务状态..." -ForegroundColor Yellow
$backendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet

if (-not $backendRunning) {
    Write-Host "❌ 后端服务未运行 (端口 3000)" -ForegroundColor Red
    Write-Host "请先启动后端: cd my1/backend && npm start" -ForegroundColor Yellow
    exit 1
}

if (-not $frontendRunning) {
    Write-Host "❌ 前端服务未运行 (端口 5173)" -ForegroundColor Red
    Write-Host "请先启动前端: cd my1/frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 后端服务运行中 (端口 3000)" -ForegroundColor Green
Write-Host "✅ 前端服务运行中 (端口 5173)" -ForegroundColor Green
Write-Host ""

# 获取Token
Write-Host "1. 获取登录Token..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "✅ 登录成功，获取到Token" -ForegroundColor Green
} catch {
    Write-Host "❌ 登录失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 测试1: 课程数量显示
Write-Host "2. 测试课程数量显示..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $categoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/learning/categories" `
        -Method Get `
        -Headers $headers
    
    if ($categoriesResponse.success -and $categoriesResponse.categories) {
        $hasLessonCount = $true
        foreach ($category in $categoriesResponse.categories) {
            if (-not $category.PSObject.Properties['lessonCount']) {
                $hasLessonCount = $false
                break
            }
        }
        
        if ($hasLessonCount) {
            Write-Host "✅ 所有分类都包含 lessonCount 字段" -ForegroundColor Green
            Write-Host "   分类数量: $($categoriesResponse.categories.Count)" -ForegroundColor Gray
            foreach ($category in $categoriesResponse.categories) {
                Write-Host "   - $($category.name): $($category.lessonCount) 个课程" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ 部分分类缺少 lessonCount 字段" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ API返回数据格式错误" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 测试2: TTS播放
Write-Host "3. 测试TTS播放..." -ForegroundColor Yellow
try {
    $ttsBody = @{
        text = "Hello"
    } | ConvertTo-Json
    
    $ttsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/tts/speak" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $ttsBody
    
    if ($ttsResponse.StatusCode -eq 200) {
        $audioSize = $ttsResponse.Content.Length
        Write-Host "✅ TTS API调用成功" -ForegroundColor Green
        Write-Host "   音频大小: $audioSize bytes" -ForegroundColor Gray
        Write-Host "   内容类型: $($ttsResponse.Headers['Content-Type'])" -ForegroundColor Gray
        
        if ($audioSize -gt 0) {
            Write-Host "✅ 成功获取音频数据" -ForegroundColor Green
        } else {
            Write-Host "❌ 音频数据为空" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ TTS API返回错误状态码: $($ttsResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 测试3: 后台管理API
Write-Host "4. 测试后台管理API..." -ForegroundColor Yellow
try {
    # 测试获取分类
    $adminCategoriesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/categories" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ 获取分类API成功" -ForegroundColor Green
    Write-Host "   分类数量: $($adminCategoriesResponse.categories.Count)" -ForegroundColor Gray
    
    # 测试获取课程
    $adminLessonsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/lessons" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ 获取课程API成功" -ForegroundColor Green
    Write-Host "   课程数量: $($adminLessonsResponse.lessons.Count)" -ForegroundColor Gray
    
    # 测试获取单词
    $adminWordsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/words" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ 获取单词API成功" -ForegroundColor Green
    Write-Host "   单词数量: $($adminWordsResponse.words.Count)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ 测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 总结
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "1. 打开浏览器访问: http://localhost:5173" -ForegroundColor Gray
Write-Host "2. 登录系统（admin / admin123）" -ForegroundColor Gray
Write-Host "3. 测试前端功能" -ForegroundColor Gray
Write-Host ""
Write-Host "详细测试指南请查看: QUICK-TEST-GUIDE.md" -ForegroundColor Gray
Write-Host ""
