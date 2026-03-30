const { spawn } = require('child_process');

const ssh = spawn('ssh', [
  '-o', 'StrictHostKeyChecking=no',
  '-o', 'BatchMode=yes',
  'root@47.97.185.117',
  'echo connected'
], {
  stdio: 'pipe'
});

ssh.stdout.on('data', (data) => {
  console.log('stdout:', data.toString());
});

ssh.stderr.on('data', (data) => {
  console.log('stderr:', data.toString());
});

ssh.on('close', (code) => {
  console.log('exit code:', code);
});

setTimeout(() => {
  ssh.kill();
  console.log('timeout');
}, 10000);
