/**
 * 测试不同的 cluster 值
 */

import axios from 'axios';

async function testCluster(cluster) {
  const appId = '2322585992';
  const accessToken = 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys';
  const voiceType = 'BV001_streaming';
  
  const params = {
    app: {
      appid: appId,
      token: "access_token",
      cluster: cluster
    },
    user: {
      uid: "uid"
    },
    audio: {
      voice_type: voiceType,
      encoding: "mp3",
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0
    },
    request: {
      reqid: "test_" + Date.now(),
      text: "Hello",
      text_type: "plain",
      operation: "query"
    }
  };
  
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer;${accessToken}`
  };
  
  try {
    const response = await axios.post(
      'https://openspeech.bytedance.com/tts_middle_layer/tts',
      params,
      { headers, timeout: 10000 }
    );
    
    return {
      cluster,
      code: response.data.code,
      message: response.data.message,
      success: response.data.code === 3000
    };
  } catch (error) {
    return {
      cluster,
      error: error.message
    };
  }
}

async function testAllClusters() {
  console.log('=== 测试不同的 cluster 值 ===\n');
  
  const clusters = [
    'volcano_tts',
    'volc_tts',
    'volcengine_tts',
    'tts',
    'default'
  ];
  
  for (const cluster of clusters) {
    console.log(`测试 cluster: "${cluster}"`);
    const result = await testCluster(cluster);
    
    if (result.success) {
      console.log(`  ✓ 成功! Code: ${result.code}`);
    } else if (result.error) {
      console.log(`  ✗ 错误: ${result.error}`);
    } else {
      console.log(`  ✗ 失败: Code ${result.code} - ${result.message}`);
    }
    console.log('');
  }
}

testAllClusters();
