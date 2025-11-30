// Vercel Native Serverless Function (Kütüphanesiz)
// Node.js'in yerleşik 'fetch' özelliğini kullanır.

export default async function handler(req, res) {
  // 1. KAPIYI SONUNA KADAR AÇ (CORS FIX)
  // Hangi siteden gelirse gelsin, izin ver.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, User-Agent');

  // 2. TARAYICI "GİREBİLİR MİYİM?" (OPTIONS) DİYE SORARSA:
  if (req.method === 'OPTIONS') {
    res.status(200).end(); // "Evet girebilirsin" de ve işlemi bitir.
    return;
  }

  try {
    // 3. HEDEF ADRESİ BELİRLE
    // Gelen istekteki yolu al (örn: /sapigw/suppliers/...)
    const path = req.url;
    const targetUrl = 'https://api.trendyol.com' + path;

    // 4. TRENDYOL'A GİT (STEALTH MODE)
    // Trendyol'un güvenlik duvarını aşan "Ben Chrome'um" başlıkları
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '', // Şifreyi taşı
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://partner.trendyol.com/',
        'Origin': 'https://partner.trendyol.com',
        'Host': 'api.trendyol.com'
      },
      // POST veya PUT ise veriyi de ekle
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : null
    });

    // 5. CEVABI AL VE TARAYICIYA VER
    // Text olarak alıyoruz ki hata HTML ise görebilelim
    const data = await response.text();

    // Trendyol'dan gelen durum kodunu (200, 404, 500) aynen yansıt
    res.status(response.status).send(data);

  } catch (error) {
    // Sunucu içinde bir hata olursa 500 dön
    console.error("Proxy Hatası:", error);
    res.status(500).json({ error: "Proxy Bağlantı Hatası: " + error.message });
  }
}
