# JSON Import Test Script
Write-Host "========================================"
Write-Host "JSON Import Function Test"
Write-Host "========================================"
Write-Host ""

$baseUrl = "http://localhost:3000/api"

# Step 1: Login as admin
Write-Host "Step 1: Login as admin..."
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json; charset=utf-8" -SessionVariable session

if ($loginResponse.success) {
    Write-Host "[OK] Login successful"
} else {
    Write-Host "[FAIL] Login failed"
    exit 1
}

Write-Host ""

# Step 2: Import JSON data
Write-Host "Step 2: Import JSON data..."
$testData = @{
    category = "Test Import Category"
    lessons = @(
        @{
            lesson = 1
            words = @(
                @{ en = "import"; cn = "导入" },
                @{ en = "export"; cn = "导出" },
                @{ en = "function"; cn = "函数" }
            )
        },
        @{
            lesson = 2
            words = @(
                @{ en = "database"; cn = "数据库" },
                @{ en = "server"; cn = "服务器" },
                @{ en = "client"; cn = "客户端" }
            )
        }
    )
} | ConvertTo-Json -Depth 10

$importResponse = Invoke-RestMethod -Uri "$baseUrl/admin/import-json-direct" -Method POST -Body $testData -ContentType "application/json; charset=utf-8" -WebSession $session

if ($importResponse.success) {
    Write-Host "[OK] Import successful"
    Write-Host "  Category: $($importResponse.category)"
    Write-Host "  Category ID: $($importResponse.categoryId)"
    Write-Host "  Lessons created: $($importResponse.lessonsCreated)"
    Write-Host "  Total words: $($importResponse.totalWords)"
} else {
    Write-Host "[FAIL] Import failed: $($importResponse.message)"
}

Write-Host ""

# Step 3: Verify imported data
Write-Host "Step 3: Verify imported data..."

$categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/learning/categories" -Method GET -WebSession $session
$testCategory = $categoriesResponse.categories | Where-Object { $_.name -eq "Test Import Category" }

if ($testCategory) {
    Write-Host "[OK] Found test category, ID: $($testCategory.id)"
    
    $lessonsResponse = Invoke-RestMethod -Uri "$baseUrl/learning/categories/$($testCategory.id)/lessons" -Method GET -WebSession $session
    Write-Host "[OK] Found $($lessonsResponse.lessons.Count) lessons"
    
    if ($lessonsResponse.lessons.Count -gt 0) {
        $firstLesson = $lessonsResponse.lessons[0]
        $wordsResponse = Invoke-RestMethod -Uri "$baseUrl/learning/lessons/$($firstLesson.id)/words" -Method GET -WebSession $session
        Write-Host "[OK] First lesson has $($wordsResponse.words.Count) words"
        
        $wordList = ($wordsResponse.words | ForEach-Object { $_.english }) -join ", "
        Write-Host "  Words: $wordList"
    }
} else {
    Write-Host "[FAIL] Test category not found"
}

Write-Host ""

# Step 4: Test invalid data
Write-Host "Step 4: Test invalid data (should fail)..."
$invalidData = @{
    category = "Invalid"
    lessons = @(
        @{
            lesson = 1
            words = @(
                @{ en = "test" }
            )
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/admin/import-json-direct" -Method POST -Body $invalidData -ContentType "application/json; charset=utf-8" -WebSession $session -ErrorAction Stop
    Write-Host "[FAIL] Should reject invalid data"
} catch {
    Write-Host "[OK] Correctly rejected invalid data"
}

Write-Host ""

# Step 5: Cleanup
Write-Host "Step 5: Cleanup test data..."

$categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/learning/categories" -Method GET -WebSession $session
$testCategory = $categoriesResponse.categories | Where-Object { $_.name -eq "Test Import Category" }

if ($testCategory) {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/admin/categories/$($testCategory.id)" -Method DELETE -WebSession $session
    Write-Host "[OK] Test data cleaned up"
} else {
    Write-Host "[INFO] No test data to clean up"
}

Write-Host ""
Write-Host "========================================"
Write-Host "[OK] All tests completed!"
Write-Host "========================================"
