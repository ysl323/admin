# 简化测试
Import-Module Posh-SSH

$password = ConvertTo-SecureString "Admin88868" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential("root", $password)

$sshSession = New-SSHSession -ComputerName "47.97.185.117" -Credential $credential -AcceptKey -Force

# 写入测试文件到服务器
$testScript = @'
#!/bin/bash
echo "=== 通过 Nginx 访问 ==="
curl -s http://localhost:80/api/auth/login

echo ""
echo "=== 直接访问后端 ==="
curl -s http://localhost:3000/api/auth/login

echo ""
echo "=== 检查 Nginx 错误日志 ==="
tail -5 /var/log/nginx/error.log
'@

# 上传并执行
Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "cat > /tmp/test_api.sh << 'SCRIPT_EOF'
#!/bin/bash
echo '=== 通过 Nginx 访问 ==='
curl -s http://localhost:80/api/auth/login
echo ''
echo '=== 直接访问后端 ==='
curl -s http://localhost:3000/api/auth/login
SCRIPT_EOF
chmod +x /tmp/test_api.sh
/tmp/test_api.sh"

Remove-SSHSession -SessionId $sshSession.SessionId
