#!/bin/bash
# 测试导出API的脚本
# 使用方法: bash test-export-api.sh <服务器IP> <管理员密码>

SERVER=${1:-"47.97.185.117"}
PASSWORD=${2:-"admin123"}

echo "=========================================="
echo "测试导出功能 - 服务器: $SERVER"
echo "=========================================="

# 1. 登录获取token
echo ""
echo "[1/3] 登录系统..."
LOGIN_RESPONSE=$(curl -s -X POST "http://${SERVER}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo "✗ 登录失败"
    echo "响应: $LOGIN_RESPONSE"
    exit 1
fi

echo "✓ 登录成功"

# 2. 测试导出所有数据
echo ""
echo "[2/3] 测试导出所有数据..."
EXPORT_RESPONSE=$(curl -s -X GET "http://${SERVER}/api/admin/export/all" \
  -H "Authorization: Bearer ${TOKEN}")

# 检查是否成功
if echo "$EXPORT_RESPONSE" | grep -q '"success":true'; then
    echo "✓ 导出成功"

    # 提取统计信息
    CATEGORIES=$(echo $EXPORT_RESPONSE | grep -o '"categories":[0-9]*' | grep -o '[0-9]*')
    LESSONS=$(echo $EXPORT_RESPONSE | grep -o '"lessons":[0-9]*' | grep -o '[0-9]*')
    WORDS=$(echo $EXPORT_RESPONSE | grep -o '"words":[0-9]*' | grep -o '[0-9]*')

    echo "  - 分类数量: $CATEGORIES"
    echo "  - 课程数量: $LESSONS"
    echo "  - 单词数量: $WORDS"

    # 保存到文件
    JSON_DATA=$(echo $EXPORT_RESPONSE | grep -o '"data":\[[^]]*\]' | sed 's/"data"://')
    echo "$EXPORT_RESPONSE" > "export-data-$(date +%Y%m%d_%H%M%S).json"
    echo "  ✓ 数据已保存到 export-data-*.json 文件"
else
    echo "✗ 导出失败"
    echo "响应: $EXPORT_RESPONSE"
fi

# 3. 测试导出分类数据
echo ""
echo "[3/3] 测试导出分类数据..."

# 先获取分类列表
CATEGORIES_RESPONSE=$(curl -s -X GET "http://${SERVER}/api/admin/categories" \
  -H "Authorization: Bearer ${TOKEN}")

FIRST_CATEGORY_ID=$(echo $CATEGORIES_RESPONSE | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -n "$FIRST_CATEGORY_ID" ]; then
    echo "  测试分类ID: $FIRST_CATEGORY_ID"

    CATEGORY_EXPORT=$(curl -s -X GET "http://${SERVER}/api/admin/export/category/${FIRST_CATEGORY_ID}" \
      -H "Authorization: Bearer ${TOKEN}")

    if echo "$CATEGORY_EXPORT" | grep -q '"success":true'; then
        echo "✓ 分类导出成功"
    else
        echo "✗ 分类导出失败"
    fi
else
    echo "ℹ 没有可用的分类用于测试"
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
