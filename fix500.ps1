Write-Host "Checking backup..."
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=20 root@47.97.185.117 "ls -t /root/backup/ | head -2"
