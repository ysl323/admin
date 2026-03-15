# 部署前端到服务器
Import-Module Posh-SSH
Import-Module Glob

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 1. 备份当前代码
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 1. 备份当前代码 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime && echo 'Backup done'"
Write-Host $result.Output

# 2. 上传 index.html
Write-Host "`n=== 2. 上传 index.html ===" -ForegroundColor Cyan
$result2 = Invoke-SCPFile -SessionId $sshSession.SessionId -LocalFile "e:\demo\my1\my1\frontend\dist\index.html" -RemotePath "/root/english-learning/frontend/dist/index.html" -Force
Write-Host "index.html 上传完成"

# 3. 上传所有 assets 文件
Write-Host "`n=== 3. 上传 assets 文件 ===" -ForegroundColor Cyan
$assetsPath = "e:\demo\my1\my1\frontend\dist\assets\*"
$files = Get-ChildItem -Path "e:\demo\my1\my1\frontend\dist\assets" -File

foreach ($file in $files) {
    $remotePath = "/root/english-learning/frontend/dist/assets/" + $file.Name
    Invoke-SCPFile -SessionId $sshSession.SessionId -LocalFile $file.FullName -RemotePath $remotePath -Force
    Write-Host "  已上传: $($file.Name)"
}

# 4. 验证
Write-Host "`n=== 4. 验证部署 ===" -ForegroundColor Cyan
$result3 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/ | head -15"
Write-Host $result3.Output

Remove-SSHSession -SessionId $sshSession.SessionId

Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
