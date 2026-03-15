# 如何更新火山引擎 TTS Access Token

## 问题

Access Token 已过期,需要获取新的 Token。

## 解决方案

### 方法 1: 通过火山引擎控制台获取新 Token (推荐)

1. **登录火山引擎控制台**
   - 访问: https://console.volcengine.com/speech/service/8
   - 使用你的火山引擎账号登录

2. **进入语音技术服务**
   - 找到你的应用: APP ID `8594935941`
   - 查看应用详情

3. **获取新的 Access Token**
   - 在应用详情页面找到 "Access Token" 或 "访问令牌"
   - 点击"生成新令牌"或"刷新令牌"
   - 复制新的 Access Token

4. **更新系统配置**
   
   **方式 A: 通过管理后台更新 (推荐)**
   - 访问: http://47.97.185.117/admin
   - 登录: admin / admin123
   - 进入"配置管理"
   - 选择"火山引擎 TTS"标签
   - 更新 Access Token
   - 点击"保存配置"
   - 点击"测试连接"验证

   **方式 B: 通过脚本更新**
   - 修改 `backend/init-tts-config.js` 中的 Access Token
   - 在服务器上运行: `node init-tts-config.js`
   - 重启后端: `pm2 restart english-learning-backend`

### 方法 2: 使用长期有效的凭证

如果频繁过期,可以考虑:

1. **申请长期 Token**
   - 在火山引擎控制台申请长期有效的 Access Token
   - 或者使用 API Key + Secret Key 的签名认证方式

2. **配置自动刷新**
   - 实现 Token 自动刷新机制
   - 在 Token 即将过期时自动获取新 Token

## 快速更新脚本

创建一个快速更新脚本:

```javascript
// backend/update-volcengine-token.js
import { sequelize } from './src/config/database.js';
import Config from './src/models/Config.js';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0')),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

async function updateToken() {
  try {
    await sequelize.authenticate();
    
    // 在这里输入新的 Access Token
    const newAccessToken = 'YOUR_NEW_ACCESS_TOKEN_HERE';
    
    if (newAccessToken === 'YOUR_NEW_ACCESS_TOKEN_HERE') {
      console.error('❌ 请先修改脚本,填入新的 Access Token!');
      process.exit(1);
    }
    
    await Config.upsert({
      key: 'volcengine_api_key',
      value: encrypt(newAccessToken)
    });
    
    console.log('✅ Access Token 更新成功!');
    console.log('');
    console.log('下一步:');
    console.log('  1. 重启后端: pm2 restart english-learning-backend');
    console.log('  2. 测试 TTS 功能');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

updateToken();
```

使用方法:
```bash
# 1. 修改脚本,填入新的 Access Token
# 2. 运行脚本
cd /root/english-learning/backend
node update-volcengine-token.js

# 3. 重启后端
pm2 restart english-learning-backend
```

## 验证更新

更新后验证:

```bash
# 方法 1: 通过管理后台
# 访问 http://47.97.185.117/admin
# 进入配置管理 > 火山引擎 TTS
# 点击"测试连接"

# 方法 2: 通过 API 测试
curl -X POST http://47.97.185.117/api/admin/test-tts/volcengine \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}' \
  -b cookies.txt
```

## 常见问题

### Q: Token 多久过期?
A: 火山引擎的 Access Token 通常有效期为 30-90 天,具体看控制台设置。

### Q: 如何避免频繁过期?
A: 
1. 申请长期有效的 Token
2. 使用 Secret Key 签名认证(不会过期)
3. 实现自动刷新机制

### Q: 更新后还是报错?
A: 
1. 确认新 Token 是否正确
2. 检查 APP ID 是否匹配
3. 查看后端日志: `pm2 logs english-learning-backend`
4. 确认后端已重启

## 联系支持

如果问题持续:
- 火山引擎技术支持: https://www.volcengine.com/docs/6561/79820
- 控制台: https://console.volcengine.com/speech/service/8

## 当前配置信息

- **APP ID**: 8594935941
- **Access Token**: 需要更新
- **Secret Key**: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
- **Endpoint**: https://openspeech.bytedance.com/api/v1/tts

---

**重要提示**: 
- 获取新 Token 后,请立即更新系统配置
- 建议定期检查 Token 有效期
- 考虑使用签名认证方式以避免 Token 过期问题
