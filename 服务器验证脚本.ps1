#!/usr/bin/env powershell
# 服务器文件完整性验证脚本

Write-Host "=========================================" -ForegroundColor Green
Write-Host "🔍 服务器文件完整性验证" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

Write-Host "📋 验证步骤:" -ForegroundColor Yellow
Write-Host "1. 检查应用目录结构" -ForegroundColor White
Write-Host "2. 验证关键文件存在" -ForegroundColor White
Write-Host "3. 检查文件大小和权限" -ForegroundColor White
Write-Host "4. 验证服务状态" -ForegroundColor White
Write-Host ""

# 创建验证命令
$commands = @(
    "echo '=== 1. 检查应用目录结构 ==='",
    "ls -la /root/english-learning/",
    "echo '=== 2. 检查后端文件 ==='",
    "ls -la /root/english-learning/backend/",
    "echo '=== 3. 检查前端文件 ==='", 
    "ls -la /root/english-learning/frontend/",
    "echo '=== 4. 检查关键文件 ==='",
    "ls -la /root/english-learning/backend/src/server.js",
    "ls -la /root/english-learning/backend/package.json",
    "ls -la /root/english-learning/frontend/index.html",
    "echo '=== 5. 检查数据库 ==='",
    "ls -la /root/english-learning/backend/database.sqlite",
    "echo '=== 6. 检查环境配置 ==='",
    "ls -la /root/english-learning/backend/.env",
    "echo '=== 7. 检查PM2服务 ==='",
    "pm2 list",
    "echo '=== 8. 检查端口监听 ==='",
    "netstat -tlnp | grep -E ':(80|443|3000)'",
    "echo '=== 9. 检查Nginx配置 ==='",
    "nginx -t",
    "echo '=== 10. 检查系统资源 ==='",
    "free -h",
    "df -h"
)

Write-Host "🚀 开始验证..." -ForegroundColor Green

# 执行验证命令
foreach ($cmd in $commands) {
    Write-Host "执行: $cmd" -ForegroundColor Cyan
    try {
        $result = ssh root@$serverIP $cmd 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $result -ForegroundColor White
        } else {
            Write-Host "❌ 命令执行失败: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 连接错误: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 建议手动执行: ssh root@$serverIP '$cmd'" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ 验证完成" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "📊 验证结果分析:" -ForegroundColor Yellow
Write-Host "- 如果看到应用目录和文件，说明部署成功" -ForegroundColor White
Write-Host "- 如果PM2显示服务运行，说明后端正常" -ForegroundColor White
Write-Host "- 如果端口3000被监听，说明API可用" -ForegroundColor White
Write-Host "- 如果Nginx配置测试通过，说明代理正常" -ForegroundColor White
Write-Host ""

Write-Host "🔧 如果发现问题，可以执行:" -ForegroundColor Yellow
Write-Host "1. .\紧急修复500错误.ps1" -ForegroundColor White
Write-Host "2. .\快速重启服务.ps1" -ForegroundColor White
Write-Host "3. .\一键修复500.bat" -ForegroundColor White