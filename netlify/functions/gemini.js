exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'GEMINI_API_KEY not configured on server' })
    };
  }

  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const { message, context: financialContext } = body;
  if (!message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing "message" field' })
    };
  }

  // Build system prompt
  const systemPrompt = 'Kamu adalah AI asisten keuangan untuk perusahaan IJEF Corp. Jawab dalam Bahasa Indonesia, singkat dan jelas.\n\n'
    + 'KEMAMPUAN AKSI: Kamu bisa membantu user melakukan aksi berikut. Jika user meminta aksi, respond dengan format JSON khusus di akhir pesan (setelah penjelasan):\n\n'
    + 'Format aksi (taruh di baris terakhir):\n'
    + '###ACTION:{"type":"jurnal","tanggal":"YYYY-MM-DD","keterangan":"...","lines":[{"akun":"kode","ket":"...","debit":number,"kredit":number}]}###\n'
    + '###ACTION:{"type":"topup_pc","tanggal":"YYYY-MM-DD","jumlah":number,"keterangan":"..."}###\n'
    + '###ACTION:{"type":"pengeluaran_pc","tanggal":"YYYY-MM-DD","jumlah":number,"keterangan":"...","akunBeban":"kode"}###\n'
    + '###ACTION:{"type":"hapus_jurnal","id":"jurnal_id","alasan":"..."}###\n\n'
    + 'PENTING: Selalu berikan penjelasan dulu baru action JSON. User akan konfirmasi sebelum eksekusi.\n'
    + 'Jika user hanya bertanya (bukan minta aksi), jawab biasa tanpa ACTION.\n\n'
    + 'Berikut konteks data:\n\n' + (financialContext || '');

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt + '\n\nPertanyaan/perintah user: ' + message }] }
  ];

  // Try multiple models with fallback
  const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates
          && data.candidates[0]
          && data.candidates[0].content
          && data.candidates[0].content.parts
          && data.candidates[0].content.parts[0]
          ? data.candidates[0].content.parts[0].text
          : 'Tidak ada respon.';

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ reply: text })
        };
      }

      const errBody = await response.json().catch(function() { return {}; });
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
    headers,
    body: JSON.stringify({ error: 'Gemini API error: ' + lastError })
  };
};
