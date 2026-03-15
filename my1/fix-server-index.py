import re

# 读取文件
with open('/root/myenglearn/server/index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 添加 captcha 路由
content = content.replace(
    "app.use('/api/auth', require('./routes/auth'));",
    "app.use('/api/auth', require('./routes/auth'));\napp.use('/api/captcha', require('./routes/captcha'));"
)

# 写入文件
with open('/root/myenglearn/server/index.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
