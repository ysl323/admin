# 简单登录测试

Write-Host "测试登录..." -ForegroundColor Cyan

$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://47.97.185.117/api/auth/login" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -SessionVariable websession `
    -UseBasicParsing

Write-Host "登录响应:" -ForegroundColor Green
$response.Content | ConvertFrom-Json | ConvertTo-Json

Write-Host "`nCookies:" -ForegroundColor Yellow
$websession.Cookies.GetCookies("http://47.97.185.117")

Write-Host "`n测试认证..." -ForegroundColor Cyan
$authResponse = Invoke-WebRequest -Uri "http://47.97.185.117/api/auth/check" `
    -Method Get `
    -WebSession $websession `
    -UseBasicParsing

Write-Host "认证响应:" -ForegroundColor Green
$authResponse.Content | ConvertFrom-Json | ConvertTo-Json
