const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 1. CORS İzinleri (Tarayıcıyı engellememesi için)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-agentname");
  
  // Ön uçuş (Preflight) isteğine hemen cevap ver
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Proxy Ayarları (Trendyol'a Tünel)
const trendyolProxy = createProxyMiddleware({
  target: 'https://api.trendyol.com', // Hedef Ana Sunucu
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Vercel bazen "/api" ön eki ekleyebilir, onu temizlemiyoruz çünkü rewrites ayarı yaptık.
    // Gelen yol neyse (örn: /sapigw/suppliers/...), aynen iletilsin.
    return path; 
  },
  onProxyReq: (proxyReq, req, res) => {
    // Trendyol'a giden başlıkları düzenle (Stealth Mode)
    proxyReq.setHeader('User-Agent', 'Partner-Integration-Client/1.0');
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('Host', 'api.trendyol.com');
    
    // Body verisini (POST) yeniden yaz
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Gelen cevaba CORS başlığını zorla ekle
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
});

// Tüm istekleri proxy'ye yönlendir
app.use('/', trendyolProxy);

module.exports = app;
