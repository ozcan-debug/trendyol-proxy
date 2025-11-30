export default async function handler(req, res) {
  // 1. CORS İZİNLERİ (Tarayıcı Kapısı)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, User-Agent');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. URL HAZIRLIĞI
    const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
    const cleanPath = path.replace('/api/index', '');
    const targetUrl = 'https://api.trendyol.com' + cleanPath;

    // 3. POSTMAN TAKLİDİ (Headers)
    // Tarayıcı gibi görünmeye çalışmak yerine, saf bir API istemcisi gibi görünüyoruz.
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization || '', // Şifre
      'User-Agent': 'PostmanRuntime/7.29.2', // KİLİT NOKTA: Postman gibi davran
      'Accept': '*/*',
      'Cache-Control': 'no-cache',
      'Host': 'api.trendyol.com',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };

    // 4. İSTEK GÖNDER
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : null
    });

    // 5. CEVABI İLET
    const data = await response.text();
    res.status(response.status).send(data);

  } catch (error) {
    console.error("Proxy Hatası:", error);
    res.status(500).json({ error: error.message });
  }
}
