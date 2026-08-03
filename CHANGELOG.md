# 版本控管紀錄 (Changelog)

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
