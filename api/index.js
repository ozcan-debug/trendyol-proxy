// Vercel Native Proxy - Manuel URL İnşası
const url = require('url');

export default async function handler(req, res) {
  // 1. CORS İzinleri (Tarayıcı Dostu)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-agentname');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. URL TEMİZLİĞİ VE İNŞASI (En Kritik Kısım)
    // Gelen isteğin tam URL'sini alıyoruz
    const requestUrl = req.url;
    
    // Vercel bazen internal pathleri ekler, temizleyelim
    // Bizim istediğimiz "/sapigw/..." ile başlayan kısımdır.
    // Eğer url "/api/index.js?..." gibi gelirse bunu düzeltmemiz lazım.
    
    let pathToSend = requestUrl;
    
    // Eğer istek "/api/index" içeriyorsa bu Vercel'in iç yönlendirmesidir, bunu atlayıp query'ye bakabiliriz
    // Ancak genelde rewrites ile "/sapigw/..." olarak gelir.
    
    // HEDEF ADRES:
    const targetUrl = 'https://api.trendyol.com' + pathToSend;

    // 3. TRENDYOL'A İSTEK (Stealth Mode Headers)
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://partner.trendyol.com/',
        'Origin': 'https://partner.trendyol.com',
        'Host': 'api.trendyol.com'
      },
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : null
    });

    // 4. CEVABI DÖN
    const data = await response.text();
    
    // Debug Header (Panelde hatayı görürsek hangi adrese gittiğimizi anlamak için)
    res.setHeader('x-debug-target-url', targetUrl);
    
    res.status(response.status).send(data);

  } catch (error) {
    res.status(500).json({ error: "Proxy İç Hatası: " + error.message });
  }
}
