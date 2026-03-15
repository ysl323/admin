# 测试外网登录
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://47.97.185.117/api/auth/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
    Write-Host "状态码: $($response.StatusCode)"
    Write-Host "响应: $($response.Content)"
} catch {
    Write-Host "错误: $($_.Exception.Message)"
}
