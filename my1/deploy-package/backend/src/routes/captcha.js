import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// 存储验证码的临时Map (生产环境应该用Redis)
const captchaStore = new Map();

// 清理过期验证码
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of captchaStore.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) { // 5分钟过期
      captchaStore.delete(key);
    }
  }
}, 60 * 1000); // 每分钟清理一次

/**
 * GET /api/captcha
 * 生成数学验证码
 */
router.get('/', (req, res) => {
  try {
    // 生成两个1-20之间的随机数
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const answer = num1 + num2;
    
    // 生成唯一ID
    const captchaId = crypto.randomBytes(16).toString('hex');
    
    // 存储答案
    captchaStore.set(captchaId, {
      answer,
      timestamp: Date.now()
    });
    
    res.json({
      success: true,
      captchaId,
      question: `${num1} + ${num2} = ?`
    });
  } catch (error) {
    console.error('生成验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '生成验证码失败'
    });
  }
});

/**
 * POST /api/captcha/verify
 * 验证验证码
 */
router.post('/verify', (req, res) => {
  try {
    const { captchaId, answer } = req.body;
    
    if (!captchaId || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    const stored = captchaStore.get(captchaId);
    
    if (!stored) {
      return res.json({
        success: false,
        message: '验证码已过期或不存在'
      });
    }
    
    // 验证答案
    const isCorrect = parseInt(answer) === stored.answer;
    
    // 验证后删除
    captchaStore.delete(captchaId);
    
    res.json({
      success: isCorrect,
      message: isCorrect ? '验证成功' : '验证码错误'
    });
  } catch (error) {
    console.error('验证验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '验证失败'
    });
  }
});

export { captchaStore };
export default router;
