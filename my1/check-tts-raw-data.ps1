# 检查服务器上 TTS 配置的原始数据
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "上传检查脚本到服务器..." -ForegroundColor Cyan
Set-SCPItem -ComputerName "47.97.185.117" -Credential $credential `
    -Path ".\my1\backend\check-tts-raw-data.js" `
    -Destination "/root/english-learning/backend/" `
    -AcceptKey -Force

Write-Host "`n连接服务器并执行检查..." -ForegroundColor Cyan
$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

$result = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning/backend && timeout 10 node check-tts-raw-data.js'

Write-Host "`n=== 检查结果 ===" -ForegroundColor Green
Write-Host $result.Output

if ($result.ExitStatus -ne 0) {
    Write-Host "`n错误输出:" -ForegroundColor Red
    Write-Host $result.Error
}

Remove-SSHSession -SessionId $session.SessionId
Write-Host "`n完成" -ForegroundColor Green
