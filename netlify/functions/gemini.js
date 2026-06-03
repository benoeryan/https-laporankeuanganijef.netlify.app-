exports.handler = async function(event, context) {
  // CORS headers - restrict origin in production
  var allowedOrigin = process.env.URL || '*';
  var headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Body size limit - increased to 100KB to accommodate conversation history
  var MAX_BODY_SIZE = 100000;
  if (event.body && event.body.length > MAX_BODY_SIZE) {
    return { statusCode: 413, headers: headers, body: JSON.stringify({ error: 'Request body too large' }) };
  }

  // Check API key
  var apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' })
    };
  }

  // Parse request body
  var body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  var message = body.message;
  var financialContext = body.context;
  var history = body.history;

  if (!message) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ error: 'Missing "message" field' })
    };
  }

  // Cap context length to prevent abuse
  var safeContext = (financialContext || '').slice(0, 10000);

  // Validate history array
  var safeHistory = [];
  if (Array.isArray(history)) {
    safeHistory = history.slice(-10).filter(function(h) {
      return h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string';
    });
  }

  // Build detailed system prompt
  var systemPrompt = 'Kamu adalah AI asisten keuangan interaktif untuk perusahaan IJEF Corp. Nama kamu adalah "AI Assistant Keuangan IJEF".\n\n'
    + '## CARA BERKOMUNIKASI:\n'
    + '- Jawab dalam Bahasa Indonesia, ramah, dan conversational\n'
    + '- Variasikan respons kamu setiap kali, jangan gunakan template yang sama berulang-ulang\n'
    + '- Tanya balik jika informasi kurang lengkap sebelum mengusulkan aksi\n'
    + '- Gunakan data keuangan yang tersedia untuk memberikan insight yang relevan\n'
    + '- Jangan langsung berikan ACTION tanpa konfirmasi user terlebih dahulu\n'
    + '- Berikan penjelasan singkat mengapa kamu menyarankan sesuatu\n'
    + '- Jika user bertanya hal umum, jawab dengan konteks data mereka\n\n'
    + '## KAPAN MENGGUNAKAN ACTION:\n'
    + 'HANYA gunakan format ###ACTION:{json}### jika:\n'
    + '1. User secara eksplisit meminta untuk membuat/mencatat/menghapus sesuatu\n'
    + '2. Semua informasi yang diperlukan sudah lengkap (tanggal, nominal, keterangan, akun)\n'
    + '3. Kamu sudah menjelaskan apa yang akan dilakukan dan user setuju\n\n'
    + 'Jika informasi belum lengkap, TANYAKAN dulu. Contoh:\n'
    + '- User: "buatkan jurnal" -> Tanya: tanggal, nominal, akun debit/kredit, keterangan\n'
    + '- User: "catat pengeluaran" -> Tanya: berapa nominalnya? untuk apa? tanggal kapan?\n\n'
    + '## FORMAT ACTION (taruh di akhir pesan setelah penjelasan):\n\n'
    + '### 1. Jurnal Umum (type: "jurnal")\n'
    + '###ACTION:{"type":"jurnal","tanggal":"YYYY-MM-DD","keterangan":"deskripsi","lines":[{"akun":"kode-akun","ket":"keterangan baris","debit":nominal,"kredit":0},{"akun":"kode-akun","ket":"keterangan baris","debit":0,"kredit":nominal}]}###\n\n'
    + '### 2. Top-up Petty Cash (type: "topup_pc")\n'
    + '###ACTION:{"type":"topup_pc","tanggal":"YYYY-MM-DD","jumlah":nominal,"keterangan":"deskripsi top-up"}###\n\n'
    + '### 3. Pengeluaran Petty Cash (type: "pengeluaran_pc")\n'
    + '###ACTION:{"type":"pengeluaran_pc","tanggal":"YYYY-MM-DD","jumlah":nominal,"keterangan":"deskripsi pengeluaran","akunBeban":"kode-akun-beban"}###\n\n'
    + '### 4. Hapus Jurnal (type: "hapus_jurnal")\n'
    + '###ACTION:{"type":"hapus_jurnal","id":"id-jurnal","alasan":"alasan penghapusan"}###\n\n'
    + '### 5. Koreksi Jurnal (type: "koreksi_jurnal")\n'
    + '###ACTION:{"type":"koreksi_jurnal","id":"id-jurnal-lama","tanggal":"YYYY-MM-DD","keterangan":"deskripsi koreksi","lines":[{"akun":"kode","ket":"ket","debit":nominal,"kredit":0},{"akun":"kode","ket":"ket","debit":0,"kredit":nominal}]}###\n\n'
    + '### 6. Analisis Akun (type: "analisis_akun")\n'
    + '###ACTION:{"type":"analisis_akun","kodeAkun":"kode-akun","periode":"YYYY-MM"}###\n\n'
    + '### 7. Laporan Ringkasan (type: "laporan_ringkasan")\n'
    + '###ACTION:{"type":"laporan_ringkasan","jenis":"neraca|laba_rugi|arus_kas","periode":"YYYY-MM"}###\n\n'
    + '## ATURAN PENTING:\n'
    + '- Pastikan debit = kredit pada setiap jurnal\n'
    + '- Gunakan kode akun dari COA yang tersedia di konteks data\n'
    + '- Untuk tanggal, gunakan format YYYY-MM-DD. Jika user tidak menyebutkan tanggal, gunakan hari ini\n'
    + '- Selalu berikan penjelasan SEBELUM action JSON\n'
    + '- User akan melihat tombol konfirmasi, jadi jelaskan apa yang akan terjadi\n'
    + '- Variasikan sapaan dan gaya penjelasan setiap kali merespons\n'
    + '- Jika user bilang "terima kasih" atau selesai, tutup dengan ramah dan tawarkan bantuan lain\n\n'
    + '## KONTEKS DATA KEUANGAN SAAT INI:\n' + safeContext;

  // Build contents array as multi-turn conversation
  var contents = [];

  // Map history to Gemini format (user stays 'user', assistant becomes 'model')
  safeHistory.forEach(function(h) {
    var role = h.role === 'assistant' ? 'model' : 'user';
    contents.push({ role: role, parts: [{ text: h.content }] });
  });

  // Add current user message last
  contents.push({ role: 'user', parts: [{ text: message }] });

  // Build request body with system_instruction
  var requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: contents
  };

  // Try multiple models with fallback
  var models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
  var lastError = '';

  for (var i = 0; i < models.length; i++) {
    var model = models[i];
    try {
      var response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        var data = await response.json();
        var text = data.candidates
          && data.candidates[0]
          && data.candidates[0].content
          && data.candidates[0].content.parts
          && data.candidates[0].content.parts[0]
          ? data.candidates[0].content.parts[0].text
          : 'Tidak ada respon.';

        return {
          statusCode: 200,
          headers: headers,
          body: JSON.stringify({ reply: text })
        };
      }

      var errBody = await response.json().catch(function() { return {}; });
      lastError = errBody.error ? errBody.error.message : ('HTTP ' + response.status);

      // Try next model on these status codes
      if (response.status === 400 || response.status === 404 || response.status === 403 || response.status === 429) {
        continue;
      }
      // Other errors, stop trying
      break;
    } catch (fetchErr) {
      lastError = fetchErr.message;
      continue;
    }
  }

  return {
    statusCode: 502,
    headers: headers,
    body: JSON.stringify({ error: 'Gemini API error: ' + lastError })
  };
};
