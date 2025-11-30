export default async function handler(req, res) {
  // 1. MANUEL CORS (Vercel.json yetmezse diye çifte dikiş)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent');

  // 2. PREFLIGHT (ÖN UÇUŞ) KONTROLÜ - CORS HATASINI BİTİREN SATIR
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 3. HEDEF URL (YOLU KAYBETMEDEN)
    // Gelen url'nin başındaki "/" işaretini garantiye al
    const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
    // Eğer path içinde "/api/index" varsa (Vercel bazen ekler), onu temizle
    const cleanPath = path.replace('/api/index', '');
    
    const targetUrl = 'https://api.trendyol.com' + cleanPath;

    // 4. TRENDYOL'A İSTEK (GİZLİ MOD)
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://partner.trendyol.com/',
        'Origin': 'https://partner.trendyol.com'
      },
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : null
    });

    // 5. CEVABI İLET
    const data = await response.text();
    res.status(response.status).send(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Proxy Bağlantı Hatası: " + error.message });
  }
}
