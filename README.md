# GEO 內容生成系統 (GEO Azure App)

**當前版本**: v1.19.3

## 專案簡介
這是一個部署於 Azure App Service 的全端網頁應用程式，專門用於產生與優化 SEO 友善的企業級產品內容。系統整合了 AI 內容生成策略，並允許使用者透過拖放參考文件與設定目標網址，快速產出符合品牌規範的行銷文案。

## 核心功能介紹

1. **AI 內容生成與優化引擎**
   - 支援多種優化模式（Standard SEO, Gemini, Claude, ChatGPT, Perplexity, Google Ads）。
   - 支援三種標題生成策略：智慧動態平衡、購買意圖優先、品牌聲量優先。
   
2. **網頁內容爬蟲通道 (Scraping Proxy)**
   - 透過後端 `/api/scrape` 整合 Jina Reader，突破前端瀏覽器的 CORS 跨網域限制。
   - 自動抓取競品或參考網址的 Markdown 內容，做為 AI 生成的參考語境。

3. **企業知識庫與品牌規範**
   - 內建品牌憲法（Brand Guidelines）輔助參考，支援管理員密碼解鎖編輯。
   - 提供拖放區匯入外部參考資料（PDF, DOCX, XLSX, TXT 等）。

4. **行動版與多國語系支援**
   - **RWD 響應式設計**：支援桌面與手機版完美排版。
   - **多語系切換**：支援英文 (預設)、繁體中文、簡體中文。

5. **後台追蹤與建議反饋**
   - 透過公司信箱登入，紀錄各部門使用頻率。
   - 系統建議反饋通道與管理員追蹤儀表板。

## 部署與運行
- **後端環境**: Node.js (Express)
- **部署平台**: Microsoft Azure App Service
- **部署方式**: Azure Zip Deploy（OneDeploy）—— 打包後以 `az webapp deploy --src-path appdeploy.zip --type zip` 上傳，建置行為由 `.deployment` 指定（`SCM_DO_BUILD_DURING_DEPLOYMENT=true`）
- **注意**: GitHub 與 Azure **無自動連動**。推送至 GitHub 僅進版控，不會更新正式站；上線需另外執行 Zip Deploy
- **正式站**: https://adv-ai-geo.azurewebsites.net （Resource Group: `Adv-Sales-Marketing-Services`）
