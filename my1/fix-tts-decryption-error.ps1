# 修复 TTS 解密错误 - 使用明文存储 Access Token
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "=== 修复 TTS 解密错误 ===" -ForegroundColor Cyan
Write-Host "问题: 数据库中的 Access Token 被加密了，但解密失败" -ForegroundColor Yellow
Write-Host "解决方案: 使用明文存储 Access Token（它是临时的，不需要加密）`n" -ForegroundColor Yellow

Write-Host "步骤 1: 上传修复后的 AdminService.js..." -ForegroundColor Cyan
Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
    -Path ".\my1\backend\src\services\AdminService.js" `
    -Destination "/root/english-learning/backend/src/services/" `
    -AcceptKey -Force

Write-Host "步骤 2: 上传数据库修复脚本..." -ForegroundColor Cyan
Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
    -Path ".\my1\backend\fix-tts-token-plaintext.js" `
    -Destination "/root/english-learning/backend/" `
    -AcceptKey -Force

Write-Host "`n步骤 3: 连接服务器并执行修复..." -ForegroundColor Cyan
$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

Write-Host "执行数据库修复..." -ForegroundColor Yellow
$result = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning/backend && timeout 10 node fix-tts-token-plaintext.js'

Write-Host $result.Output

if ($result.ExitStatus -eq 0) {
    Write-Host "`n步骤 4: 重启后端服务..." -ForegroundColor Cyan
    $restart = Invoke-SSHCommand -SessionId $session.SessionId `
        -Command 'pm2 restart english-learning-backend'
    
    Write-Host $restart.Output
    
    Start-Sleep -Seconds 3
    
    Write-Host "`n步骤 5: 检查服务状态..." -ForegroundColor Cyan
    $status = Invoke-SSHCommand -SessionId $session.SessionId `
        -Command 'pm2 status english-learning-backend'
    
    Write-Host $status.Output
    
    Write-Host "`n步骤 6: 检查后端日志..." -ForegroundColor Cyan
    $logs = Invoke-SSHCommand -SessionId $session.SessionId `
        -Command 'pm2 logs english-learning-backend --lines 20 --nostream'
    
    Write-Host $logs.Output
    
    Write-Host "`n=== 修复完成 ===" -ForegroundColor Green
    Write-Host "✅ AdminService.js 已更新（支持明文和加密格式）" -ForegroundColor Green
    Write-Host "✅ 数据库已更新（Access Token 使用明文存储）" -ForegroundColor Green
    Write-Host "✅ 后端服务已重启" -ForegroundColor Green
    Write-Host "`n请在浏览器中测试 TTS 功能：http://47.97.185.117" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 修复失败，请查看错误信息" -ForegroundColor Red
    Write-Host $result.Error
}

Remove-SSHSession -SessionId $session.SessionId
Write-Host "`n完成" -ForegroundColor Green
