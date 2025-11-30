const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-agentname");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const trendyolProxy = createProxyMiddleware({
  target: 'https://api.trendyol.com',
  changeOrigin: true,
  pathRewrite: { '^/': '/' },
  onProxyReq: (proxyReq, req, res) => {
    // Trendyol'a giden isteği "Resmi Entegratör" gibi gösteriyoruz
    proxyReq.setHeader('User-Agent', 'Partner-Integration-Client/1.0');
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('Host', 'api.trendyol.com');
    
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
});

app.use('/', trendyolProxy);
module.exports = app;
