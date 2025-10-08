# Orion 品牌網站 — 核心規格書 (簡潔版)  
版本：1.0 更新：2025‑07‑21

---

## 1. 目標與定位
- 展示個人作品、技術文章與生活日誌。  
- 留言表單收集客戶或讀者訊息。  
- 管理端僅本人使用，功能維持最小可用 (文章 / 作品 / 標籤 / 留言)。

---

## 2. 頁面與功能

| Route | 主要功能 |
| ----- | -------- |
| `/` 首頁 | Hero 自我介紹、服務項目列表、技能圖表 |
| `/about` | 個人故事時線、技能分類、統計數字 (年資 / 專案 / 客戶) |
| `/portfolio` | 作品篩選、卡片格線、詳情 Modal、技術標籤 |
| `/blog` | 文章列表、分類 & 標籤、分頁 |
| `/blog/{slug}` | 文章內容 (Markdown + 程式碼高亮) |
| `/contact` | 即時驗證表單、FAQ 手風琴、送出成功提示 |
| `/404` | 友善錯誤頁、返回連結 |
| `/login` | 登入表單 (JWT) |
| `/blogmanage` | 文章 + 標籤 CRUD |
| `/projectmanage` | 作品 + 圖片 CRUD |
| `/messages` | 留言列表、狀態更新 |

---

## 3. 資料模型（必備欄位）

### 3.1 users
| 欄位 | 型別 | 說明 |
| ---- | ---- | ---- |
| id | INT PK | 自增 |
| username | VARCHAR(50) | 登入帳號 |
| password_hash | CHAR(60) | bcrypt |
| role | ENUM('admin','editor') | 權限 |
| created_at | TIMESTAMP | 建立時間 |

### 3.2 posts
| 欄位 | 型別 | 說明 |
| ---- | ---- | ---- |
| id | INT PK |
| slug | VARCHAR(120) UNIQUE |
| title | VARCHAR(150) |
| content_md | MEDIUMTEXT |
| type | ENUM('dev','life') |
| status | ENUM('draft','published') |
| created_at | TIMESTAMP |

### 3.3 projects
| 欄位 | 型別 |
| ---- | ---- |
| id | INT PK |
| name | VARCHAR(100) |
| url | VARCHAR(255) |
| description | TEXT |
| category | ENUM('business','functional','e‑commerce','misc') |
| version | SMALLINT |
| created_at | TIMESTAMP |

### 3.4 其他
`tags`, `project_tags`(多對多), `project_images`, `messages`, `about_stats` 與先前草稿一致。

---

## 4. API 介面（純 JSON）

### 4.1 Auth
- **POST `/auth/login`** → `{access_token, refresh_token}`  
- **POST `/auth/refresh`** → `{access_token}`  
- **POST `/auth/logout`** → `{ok:true}`  

### 4.2 Posts
| 方法 | 路徑 | 功能 |
| ---- | ---- | ---- |
| GET | /posts | 列表 (filter: `type,status,tag,page`) |
| GET | /posts/{slug} | 單篇 |
| POST | /posts | 新增 |
| PATCH | /posts/{id} | 更新 |
| DELETE | /posts/{id} | 刪除 (soft) |

### 4.3 Projects
| GET /projects | 列表 |
| GET /projects/{id} | 詳情 |
| POST /projects | 新增 |
| PATCH /projects/{id} | 更新 |
| DELETE /projects/{id} | 刪除 |
| POST /projects/{id}/images | 上傳圖片 |
| DELETE /projects/{id}/images/{imgId} | 刪圖片 |

### 4.4 Tags
`GET /tags`, `POST /tags`, `DELETE /tags/{id}`

### 4.5 Messages
`POST /messages`, `GET /messages`, `PATCH /messages/{id}/status`

### 4.6 Health
`GET /health` → `{status:"ok"}`

---

## 5. 設計格式

### 5.1 色彩
| 用途 | HEX |
| ---- | --- |
| 主要 | `#2c3e50` |
| 次要 | `#34495e` |
| 強調 | `#3498db` |
| 淺背景 | `#f8f9fa` |

### 5.2 字體
- 系統疊字：`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`  
- 標題 700 weight，內文 400，行高 1.6。

### 5.3 RWD 斷點
| 名稱 | Min‑width |
| ---- | --------- |
| xs | 0 |
| sm | 480px |
| md | 768px |
| lg | 992px |
| xl | 1280px |

### 5.4 元件
- 卡片：`border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,.05);`  
- 按鈕：主色漸變，hover 亮度提升 5%。  
- 表單：Bootstrap 預設 + focus 光暈。

---

## 6. 安全要求
1. 密碼雜湊 `bcrypt` 12 rounds。  
2. JWT：Access 15 min、Refresh 7 d。  
3. Rate Limit：50 req/min/IP。  
4. HTTPS 強制 + HSTS。  
5. 表單 Honeypot ＋ reCAPTCHA v3。  

---

## 7. 附錄：環境變數 (最小集)
DATABASE_URL=
JWT_SECRET=
VITE_API_BASE=