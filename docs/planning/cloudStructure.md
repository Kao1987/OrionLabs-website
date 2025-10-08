本地端的LineageW-Labs 就是線上版的  lineagew-labs.orionlabs.pro
本地端的Divination 就是線上版的 divinationlabs.orionlabs.pro
本地端的Orionlabs-website 就是線上版的 orionlabs.pro

以下是你目前雲端的實際架構、說明，以及未來維護時你可能會忘記但很重要的資訊整理：

---

# Orionlabs 雲端專案架構與說明（2024/07）

---

## 1. 目錄結構（2024/07 現況）

```
/opt/orionlabs/
├── Orionlabs-backend/           # FastAPI 後端原始碼與虛擬環境
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── orionlabs-env/           # Python 虛擬環境
│   └── ...（其他後端檔案）

/var/www/
├── orionlabs.pro/
│   ├── personal-brand-website/  # 前端原始碼與建構產物（目前建構產物在這裡）
│   │   └── dist/                # 前端建構產物（Nginx root 指向這裡）
│   ├── LineageW-Labs/           # 其他前端原始碼（如有）
│   ├── backend/                 # 之前誤上傳的本地資料夾（建議刪除）
│   ├── ...（其他本地端誤上傳的資料夾）
│   ├── index.html、favicon.ico、assets/（建構產物內容）
│   └── ...（.git、CNAME 等檔案）
├── lineagew-labs.orionlabs.pro/ # 其他網站
├── divinationlabs.orionlabs.pro/
├── html/                        # Nginx 預設網頁
```

---

## 2. Nginx 主要設定（orionlabs.pro）

```nginx
server {
    server_name orionlabs.pro www.orionlabs.pro;
    root /var/www/orionlabs.pro/personal-brand-website/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    # SSL 設定略
}
```
- **root** 目前指向 `/var/www/orionlabs.pro/personal-brand-website/dist`
- 外部訪客**只會看到這個 dist 目錄下的內容**，其他資料夾不會被公開

---

## 3. 前端部署流程

- 你目前是用 GitHub Action（或手動）把前端建構產物（dist）部署到 `/var/www/orionlabs.pro/personal-brand-website/dist/`
- 只要 dist 內容正確，網站就能正常顯示

---

## 4. 後端部署流程

- 後端原始碼放在 `/opt/orionlabs/Orionlabs-backend/`
- 用 Python 虛擬環境執行（如 `source orionlabs-env/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000`）
- Nginx 會有一個 API 站台（如 api.orionlabs.pro）反向代理到這個 FastAPI 服務

---

## 5. 你可能會忘記但很重要的資訊

- **Nginx root 只會服務設定的 dist 目錄，其他本地誤上傳的資料夾不會被外部看到**
- 你可以安全刪除 `/var/www/orionlabs.pro/` 下除了 `personal-brand-website`（或未來直接 dist）以外的資料夾
- **前端原始碼**不需要放在 `/var/www/`，只需建構產物
- **建議未來把 dist 直接部署到 `/var/www/orionlabs.pro/`，這樣可以刪掉 personal-brand-website 這個中間資料夾，讓結構更簡單**
- **Nginx 設定變更後要 `sudo nginx -t && sudo systemctl reload nginx`**
- **API base url** 請在前端 .env.production 設定為 `https://api.orionlabs.pro`
- **後端不要放在 /var/www/，只放在 /opt/orionlabs/ 下，避免資安風險**
- **多餘的本地端資料夾（如 backend、LineageW-Labs、LineageW-Calculator 等）可以直接 rm -rf 刪除**
- **網站能否正常顯示，完全取決於 Nginx root 指向的 dist 內容**
- **未來如要自動化部署，請讓 GitHub Action 直接覆蓋正確的 dist 目錄即可**

---

## 6. 建議的未來最佳化

- **將 Nginx root 改為 `/var/www/orionlabs.pro/`，dist 內容直接放這裡，刪除 personal-brand-website 夾層**
- **所有原始碼（前後端）都放在 `/opt/orionlabs/`，只保留建構產物在 `/var/www/`**
- **每次部署前可自動清空 `/var/www/orionlabs.pro/`，再複製最新 dist 內容進去，避免舊檔殘留**

---

## 10 行說明邏輯

1. 目前 Nginx root 指向 /var/www/orionlabs.pro/personal-brand-website/dist
2. 外部只會看到這個 dist 目錄下的內容
3. /var/www/orionlabs.pro/ 下多餘資料夾可安全刪除
4. 前端原始碼不需放 /var/www/，只需建構產物
5. 後端原始碼放 /opt/orionlabs/Orionlabs-backend
6. Nginx 設定變更後要 reload
7. API base url 設定為 https://api.orionlabs.pro
8. 未來可將 dist 直接部署到 /var/www/orionlabs.pro/
9. 多網站部署可用同一模式
10. 保持前後端分離，安全又好維護

---

**這份整理建議你存檔，未來忘記時直接看這份就能快速回憶你的雲端專案架構與部署邏輯！如需自動化腳本或 Nginx 範本，歡迎再問我。**