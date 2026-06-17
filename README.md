# Scene Scroll Portfolio

A cinematic personal portfolio website built with native HTML, CSS, and JavaScript.

The site uses full-screen video scenes, scroll-driven transitions, glassmorphism cards, a gallery scene, a contact page, water ripple effects, audio controls, and a Formspree-powered feedback form.

## Tech Stack

- Native HTML
- CSS
- JavaScript
- Node.js static build script
- Vercel static deployment
- Formspree feedback form

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

The production files are generated into:

```text
dist
```

## Preview Production Build

```bash
npm run preview
```

Open:

```text
http://localhost:4173
```

## Vercel Deployment

Recommended Vercel settings:

- Framework Preset: Other
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

`vercel.json` includes a rewrite to `index.html` for single-page routing compatibility.

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── project-cards.js
├── gallery-3d.js
├── gallery-carousel.js
├── audio-control.js
├── audio-spectrum.js
├── water-ripple.js
├── effects-init.js
├── assets/
├── projects/
├── public/
├── scripts/
└── static-server.mjs
```

## Environment Variables

No private environment variables are required for the current static build.

The Formspree endpoint is a public form endpoint configured in `script.js`. Do not commit private API keys, tokens, or `.env` files.

An `.env.example` file is included for future optional deployment settings.

## Current Status

- Scene1: intro and home scene
- Scene2: project cards and project detail overlay
- Scene3: gallery scene
- Scene4: contact page and feedback form
- Ready for Vercel static deployment after GitHub repository setup
