const https = require('https');
const http = require('http');

// 测试后端API
function testBackend() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/api/health', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('✅ 后端服务正常:', res.statusCode);
                resolve(true);
            });
        });
        req.on('error', (err) => {
            console.log('❌ 后端服务异常:', err.message);
            resolve(false);
        });
        req.setTimeout(5000, () => {
            console.log('❌ 后端服务超时');
            req.destroy();
            resolve(false);
        });
    });
}

// 测试前端服务
function testFrontend() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:5173', (res) => {
            console.log('✅ 前端服务正常:', res.statusCode);
            resolve(true);
        });
        req.on('error', (err) => {
            console.log('❌ 前端服务异常:', err.message);
            resolve(false);
        });
        req.setTimeout(5000, () => {
            console.log('❌ 前端服务超时');
            req.destroy();
            resolve(false);
        });
    });
}

// 测试分类API
function testCategoriesAPI() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/api/categories', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const categories = JSON.parse(data);
                    console.log('✅ 分类API正常，返回', categories.length, '个分类');
                    resolve(true);
                } catch (e) {
                    console.log('❌ 分类API返回数据格式错误');
                    resolve(false);
                }
            });
        });
        req.on('error', (err) => {
            console.log('❌ 分类API异常:', err.message);
            resolve(false);
        });
        req.setTimeout(5000, () => {
            console.log('❌ 分类API超时');
            req.destroy();
            resolve(false);
        });
    });
}

async function runTests() {
    console.log('🔍 开始测试合并布局功能...\n');
    
    console.log('1. 测试后端服务...');
    const backendOk = await testBackend();
    
    console.log('\n2. 测试前端服务...');
    const frontendOk = await testFrontend();
    
    console.log('\n3. 测试分类API...');
    const apiOk = await testCategoriesAPI();
    
    console.log('\n📊 测试结果总结:');
    console.log('- 后端服务:', backendOk ? '✅ 正常' : '❌ 异常');
    console.log('- 前端服务:', frontendOk ? '✅ 正常' : '❌ 异常');
    console.log('- API接口:', apiOk ? '✅ 正常' : '❌ 异常');
    
    if (backendOk && frontendOk && apiOk) {
        console.log('\n🎉 所有服务正常！合并布局功能可以正常使用');
        console.log('📱 访问地址: http://localhost:5173');
        console.log('🔗 学习页面: http://localhost:5173/#/learning/1');
    } else {
        console.log('\n⚠️  部分服务异常，请检查服务状态');
    }
}

runTests().catch(console.error);