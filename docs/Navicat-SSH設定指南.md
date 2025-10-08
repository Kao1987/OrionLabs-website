# 🚀 Navicat SSH 隧道連接設定指南

## 🎯 **設定目標**
透過 SSH 隧道讓 Navicat 安全連接到 Oracle 主機的 MySQL，即使 MySQL 只監聽 localhost。

## 🔧 **方法 1: Navicat 內建 SSH 隧道** (推薦)

### **步驟 1: 建立新連接**
1. 開啟 Navicat
2. 點擊 **"Connection"** → **"MySQL"**
3. 輸入連接名稱：`OrionLabs-MySQL-SSH`

### **步驟 2: SSH 隧道設定**
在連接設定視窗中，點擊 **"SSH"** 分頁：

```
✅ 勾選 "Use SSH Tunnel"

SSH 設定:
- Host Name/IP Address: 161.33.209.198
- Port: 22
- User Name: ubuntu (或您的 SSH 用戶名)
- Authentication Method: 選擇以下之一：
  
  選項 A - 密碼認證:
  ☐ Public Key
  ☑ Password
  Password: [輸入您的密碼]
  
  選項 B - 金鑰認證 (推薦):
  ☑ Public Key
  ☐ Password
  Private Key: [選擇您的 ~/.ssh/id_rsa 檔案]
  Passphrase: [如果金鑰有密碼則輸入]
```

### **步驟 3: MySQL 連接設定**
在同一個視窗的 **"General"** 分頁：

```
連接設定:
- Host Name/IP Address: 127.0.0.1 (重要！使用 localhost)
- Port: 3306
- User Name: admin
- Password: CcBb0932173427!
- Initial Database: orionlabs (可選)
```

### **步驟 4: 測試連接**
1. 點擊 **"Test Connection"**
2. 應該看到 "Connection Successful" 訊息
3. 點擊 **"Save"** 儲存設定

## 🔧 **方法 2: 手動建立 SSH 隧道**

如果 Navicat 內建功能有問題，可以手動建立隧道：

### **步驟 1: 建立 SSH 隧道**
在終端機執行：
```bash
ssh -L 3306:localhost:3306 oracle-tokyo
```
或者背景執行：
```bash
ssh -f -N -L 3306:localhost:3306 oracle-tokyo
```

### **步驟 2: Navicat 設定**
```
連接設定:
- Host Name/IP Address: 127.0.0.1
- Port: 3306
- User Name: admin
- Password: CcBb0932173427!
- Initial Database: orionlabs
```

**注意**: 這個方法會佔用本機的 3306 端口

## 🔧 **方法 3: 使用不同本機端口** (避免衝突)

### **SSH 隧道 (使用端口 13306)**
```bash
ssh -f -N -L 13306:localhost:3306 oracle-tokyo
```

### **Navicat 設定**
```
連接設定:
- Host Name/IP Address: 127.0.0.1
- Port: 13306  (使用隧道端口)
- User Name: admin
- Password: CcBb0932173427!
```

## 🔍 **故障排除**

### **問題 1: 無法連接**
```bash
# 測試 SSH 連接
ssh oracle-tokyo "echo 'SSH 連接正常'"

# 測試 MySQL 本機連接
ssh oracle-tokyo "mysql -u admin -p -h localhost -e 'SELECT 1;'"
```

### **問題 2: 端口衝突**
```bash
# 檢查本機端口使用
lsof -i :3306
netstat -an | grep 3306

# 使用其他端口
ssh -L 23306:localhost:3306 oracle-tokyo
```

### **問題 3: 金鑰認證問題**
```bash
# 檢查 SSH 金鑰
ssh -T oracle-tokyo

# 如果需要複製金鑰
ssh-copy-id oracle-tokyo
```

## 📋 **完整 Navicat 設定檢查清單**

### **SSH 分頁**
- [x] ✅ Use SSH Tunnel 已勾選
- [x] Host: 161.33.209.198
- [x] Port: 22
- [x] User: ubuntu
- [x] 認證方式已設定 (金鑰或密碼)

### **General 分頁**
- [x] Host: 127.0.0.1 (不是遠端 IP!)
- [x] Port: 3306
- [x] User: admin
- [x] Password: CcBb0932173427!

### **Advanced 分頁** (可選)
- [x] Auto Connect: 可勾選
- [x] Use MySQL System Database: 可勾選

## 🧪 **連接測試步驟**

### **1. SSH 連通性測試**
```bash
ssh oracle-tokyo "echo '連接成功'"
```

### **2. MySQL 服務測試**
```bash
ssh oracle-tokyo "mysql -u admin -p -e 'SHOW DATABASES;'"
```

### **3. Navicat 連接測試**
1. 點擊 Navicat 中的 "Test Connection"
2. 查看連接日誌
3. 嘗試打開資料庫瀏覽器

## 🎯 **安全最佳實踐**

### **推薦設定**
1. **使用 SSH 金鑰認證** (而非密碼)
2. **限制 SSH 金鑰使用** (添加 from="your-ip")
3. **定期更換密碼**
4. **使用專用資料庫用戶** (而非 admin)

### **建立專用用戶** (可選)
```sql
-- 連接後執行
CREATE USER 'navicat_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON orionlabs.* TO 'navicat_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📊 **連接方式比較**

| 方法 | 安全性 | 便利性 | 推薦度 |
|------|-------|-------|-------|
| Navicat SSH 隧道 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🥇 推薦 |
| 手動 SSH 隧道 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🥈 備選 |
| 直接連接 | ⭐ | ⭐⭐⭐⭐⭐ | ❌ 不安全 |

## 🎉 **預期結果**

設定完成後，您將能夠：
- 🔒 安全連接到遠端 MySQL
- 📊 使用 Navicat 完整功能
- 🚀 無需手動建立隧道
- 🛡️ 保持資料庫安全隔離
