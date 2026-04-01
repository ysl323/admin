import sys
# 读取原文件
with open('/var/www/english-learning/server/routes/admin.js', 'r') as f:
    content = f.read()

# 读取补丁
with open('/tmp/admin-export-patch.js', 'r') as f:
    patch = f.read()

# 在 module.exports 之前插入
new_content = content.replace('module.exports = router;', patch + '\nmodule.exports = router;')

# 写回文件
with open('/var/www/english-learning/server/routes/admin.js', 'w') as f:
    f.write(new_content)

print('Done')
