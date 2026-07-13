import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK
// user-agent 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint: generateFinancialInsight
app.post('/.netlify/functions/generateFinancialInsight', async (req, res) => {
  try {
    const { totalPendapatan, totalPengeluaran, saldoKasBank } = req.body;

    if (totalPendapatan === undefined || totalPengeluaran === undefined || saldoKasBank === undefined) {
      return res.status(400).json({ error: 'Missing required fields: totalPendapatan, totalPengeluaran, saldoKasBank' });
    }

    // Build prompt for the CFO analysis
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let result;
    try {
      result = JSON.parse(response.text.trim());
    } catch (parseErr) {
      // Fallback: split text into two sentences if JSON parsing failed
      const text = response.text || '';
      const sentences = text.split(/[.\n]/).filter(s => s.trim().length > 10);
      result = {
        ringkasan_analisis: sentences[0] ? sentences[0].trim() : text.trim(),
        rekomendasi_strategi: sentences[1] ? sentences[1].trim() : 'Lakukan evaluasi berkala terhadap arus kas.'
      };
    }

    res.json({
      ringkasan_analisis: result.ringkasan_analisis || '',
      rekomendasi_strategi: result.rekomendasi_strategi || '',
      tanggal: new Date().toISOString()
    });
  } catch (error) {
    console.error('generateFinancialInsight error:', error);
    res.status(500).json({ error: 'Failed to generate financial insight: ' + error.message });
  }
});

// Endpoint: gemini chat assistant
app.post('/.netlify/functions/gemini', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing required field: message' });
    }

    const systemInstruction = "Bertindaklah sebagai Asisten Keuangan cerdas (AI Assistant) untuk IJEF Corp. " +
      "Gunakan konteks keuangan yang diberikan untuk menjawab pertanyaan user secara profesional, akurat, dan membantu.";

    const prompt = (context ? `Konteks:\n${context}\n\nPertanyaan: ` : '') + message;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Gemini chat assistant error:', error);
    res.status(500).json({ error: 'AI Assistant failed: ' + error.message });
  }
});

// Serve static files from root directory
app.use(express.static(__dirname));

// Fallback all other routes to index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
