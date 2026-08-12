# GEO 內容生成系統 (GEO Azure App)

**當前版本**: v1.21.7

## 專案簡介
這是一個部署於 Azure App Service 的全端網頁應用程式，專門用於產生與優化 SEO 友善的企業級產品內容。系統整合了 AI 內容生成策略，並允許使用者透過拖放參考文件與設定目標網址，快速產出符合品牌規範的行銷文案。

## 核心功能介紹

1. **AI 內容生成與優化引擎**
   - 選單順序：RBU（地區/事業群）＞生成內容（網站產品文案／廣告文案／SEO-GEO文章）＞目標優化引擎＞生成策略。
   - 目標優化引擎支援 Standard SEO, Gemini, Claude, ChatGPT, Perplexity；RBU 選 ACN（中國）時自動切換為文心一言、通義千問、DeepSeek、豆包。
   - 生成策略三種：智慧動態平衡、購買意圖優先、品牌聲量優先。
   - **SEO/GEO 文章（主文＋欉集叢集架構）**：兩階段生成——AI 先依 8 種內容角度評分規劃 3 套「主文＋3篇欉集」主題組合供選擇與微調標題，確認後正式生成 4 篇互相交叉引用的完整文章（含 TL;DR、H2/H3 目錄、FAQ）。

2. **網頁內容爬蟲通道 (Scraping Proxy)**
   - 透過後端 `/api/scrape` 整合 Apify Website Content Crawler，突破前端瀏覽器的 CORS 跨網域限制與一般爬蟲的反爬蟲防護。
   - 自動抓取競品或參考網址的 Markdown 內容，做為 AI 生成的參考語境。

3. **企業知識庫與品牌規範**
   - 內建品牌憲法（Brand Guidelines）輔助參考，支援管理員密碼解鎖編輯。
   - 提供拖放區匯入外部參考資料（PDF, DOCX, XLSX, TXT 等）。

4. **行動版與多國語系支援**
   - **RWD 響應式設計**：支援桌面與手機版完美排版。
   - **多語系切換**：英文 (預設) ＞ 日文 ＞ 韓文 ＞ 繁體中文 ＞ 簡體中文，共 5 語系。介面語言與 AI 生成內容語言一致。

5. **後台追蹤與建議反饋**
   - 透過公司信箱登入，紀錄各部門使用頻率。
   - 系統建議反饋通道與管理員追蹤儀表板。

## 部署與運行
- **後端環境**: Node.js (Express)
- **部署平台**: Microsoft Azure App Service
- **部署方式**: Azure Zip Deploy（OneDeploy）—— 打包後以 `az webapp deploy --src-path appdeploy.zip --type zip` 上傳，建置行為由 `.deployment` 指定（`SCM_DO_BUILD_DURING_DEPLOYMENT=true`）
- **注意**: GitHub 與 Azure **無自動連動**。推送至 GitHub 僅進版控，不會更新正式站；上線需另外執行 Zip Deploy
- **正式站**: https://adv-ai-geo.azurewebsites.net （Resource Group: `Adv-Sales-Marketing-Services`）
