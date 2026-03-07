# DreamSVG ✦

**AI-powered SVG icon editor** — create, edit, and export SVG icons with a live preview and AI generation.

🌐 **[dreamsvg.ru](https://dreamsvg.ru)**

<br>

## ✨ Features

- 🎨 **Live SVG Editor** — edit SVG code with syntax highlighting, line numbers, and auto-formatting (CodeMirror)
- 🤖 **AI Generation** — describe an icon in plain text, and AI creates or refines your SVG
- 👁 **Instant Preview** — see your icon update in real-time as you type
- 🌗 **Dark / Light Theme** — toggle between themes with system preference detection
- 📋 **Copy to Clipboard** — one-click copy of SVG code
- ⬇️ **Download SVG / JSX** — export as a raw `.svg` file or as a ready-to-use React component
- ↩️ **Undo History** — revert AI-generated changes with one click
- 🔒 **XSS Protection** — SVG is sanitized via DOMPurify before rendering

<br>

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/dmitriyg0r/DreamSVG.git
cd DreamSVG

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Edit .env and add your Polza AI API key

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

<br>

## 🔧 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_POLZA_AI_API_KEY` | API key for [Polza AI](https://polza.ai) | — |
| `VITE_POLZA_AI_MODEL` | AI model to use | `openai/gpt-4o` |
| `VITE_POLZA_API_BASE_URL` | API endpoint | `/api/polza` |

<br>

## 📦 Tech Stack

- **[React 19](https://react.dev)** — UI framework
- **[Vite](https://vite.dev)** — build tool with HMR
- **[CodeMirror](https://codemirror.net)** — code editor with XML syntax highlighting
- **[DOMPurify](https://github.com/cure53/DOMPurify)** — SVG sanitization
- **[xml-formatter](https://github.com/chrisbottin/xml-formatter)** — SVG auto-formatting

<br>

## 🏗 Project Structure

```
src/
├── components/        # UI components
│   ├── AiPanel.jsx       # AI prompt panel
│   ├── AppLogo.jsx       # Logo icon
│   └── SvgCodeEditor.jsx # CodeMirror editor
├── hooks/             # Custom React hooks
│   ├── useDebounce.js    # Value debouncing
│   └── useSvgHistory.js  # Undo history
├── services/          # API services
│   └── svgAi.js          # Polza AI integration
├── utils/             # Utility functions
│   ├── download.js       # File download
│   ├── jsxConverter.js   # SVG → JSX conversion
│   ├── sanitize.js       # XSS sanitization
│   └── svgMeta.js        # SVG parsing & validation
├── App.jsx            # Main application
├── App.css            # Component styles (CSS variables)
└── index.css          # Design tokens & theme
```

<br>

## 🚢 Deployment

Build and deploy to the production server:

```bash
chmod +x deploy.sh
./deploy.sh
```

<br>

## 💖 Support

If you find DreamSVG useful, consider supporting the project:

[![Donation](https://img.shields.io/badge/Donate-DonationAlerts-orange?style=for-the-badge)](https://www.donationalerts.com/r/dmitriygor)

<br>

## 📄 License

MIT
