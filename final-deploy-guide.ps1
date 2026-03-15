# 导出功能部署指南

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "导出功能部署指南" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "问题:" -ForegroundColor Red
Write-Host "  - 后台上传课程失败" -ForegroundColor Gray
Write-Host "  - 没有'一键导出课程'按钮" -ForegroundColor Gray
Write-Host ""

Write-Host "解决方法:" -ForegroundColor Green
Write-Host "  需要手动上传文件到服务器" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署步骤 (使用 WinSCP)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "步骤 1: 下载并安装 WinSCP" -ForegroundColor Yellow
Write-Host "  https://winscp.net/eng/download.php" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤 2: 连接到服务器" -ForegroundColor Yellow
Write-Host "  协议: SFTP" -ForegroundColor Gray
Write-Host "  主机: 47.97.185.117" -ForegroundColor Gray
Write-Host "  端口: 22" -ForegroundColor Gray
Write-Host "  用户名: root" -ForegroundColor Gray
Write-Host "  密码: MyEnglish2025!" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤 3: 上传前端文件" -ForegroundColor Yellow
Write-Host "  从: e:\demo\my1\my1\frontend\dist\*" -ForegroundColor Gray
Write-Host "  到: /var/www/html/learning/" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤 4: 上传后端文件" -ForegroundColor Yellow
Write-Host "  从: e:\demo\my1\my1\backend\src\services\AdminService.js" -ForegroundColor Gray
Write-Host "  到: /root/english-learning/backend/src/services/AdminService.js" -ForegroundColor Gray
Write-Host ""
Write-Host "  从: e:\demo\my1\my1\backend\src\routes\admin.js" -ForegroundColor Gray
Write-Host "  到: /root/english-learning/backend/src/routes/admin.js" -ForegroundColor Gray
Write-Host ""

Write-Host "步骤 5: 重启服务" -ForegroundColor Yellow
Write-Host "  在 WinSCP 中按 Ctrl+P 打开终端" -ForegroundColor Gray
Write-Host "  然后执行以下命令:" -ForegroundColor Gray
Write-Host ""
Write-Host "    cd /root/english-learning/backend" -ForegroundColor White
Write-Host "    pm2 restart english-learning-backend" -ForegroundColor Green
Write-Host "    pm2 status" -ForegroundColor Gray
Write-Host "    pm2 logs english-learning-backend --lines 20" -ForegroundColor Gray
Write-Host "    rm -rf /var/cache/nginx/*" -ForegroundColor Gray
Write-Host "    systemctl reload nginx" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "验证部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. 访问: http://47.97.185.117/admin" -ForegroundColor White
Write-Host "2. 登录后进入'内容管理'" -ForegroundColor White
Write-Host "3. 检查是否有'一键导出课程'按钮" -ForegroundColor White
Write-Host "4. 测试导出功能" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "常见问题" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Q: 上传后看不到按钮?" -ForegroundColor Yellow
Write-Host "A: 清除浏览器缓存 (Ctrl + F5)" -ForegroundColor Gray
Write-Host ""

Write-Host "Q: 导出按钮点击没反应?" -ForegroundColor Yellow
Write-Host "A: 按 F12 打开浏览器控制台,查看错误信息" -ForegroundColor Gray
Write-Host ""

Write-Host "Q: PM2 重启失败?" -ForegroundColor Yellow
Write-Host "A: 执行以下命令:" -ForegroundColor Gray
Write-Host "   pm2 stop english-learning-backend" -ForegroundColor Gray
Write-Host "   pm2 delete english-learning-backend" -ForegroundColor Gray
Write-Host "   cd /root/english-learning/backend" -ForegroundColor Gray
Write-Host "   pm2 start index.js --name english-learning-backend" -ForegroundColor Gray
Write-Host "   pm2 save" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "详细文档" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "更多详细信息请查看:" -ForegroundColor Yellow
Write-Host "  e:\demo\my1\手动部署指南-导出功能.md" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "准备就绪" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Files = @(
    "e:\demo\my1\my1\frontend\dist\index.html",
    "e:\demo\my1\my1\backend\src\services\AdminService.js",
    "e:\demo\my1\my1\backend\src\routes\admin.js"
)

$AllReady = $true
foreach ($file in $Files) {
    if (Test-Path $file) {
        $size = [math]::Round((Get-Item $file).Length / 1KB, 2)
        Write-Host "  [OK] $file ($size KB)" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $AllReady = $false
    }
}

Write-Host ""
if ($AllReady) {
    Write-Host "所有文件已准备就绪,可以开始部署!" -ForegroundColor Green
} else {
    Write-Host "部分文件缺失,请先执行: build.bat" -ForegroundColor Red
}
