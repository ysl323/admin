const fs = require('fs');
const path = '/root/myenglearn/server/package.json';
const content = fs.readFileSync(path, 'utf8');
const fixed = content.replace(/,\s*"type": "module"/g, '').replace(/\s*"type": "module",\s*/g, '');
fs.writeFileSync(path, fixed);
console.log('Fixed package.json');