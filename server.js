const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

function pollinationsUrl(prompt) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?nologo=true`;
}

async function fetchGeneratedImage(prompt) {
  let lastError = new Error('Image download failed');
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(pollinationsUrl(prompt), {
      headers: { Accept: 'image/jpeg,image/png,image/webp,image/*' },
    });
    if (!response.ok) {
      lastError = new Error(`Image download failed (${response.status})`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      continue;
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('text/html')) {
      lastError = new Error('Image service returned an error page');
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1000) {
      lastError = new Error('Image service returned an empty file');
      continue;
    }
    return { buffer, mime: contentType.split(';')[0] || 'image/jpeg' };
  }
  throw lastError;
}

app.get('/', (req, res) => {
  res.redirect(302, 'http://localhost:3000');
});

app.get('/api/image', async (req, res) => {
  try {
    const prompt = String(req.query.prompt || '').trim();
    if (!prompt) {
      return res.status(400).send('Prompt is required');
    }
    const image = await fetchGeneratedImage(prompt);
    res.setHeader('Content-Type', image.mime);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(image.buffer);
  } catch (err) {
    return res.status(502).send('Could not create the image');
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          size: '512x512',
          n: 1,
          response_format: 'b64_json',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error || 'OpenAI error' });
      }

      const first = data && data.data && data.data[0];
      if (first?.b64_json) {
        return res.json({ b64_json: first.b64_json, mime: 'image/png' });
      }
    }

    return res.json({
      url: `http://localhost:${PORT}/api/image?prompt=${encodeURIComponent(prompt.trim())}&t=${Date.now()}`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not create the image. Please try again.', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
