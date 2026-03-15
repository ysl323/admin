# 使用 tar + base64 上传
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 1. 备份
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 1. 备份 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime"
Write-Host "备份完成"

# 2. 压缩本地 dist 目录为 tar
Write-Host "`n=== 2. 压缩 ===" -ForegroundColor Cyan
cd e:/demo/my1/my1/frontend
$tarFile = "dist.tar"
if (Test-Path $tarFile) { Remove-Item $tarFile }
# 使用 7zip 如果可用，否则用 tar
$7zip = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $7zip) {
    & $7zip a -tzip $tarFile dist\* 
    Write-Host "使用 7zip 压缩"
} else {
    # 尝试用 PowerShell 压缩
    Compress-Archive -Path dist\* -DestinationPath $tarFile -Force
}
Write-Host "压缩完成: $tarFile"
Remove-SSHSession -SessionId $sshSession.SessionId

# 3. 上传
Write-Host "`n=== 3. 上传 ===" -ForegroundColor Cyan
$uploadScript = @"
`$session = New-Object Renci.SshNet.SshClient('47.97.185.117', 'root', 'Admin88868')
`$session.Connect()
`$stream = `$session.CreateShellStream('xterm', 80, 24, 800, 600, 1024)
Start-Sleep -Seconds 2
`$stream.WriteLine('scp -o StrictHostKeyChecking=no e:\demo\my1\my1\frontend\$tarFile root@47.97.185.117:/root/english-learning/frontend/')
Start-Sleep -Seconds 5
`$stream.WriteLine('exit')
`$session.Disconnect()
"@
# 由于上传复杂，直接用 scp 命令
$uploadCmd = "scp -o StrictHostKeyChecking=no -o ConnectTimeout=60 `"e:\demo\my1\my1\frontend\$tarFile`" `"root@47.97.185.117:/root/english-learning/frontend/`""
Write-Host "开始上传..."
Write-Host $uploadCmd

# 4. 简化：尝试直接执行 scp
Write-Host "请手动运行以下命令上传文件："
Write-Host "scp -o StrictHostKeyChecking=no `"e:\demo\my1\my1\frontend\$tarFile`" `"root@47.97.185.117:/root/english-learning/frontend/`""
Write-Host ""
Write-Host "或者，我尝试另一种方式..."

