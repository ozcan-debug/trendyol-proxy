const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 1. CORS Başlıkları (Panelin erişebilmesi için)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-agentname");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 2. Proxy Ayarı (Yolu bozmadan ilet)
const proxy = createProxyMiddleware({
  target: 'https://api.trendyol.com',
  changeOrigin: true,
  pathRewrite: {
    // Vercel bazen /api/index.js gibi yollar ekler, bunları temizlemiyoruz.
    // Express gelen yolu olduğu gibi hedefe ekleyecek.
  },
  onProxyReq: (proxyReq, req, res) => {
    // Trendyol'a giden isteği "Web Sitesi" gibi göster (Stealth Mode)
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    proxyReq.setHeader('Referer', 'https://partner.trendyol.com/');
    proxyReq.setHeader('Origin', 'https://partner.trendyol.com');
    proxyReq.setHeader('Host', 'api.trendyol.com');
    
    // POST datası varsa düzelt
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
});

// Tüm yolları proxy'ye ver
app.use('/', proxy);

module.exports = app;
