<div align="center">

<img src="public/dreamsvg-logo.svg" alt="DreamSVG" width="80" />

# DreamSVG

**AI-powered SVG icon editor with live preview**

Create, edit, and export SVG icons using natural language and code.

[![Live Demo](https://img.shields.io/badge/Live_Demo-dreamsvg.ru-0f172a?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMCAyQzUuNTggMiAyIDUuNTggMiAxMHMzLjU4IDggOCA4IDgtMy41OCA4LTgtMy41OC04LTgtOFptMSAxMy45M0E2LjAwNiA2LjAwNiAwIDAwMTUuOTMgMTFIMTN2LTJoMi45M0E2LjAwNiA2LjAwNiAwIDAwMTEgNC4wN1Y3SDlWNC4wN0E2LjAwNiA2LjAwNiAwIDAwNC4wNyA5SDdWMTFINC4wN0E2LjAwNiA2LjAwNiAwIDAwOSAxNS45M1YxM2gydjIuOTNaIi8+PC9zdmc+)](https://dreamsvg.ru)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)

</div>

---

## Features

| | Feature | Description |
|---|---|---|
| **Code** | Live SVG Editor | Syntax highlighting, line numbers, auto-formatting via CodeMirror |
| **AI** | AI Generation | Describe an icon in plain text — AI creates or refines your SVG |
| **Preview** | Instant Preview | Real-time rendering as you type with debounced updates |
| **Theme** | Dark / Light | Toggle themes with system preference detection |
| **Export** | SVG & JSX | Download as `.svg` or as a ready-to-use React component |
| **History** | Undo / Redo | Revert or replay changes with up to 50 snapshots |
| **Security** | XSS Protection | All SVG sanitized via DOMPurify before rendering |
| **Mobile** | Responsive | Optimized layout for phones, tablets, and desktops |

---

## Quick Start

```bash
git clone https://github.com/dmitriyg0r/DreamSVG.git
cd DreamSVG
npm install
cp .env.example .env   # add your Polza AI API key
npm run dev             # → http://localhost:5173
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_POLZA_AI_API_KEY` | API key for [Polza AI](https://polza.ai) | *required* |
| `VITE_POLZA_AI_MODEL` | AI model | `openai/gpt-4o` |
| `VITE_POLZA_API_BASE_URL` | API endpoint | `/api/polza` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) |
| Build | [Vite](https://vite.dev) |
| Editor | [CodeMirror 6](https://codemirror.net) with XML highlighting |
| Security | [DOMPurify](https://github.com/cure53/DOMPurify) |
| Formatting | [xml-formatter](https://github.com/chrisbottin/xml-formatter) |

---

## Project Structure

```
src/
├── components/           # UI components
│   ├── AiPanel.jsx          AI prompt input & generation
│   ├── AppLogo.jsx          Logo component
│   └── SvgCodeEditor.jsx   CodeMirror wrapper
├── hooks/                # Custom React hooks
│   ├── useDebounce.js       Value debouncing (300ms)
│   └── useSvgHistory.js     Undo/redo (50 snapshots)
├── services/             # External integrations
│   └── svgAi.js             Polza AI API client
├── utils/                # Pure functions
│   ├── download.js          File download helper
│   ├── jsxConverter.js      SVG → React JSX converter
│   ├── sanitize.js          XSS sanitization
│   └── svgMeta.js           SVG validation & metadata
├── App.jsx               # Root component
├── App.css               # Styles & responsive breakpoints
└── index.css             # Design tokens & theme variables
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Support

If you find DreamSVG useful, consider supporting the project:

<a href="https://www.donationalerts.com/r/dmitriygor">
  <img src="https://img.shields.io/badge/Donate-DonationAlerts-F97316?style=for-the-badge" alt="Donate" />
</a>

---

## License

[MIT](LICENSE) — Dmitriy Gordienko
