# SSH 自动登录配置脚本

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

# 安装 Posh-SSH 模块（如果未安装）
if (!(Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "正在安装 Posh-SSH 模块..."
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser
}

Import-Module Posh-SSH

# 创建 SSH 会话
$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "SSH 配置完成，可以使用以下方式连接:"
Write-Host "`$session = New-SSHSession -ComputerName $serverIP -Credential `$credential"
Write-Host "Invoke-SSHCommand -SessionId `$session.SessionId -Command 'your command'"

# 导出变量供其他脚本使用
$global:ServerIP = $serverIP
$global:ServerCredential = $credential

Write-Host "`n全局变量已设置:"
Write-Host "  `$global:ServerIP = $serverIP"
Write-Host "  `$global:ServerCredential = [已设置]"
