import React, { useEffect, useMemo, useState } from 'react';
import './ImageGenerator.css';

const STYLES = [
  { id: 'default', label: 'Editorial' },
  { id: 'cinematic', label: 'Cinematic', suffix: ', cinematic lighting, film still, shallow depth of field' },
  { id: 'photo', label: 'Photoreal', suffix: ', photorealistic, natural light, ultra detailed' },
  { id: 'ink', label: 'Ink Art', suffix: ', ink wash illustration, fine linework, museum print' },
  { id: 'noir', label: 'Noir', suffix: ', moody noir, high contrast, dramatic shadows' },
];

const EXAMPLES = [
  'A cozy coffee shop with warm sunlight and plants',
  'A white cat sitting on a wooden window bench',
  'A mountain lake at sunrise, clear water and pine trees',
  'A modern kitchen with fruit on the counter, bright and clean',
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [styleId, setStyleId] = useState('default');
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedStyle = useMemo(
    () => STYLES.find((item) => item.id === styleId) || STYLES[0],
    [styleId]
  );

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('lumina-history') || '[]');
      const valid = Array.isArray(saved)
        ? saved.filter((item) => item?.url && String(item.url).startsWith('data:image/'))
        : [];
      sessionStorage.setItem('lumina-history', JSON.stringify(valid));
      if (valid.length) {
        setHistory(valid);
        setImageUrl(valid[0].url);
        setPrompt(valid[0].prompt || '');
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const persistHistory = (next) => {
    setHistory(next);
    sessionStorage.setItem('lumina-history', JSON.stringify(next.slice(0, 12)));
  };

  const generateImage = async () => {
    const raw = prompt.trim();
    if (!raw) {
      setError('Write a description first — even a short one will do.');
      return;
    }

    const finalPrompt = `${raw}${selectedStyle.suffix || ''}`;
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message =
          data.error?.message ||
          data.error ||
          'Generation failed. Confirm the API server and OpenAI key are set.';
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
      }

      let url = '';
      if (data.b64_json) {
        url = `data:${data.mime || 'image/png'};base64,${data.b64_json}`;
        setImageUrl(url);
        persistHistory([{ url, prompt: raw, style: selectedStyle.label, at: Date.now() }, ...history].slice(0, 12));
        setLoading(false);
      } else if (data.url) {
        setImageUrl(data.url);
        persistHistory([{ url: data.url, prompt: raw, style: selectedStyle.label, at: Date.now() }, ...history].slice(0, 12));
      } else {
        throw new Error('No image returned from the server.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `pixora-${Date.now()}.jpg`;
    link.click();
  };

  const copyPrompt = async () => {
    if (!prompt.trim()) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="studio">
      <div className="studio-glow" />

      <header className="nav-bar">
        <div className="nav">
          <a className="brand" href="#top">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path
                  d="M16 10h12.5a11 11 0 0 1 0 22H22v6h-6V10z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <rect x="22" y="16" width="9" height="9" rx="1.5" fill="#e8c37a" />
              </svg>
            </span>
            <span className="brand-text">
              <strong>Pixora</strong>
              <small>AI Image Studio</small>
            </span>
          </a>
          <nav className="nav-links">
            <a href="#studio"><span>01</span>Create</a>
            <a href="#gallery"><span>02</span>Gallery</a>
            <a href="#craft"><span>03</span>Features</a>
          </nav>
          <div className="nav-actions">
            <span className="nav-status">
              <i />
              Online
            </span>
            <a className="nav-cta" href="#studio">Generate now</a>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">AI image generator</p>
        <h1>A studio for images that feel finished.</h1>
        <p className="lede">
          Write what you want to see. Pixora creates the picture, then you can restyle it and download it.
        </p>
      </section>

      <section className="workspace" id="studio">
        <aside className="panel">
          <div className="panel-head">
            <h2>Prompt</h2>
            <span>{prompt.length}/500</span>
          </div>

          <textarea
            value={prompt}
            maxLength={500}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                generateImage();
              }
            }}
            placeholder="Example: a golden retriever sitting in a sunny garden, photorealistic"
          />

          <div className="style-row">
            {STYLES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styleId === item.id ? 'chip active' : 'chip'}
                onClick={() => setStyleId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="examples">
            <p>Example prompts</p>
            <div className="example-list">
              {EXAMPLES.map((item) => (
                <button key={item} type="button" onClick={() => setPrompt(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="actions">
            <button type="button" className="ghost" onClick={copyPrompt} disabled={!prompt.trim()}>
              {copied ? 'Copied' : 'Copy prompt'}
            </button>
            <button type="button" className="primary" onClick={generateImage} disabled={loading}>
              {loading ? 'Generating…' : 'Generate image'}
            </button>
          </div>
          <p className="hint">Press Enter to generate</p>
        </aside>

        <div className="canvas-wrap">
          <div className="canvas-frame">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={prompt || 'Generated artwork'}
                referrerPolicy="no-referrer"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setImageUrl('');
                  setError('The image could not be created. Click Generate again.');
                }}
              />
            ) : (
              <div className="empty-canvas">
                <span>Preview</span>
                <h3>Your image will hang here</h3>
                <p>Write a prompt, then generate. The finished image appears in this frame.</p>
              </div>
            )}
            {loading ? (
              <div className="overlay">
                <div className="spinner" />
                <p>Creating your image</p>
              </div>
            ) : null}
          </div>
          <div className="canvas-meta">
            <div>
              <strong>{imageUrl ? selectedStyle.label : 'No image yet'}</strong>
              <span>{imageUrl ? '512 × 512  ·  PNG' : 'Waiting for a prompt'}</span>
            </div>
            <button type="button" className="ghost compact" onClick={downloadImage} disabled={!imageUrl}>
              Download
            </button>
          </div>
        </div>
      </section>

      <section className="gallery" id="gallery">
        <div className="section-head">
          <h2>Your gallery</h2>
          <p>Images you create in this visit are saved here until you close the tab.</p>
        </div>
        {history.length === 0 ? (
          <div className="gallery-empty">No images yet. Generate one to see it here.</div>
        ) : (
          <div className="gallery-grid">
            {history.map((item) => (
              <button
                key={item.at}
                type="button"
                className={item.url === imageUrl ? 'thumb active' : 'thumb'}
                onClick={() => {
                  setImageUrl(item.url);
                  setPrompt(item.prompt);
                }}
              >
                <img src={item.url} alt={item.prompt} />
                <span>{item.style}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="craft" id="craft">
        <article>
          <h3>Choose a style</h3>
          <p>Editorial, cinematic, photoreal, ink, or noir — pick one before you generate.</p>
        </article>
        <article>
          <h3>Runs on your computer</h3>
          <p>Your prompt goes to the local server. You do not need an account to use this app.</p>
        </article>
        <article>
          <h3>Save your image</h3>
          <p>Download a PNG anytime. Your gallery keeps this session’s results.</p>
        </article>
      </section>

      <footer className="footer">
        <span className="footer-brand">Pixora</span>
        <span>AI Image Studio · Create, preview, download</span>
      </footer>
    </div>
  );
};

export default ImageGenerator;
