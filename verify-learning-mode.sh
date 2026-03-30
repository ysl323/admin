#!/bin/bash

# ============================================
# 学习模式功能验证脚本
# ============================================

echo "=========================================="
echo "  学习模式功能验证"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/root/english-learning/my1"

# 验证计数
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

check_result() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo -e "${GREEN}✓ 通过${NC}"
    else
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        echo -e "${RED}✗ 失败${NC}"
    fi
}

echo "1. 检查后端文件..."
cd "$PROJECT_DIR/backend"

if [ -f "src/models/WordMastery.js" ]; then
    echo -e "${GREEN}✓${NC} WordMastery模型存在"
    check_result 0
else
    echo -e "${RED}✗${NC} WordMastery模型不存在"
    check_result 1
fi

if [ -f "src/routes/wordMastery.js" ]; then
    echo -e "${GREEN}✓${NC} wordMastery路由存在"
    check_result 0
else
    echo -e "${RED}✗${NC} wordMastery路由不存在"
    check_result 1
fi

if [ -f "src/services/wordMastery.js" ]; then
    echo -e "${GREEN}✓${NC} wordMastery服务存在"
    check_result 0
else
    echo -e "${RED}✗${NC} wordMastery服务不存在"
    check_result 1
fi

echo ""
echo "2. 检查前端文件..."
cd "$PROJECT_DIR/frontend"

if [ -f "src/components/LearningModeSelector.vue" ]; then
    echo -e "${GREEN}✓${NC} LearningModeSelector组件存在"
    check_result 0
else
    echo -e "${RED}✗${NC} LearningModeSelector组件不存在"
    check_result 1
fi

if [ -f "src/stores/learning.js" ]; then
    echo -e "${GREEN}✓${NC} learning store存在"
    check_result 0
else
    echo -e "${RED}✗${NC} learning store不存在"
    check_result 1
fi

if [ -f "src/services/wordMastery.js" ]; then
    echo -e "${GREEN}✓${NC} wordMastery前端服务存在"
    check_result 0
else
    echo -e "${RED}✗${NC} wordMastery前端服务不存在"
    check_result 1
fi

echo ""
echo "3. 检查数据库..."
cd "$PROJECT_DIR/backend"

# 检查表是否存在
sqlite3 database.sqlite ".tables" | grep -q "word_mastery"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} word_mastery表存在"
    check_result 0
else
    echo -e "${RED}✗${NC} word_mastery表不存在"
    check_result 1
fi

# 检查索引
sqlite3 database.sqlite ".schema word_mastery" | grep -q "unique_user_lesson_word_mastery"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 唯一索引正确(userId, lessonId, wordId)"
    check_result 0
else
    echo -e "${YELLOW}⚠${NC} 唯一索引可能需要更新"
    sqlite3 database.sqlite ".schema word_mastery" | grep "unique_user_word_mastery"
    check_result 1
fi

echo ""
echo "4. 检查后端服务..."

if pm2 list | grep -q "english-backend"; then
    STATUS=$(pm2 list | grep "english-backend" | awk '{print $10}')
    if [ "$STATUS" = "online" ]; then
        echo -e "${GREEN}✓${NC} 后端服务运行中"
        check_result 0
    else
        echo -e "${YELLOW}⚠${NC} 后端服务状态: $STATUS"
        check_result 1
    fi
else
    echo -e "${RED}✗${NC} 后端服务未启动"
    check_result 1
fi

echo ""
echo "5. 测试API..."

# 测试健康检查
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✓${NC} API健康检查通过 (200)"
    check_result 0
else
    echo -e "${RED}✗${NC} API健康检查失败 ($HEALTH_CHECK)"
    check_result 1
fi

# 测试word-mastery路由(需要认证)
echo -e "${YELLOW}⚠${NC} word-mastery API需要认证,跳过直接测试"

echo ""
echo "6. 检查前端构建..."

if [ -d "dist" ]; then
    JS_FILE_COUNT=$(find dist -name "*.js" | wc -l)
    if [ "$JS_FILE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} 前端构建完成 ($JS_FILE_COUNT 个JS文件)"
        check_result 0
    else
        echo -e "${YELLOW}⚠${NC} 前端dist目录为空"
        check_result 1
    fi
else
    echo -e "${RED}✗${NC} 前端dist目录不存在"
    check_result 1
fi

echo ""
echo "7. 检查Nginx..."

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx运行中"
    check_result 0
else
    echo -e "${RED}✗${NC} Nginx未运行"
    check_result 1
fi

echo ""
echo "=========================================="
echo "验证结果"
echo "=========================================="
echo "总检查项: $TOTAL_CHECKS"
echo -e "${GREEN}通过: $PASSED_CHECKS${NC}"
echo -e "${RED}失败: $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过!学习模式功能已成功部署${NC}"
    exit 0
else
    echo -e "${RED}✗ 部分检查失败,请查看上方详细信息${NC}"
    exit 1
fi
