$json = @"
{
  "data": [
    {"lesson": 1, "question": 1, "english": "Hello", "chinese": "你好"},
    {"lesson": 1, "question": 2, "english": "Goodbye", "chinese": "再见"}
  ],
  "categoryName": "测试分类"
}
"@

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/import-simple-lesson" -Method POST -ContentType "application/json; charset=utf-8" -Body $json
    Write-Host "成功！" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "失败：" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
