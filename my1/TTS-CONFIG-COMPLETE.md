# TTS 配置完成报告

## ✅ 配置状态

TTS 配置已成功完成并部署到服务器！

## 📊 配置详情

### 🔥 火山引擎 TTS (默认提供商)

**状态**: ✅ 已配置并启用

**配置信息**:
- APP ID: `8594935941`
- Access Token: `sRWj****` (已加密存储)
- Secret Key: `hLY8****` (已加密存储)
- Endpoint: `https://openspeech.bytedance.com/api/v1/tts`
- Voice Type: `BV001_streaming` (通用女声)
- Language: `en-US`
- Cluster: `volcano_tts`
- Mode: `simple` (Token 认证)

**特点**:
- 使用 Token 认证方式
- 支持英文和中文语音合成
- 音频格式: MP3
- 已集成音频缓存功能

### 🌐 谷歌 TTS (备用提供商)

**状态**: ⚠️ 已配置框架,需要 API Key

**配置信息**:
- API Key: (未配置 - 需要在管理后台设置)
- Language: `en-US`
- Voice: `en-US-Wavenet-D`
- Speaking Rate: `1.0`

**如何配置**:
1. 访问管理后台: http://47.97.185.117/admin
2. 登录: admin / admin123
3. 进入"配置管理"
4. 选择"谷歌 TTS"标签
5. 输入 Google Cloud API Key
6. 保存并测试

## 🎯 默认调用设置

**当前默认提供商**: 火山引擎 TTS

系统会按以下优先级调用 TTS:
1. 🔥 火山引擎 TTS (主要)
2. 🌐 谷歌 TTS (备用,需配置 API Key)
3. 🔊 浏览器 TTS (降级方案)

## 🔒 安全特性

### 加密存储
- 所有敏感配置使用 AES-256-CBC 加密
- Access Token 和 Secret Key 加密存储在数据库
- 只有管理员可以查看和修改配置

### 脱敏显示
- Access Token 显示: `sRWj****`
- Secret Key 显示: `hLY8****`
- 只显示前4个字符,其余用星号替代

## 📁 相关文件

### 后端文件
- `backend/src/services/TTSService.js` - TTS 服务实现
- `backend/src/services/AdminService.js` - 配置管理
- `backend/src/models/Config.js` - 配置模型
- `backend/init-tts-config.js` - 初始化脚本

### 前端文件
- `frontend/src/views/admin/ConfigManagement.vue` - 配置管理页面
- `frontend/src/services/tts.js` - TTS 服务调用
- `frontend/src/views/LearningPage.vue` - 学习页面(使用 TTS)

### 部署脚本
- `init-tts-on-server.ps1` - 初始化 TTS 配置
- `fix-tts-init.ps1` - 修复并上传配置
- `test-tts-config.ps1` - 测试 TTS 功能

## 🧪 测试 TTS 功能

### 方法 1: 管理后台测试

1. 访问: http://47.97.185.117/admin
2. 登录: admin / admin123
3. 进入"配置管理"
4. 点击"测试连接"按钮
5. 查看测试结果

### 方法 2: 学习页面测试

1. 访问: http://47.97.185.117
2. 登录系统
3. 选择任意分类和课程
4. 点击单词旁边的"播放"按钮
5. 听到语音即表示成功

### 方法 3: API 测试

```bash
# 登录
curl -X POST http://47.97.185.117/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# 获取 TTS 配置
curl -X GET http://47.97.185.117/api/admin/tts-config \
  -b cookies.txt

# 测试火山引擎 TTS
curl -X POST http://47.97.185.117/api/admin/test-tts/volcengine \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test."}' \
  -b cookies.txt
```

## 📊 数据库配置

配置存储在 `config` 表中:

```sql
-- 查看 TTS 配置
SELECT key, 
  CASE 
    WHEN key LIKE '%api%' OR key LIKE '%secret%' 
    THEN '***' 
    ELSE value 
  END as value 
FROM config 
WHERE key LIKE '%tts%' 
   OR key LIKE '%volcengine%' 
   OR key LIKE '%google%';
```

## 🔧 配置管理

### 查看配置

通过管理后台:
1. 登录管理后台
2. 进入"配置管理"
3. 查看火山引擎和谷歌 TTS 配置

### 修改配置

通过管理后台:
1. 修改配置项
2. 点击"保存配置"
3. 点击"测试连接"验证
4. 后端会自动重新加载配置

### 切换提供商

在配置管理中选择默认提供商:
- 火山引擎 TTS (推荐)
- 谷歌 TTS (需要 API Key)

## 🎵 音频缓存

系统已集成音频缓存功能:

**缓存策略**:
- 首次请求时调用 TTS API 并缓存
- 后续相同文本直接从缓存返回
- 大幅减少 API 调用次数
- 提升响应速度

**缓存位置**:
- 数据库: `audio_cache` 表
- 文件系统: `backend/audio_cache/` 目录

**缓存管理**:
- 管理后台可查看缓存统计
- 支持清理过期缓存
- 支持导出/导入缓存

## 🚀 性能优化

### 已实现
- ✅ 音频缓存机制
- ✅ Token 认证(无需每次签名)
- ✅ 连接池复用
- ✅ 超时控制(10秒)

### 建议
- 定期清理过期缓存
- 监控 API 调用配额
- 实现降级策略

## 🐛 故障排查

### 问题 1: TTS 合成失败

**检查项**:
1. 火山引擎凭证是否正确
2. Access Token 是否过期
3. 网络连接是否正常
4. 后端服务是否运行

**解决方法**:
```bash
# 检查后端日志
pm2 logs english-learning-backend

# 重启后端
pm2 restart english-learning-backend

# 测试 TTS
curl -X POST http://47.97.185.117/api/admin/test-tts/volcengine \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}' \
  -b cookies.txt
```

### 问题 2: 配置保存失败

**检查项**:
1. 是否以管理员身份登录
2. 数据库连接是否正常
3. 配置格式是否正确

**解决方法**:
```bash
# 检查数据库
cd /root/english-learning/backend
sqlite3 database.sqlite ".tables"

# 查看配置
sqlite3 database.sqlite "SELECT * FROM config WHERE key LIKE '%tts%';"
```

### 问题 3: 音频无法播放

**检查项**:
1. TTS 配置是否正确
2. 音频文件是否生成
3. 浏览器是否支持 MP3
4. 网络请求是否成功

**解决方法**:
- 打开浏览器开发者工具
- 查看 Network 标签
- 检查 TTS API 请求状态
- 查看 Console 错误信息

## 📝 日志位置

### 后端日志
```bash
# PM2 日志
pm2 logs english-learning-backend

# 应用日志
/root/english-learning/backend/logs/
```

### 前端日志
- 浏览器开发者工具 Console

## 🔄 更新配置

如需更新 TTS 配置:

1. **通过管理后台** (推荐):
   - 登录管理后台
   - 修改配置
   - 保存并测试

2. **通过脚本**:
   ```bash
   # 重新运行初始化脚本
   cd /root/english-learning/backend
   node init-tts-config.js
   pm2 restart english-learning-backend
   ```

3. **通过数据库**:
   ```bash
   # 直接修改数据库(不推荐)
   sqlite3 database.sqlite
   UPDATE config SET value='new_value' WHERE key='volcengine_app_id';
   ```

## 📞 支持信息

### 火山引擎 TTS
- 文档: https://www.volcengine.com/docs/6561/79820
- 控制台: https://console.volcengine.com/speech/service/8
- APP ID: 8594935941

### 谷歌 TTS
- 文档: https://cloud.google.com/text-to-speech/docs
- 控制台: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com

## ✅ 完成清单

- [x] 创建 TTS 配置初始化脚本
- [x] 上传脚本到服务器
- [x] 运行初始化脚本
- [x] 配置火山引擎 TTS
- [x] 配置谷歌 TTS 框架
- [x] 设置默认提供商(火山引擎)
- [x] 加密存储敏感信息
- [x] 重启后端服务
- [x] 验证配置成功

## 🎉 总结

TTS 配置已完成!系统现在可以:

1. ✅ 使用火山引擎 TTS 进行语音合成
2. ✅ 支持英文和中文语音
3. ✅ 自动缓存音频文件
4. ✅ 降级到浏览器 TTS
5. ✅ 管理后台配置管理
6. ⚠️ 谷歌 TTS 需要配置 API Key

**下一步**:
1. 访问管理后台测试 TTS 功能
2. 在学习页面测试单词发音
3. (可选) 配置谷歌 TTS API Key

**访问地址**:
- 前端: http://47.97.185.117
- 管理后台: http://47.97.185.117/admin
- 登录: admin / admin123

---

配置完成时间: 2026-03-09
配置人员: Kiro AI Assistant
