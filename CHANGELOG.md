# 版本控管紀錄 (Changelog)

## [v1.19.1] - 2026-08-10
### 修復
- **產品型號／關鍵字幻覺修正 (commit `ca98b17`)**：
  - 目標網址與參考網址欄位改為逐行 `trim()`，避免多餘空白造成判讀錯誤。
  - 輸入若非 `http` 開頭，判定為「產品型號或關鍵字」，直接跳過爬蟲並改以提示語引導 AI 使用內建知識庫，解決過去因抓取失敗而輸出 `N/A` 的問題。
  - 爬取失敗時的提示語改為引導 AI 以內建知識庫為主，不再插入干擾性的失敗標記。
- **編碼修復 (commit `299092e`)**：修正 `index.html` 中文字元毀損問題，同時保留 8 月的排版與版號更新。

### 維護
- **版號全面對齊**：`package.json` 自 `1.18.0` 補正至 `1.19.1`，與 `index.html`、`README.md` 一致。
- **文件校正**：README 部署說明更正為實際使用的 Azure Zip Deploy（OneDeploy），原「GitHub 自動觸發部署」敘述與 Azure 實際設定不符（`deployment source` 未綁定 GitHub，專案亦無 GitHub Actions）。
- **`.gitignore` 強化**：排除 `appdeploy.zip`、`publish_profiles.json` 與除錯用暫存檔，避免部署憑證與比對檔誤入版控。

## [v1.19.0] - 2026-08-03
### 新增與優化
- **行動版排版全面優化 (Mobile UI Overhaul)**：
  - 新增 mobile CSS `@media` 規則，解決手機版區塊擁擠與溢出問題。
  - Navbar 右側按鈕改為 Grid 排列，並將連線狀態指示器移至 Logo 右方節省空間。
  - 各 Section 的 padding 在小螢幕下縮減為 `p-4`，以增加內容可視範圍。
  - Textarea 與拖放上傳區塊的高度在手機版縮減。
  - 引擎與策略下拉選單在手機版改為全寬垂直排列。
  - 結果區塊文字與間距縮小，提升行動端閱讀體驗。
- **預設語系調整**：網頁載入時的預設語言由繁體中文 (`zh-TW`) 變更為英文 (`en`)。
- **基礎設施**：新增 `.deployment` 設定檔與 `.vscode/settings.json` 並納入版控，強化 Azure 部署穩定性。

## [v1.18.3] - 2026-06-18
### 新增
- **網頁抓取代理 (Scraping Proxy)**：
  - 後端新增 `/api/scrape` 路由。
  - 整合 Jina Reader API 將網頁轉換為 Markdown。
  - 實作 20 秒 Timeout 控制與錯誤攔截機制，成功避開前端 CORS 限制。

---
*備註：本專案遵循 Global Developer Constitution，自 v1.19.0 起嚴格執行每次修改自動更新版號與文件的規範。*
