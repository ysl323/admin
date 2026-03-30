# 检查服务器上的加密密钥配置
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

Write-Host "连接服务器检查 .env 文件..." -ForegroundColor Cyan
$session = New-SSHSession -ComputerName "47.97.185.117" `
    -Credential $credential `
    -AcceptKey -Force

Write-Host "`n检查 ENCRYPTION_KEY..." -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning && grep ENCRYPTION_KEY .env || echo "未找到 ENCRYPTION_KEY"'

Write-Host $result.Output

Write-Host "`n检查 .env 文件内容（隐藏敏感信息）..." -ForegroundColor Cyan
$result2 = Invoke-SSHCommand -SessionId $session.SessionId `
    -Command 'cd /root/english-learning && cat .env | grep -v "PASSWORD\|SECRET\|KEY" | head -20'

Write-Host $result2.Output

Remove-SSHSession -SessionId $session.SessionId
Write-Host "`n完成" -ForegroundColor Green
