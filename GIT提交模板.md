# Git 提交记录

## 功能说明

本次提交实现学习模式功能,包括小白模式和进阶模式,以及单词掌握状态管理。

## 主要变更

### 前端

1. **LearningModeSelector.vue**
   - 删除重复的CSS规则(第306行)
   - 优化样式优先级

2. **learning.js (Pinia Store)**
   - 修复`shouldShowEnglishForCurrentWord`边界条件
   - 改进`markAsMastered`返回值结构
   - 返回`{success, isNew, wasAlreadyMastered}`对象

3. **LearningPage.vue**
   - 优化掌握按钮提示逻辑
   - 区分"新标记"和"已存在"两种情况

4. **wordMastery.js (Service)**
   - 掌握状态API服务(已存在,无变更)

### 后端

1. **WordMastery.js (Model)**
   - 更新唯一索引:`(userId, lessonId, wordId)`
   - 解决同单词在不同课程中的冲突问题

2. **wordMastery.js (Routes)**
   - API路由(已存在,无变更)

3. **index.js (Models)**
   - 模型关联关系(已存在,无变更)

## 数据库迁移

需要执行以下SQL更新索引:

```sql
-- 删除旧索引
DROP INDEX IF EXISTS unique_user_word_mastery ON word_mastery;

-- 创建新索引
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_lesson_word_mastery
ON word_mastery (userId, lessonId, wordId);
```

详见:`migrate-word-mastery.sql`

## 部署说明

详见:`学习模式部署指南.md` 和 `快速部署说明.md`

自动化部署:
```bash
chmod +x deploy-learning-mode.sh
./deploy-learning-mode.sh
```

## 功能特性

- ✅ 小白模式:未掌握单词显示英文,已掌握隐藏
- ✅ 进阶模式:始终隐藏英文(听写模式)
- ✅ 掌握状态:本地存储 + 服务器同步
- ✅ 离线支持:批量同步离线掌握记录
- ✅ 响应式UI:适配移动端和桌面端

## 测试验证

- [ ] 小白模式下英文显示/隐藏正常
- [ ] 进阶模式下英文始终隐藏
- [ ] 掌握状态刷新后保留
- [ ] 离线数据同步正常
- [ ] 数据库索引更新成功
- [ ] 后端API正常响应
- [ ] 前端构建无错误

## 已修复问题

1. **CSS重复定义**: 删除第306行重复规则
2. **边界条件错误**: `currentWord`为null时返回false
3. **返回值不一致**: 返回完整对象而非boolean
4. **数据库唯一索引**: 从2字段改为3字段组合

## 代码审查

通过10种反查方法验证:
- 逻辑流程检查
- 数据流追踪
- 后端路由注册检查
- 边界条件和异常检查
- CSS样式覆盖和优先级检查
- 数据库模型关联关系检查
- 路由权限和认证检查
- 竞态条件检查
- 响应式更新验证
- 持久化数据完整性检查

## 版本信息

- 版本号:1.1.0
- 发布日期:2026-03-30
- 依赖版本:
  - Vue 3.3.11
  - Element Plus 2.4.4
  - Pinia 3.0.4
  - Express 4.18.2
  - Sequelize 6.35.0

## 相关文档

- 部署指南:`学习模式部署指南.md`
- 快速部署:`快速部署说明.md`
- 部署脚本:`deploy-learning-mode.sh`
- 数据库迁移:`migrate-word-mastery.sql`
- 检查清单:`部署检查清单.md`

---

**提交类型**: feat (新功能)
**影响范围**: 前端UI, 数据库, API
**破坏性变更**: 数据库索引结构变更
**向后兼容**: 是(通过迁移脚本处理)
