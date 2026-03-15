# 使用 zip 压缩上传
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

# 1. 本地压缩
Write-Host "=== 1. 本地压缩 dist 目录 ===" -ForegroundColor Cyan
cd e:/demo/my1/my1/frontend
if (Test-Path dist.zip) { Remove-Item dist.zip }
Compress-Archive -Path dist/* -DestinationPath dist.zip -Force
Write-Host "压缩完成: dist.zip"

# 2. 上传压缩文件
Write-Host "`n=== 2. 上传压缩文件 ===" -ForegroundColor Cyan
$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 备份
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime"

# 上传
scp -o StrictHostKeyChecking=no "e:\demo\my1\my1\frontend\dist.zip" "root@47.97.185.117:/root/english-learning/frontend/dist.zip"
Write-Host "上传完成"

# 3. 解压并清理
Write-Host "`n=== 3. 解压并清理 ===" -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cd /root/english-learning/frontend && rm -rf dist && unzip -o dist.zip && rm dist.zip"
Write-Host "解压完成"

# 4. 设置权限
Write-Host "`n=== 4. 设置权限 ===" -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "chown -R www-data:www-data /root/english-learning/frontend/dist"
Write-Host "权限设置完成"

# 5. 验证
Write-Host "`n=== 5. 验证 ===" -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls -la /root/english-learning/frontend/dist/assets/ | head -5"
Write-Host $result.Output

$result2 = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/"
Write-Host "网站状态: $($result2.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId

# 清理本地压缩文件
Remove-Item "e:\demo\my1\my1\frontend\dist.zip" -Force

Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
