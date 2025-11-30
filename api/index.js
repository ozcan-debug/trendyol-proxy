const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 1. CORS ve Güvenlik Başlıkları
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-agentname");
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. Proxy Konfigürasyonu (Trendyol Tüneli)
const proxyOptions = {
  target: 'https://api.trendyol.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug', // Hata ayıklama için logları açtık
  pathRewrite: function (path, req) {
    // Vercel bazen dosya yolunu karıştırabilir, gelen yolu olduğu gibi alıyoruz.
    return path;
  },
  onProxyReq: (proxyReq, req, res) => {
    // Trendyol'un Güvenlik Duvarını Aşan Başlıklar (Stealth Mode)
    proxyReq.setHeader('User-Agent', 'Partner-Integration-Client/1.0');
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('Host', 'api.trendyol.com');
    
    // POST işlemlerinde body verisini düzelt
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // Cevap dönerken de CORS ekle
  }
};

// Express Body Parser (POST verisini okumak için gerekli)
app.use(express.json());

// 3. Tüm İstekleri Yakala ve Proxy'ye İlet
// '*' kullanarak gelen her şeyi, adresi ne olursa olsun yakalıyoruz.
app.use('*', createProxyMiddleware(proxyOptions));

module.exports = app;
