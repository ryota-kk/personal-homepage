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

## Media Delivery And Verification

Original videos and gallery photographs are retained in the source repository. The production build excludes those originals and ships the generated desktop/mobile videos, static posters, thumbnails, and WebP gallery previews. Videos load when their scene is requested. Navigation remains available when playback is blocked or a media request fails.

Generated delivery files are included in the repository; Vercel does not need FFmpeg. To regenerate them locally with FFmpeg available on PATH:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/optimize-media.ps1
```

Run the HTTP media checks with `npm run test:server` and verify generated assets with `npm run test:media`. After building, run `npm run test:build` to check deployment references and source-file exclusions. Browser regression checks use Playwright and Microsoft Edge. Install Playwright locally with `npm install --no-save --package-lock=false playwright`, or point the `PLAYWRIGHT_MODULE` environment variable to an existing installation, then run `npm run test:playback`.

The browser checks cover stalled music, blocked playback, failed looping videos, stale video responses, project modals, and desktop/mobile scene navigation. Failed videos use extracted scene posters. Hidden tabs pause media and gallery animation.

## Current Scenes

- Scene1: intro and home scene
- Scene2: project cards and project detail overlay
- Scene3: gallery scene
- Scene4: contact page and feedback form
- Ready for Vercel static deployment after GitHub repository setup
