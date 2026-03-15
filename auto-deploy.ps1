# 自动部署脚本 - 使用 SSH 连接并执行命令

$Server = "47.97.185.117"
$User = "root"
$Password = "MyEnglish2025!"

# 检查 SSH 是否可用
$SSHPath = Get-Command ssh -ErrorAction SilentlyContinue
if (-not $SSHPath) {
    Write-Host "SSH 客户端不可用" -ForegroundColor Red
    Write-Host "请安装 Windows OpenSSH 客户端" -ForegroundColor Yellow
    exit 1
}

Write-Host "SSH 客户端可用: $($SSHPath.Source)" -ForegroundColor Green

# 创建一个临时的 SSH 脚本文件
$LocalAdminServiceJS = "e:\demo\my1\my1\backend\src\services\AdminService.js"
$LocalAdminRoutesJS = "e:\demo\my1\my1\backend\src\routes\admin.js"

# 读取文件内容
$AdminServiceContent = Get-Content $LocalAdminServiceJS -Raw -Encoding UTF8
$AdminRoutesContent = Get-Content $LocalAdminRoutesJS -Raw -Encoding UTF8

# 创建 Python 脚本来写入文件
$PythonScript = @"
import os
import sys

# AdminService.js
admin_service_content = '''$AdminServiceContent'''

# admin.js
admin_routes_content = '''$AdminRoutesContent'''

# 写入文件
with open('/tmp/AdminService.js', 'w', encoding='utf-8') as f:
    f.write(admin_service_content)

with open('/tmp/admin.js', 'w', encoding='utf-8') as f:
    f.write(admin_routes_content)

print("Files written successfully")
"@

# 保存 Python 脚本
$PythonScript | Out-File -FilePath "e:\demo\my1\write-files.py" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "手动部署指南" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "由于 SSH 认证需要交互式输入,请按以下步骤手动操作:" -ForegroundColor Yellow
Write-Host ""
Write-Host "步骤 1: 使用 FileZilla 或 WinSCP 上传前端文件" -ForegroundColor White
Write-Host "  连接信息:" -ForegroundColor Gray
Write-Host "    主机: $Server" -ForegroundColor Gray
Write-Host "    用户: $User" -ForegroundColor Gray
Write-Host "    密码: $Password" -ForegroundColor Gray
Write-Host "  上传:" -ForegroundColor Gray
Write-Host "    e:\demo\my1\my1\frontend\dist\index.html -> /var/www/html/learning/" -ForegroundColor Gray
Write-Host "    e:\demo\my1\my1\frontend\dist\assets\* -> /var/www/html/learning/assets/" -ForegroundColor Gray
Write-Host ""
Write-Host "步骤 2: 上传后端文件" -ForegroundColor White
Write-Host "  上传:" -ForegroundColor Gray
Write-Host "    e:\demo\my1\my1\backend\src\services\AdminService.js -> /root/english-learning/backend/src/services/" -ForegroundColor Gray
Write-Host "    e:\demo\my1\my1\backend\src\routes\admin.js -> /root/english-learning/backend/src/routes/" -ForegroundColor Gray
Write-Host ""
Write-Host "步骤 3: 连接 SSH 并执行命令" -ForegroundColor White
Write-Host "  在 PowerShell 中执行:" -ForegroundColor Gray
Write-Host "    ssh $User@$Server" -ForegroundColor Yellow
Write-Host "  输入密码后,执行以下命令:" -ForegroundColor Gray
Write-Host "    cd /root/english-learning/backend" -ForegroundColor Gray
Write-Host "    pm2 restart english-learning-backend" -ForegroundColor Green
Write-Host "    pm2 status" -ForegroundColor Gray
Write-Host "    pm2 logs english-learning-backend --lines 20" -ForegroundColor Gray
Write-Host "    rm -rf /var/cache/nginx/*" -ForegroundColor Gray
Write-Host "    systemctl reload nginx" -ForegroundColor Gray
Write-Host ""
Write-Host "步骤 4: 验证部署" -ForegroundColor White
Write-Host "  访问: http://$Server/admin" -ForegroundColor Cyan
Write-Host "  检查是否有'一键导出课程'按钮" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "快速一键部署(需要手动输入密码)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果您已安装 SSH 客户端,可以直接执行:" -ForegroundColor Yellow
Write-Host "  ssh $User@$Server" -ForegroundColor Yellow
Write-Host ""
Write-Host "然后输入密码并执行上面的命令" -ForegroundColor Yellow
