import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Node.js ES6 模組路徑設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Azure 會自動分配 PORT，若在本地測試則預設使用 8080
const PORT = process.env.PORT || 8080;

// 【保全設定 1】：允許接收來自前端的大容量圖檔 (50MB)
app.use(express.json({ limit: '50mb' }));

// 【保全設定 2】：將這個資料夾變成網頁伺服器，自動讀取 index.html
app.use(express.static(__dirname));

// 【爬蟲代理通道】：透過 Apify Website Content Crawler 抓取網頁的 Markdown 內容，完美避開跨網域 (CORS) 錯誤
// 關閉 Readability 式自動清理（htmlTransformer: none），改用手動選擇器排除 Cookie 同意框與導覽/頁尾，
// 避免像 iotmart.com 這類 Salesforce Experience Cloud 商店頁，內建演算法誤判把賣點/認證/價格當雜訊丟棄
app.post('/api/scrape', async (req, res) => {
    const targetUrl = req.body.url;
    if (!targetUrl) {
        return res.status(400).json({ error: "沒有提供目標網址" });
    }
    const apifyToken = process.env.APIFY_API_KEY;
    if (!apifyToken) {
        return res.status(500).json({ error: "伺服器嚴重錯誤：Azure 後台尚未設定 APIFY_API_KEY 環境變數！" });
    }
    // Apify 需要啟動無頭瀏覽器渲染 JS，比純文字抓取慢，給 140 秒超時
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 140000);

    try {
        const response = await fetch(`https://api.apify.com/v2/actors/apify~website-content-crawler/run-sync-get-dataset-items?token=${apifyToken}&timeout=120`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startUrls: [{ url: targetUrl }],
                maxCrawlDepth: 0,
                maxCrawlPages: 1,
                saveMarkdown: true,
                crawlerType: 'playwright:firefox',
                dynamicContentWaitSecs: 20,
                htmlTransformer: 'none',
                // 涵蓋常見同意管理工具（CookieYes/OneTrust/Cookiebot/TrustArc）+ 通用頁尾/導覽，
                // 但仍非萬能：不同網站用的同意框架不同，仍可能有殘留雜訊，需個別網站再微調
                removeElementsCssSelector: '[class*="cky-"], [id*="cookieyes" i], #onetrust-banner-sdk, .onetrust-pc-dark-filter, #CybotCookiebotDialog, #truste-consent-track, [class*="cookie-consent" i], [id*="cookie-consent" i], [class*="gdpr" i], footer, nav, script, style, noscript'
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody?.error?.message || `抓取錯誤碼: ${response.status}`);
        }
        const items = await response.json();
        const markdown = items?.[0]?.markdown || items?.[0]?.text || '';
        res.json({ text: markdown });
    } catch (error) {
        clearTimeout(timeout);
        res.status(500).json({ error: `網頁抓取失敗: ${error.message}` });
    }
});

// 【核心機密通道】：專門幫前端去向 Google 拿資料的隱形通道
app.post('/api/generate', async (req, res) => {
    // 🚨 關鍵：從 Azure 保險箱拿出金鑰，前端絕對看不到！
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            error: { message: "伺服器嚴重錯誤：Azure 後台尚未設定 GEMINI_API_KEY 環境變數！" } 
        });
    }

    try {
        // 代替前端去呼叫 Google Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        
        // 如果 Google 報錯，原封不動把錯誤訊息傳給前端
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        // 成功拿回資料，回傳給前端網頁
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: { message: `伺服器連線異常: ${error.message}` } });
    }
});

// 【GEO文章搜尋補充通道】：幫SEO/GEO文章生成流程去Tavily查詢最新事實/數據當佐證素材
app.post('/api/tavily-search', async (req, res) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: { message: "伺服器嚴重錯誤：Azure 後台尚未設定 TAVILY_API_KEY 環境變數！" } });
    }
    const { query, max_results } = req.body;
    if (!query) {
        return res.status(400).json({ error: { message: "沒有提供查詢關鍵字" } });
    }
    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ query, max_results: max_results || 4, search_depth: 'basic' })
        });
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: { message: `搜尋服務連線異常: ${error.message}` } });
    }
});

// 【產品照片轉存通道】：把爬取結果裡找到的研華產品主圖網址，轉成base64給前端當生圖參考圖（避開瀏覽器直接抓外部圖片的CORS限制）
app.post('/api/fetch-image', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: { message: "沒有提供圖片網址" } });
    }
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) {
            return res.status(response.status).json({ error: { message: `圖片下載失敗: HTTP ${response.status}` } });
        }
        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = Buffer.from(await response.arrayBuffer());
        res.json({ mimeType: contentType, data: buffer.toString('base64') });
    } catch (error) {
        res.status(500).json({ error: { message: `圖片下載連線異常: ${error.message}` } });
    }
});

// 【GEO文章重點配圖通道】：幫SEO/GEO文章生成流程呼叫Gemini原生圖片模型，產出文章重點示意圖
app.post('/api/generate-image', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: { message: "伺服器嚴重錯誤：Azure 後台尚未設定 GEMINI_API_KEY 環境變數！" } });
    }
    const { prompt, refImage } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: { message: "沒有提供圖片描述" } });
    }
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
        const parts = [];
        // refImage：前端從研華產品頁抓到的真實產品照片（已由/api/fetch-image轉成base64），
        // 附上去讓生圖模型照著真實外觀畫，不是憑空想像
        if (refImage && refImage.mimeType && refImage.data) {
            parts.push({ inlineData: { mimeType: refImage.mimeType, data: refImage.data } });
        }
        parts.push({ text: prompt });
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: { message: `圖片生成服務連線異常: ${error.message}` } });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`GEO Azure 企業版伺服器已啟動！Port: ${PORT}`);
    console.log(`請確保在 Azure 後台設定了 GEMINI_API_KEY 與 APIFY_API_KEY 環境變數。`);
});