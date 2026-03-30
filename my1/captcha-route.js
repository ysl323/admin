const express = require("express");
const crypto = require("crypto");

const router = express.Router();
const captchaStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of captchaStore.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      captchaStore.delete(key);
    }
  }
}, 60 * 1000);

router.get("/", (req, res) => {
  try {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const answer = num1 + num2;
    const captchaId = crypto.randomBytes(16).toString("hex");
    captchaStore.set(captchaId, { answer, timestamp: Date.now() });
    res.json({ success: true, captchaId, question: num1 + " + " + num2 + " = ?" });
  } catch (error) {
    console.error("生成验证码失败:", error);
    res.status(500).json({ success: false, message: "生成验证码失败" });
  }
});

router.post("/verify", (req, res) => {
  try {
    const { captchaId, answer } = req.body;
    if (!captchaId || answer === undefined) {
      return res.status(400).json({ success: false, message: "缺少必要参数" });
    }
    const stored = captchaStore.get(captchaId);
    if (!stored) {
      return res.json({ success: false, message: "验证码已过期或不存在" });
    }
    const isCorrect = parseInt(answer) === stored.answer;
    captchaStore.delete(captchaId);
    res.json({ success: isCorrect, message: isCorrect ? "验证成功" : "验证码错误" });
  } catch (error) {
    console.error("验证验证码失败:", error);
    res.status(500).json({ success: false, message: "验证失败" });
  }
});

module.exports = router;
