@echo off
chcp 65001 > nul
echo ========================================
echo 火山引擎 TTS 最终测试
echo ========================================
echo.
echo 正在测试后端 API...
echo.

cd backend
powershell -ExecutionPolicy Bypass -Command "$loginBody = '{\"username\":\"admin\",\"password\":\"admin123\"}'; $loginResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -SessionVariable session; if ($loginResponse.success) { Write-Host '1. Login Success' -ForegroundColor Green; $configBody = '{\"provider\":\"volcengine\",\"config\":{\"appId\":\"2128862431\",\"apiKey\":\"eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq\",\"endpoint\":\"https://openspeech.bytedance.com/api/v1/tts\",\"voiceType\":\"BV001_streaming\",\"language\":\"zh-CN\",\"mode\":\"simple\"}}'; $saveResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/config/tts' -Method PUT -Body $configBody -ContentType 'application/json' -WebSession $session; if ($saveResponse.success) { Write-Host '2. Config Saved' -ForegroundColor Green; $testBody = '{\"provider\":\"volcengine\",\"text\":\"Hello\"}'; $testResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/test-tts' -Method POST -Body $testBody -ContentType 'application/json' -WebSession $session; if ($testResponse.success) { Write-Host '3. TTS Test Success!' -ForegroundColor Green; Write-Host $testResponse.message -ForegroundColor Cyan } else { Write-Host '3. TTS Test Failed:' $testResponse.message -ForegroundColor Red } } else { Write-Host '2. Config Save Failed' -ForegroundColor Red } } else { Write-Host '1. Login Failed' -ForegroundColor Red }"

cd ..
echo.
echo ========================================
echo 测试完成
echo ========================================
echo.
echo 现在可以打开浏览器测试前端界面：
echo http://localhost:5173
echo.
echo 登录信息：
echo 用户名: admin
echo 密码: admin123
echo.
echo 正确的配置信息：
echo AppID: 2128862431
echo Access Token: eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq
echo.
pause
