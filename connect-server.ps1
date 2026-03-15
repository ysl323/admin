Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "正在连接服务器 $serverIP ..."

try {
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "连接成功！Session ID: $($session.SessionId)"
    
    # 执行命令查看PM2状态
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 list"
    Write-Host "`n=== PM2 服务状态 ==="
    Write-Host $result.Output
    
    # 执行命令查看后端日志
    Write-Host "`n=== 最近后端日志 ==="
    $logResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 logs english-learning-backend --lines 30 --nostream"
    Write-Host $logResult.Output
    
    # 断开连接
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    Write-Host "`n已断开连接"
} catch {
    Write-Host "连接失败: $_" -ForegroundColor Red
}
