# Sprite Editor Web App

A client-only web-based sprite editor similar to Aseprite, built with React. Runs entirely in the browser with no backend or login required.

## Features

- Canvas-based pixel art drawing
- Multiple layers support
- Animation frames with timeline
- Color palette management
- Drawing tools: pencil, eraser, fill bucket, eyedropper
- Export to PNG, GIF, and sprite sheets
- All processing done client-side - no server required

## Getting Started

### Using Docker Compose

```bash
docker compose up
```

The app will be available at http://localhost:3000

### Development

```bash
cd frontend
npm install
npm run dev
```

The app runs entirely in your browser - all data stays local to your machine.

### Building for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

## GitHub Pages Deployment

This repository is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

### Setup Instructions

1. Push this repository to GitHub
2. Go to your repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically build and deploy on every push to `main`

The app will be available at `https://yourusername.github.io/Sprites/`

**Note:** If your repository name is different from "Sprites", update the `base` path in `frontend/vite.config.ts` to match your repository name.

## Tech Stack

- Frontend: React, TypeScript, Vite, Canvas API
- Export: gif.js (client-side GIF export)
- No backend required - fully client-side application
- CI/CD: GitHub Actions for automated deployment
