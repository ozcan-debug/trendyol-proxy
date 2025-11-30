// Bu kod Vercel'in "Serverless Function" yapısına %100 uyumludur.
// Harici kütüphane gerektirmez.

export default async function handler(req, res) {
  // 1. CORS İZİNLERİ (Tarayıcıdan gelen isteklere kapıyı aç)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, User-Agent');

  // Tarayıcı "İzin var mı?" diye sorarsa (OPTIONS), "Evet" de ve bitir.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. HEDEF ADRESİ OLUŞTUR
  // Gelen adres neyse (örn: /sapigw/suppliers/...) onu Trendyol'un sonuna ekle.
  const targetUrl = 'https://api.trendyol.com' + req.url;

  try {
    // 3. TRENDYOL'A İSTEK AT (Native Fetch)
    // Burada "Stealth Mode" (Gizli Mod) başlıklarını ekliyoruz.
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '', // Şifreyi aynen ilet
        // Güvenlik duvarını aşan sihirli başlıklar:
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://partner.trendyol.com/',
        'Origin': 'https://partner.trendyol.com',
        'Host': 'api.trendyol.com'
      },
      // Eğer veri gönderiliyorsa (POST), veriyi JSON'a çevirip ekle
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : null
    });

    // 4. TRENDYOL'DAN GELEN CEVABI OKU VE TARAYICIYA İLET
    const data = await response.text(); // JSON yerine text alıyoruz ki hata varsa HTML'i de görelim
    
    // Trendyol'un verdiği durum kodunu (200, 403, 500) aynen yansıt
    res.status(response.status).send(data);

  } catch (error) {
    // Sunucu hatası olursa
    console.error("Proxy Hatası:", error);
    res.status(500).json({ error: "Proxy Hatası: " + error.message });
  }
}
