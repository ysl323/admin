#!/bin/bash
# Quick server status check

echo "=== PM2 Status ==="
ssh root@47.97.185.117 'pm2 status'

echo ""
echo "=== PM2 Logs (last 20 lines) ==="
ssh root@47.97.185.117 'pm2 logs english-learning-backend --lines 20 --nostream'

echo ""
echo "=== Nginx Status ==="
ssh root@47.97.185.117 'systemctl status nginx | head -5'

echo ""
echo "=== Port Check ==="
ssh root@47.97.185.117 'netstat -tlnp | grep -E "(3000|80)" || echo "Ports not found"'

echo ""
echo "=== Backend Process ==="
ssh root@47.97.185.117 'ps aux | grep node | grep -v grep'
