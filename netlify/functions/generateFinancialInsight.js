exports.handler = async function(event, context) {
  // CORS headers
  const allowedOrigin = process.env.URL || '*';
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
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

  // Body size limit
  const MAX_BODY_SIZE = 50000; // 50KB limit
  if (event.body && event.body.length > MAX_BODY_SIZE) {
    return { statusCode: 413, headers, body: JSON.stringify({ error: 'Request body too large' }) };
  }

  // Check API keys - prefer OpenRouter, fallback to Gemini
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openRouterKey && !geminiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'No API key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY on server.' })
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

  const { totalPendapatan, totalPengeluaran, saldoKasBank } = body;

  if (totalPendapatan === undefined || totalPengeluaran === undefined || saldoKasBank === undefined) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required fields: totalPendapatan, totalPengeluaran, saldoKasBank' })
    };
  }

  // Build prompt
  const prompt = 'Bertindaklah sebagai CFO/Konsultan Keuangan Profesional untuk LPK IJEF Corp. '
    + 'Analisis data keuangan berikut dan berikan:\n'
    + '1. Satu kalimat analisis kondisi keuangan saat ini\n'
    + '2. Satu kalimat saran pemasaran/efisiensi yang konkret\n\n'
    + 'Data Keuangan:\n'
    + '- Total Pendapatan: Rp ' + Number(totalPendapatan).toLocaleString('id-ID') + '\n'
    + '- Total Pengeluaran: Rp ' + Number(totalPengeluaran).toLocaleString('id-ID') + '\n'
    + '- Saldo Kas/Bank saat ini: Rp ' + Number(saldoKasBank).toLocaleString('id-ID') + '\n\n'
    + 'Format jawaban HARUS dalam JSON seperti berikut (tanpa markdown code block):\n'
    + '{"ringkasan_analisis": "...", "rekomendasi_strategi": "..."}\n'
    + 'Jawab dalam Bahasa Indonesia, singkat, profesional, dan langsung ke poin.';

  let text = '';
  let lastError = '';

  if (openRouterKey) {
    // Use OpenRouter API (OpenAI-compatible format)
    const openRouterModels = [
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-2.5-flash-preview-05-20'
    ];

    for (const model of openRouterModels) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openRouterKey,
            'HTTP-Referer': 'https://laporankeuanganijef.netlify.app',
            'X-Title': 'Sistem Keuangan IJEF'
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          text = data.choices
            && data.choices[0]
            && data.choices[0].message
            && data.choices[0].message.content
            ? data.choices[0].message.content
            : '';

          if (text) break;
          lastError = 'Empty response from OpenRouter model ' + model;
          continue;
        }

        const errBody = await response.json().catch(function() { return {}; });
        lastError = errBody.error
          ? (errBody.error.message || JSON.stringify(errBody.error))
          : ('HTTP ' + response.status);

        // Try next model on these status codes
        if (response.status === 400 || response.status === 404 || response.status === 403 || response.status === 429) {
          continue;
        }
        break;
      } catch (fetchErr) {
        lastError = fetchErr.message;
        continue;
      }
    }
  } else {
    // Fallback: use Gemini API directly
    const contents = [
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

    for (const model of models) {
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + geminiKey,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
          }
        );

        if (response.ok) {
          const data = await response.json();
          text = data.candidates
            && data.candidates[0]
            && data.candidates[0].content
            && data.candidates[0].content.parts
            && data.candidates[0].content.parts[0]
            ? data.candidates[0].content.parts[0].text
            : '';

          if (text) break;
          lastError = 'Empty response from Gemini model ' + model;
          continue;
        }

        const errBody = await response.json().catch(function() { return {}; });
        lastError = errBody.error ? errBody.error.message : ('HTTP ' + response.status);

        if (response.status === 400 || response.status === 404 || response.status === 403 || response.status === 429) {
          continue;
        }
        break;
      } catch (fetchErr) {
        lastError = fetchErr.message;
        continue;
      }
    }
  }

  // If no text was returned from any model, return error
  if (!text) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'AI API error: ' + lastError })
    };
  }

  // Parse AI response - try to extract JSON
  let ringkasan_analisis = '';
  let rekomendasi_strategi = '';

  try {
    // Remove markdown code block markers if present
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const parsed = JSON.parse(cleaned);
    ringkasan_analisis = parsed.ringkasan_analisis || '';
    rekomendasi_strategi = parsed.rekomendasi_strategi || '';
  } catch (parseErr) {
    // Fallback: split text into two sentences
    const sentences = text.split(/[.\n]/).filter(function(s) { return s.trim().length > 10; });
    ringkasan_analisis = sentences[0] ? sentences[0].trim() : text.trim();
    rekomendasi_strategi = sentences[1] ? sentences[1].trim() : 'Lakukan evaluasi berkala terhadap arus kas.';
  }

  const tanggal = new Date().toISOString();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ringkasan_analisis: ringkasan_analisis,
      rekomendasi_strategi: rekomendasi_strategi,
      tanggal: tanggal
    })
  };
};
