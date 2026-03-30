#!/bin/bash
echo "=== 测试验证码接口 ==="
curl -s http://localhost:3000/api/captcha
echo ""
echo ""
echo "=== 测试登录接口 ==="
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
echo ""
echo ""
echo "=== 测试健康检查 ==="
curl -s http://localhost:3000/health
echo ""