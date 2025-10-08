# 🔒 MySQL 安全配置方案 - OrionLabs

## 🚨 **當前安全問題**
- MySQL 端口 3306 對所有 IP 監聽 (0.0.0.0:3306)
- 雖然 Oracle Cloud Security Lists 已關閉外部存取
- 但本機應用層仍需安全加固

## 💡 **推薦安全方案**

### **方案 1: 限制 MySQL 監聽範圍** ⭐⭐⭐⭐⭐
**最推薦 - 從根本解決問題**

#### **實作步驟**:
```bash
# 1. 修改 MySQL 配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 2. 修改 bind-address
bind-address = 127.0.0.1  # 只允許本機連接
# 或者
bind-address = 172.17.0.1  # 只允許 Docker 網路

# 3. 重啟 MySQL
sudo systemctl restart mysql
```

#### **優勢**:
- ✅ **根本解決**: MySQL 只監聽本機
- ✅ **效能最佳**: 無額外網路跳轉
- ✅ **配置簡單**: 一次設定終身受益
- ✅ **完全安全**: 外部無法直接存取

### **方案 2: Docker 網路隔離** ⭐⭐⭐⭐
**容器化最佳實踐**

#### **實作步驟**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: orionlabs
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - backend-network
    # 不暴露端口到主機
    
  backend:
    build: .
    depends_on:
      - mysql
    networks:
      - backend-network
    ports:
      - "8000:8000"

networks:
  backend-network:
    driver: bridge

volumes:
  mysql_data:
```

#### **優勢**:
- ✅ **網路隔離**: MySQL 只在 Docker 網路內可存取
- ✅ **容器化**: 完整 Docker 生態系統
- ✅ **可移植性**: 環境一致性高
- ⚠️ **複雜度**: 需要重新設計架構

### **方案 3: MySQL 用戶權限限制** ⭐⭐⭐
**最低侵入性**

#### **實作步驟**:
```sql
-- 1. 建立限制性用戶
CREATE USER 'backend_user'@'localhost' IDENTIFIED BY 'secure_password';
CREATE USER 'backend_user'@'172.17.0.%' IDENTIFIED BY 'secure_password';

-- 2. 授予最小權限
GRANT SELECT, INSERT, UPDATE, DELETE ON orionlabs.* TO 'backend_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON orionlabs.* TO 'backend_user'@'172.17.0.%';

-- 3. 移除 admin 用戶的遠端存取
DELETE FROM mysql.user WHERE User='admin' AND Host!='localhost';
FLUSH PRIVILEGES;
```

## 🎯 **推薦實作順序**

### **立即實作 (今天)**
1. **修改 MySQL bind-address** (方案 1)
   ```bash
   ssh oracle-tokyo "sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf"
   # 設定: bind-address = 127.0.0.1
   ```

2. **更新後端連接字串**
   ```bash
   # 本地開發環境
   DATABASE_URL=mysql+pymysql://admin:password@localhost:3306/orionlabs
   
   # Docker 環境 (如果 MySQL 也在 Docker)
   DATABASE_URL=mysql+pymysql://admin:password@mysql:3306/orionlabs
   ```

### **短期優化 (本週)**
3. **建立專用資料庫用戶** (方案 3)
4. **測試 Docker 本地後端連接**
5. **驗證外部存取已完全阻擋**

### **長期規劃 (下月)**
6. **考慮完整 Docker 化** (方案 2)
7. **實作資料庫備份策略**
8. **設定監控和日誌**

## 🧪 **測試驗證**

### **安全性測試**
```bash
# 1. 驗證外部無法存取
nmap -p 3306 161.33.209.198
# 應該顯示: closed 或 filtered

# 2. 驗證本機可以存取
ssh oracle-tokyo "mysql -u admin -p -h localhost -e 'SELECT 1;'"
# 應該成功

# 3. 驗證後端應用連接
curl http://161.33.209.198:8000/health
# 應該回傳健康狀態
```

### **功能性測試**
```bash
# 測試 API 功能
curl http://161.33.209.198:8000/api/blog/posts
# 應該正常回傳資料
```

## 📋 **具體實作指令**

### **方案 1 實作** (推薦)
```bash
# 1. SSH 到伺服器
ssh oracle-tokyo

# 2. 備份原始配置
sudo cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.backup

# 3. 編輯配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# 找到並修改: bind-address = 127.0.0.1

# 4. 重啟 MySQL
sudo systemctl restart mysql

# 5. 驗證監聽狀態
sudo ss -tlnp | grep :3306
# 應該看到: 127.0.0.1:3306 而不是 0.0.0.0:3306
```

## 🔍 **故障排除**

### **如果後端無法連接資料庫**
1. **檢查 Docker 網路**:
   ```bash
   docker network ls
   docker inspect orionlabs-backend
   ```

2. **檢查連接字串**:
   ```bash
   # 如果 MySQL bind-address = 127.0.0.1
   # Docker 容器需要使用 host 網路或 bridge IP
   DATABASE_URL=mysql+pymysql://admin:password@host.docker.internal:3306/orionlabs
   ```

3. **檢查防火牆**:
   ```bash
   sudo iptables -L INPUT | grep 3306
   ```

## 🎯 **結論**

**立即推薦**: 實作方案 1 (修改 MySQL bind-address)
- 最安全、最簡單、影響最小
- 完全阻擋外部存取，只允許本機連接
- 後端透過 Docker bridge 或 host.docker.internal 連接

這樣既保證了安全性，又不會影響現有功能！
