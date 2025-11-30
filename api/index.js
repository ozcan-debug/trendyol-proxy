export default async function handler(req, res) {
  // 1. OPTIONS İSTEĞİ (Ön Kontrol)
  // Vercel.json halletse bile garanti olsun diye buraya da koyuyoruz.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. HEDEF URL OLUŞTURMA
    // Gelen yolun başındaki "/" işaretini garantiye alalım
    const path = req.url.startsWith('/') ? req.url : '/' + req.url;
    const targetUrl = 'https://api.trendyol.com' + path;

    // 3. TRENDYOL'A İSTEK (STEALTH MODE)
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

    // 4. CEVABI OKU VE İLET
    const data = await response.text();
    
    // Vercel.json headers eklediği için buraya eklemeye gerek yok, direkt cevabı dön.
    res.status(response.status).send(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
}
