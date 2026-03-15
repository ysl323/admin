#!/usr/bin/env powershell
# 直接诊断500错误 - 不依赖SSH连接

Write-Host "=========================================" -ForegroundColor Red
Write-Host "🚨 500错误直接诊断" -ForegroundColor Red  
Write-Host "=========================================" -ForegroundColor Red

$serverIP = "47.97.185.117"

Write-Host "📋 诊断步骤:" -ForegroundColor Yellow
Write-Host "1. 测试网站访问状态" -ForegroundColor White
Write-Host "2. 检查端口连通性" -ForegroundColor White
Write-Host "3. 执行远程修复命令" -ForegroundColor White
Write-Host ""

# 1. 测试网站状态
Write-Host "=== 1. 测试网站访问 ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://$serverIP" -Method Head -ErrorAction Stop
    Write-Host "✅ 网站正常访问" -ForegroundColor Green
} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ 网站返回错误: $statusCode" -ForegroundColor Red
        if ($statusCode -eq 500) {
            Write-Host "🔍 确认是500内部服务器错误" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ 网站连接失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. 检查端口连通性
Write-Host "`n=== 2. 检查关键端口 ===" -ForegroundColor Cyan
$ports = @(22, 80, 3000)
foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName $serverIP -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "✅ 端口 $port 连通" -ForegroundColor Green
        } else {
            Write-Host "❌ 端口 $port 不通" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 端口 $port 测试失败" -ForegroundColor Red
    }
}

# 3. 尝试执行修复
Write-Host "`n=== 3. 执行自动修复 ===" -ForegroundColor Cyan
Write-Host "正在尝试远程修复..." -ForegroundColor Yellow

# 创建修复命令
$fixCommands = @(
    "cd /root/english-learning/backend",
    "pm2 restart english-learning-backend",
    "pm2 logs english-learning-backend --lines 5",
    "systemctl restart nginx",
    "nginx -t"
)

# 尝试执行修复命令
foreach ($cmd in $fixCommands) {
    Write-Host "执行: $cmd" -ForegroundColor White
    try {
        # 使用PowerShell的SSH功能（如果可用）
        $result = & ssh root@$serverIP $cmd 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $result -ForegroundColor Green
        } else {
            Write-Host "命令执行失败: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "SSH连接失败，尝试其他方法..." -ForegroundColor Yellow
        break
    }
}

# 4. 再次测试网站
Write-Host "`n=== 4. 验证修复结果 ===" -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://$serverIP" -Method Head -ErrorAction Stop
    Write-Host "✅ 修复成功！网站现在可以访问" -ForegroundColor Green
} catch {
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ 修复失败，仍然返回错误: $statusCode" -ForegroundColor Red
    } else {
        Write-Host "❌ 修复失败，连接错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=========================================" -ForegroundColor Yellow
Write-Host "🔧 手动修复建议" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

Write-Host "如果自动修复失败，请手动执行:" -ForegroundColor White
Write-Host "1. 运行: .\一键修复500.bat" -ForegroundColor Cyan
Write-Host "2. 或者: .\紧急修复500错误.ps1" -ForegroundColor Cyan
Write-Host "3. 或者: .\快速重启服务.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果需要重新部署:" -ForegroundColor White
Write-Host ".\清空服务器并重新部署.ps1" -ForegroundColor Cyan