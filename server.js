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

// 【爬蟲代理通道】：專門透過 Jina Reader 抓取網頁的 Markdown 內容，完美避開跨網域 (CORS) 錯誤
app.post('/api/scrape', async (req, res) => {
    const targetUrl = req.body.url;
    if (!targetUrl) {
        return res.status(400).json({ error: "沒有提供目標網址" });
    }
    // 加入 Timeout 機制以防抓取過久
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 秒超時限時
    
    try {
        const response = await fetch(`https://r.jina.ai/${targetUrl}`, {
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(`抓取錯誤碼: ${response.status}`);
        const markdown = await response.text();
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

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`GEO Azure 企業版伺服器已啟動！Port: ${PORT}`);
    console.log(`請確保在 Azure 後台設定了 GEMINI_API_KEY 環境變數。`);
});