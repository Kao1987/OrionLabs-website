// 登入記憶功能測試腳本
// 測試24小時記憶登入和30天記住我功能

// 模擬 localStorage for Node.js 環境
const mockLocalStorage = {
  storage: {},
  setItem: function(key, value) {
    this.storage[key] = value.toString();
  },
  getItem: function(key) {
    return this.storage[key] || null;
  },
  removeItem: function(key) {
    delete this.storage[key];
  },
  clear: function() {
    this.storage = {};
  }
};

const testLoginMemory = () => {
  console.log('🔐 測試登入記憶功能...\n');

  // 模擬 TokenManager 的功能（使用 mockLocalStorage）
  const mockTokenManager = {
    setToken: (token, tokenType = 'Bearer', expiresIn, rememberMe = false) => {
      mockLocalStorage.setItem('adminToken', token);
      mockLocalStorage.setItem('tokenType', tokenType);
      mockLocalStorage.setItem('lastLoginTime', Date.now().toString());

      const expiry = rememberMe
        ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30天
        : expiresIn
          ? Date.now() + (expiresIn * 1000)
          : Date.now() + (24 * 60 * 60 * 1000); // 24小時

      mockLocalStorage.setItem('tokenExpiry', expiry.toString());
      mockLocalStorage.setItem('rememberMe', rememberMe.toString());

      return {
        token,
        expiry: new Date(expiry),
        rememberMe,
        expiresIn: Math.floor((expiry - Date.now()) / (60 * 1000)) // 分鐘
      };
    },

    hasValidToken: () => {
      const token = mockLocalStorage.getItem('adminToken');
      const expiry = mockLocalStorage.getItem('tokenExpiry');
      return !!token && !!expiry && Date.now() < parseInt(expiry);
    },

    getRemainingTime: () => {
      const expiry = mockLocalStorage.getItem('tokenExpiry');
      if (!expiry) return 0;
      const remaining = parseInt(expiry) - Date.now();
      return Math.max(0, Math.floor(remaining / (60 * 1000)));
    },

    isRemembered: () => {
      return mockLocalStorage.getItem('rememberMe') === 'true';
    },

    clearToken: () => {
      mockLocalStorage.removeItem('adminToken');
      mockLocalStorage.removeItem('tokenType');
      mockLocalStorage.removeItem('tokenExpiry');
      mockLocalStorage.removeItem('rememberMe');
      mockLocalStorage.removeItem('lastLoginTime');
    }
  };

  // 測試案例
  const tests = [
    {
      name: '一般登入（24小時）',
      rememberMe: false,
      expectedHours: 24
    },
    {
      name: '記住我登入（30天）',
      rememberMe: true,
      expectedHours: 30 * 24
    }
  ];

  tests.forEach((test, index) => {
    console.log(`\n📋 測試案例 ${index + 1}: ${test.name}`);

    // 清除之前的 token
    mockTokenManager.clearToken();

    // 模擬登入
    const result = mockTokenManager.setToken(
      `mock-token-${index + 1}`,
      'Bearer',
      undefined,
      test.rememberMe
    );

    console.log(`✅ Token 已設定:`);
    console.log(`   🎯 記住我: ${result.rememberMe ? '是' : '否'}`);
    console.log(`   ⏰ 到期時間: ${result.expiry.toLocaleString('zh-TW')}`);
    console.log(`   ⏳ 剩餘時間: ${result.expiresIn.toLocaleString()} 分鐘`);

    // 驗證狀態
    console.log(`✅ 驗證結果:`);
    console.log(`   🔑 Token 有效: ${mockTokenManager.hasValidToken() ? '是' : '否'}`);
    console.log(`   💾 已記住: ${mockTokenManager.isRemembered() ? '是' : '否'}`);
    console.log(`   ⏱️  剩餘時間: ${mockTokenManager.getRemainingTime()} 分鐘`);

    // 模擬時間快進測試
    console.log(`\n🚀 模擬時間快進測試:`);

    // 測試23小時後（一般登入應該快到期，記住我應該還有效）
    const testTime = 23 * 60; // 23小時轉分鐘
    const originalExpiry = parseInt(mockLocalStorage.getItem('tokenExpiry'));
    mockLocalStorage.setItem('tokenExpiry', (originalExpiry - testTime * 60 * 1000).toString());

    console.log(`   📅 快進 23 小時後:`);
    console.log(`   🔑 Token 有效: ${mockTokenManager.hasValidToken() ? '是' : '否'}`);
    console.log(`   ⏱️  剩餘時間: ${mockTokenManager.getRemainingTime()} 分鐘`);

    // 恢復原始到期時間
    mockLocalStorage.setItem('tokenExpiry', originalExpiry.toString());
  });

  console.log('\n🎯 登入記憶功能測試完成');
  console.log('\n📝 功能說明:');
  console.log('• 一般登入: 24小時後自動過期');
  console.log('• 記住我登入: 30天後自動過期');
  console.log('• 系統會自動檢查登入狀態');
  console.log('• 進入登入頁面時自動導向管理後台（如果已登入）');
  console.log('• 可即時顯示剩餘登入時間');

  // 清除測試數據
  mockTokenManager.clearToken();
  console.log('\n🧹 測試數據已清除');
};

// 執行測試
testLoginMemory();
