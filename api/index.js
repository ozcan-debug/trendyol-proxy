export default async function handler(req, res) {
  // 1. CORS İZİNLERİ (Tarayıcıya "Sorun yok, geç" diyoruz)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, User-Agent');

  // 2. ÖN KONTROL (OPTIONS) İSTEĞİ
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 3. HEDEF ADRESİ OLUŞTUR
    // Gelen URL: /sapigw/suppliers/... -> Hedef: https://api.trendyol.com/sapigw/suppliers/...
    const targetUrl = 'https://api.trendyol.com' + req.url;

    // 4. TRENDYOL'A GİDEN İSTEK (STEALTH MODE - GİZLİ MOD)
    // Kendimizi "Partner Paneli" gibi gösteriyoruz.
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '', // Şifreyi taşı
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://partner.trendyol.com/',
        'Origin': 'https://partner.trendyol.com',
        'Host': 'api.trendyol.com'
      }
    };

    // Eğer POST isteği ise ve body varsa ekle
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // Trendyol'a Ateşle!
    const response = await fetch(targetUrl, fetchOptions);
    
    // Trendyol'dan gelen cevabı oku (Text olarak alıyoruz ki HTML hatası varsa görelim)
    const data = await response.text();

    // 5. CEVABI TARAYICIYA İLET
    // Trendyol ne dediyse (200, 403, 404) aynen iletiyoruz.
    res.status(response.status).send(data);

  } catch (error) {
    // Sunucu hatası olursa 500 dön ve hatayı yaz
    console.error("Proxy Hatası:", error);
    res.status(500).json({ error: "Proxy Hatası: " + error.message });
  }
}
