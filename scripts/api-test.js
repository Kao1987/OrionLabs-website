// API 測試腳本
// 測試修復後的 API 端點是否正常工作

const testAPI = async () => {
  const baseURL = 'http://localhost:8003';

  console.log('🔍 測試 API 端點狀態...\n');

  const endpoints = [
    { name: '部落格公開API', url: '/api/blog/public', expectedStatus: 200 },
    { name: '部落格管理員API', url: '/api/blog', expectedStatus: 403 },
    { name: '作品集公開API', url: '/api/portfolio/public', expectedStatus: 200 },
    { name: '作品集管理員API', url: '/api/portfolio', expectedStatus: 403 },
    { name: '統計API', url: '/api/stats', expectedStatus: 403 },
    { name: '留言管理員API', url: '/api/messages', expectedStatus: 403 },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint.url}`);
      const status = response.status;
      const statusMatch = status === endpoint.expectedStatus;
      const icon = statusMatch ? '✅' : '❌';

      console.log(`${icon} ${endpoint.name}: ${status} (預期: ${endpoint.expectedStatus})`);

      if (statusMatch && status === 200) {
        try {
          const data = await response.json();
          console.log(`   📊 數據: ${Array.isArray(data) ? `陣列(${data.length}項)` : typeof data}`);
        } catch (e) {
          console.log('   ⚠️  無法解析JSON響應');
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: 連接失敗 - ${error.message}`);
    }
  }

  console.log('\n🎯 API 端點測試完成');
};

// 執行測試
testAPI().catch(console.error);
