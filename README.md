# Pixora — AI Image Studio

Pixora is a web app that turns a text prompt into an image. Type what you want to see, pick a visual style, generate, then download or keep the result in a session gallery.

**Stack:** React · Express · Node.js  
**App:** http://localhost:3000  
**API:** http://localhost:5000

---

## About

Pixora is built as a complete image-generation studio, not a blank Create React App template. The frontend is a light, gallery-style UI. The backend is a small Express server that creates images from your prompt.

By default it uses [Pollinations](https://pollinations.ai/) so you can run the project without an API key. If you add an `OPENAI_API_KEY`, the server uses OpenAI image generation instead.

---

## Features

- Text-to-image generation from a prompt
- Style presets: Editorial, Cinematic, Photoreal, Ink Art, Noir
- Example prompts to start quickly
- Live preview with loading state
- Download the generated image
- Session gallery (saved in the browser until you close the tab)
- Works without an OpenAI key
- Optional OpenAI support via `.env`

---

## Screenshots

Add a screenshot of the studio here after you run the app:

```text
public/screenshot.png
```

Then replace this section with:

```md
![Pixora studio](public/screenshot.png)
```

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, CSS |
| Backend | Node.js, Express |
| Image generation | Pollinations (default), OpenAI (optional) |
| Tooling | Create React App, concurrently |

---

## Project structure

```text
AI-Image-Generator-APP-master/
├── public/                          # HTML, favicon
├── src/
│   ├── App.js
│   └── Components/ImageGenerator/   # Studio UI
├── server.js                        # Express API
├── package.json
└── .env                             # optional OPENAI_API_KEY
```

---

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node.js)

### Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### Run the full app

This starts the API and the React app together:

```bash
npm run dev
```

Then open **http://localhost:3000**.

Leave that terminal running. Do not start a second copy if port 3000 is already in use.

### Run in two terminals (optional)

Terminal 1 — API:

```bash
npm run server
```

Terminal 2 — website:

```bash
npm start
```

---

## Optional OpenAI key

Pixora works without a key.

To use OpenAI instead, create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_key_here
```

Restart the server after saving the file:

```bash
npm run server
```

Never commit `.env` or your API key.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts API + React together |
| `npm start` | Starts the React app on port 3000 |
| `npm run server` | Starts the Express API on port 5000 |
| `npm run build` | Creates a production build |

---

## How it works

1. You enter a prompt and choose a style.
2. The React app sends the prompt to `POST /api/generate`.
3. If `OPENAI_API_KEY` is set, the server calls OpenAI.
4. If not, the server generates the image through Pollinations and returns it to the app.
5. The image is shown in the preview. You can download it or reopen it from the gallery.

---

## Troubleshooting

**Port 3000 already in use**  
The app is already running. Open http://localhost:3000. Do not run `npm start` again.

**`concurrently` is not recognized**  
Run `npm install` in the project folder, then `npm run dev`.

**Generate shows a broken image or an error**  
Make sure the API is running on port 5000 (`npm run server` or `npm run dev`). Wait a few seconds after clicking Generate.

**Cannot GET /** on port 5000  
That is the API, not the website. Use http://localhost:3000.

---

## License

This project is available for personal and educational use.
