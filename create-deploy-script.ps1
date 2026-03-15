# 读取本地文件内容并编码为 Base64
$AdminServiceJS = Get-Content "e:\demo\my1\my1\backend\src\services\AdminService.js" -Raw -Encoding UTF8
$AdminRoutesJS = Get-Content "e:\demo\my1\my1\backend\src\routes\admin.js" -Raw -Encoding UTF8

# 转换为 Base64
$AdminServiceBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($AdminServiceJS))
$AdminRoutesBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($AdminRoutesJS))

# 创建部署脚本
$DeployScript = @"
# 在服务器上执行此脚本
cd /root/english-learning/backend

# 备份旧文件
cp src/services/AdminService.js src/services/AdminService.js.backup
cp src/routes/admin.js src/routes/admin.js.backup

# 写入 AdminService.js
echo '$AdminServiceBase64' | base64 -d > src/services/AdminService.js

# 写入 admin.js
echo '$AdminRoutesBase64' | base64 -d > src/routes/admin.js

# 检查文件大小
ls -lh src/services/AdminService.js
ls -lh src/routes/admin.js

# 重启服务
pm2 restart english-learning-backend

# 检查状态
pm2 status
pm2 logs english-learning-backend --lines 30

echo "部署完成!"
"@

# 保存脚本
$DeployScript | Out-File -FilePath "e:\demo\my1\server-deploy-script.sh" -Encoding UTF8

Write-Host "部署脚本已创建: e:\demo\my1\server-deploy-script.sh" -ForegroundColor Green
Write-Host ""
Write-Host "请按以下步骤操作:" -ForegroundColor Cyan
Write-Host "1. 使用 FileZilla 或 WinSCP 连接到 47.97.185.117" -ForegroundColor White
Write-Host "2. 上传 e:\demo\my1\server-deploy-script.sh 到服务器的 /tmp/ 目录" -ForegroundColor White
Write-Host "3. 上传 e:\demo\my1\my1\frontend\dist\* 到 /var/www/html/learning/" -ForegroundColor White
Write-Host "4. SSH 连接到服务器: ssh root@47.97.185.117" -ForegroundColor White
Write-Host "5. 执行: bash /tmp/server-deploy-script.sh" -ForegroundColor Yellow
