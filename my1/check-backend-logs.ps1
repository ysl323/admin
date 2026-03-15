# 检查后端日志
$server = "47.97.185.117"
$username = "root"
$password = "Admin88868"

try {
    $secPassword = ConvertTo-SecureString $password -AsPlainText -Force
    $credential = New-Object System.Management.Automation.PSCredential($username, $secPassword)
    
    Write-Host "=== 查看后端日志 ===" -ForegroundColor Cyan
    $session = New-SSHSession -ComputerName $server -Credential $credential -AcceptKey
    
    Write-Host "`n最近的错误日志:" -ForegroundColor Yellow
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "pm2 logs english-learning-backend --lines 100 --nostream | grep -A 5 'error\|Error\|TTS\|decrypt'"
    Write-Host $result.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}
