# 直接在服务器上更新代码
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 1. 备份
$backupTime = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=== 1. 备份 ===" -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cp -r /root/english-learning/frontend/dist /root/english-learning/frontend/dist-backup-$backupTime"
Write-Host "备份完成"

# 2. 删除旧文件
Write-Host "`n=== 2. 删除旧文件 ===" -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "rm -rf /root/english-learning/frontend/dist"
Write-Host "删除完成"

# 3. 创建目录
Write-Host "`n=== 3. 创建目录 ===" -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "mkdir -p /root/english-learning/frontend/dist/assets"
Write-Host "创建完成"

# 4. 上传 index.html
Write-Host "`n=== 4. 上传 index.html ===" -ForegroundColor Cyan
$content = Get-Content "e:\demo\my1\my1\frontend\dist\index.html" -Raw
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "echo '$content' > /root/english-learning/frontend/dist/index.html"
Write-Host "index.html 上传完成"

# 5. 获取文件列表
Write-Host "`n=== 5. 获取文件列表 ===" -ForegroundColor Cyan
$files = Get-ChildItem "e:\demo\my1\my1\frontend\dist\assets" -File
Write-Host "共 $($files.Count) 个文件"

# 6. 上传文件（每次传一个）
foreach ($file in $files) {
    Write-Host "上传: $($file.Name)"
    $fileContent = [Convert]::ToBase64String((Get-Content $file.FullName -Raw -AsByteStream))
    Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "echo '$fileContent' | base64 -d > /root/english-learning/frontend/dist/assets/$($file.Name)"
}

# 7. 设置权限
Write-Host "`n=== 7. 设置权限 ===" -ForegroundColor Cyan
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "chown -R www-data:www-data /root/english-learning/frontend/dist"

# 8. 验证
Write-Host "`n=== 8. 验证 ===" -ForegroundColor Cyan
$result = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "ls /root/english-learning/frontend/dist/assets/ | wc -l"
Write-Host "文件数: $($result.Output)"

Remove-SSHSession -SessionId $sshSession.SessionId

Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
