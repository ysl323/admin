# 部署更新后的前端和后端代码

Import-Module Posh-SSH

# 服务器连接信息
$ServerIP = "47.97.185.117"
$Username = "root"
$Password = ConvertTo-SecureString "MyEnglish2025!" -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($Username, $Password)

Write-Host "连接到服务器 $ServerIP..." -ForegroundColor Green
try {
    $Session = New-SSHSession -ComputerName $ServerIP -Credential $Credential -AcceptKey

    # 1. 上传前端dist文件
    Write-Host "上传前端文件..." -ForegroundColor Yellow
    $LocalFrontend = "e:\demo\my1\my1\frontend\dist"
    Set-SCPFile -LocalFile "$LocalFrontend\index.html" -RemotePath "/var/www/html/learning/" -SessionId $Session.SessionId -Force
    Set-SCPFolder -LocalFolder "$LocalFrontend\assets" -RemotePath "/var/www/html/learning/assets/" -SessionId $Session.SessionId -Force

    # 2. 上传后端文件
    Write-Host "上传后端文件..." -ForegroundColor Yellow

    # AdminService.js
    $AdminServiceContent = Get-Content "e:\demo\my1\my1\backend\src\services\AdminService.js" -Raw -Encoding UTF8
    $AdminServiceContent | Invoke-SSHCommandStream -SessionId $Session.SessionId -Command "cat > /root/english-learning/backend/src/services/AdminService.js"

    # admin.js routes
    $AdminRoutesContent = Get-Content "e:\demo\my1\my1\backend\src\routes\admin.js" -Raw -Encoding UTF8
    $AdminRoutesContent | Invoke-SSHCommandStream -SessionId $Session.SessionId -Command "cat > /root/english-learning/backend/src/routes/admin.js"

    # 3. 重启后端服务
    Write-Host "重启后端服务..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $Session.SessionId -Command "cd /root/english-learning/backend && pm2 restart english-learning-backend"

    # 4. 检查服务状态
    Write-Host "检查服务状态..." -ForegroundColor Yellow
    $Status = Invoke-SSHCommand -SessionId $Session.SessionId -Command "pm2 status"
    Write-Host $Status.Output -ForegroundColor Cyan

    # 5. 清理Nginx缓存
    Write-Host "清理Nginx缓存..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $Session.SessionId -Command "rm -rf /var/cache/nginx/* && systemctl reload nginx"

    Write-Host "部署完成!" -ForegroundColor Green
    Write-Host "请访问 http://47.97.185.117/admin 查看管理后台" -ForegroundColor Green

    Remove-SSHSession -SessionId $Session.SessionId

} catch {
    Write-Host "部署失败: $_" -ForegroundColor Red
    if ($Session) {
        Remove-SSHSession -SessionId $Session.SessionId
    }
}
