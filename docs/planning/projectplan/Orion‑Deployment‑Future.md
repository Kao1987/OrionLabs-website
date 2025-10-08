# Orion 品牌網站 — 部署建議與未來規劃  
版本：1.0 更新：2025‑07‑21

---

## 1. 目前部署概況
| 層級 | 建議雲端資源 | 理由 |
| ---- | ------------ | ---- |
| 前端 | 阿里雲 ECS 2 vCPU / 2 GiB | 可容納 ≤ 30 k UV/月，維護成本低 |
| 後端 | GCP e2‑micro (永遠免費) | FastAPI API；低流量零月費 |
| DNS / WAF | Cloudflare Free | 具基本 DDoS 防禦、快取 |

*現有規模足以支撐輕量品牌站；後續可按流量水平升級。*

---

## 2. 安全與可靠性建議
| 類別 | 建議措施 | 目的 |
| ---- | -------- | ---- |
| 傳輸 | 全站 HTTPS + HSTS | 防竊聽、強制加密 |
| 認證 | JWT Access+Refresh，密鑰輪替 | 減少憑證外洩風險 |
| 速率 | Nginx 每 IP 50 req/min | 阻擋暴力攻擊 |
| 表單 | reCAPTCHA v3 + Honeypot | 防垃圾訊息 |
| 日誌 | Cloudflare WAF Log ≥ 100 次命中須檢討 | 早期偵測惡意流量 |
| 備份 | 每日資料庫差分 + 週全備，離線存放 30 天 | 防資料遺失 |

---

## 3. 成本與升級門檻
| 指標 | 臨界值 | 建議升級 |
| ---- | ------ | -------- |
| 月 UV | > 30 k | 啟用 Cloudflare APO (5 USD/月) |
| API RPS | > 25 | 升級 GCP e2‑small（約 13 USD/月） |
| 流量 | 1 TB/月 | 轉 OSS + CDN 靜態存放；ECS 關機 |
| 高峰 CPU | > 70 % 持續 10 分鐘 | 考慮 Cloud Run AutoScale |

---

## 4. 擴充與優化路線圖
1. **Cloudflare APO** — 邊緣快取整頁 HTML，降低後端負荷。  
2. **前端靜態化** — 將 `dist/` 發布至阿里 OSS 或 GitHub Pages，結合 CDN。  
3. **後端無伺服器** — 將 FastAPI 容器鏡像部屬至 Cloud Run，RPS 高峰時自動擴充。  
4. **圖片服務** — 改用 Cloudflare Images 或 Aliyun OSS ImageStyle，自動轉 WebP 與縮圖。  
5. **多語系 i18n** — 在 posts 增 `locale` 欄位，路由加 `/en/` `/zh/` 前綴。  
6. **OAuth 登入** — Google / GitHub 登入取代本地密碼，減少管理成本。  
7. **Edge Function SEO** — ISR（Incremental Static Regeneration）或 Edge Rendering，兼顧 SSG 與即時性。  

---

## 5. 監控與可觀測性
| 項目 | 監測指標 | 建議工具 |
| ---- | -------- | -------- |
| 可用性 | HTTPS 200 OK / 延遲 | Uptime‑Kuma |
| 資源 | CPU / RAM / 帶寬 | Grafana + Prometheus |
| 安全 | SSH 登入失敗、WAF 命中 | Fail2Ban / Cloudflare Log |
| 備份 | dump 成功率、大小 | Cloud Storage Lifecycle |
| 前端品質 | Lighthouse ➤ Performance ≥ 90 | 定期自動報表 |

---

## 6. 法規與合規
- **GDPR / CCPA**：若使用 GA 或第三方 Cookie，須出現同意 Banner。  
- **Accessibility (WCAG 2.1 AA)**：對比度、ARIA、鍵盤操作皆符合。  

---

### 結論
> 目前架構足以支撐個人品牌初期發展；  
> 當訪問量或商業需求提升，可依「成本 vs 效益」分階段擴充，  
> 保持 **低成本、低維護、可水平擴張** 的原則。  
> 任何時候首要確保 **資料安全與備份完整**，其次再追求效能優化。  
