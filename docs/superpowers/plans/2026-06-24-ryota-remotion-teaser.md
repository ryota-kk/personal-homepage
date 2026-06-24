# Ryota Remotion Teaser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 15-second vertical Remotion teaser for `www.ryota.top` using the provided website recording as the main visual layer.

**Architecture:** Create a standalone Remotion project at `C:\Users\25384\Desktop\ryota-site-video`. The composition uses the recording as the base footage, then layers controlled camera motion, HUD effects, timed title beats, and a final URL card. A source-asset flash component is included as a real extension point for the future hybrid version, but the first render remains recording-driven.

**Tech Stack:** Remotion, React, TypeScript, Node.js, local MP4 assets, CSS-in-JS style objects.

---

## File Structure

Create a new standalone project:

`C:\Users\25384\Desktop\ryota-site-video`

Files to create or modify:

- Create: `C:\Users\25384\Desktop\ryota-site-video\public\assets\personal-site.mp4`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\.gitignore`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\package.json`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\src\Root.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\constants.ts`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\lib\timing.ts`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\RyotaVerticalTeaser.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\FootageLayer.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\HudOverlay.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\TitleBeats.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\FinalUrlCard.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\SourceAssetFlash.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\docs\voiceover-script.md`

Do not commit `public\assets\personal-site.mp4`. It is a large local render asset.

## Task 1: Scaffold Remotion Project And Local Asset

**Files:**

- Create: `C:\Users\25384\Desktop\ryota-site-video\`
- Create: `C:\Users\25384\Desktop\ryota-site-video\public\assets\personal-site.mp4`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\.gitignore`

- [ ] **Step 1: Scaffold the blank Remotion project**

Run from `C:\Users\25384\Desktop`:

```powershell
npx create-video@latest --yes --blank --no-tailwind ryota-site-video
```

Expected:

```text
ryota-site-video
```

The generated project should contain `package.json`, `src`, and Remotion configuration files.

- [ ] **Step 2: Install dependencies**

Run:

```powershell
npm install
```

Expected:

```text
added
```

or:

```text
up to date
```

- [ ] **Step 3: Create the local asset folder**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\25384\Desktop\ryota-site-video\public\assets"
```

Expected:

```text
Directory: C:\Users\25384\Desktop\ryota-site-video\public
```

- [ ] **Step 4: Copy the recording into the Remotion project**

Run:

```powershell
Copy-Item -LiteralPath "C:\Users\25384\Desktop\remotion素材\个人网页.mp4" -Destination "C:\Users\25384\Desktop\ryota-site-video\public\assets\personal-site.mp4" -Force
```

Expected:

```text
No output
```

- [ ] **Step 5: Exclude large local videos from git**

Append these lines to `C:\Users\25384\Desktop\ryota-site-video\.gitignore`:

```gitignore

# Local render source assets
public/assets/*.mp4
out/
```

- [ ] **Step 6: Confirm the recording is present and untracked**

Run:

```powershell
Get-Item "C:\Users\25384\Desktop\ryota-site-video\public\assets\personal-site.mp4" | Select-Object Name,Length
git status --short
```

Expected:

```text
Name              Length
----              ------
personal-site.mp4 169432403
```

`git status --short` should not list `public/assets/personal-site.mp4`.

- [ ] **Step 7: Commit the scaffold and ignore rule**

Run:

```powershell
git add .
git commit -m "chore: scaffold ryota teaser video"
```

Expected:

```text
[main ...] chore: scaffold ryota teaser video
```

## Task 2: Define Composition Constants And Root

**Files:**

- Modify: `C:\Users\25384\Desktop\ryota-site-video\src\Root.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\constants.ts`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\lib\timing.ts`

- [ ] **Step 1: Create shared constants**

Create `src\constants.ts`:

```ts
export const SITE_URL = 'www.ryota.top';

export const VIDEO = {
  id: 'RyotaVerticalTeaser',
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 450,
} as const;

export const COLORS = {
  bg: '#05070a',
  text: 'rgba(255, 255, 255, 0.96)',
  muted: 'rgba(255, 255, 255, 0.62)',
  cyan: 'rgba(118, 255, 235, 0.95)',
  cyanSoft: 'rgba(118, 255, 235, 0.22)',
  green: 'rgba(75, 196, 132, 0.9)',
  panel: 'rgba(5, 10, 14, 0.48)',
  stroke: 'rgba(255, 255, 255, 0.18)',
} as const;
```

- [ ] **Step 2: Create timing helpers**

Create `src\lib\timing.ts`:

```ts
import {Easing, interpolate} from 'remotion';

export const clampInterpolate = (
  frame: number,
  input: [number, number],
  output: [number, number],
) => {
  return interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const fadeInOut = (
  frame: number,
  start: number,
  end: number,
  fadeFrames = 8,
) => {
  const fadeIn = clampInterpolate(frame, [start, start + fadeFrames], [0, 1]);
  const fadeOut = clampInterpolate(frame, [end - fadeFrames, end], [1, 0]);
  return Math.min(fadeIn, fadeOut);
};

export const easeInOut = (value: number) => Easing.inOut(Easing.cubic)(value);

export const beatPulse = (frame: number, beatFrame: number, strength = 0.035) => {
  const distance = Math.abs(frame - beatFrame);
  const amount = clampInterpolate(distance, [0, 8], [strength, 0]);
  return 1 + amount;
};
```

- [ ] **Step 3: Replace the Remotion root**

Replace `src\Root.tsx` with:

```tsx
import {Composition} from 'remotion';
import {RyotaVerticalTeaser} from './RyotaVerticalTeaser';
import {VIDEO} from './constants';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO.id}
      component={RyotaVerticalTeaser}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
```

- [ ] **Step 4: Run TypeScript validation**

Run:

```powershell
npm run tsc
```

Expected:

```text
Cannot find module './RyotaVerticalTeaser'
```

This failure is expected because the main composition is created in Task 3.

- [ ] **Step 5: Commit constants and root**

Run:

```powershell
git add src/Root.tsx src/constants.ts src/lib/timing.ts
git commit -m "feat: define teaser composition root"
```

Expected:

```text
[main ...] feat: define teaser composition root
```

## Task 3: Add Main Composition And Footage Layer

**Files:**

- Create: `C:\Users\25384\Desktop\ryota-site-video\src\RyotaVerticalTeaser.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\FootageLayer.tsx`

- [ ] **Step 1: Create the footage layer**

Create `src\components\FootageLayer.tsx`:

```tsx
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants';
import {beatPulse, easeInOut} from '../lib/timing';

const cropXByFrame = (frame: number) => {
  if (frame < 120) return interpolate(frame, [0, 120], [50, 48], {extrapolateRight: 'clamp'});
  if (frame < 222) return interpolate(frame, [120, 222], [48, 54], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < 324) return interpolate(frame, [222, 324], [54, 46], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return interpolate(frame, [324, 450], [46, 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

export const FootageLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const introReveal = interpolate(frame, [0, 18, 36], [0, 0.75, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOut,
  });
  const exitFade = interpolate(frame, [408, 438], [1, 0.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, 450], [0, -44], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const baseScale = interpolate(frame, [0, 450], [1.08, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const punch = beatPulse(frame, 122, 0.025) * beatPulse(frame, 222, 0.03) * beatPulse(frame, 324, 0.025);
  const scale = baseScale * punch;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          opacity: introReveal * exitFade,
          transform: `scale(${scale}) translate3d(0, ${drift}px, 0)`,
          transformOrigin: `${cropXByFrame(frame)}% 50%`,
          filter: frame < 18 ? 'blur(8px) saturate(1.15)' : 'saturate(1.08) contrast(1.06)',
        }}
      >
        <OffthreadVideo
          src={staticFile('assets/personal-site.mp4')}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${cropXByFrame(frame)}% center`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 46%, transparent 22%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.78) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Create the main composition**

Create `src\RyotaVerticalTeaser.tsx`:

```tsx
import {AbsoluteFill} from 'remotion';
import {COLORS} from './constants';
import {FootageLayer} from './components/FootageLayer';

export const RyotaVerticalTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <FootageLayer />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Run TypeScript validation**

Run:

```powershell
npm run tsc
```

Expected:

```text
No TypeScript errors
```

- [ ] **Step 4: Render a still frame to verify the recording loads**

Run:

```powershell
npx remotion still RyotaVerticalTeaser --frame=30 --scale=0.25 out/opening.png
```

Expected:

```text
Saved still to
```

Open `C:\Users\25384\Desktop\ryota-site-video\out\opening.png`. It should show the website recording in a vertical crop.

- [ ] **Step 5: Commit composition and footage layer**

Run:

```powershell
git add src/RyotaVerticalTeaser.tsx src/components/FootageLayer.tsx
git commit -m "feat: add recording-driven teaser base"
```

Expected:

```text
[main ...] feat: add recording-driven teaser base
```

## Task 4: Add HUD Overlay And Cinematic Texture

**Files:**

- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\HudOverlay.tsx`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\src\RyotaVerticalTeaser.tsx`

- [ ] **Step 1: Create the HUD overlay**

Create `src\components\HudOverlay.tsx`:

```tsx
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants';
import {fadeInOut} from '../lib/timing';

const cornerStyle: React.CSSProperties = {
  position: 'absolute',
  width: 82,
  height: 82,
  borderColor: COLORS.cyan,
  opacity: 0.64,
};

export const HudOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const sweepY = interpolate(frame % 90, [0, 90], [-18, 118], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulseOpacity =
    fadeInOut(frame, 4, 58, 8) * 0.55 +
    fadeInOut(frame, 118, 154, 5) * 0.36 +
    fadeInOut(frame, 222, 256, 5) * 0.32 +
    fadeInOut(frame, 324, 354, 5) * 0.28;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '100% 5px',
          opacity: 0.18,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(118,255,235,0.16), transparent 20%, transparent 80%, rgba(75,196,132,0.12))',
          opacity: pulseOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${sweepY}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, transparent)`,
          opacity: 0.24,
          boxShadow: `0 0 30px ${COLORS.cyanSoft}`,
        }}
      />
      <div style={{...cornerStyle, left: 42, top: 54, borderLeft: '1px solid', borderTop: '1px solid'}} />
      <div style={{...cornerStyle, right: 42, top: 54, borderRight: '1px solid', borderTop: '1px solid'}} />
      <div style={{...cornerStyle, left: 42, bottom: 54, borderLeft: '1px solid', borderBottom: '1px solid'}} />
      <div style={{...cornerStyle, right: 42, bottom: 54, borderRight: '1px solid', borderBottom: '1px solid'}} />
      <div
        style={{
          position: 'absolute',
          left: 56,
          bottom: 128,
          width: 180,
          height: 2,
          background: `linear-gradient(90deg, ${COLORS.cyan}, transparent)`,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 56,
          top: 128,
          width: 120,
          height: 2,
          background: `linear-gradient(270deg, ${COLORS.green}, transparent)`,
          opacity: 0.48,
        }}
      />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Layer the HUD over the footage**

Replace `src\RyotaVerticalTeaser.tsx` with:

```tsx
import {AbsoluteFill} from 'remotion';
import {COLORS} from './constants';
import {FootageLayer} from './components/FootageLayer';
import {HudOverlay} from './components/HudOverlay';

export const RyotaVerticalTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <FootageLayer />
      <HudOverlay />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Run TypeScript validation**

Run:

```powershell
npm run tsc
```

Expected:

```text
No TypeScript errors
```

- [ ] **Step 4: Render a still frame to verify HUD visibility**

Run:

```powershell
npx remotion still RyotaVerticalTeaser --frame=132 --scale=0.25 out/hud.png
```

Expected:

```text
Saved still to
```

Open `C:\Users\25384\Desktop\ryota-site-video\out\hud.png`. The frame should show scanlines, corner brackets, and the website still visible underneath.

- [ ] **Step 5: Commit HUD overlay**

Run:

```powershell
git add src/RyotaVerticalTeaser.tsx src/components/HudOverlay.tsx
git commit -m "feat: add cinematic HUD overlay"
```

Expected:

```text
[main ...] feat: add cinematic HUD overlay
```

## Task 5: Add Timed Titles And Final URL Card

**Files:**

- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\TitleBeats.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\FinalUrlCard.tsx`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\src\RyotaVerticalTeaser.tsx`

- [ ] **Step 1: Create timed title beats**

Create `src\components\TitleBeats.tsx`:

```tsx
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, SITE_URL} from '../constants';
import {fadeInOut} from '../lib/timing';

type Beat = {
  start: number;
  end: number;
  kicker: string;
  title: string;
  align: 'top' | 'middle' | 'bottom';
};

const beats: Beat[] = [
  {start: 8, end: 58, kicker: 'CINEMATIC WEB EXPERIENCE', title: SITE_URL, align: 'middle'},
  {start: 120, end: 210, kicker: 'SCROLL-DRIVEN', title: 'SCENES', align: 'bottom'},
  {start: 222, end: 324, kicker: 'MOTION / GLASS', title: 'INTERACTION', align: 'top'},
];

const alignToTop = (align: Beat['align']) => {
  if (align === 'top') return 190;
  if (align === 'middle') return 760;
  return 1390;
};

export const TitleBeats: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {beats.map((beat) => {
        const opacity = fadeInOut(frame, beat.start, beat.end, 10);
        const y = interpolate(frame, [beat.start, beat.end], [18, -12], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={`${beat.kicker}-${beat.title}`}
            style={{
              position: 'absolute',
              left: 76,
              right: 76,
              top: alignToTop(beat.align),
              transform: `translateY(${y}px)`,
              opacity,
              textAlign: beat.align === 'middle' ? 'center' : 'left',
            }}
          >
            <div
              style={{
                color: COLORS.cyan,
                fontSize: 24,
                letterSpacing: 7,
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 16,
                textShadow: `0 0 28px ${COLORS.cyanSoft}`,
              }}
            >
              {beat.kicker}
            </div>
            <div
              style={{
                color: COLORS.text,
                fontSize: beat.title === SITE_URL ? 58 : 72,
                lineHeight: 1,
                fontWeight: 750,
                letterSpacing: beat.title === SITE_URL ? 0 : 4,
                textShadow: '0 18px 44px rgba(0,0,0,0.52)',
              }}
            >
              {beat.title}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Create final URL card**

Create `src\components\FinalUrlCard.tsx`:

```tsx
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, SITE_URL} from '../constants';

export const FinalUrlCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [396, 426], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [396, 450], [0.96, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          'radial-gradient(circle at 50% 44%, rgba(118,255,235,0.14), transparent 30%), linear-gradient(180deg, rgba(5,7,10,0.28), rgba(5,7,10,0.92))',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: 'center',
          border: `1px solid ${COLORS.stroke}`,
          background: COLORS.panel,
          padding: '46px 54px',
          minWidth: 760,
          boxShadow: '0 34px 120px rgba(0,0,0,0.46)',
        }}
      >
        <div
          style={{
            color: COLORS.cyan,
            fontSize: 22,
            letterSpacing: 8,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          ENTER THE SITE
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 72,
            fontWeight: 780,
            letterSpacing: 0,
            lineHeight: 1,
          }}
        >
          {SITE_URL}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Add title and final card layers**

Replace `src\RyotaVerticalTeaser.tsx` with:

```tsx
import {AbsoluteFill} from 'remotion';
import {COLORS} from './constants';
import {FootageLayer} from './components/FootageLayer';
import {HudOverlay} from './components/HudOverlay';
import {TitleBeats} from './components/TitleBeats';
import {FinalUrlCard} from './components/FinalUrlCard';

export const RyotaVerticalTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <FootageLayer />
      <HudOverlay />
      <TitleBeats />
      <FinalUrlCard />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: Run TypeScript validation**

Run:

```powershell
npm run tsc
```

Expected:

```text
No TypeScript errors
```

- [ ] **Step 5: Render stills for the title and URL card**

Run:

```powershell
npx remotion still RyotaVerticalTeaser --frame=30 --scale=0.25 out/title.png
npx remotion still RyotaVerticalTeaser --frame=430 --scale=0.25 out/final-url.png
```

Expected:

```text
Saved still to
Saved still to
```

Open both files. `title.png` should show `www.ryota.top` over the footage. `final-url.png` should show a clean final lockup with readable URL text.

- [ ] **Step 6: Commit title and URL layers**

Run:

```powershell
git add src/RyotaVerticalTeaser.tsx src/components/TitleBeats.tsx src/components/FinalUrlCard.tsx
git commit -m "feat: add teaser title beats and URL card"
```

Expected:

```text
[main ...] feat: add teaser title beats and URL card
```

## Task 6: Add Hybrid Extension Point And Voiceover Script

**Files:**

- Create: `C:\Users\25384\Desktop\ryota-site-video\src\components\SourceAssetFlash.tsx`
- Modify: `C:\Users\25384\Desktop\ryota-site-video\src\RyotaVerticalTeaser.tsx`
- Create: `C:\Users\25384\Desktop\ryota-site-video\docs\voiceover-script.md`

- [ ] **Step 1: Create source asset flash component**

Create `src\components\SourceAssetFlash.tsx`:

```tsx
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {fadeInOut} from '../lib/timing';

type SourceAssetFlashProps = {
  enabled?: boolean;
};

const flashes = [
  {start: 128, end: 140, src: 'source-assets/projects/cinematic-portfolio.svg'},
  {start: 238, end: 250, src: 'source-assets/projects/visual-draft-editor.svg'},
  {start: 330, end: 342, src: 'source-assets/gallery/photo1.jpg'},
];

export const SourceAssetFlash: React.FC<SourceAssetFlashProps> = ({enabled = false}) => {
  const frame = useCurrentFrame();

  if (!enabled) {
    return null;
  }

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {flashes.map((flash) => {
        const opacity = fadeInOut(frame, flash.start, flash.end, 3);
        return (
          <AbsoluteFill
            key={flash.src}
            style={{
              opacity,
              transform: `scale(${1 + opacity * 0.06})`,
              filter: 'saturate(1.1) contrast(1.08)',
            }}
          >
            <Img
              src={staticFile(flash.src)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Add the extension component disabled in the main composition**

Replace `src\RyotaVerticalTeaser.tsx` with:

```tsx
import {AbsoluteFill} from 'remotion';
import {COLORS} from './constants';
import {FootageLayer} from './components/FootageLayer';
import {HudOverlay} from './components/HudOverlay';
import {TitleBeats} from './components/TitleBeats';
import {FinalUrlCard} from './components/FinalUrlCard';
import {SourceAssetFlash} from './components/SourceAssetFlash';

export const RyotaVerticalTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      <FootageLayer />
      <SourceAssetFlash enabled={false} />
      <HudOverlay />
      <TitleBeats />
      <FinalUrlCard />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Add the voiceover script document**

Create `docs\voiceover-script.md`:

````markdown
# Voiceover Script

```text
欢迎进入 www.ryota.top。
这里不是一张静态主页，
而是一段可以滚动探索的视觉场景。
视频、玻璃卡片、相册和交互，
被组织成一个电影感的个人网站。
打开 www.ryota.top，
进入我的数字空间。
```
````

- [ ] **Step 4: Run TypeScript validation**

Run:

```powershell
npm run tsc
```

Expected:

```text
No TypeScript errors
```

- [ ] **Step 5: Render the final still again**

Run:

```powershell
npx remotion still RyotaVerticalTeaser --frame=430 --scale=0.25 out/final-url-after-extension.png
```

Expected:

```text
Saved still to
```

Open `out\final-url-after-extension.png`. It should match the final URL card from Task 5 because `SourceAssetFlash` is disabled.

- [ ] **Step 6: Commit extension point and voiceover script**

Run:

```powershell
git add src/RyotaVerticalTeaser.tsx src/components/SourceAssetFlash.tsx docs/voiceover-script.md
git commit -m "feat: add teaser extension point and voiceover script"
```

Expected:

```text
[main ...] feat: add teaser extension point and voiceover script
```

## Task 7: Add Render Scripts And Full Verification

**Files:**

- Modify: `C:\Users\25384\Desktop\ryota-site-video\package.json`

- [ ] **Step 1: Add local render scripts**

Run:

```powershell
npm pkg set scripts.studio="remotion studio"
npm pkg set scripts.check="tsc --noEmit"
npm pkg set scripts.still:opening="remotion still RyotaVerticalTeaser --frame=30 --scale=0.25 out/opening.png"
npm pkg set scripts.still:final="remotion still RyotaVerticalTeaser --frame=430 --scale=0.25 out/final-url.png"
npm pkg set scripts.render="remotion render RyotaVerticalTeaser out/ryota-teaser.mp4"
```

Expected:

```text
No output
```

- [ ] **Step 2: Verify package scripts**

Run:

```powershell
npm pkg get scripts
```

Expected output includes:

```json
{
  "studio": "remotion studio",
  "check": "tsc --noEmit",
  "still:opening": "remotion still RyotaVerticalTeaser --frame=30 --scale=0.25 out/opening.png",
  "still:final": "remotion still RyotaVerticalTeaser --frame=430 --scale=0.25 out/final-url.png",
  "render": "remotion render RyotaVerticalTeaser out/ryota-teaser.mp4"
}
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
npm run check
```

Expected:

```text
No TypeScript errors
```

- [ ] **Step 4: Render verification stills**

Run:

```powershell
npm run still:opening
npm run still:final
```

Expected:

```text
Saved still to
Saved still to
```

Review:

- `out\opening.png` shows the website footage and opening URL text.
- `out\final-url.png` shows a readable `www.ryota.top` lockup.
- Neither still has text clipped by the vertical canvas.

- [ ] **Step 5: Run full render**

Run:

```powershell
npm run render
```

Expected:

```text
Rendered
```

Review `C:\Users\25384\Desktop\ryota-site-video\out\ryota-teaser.mp4`:

- It is 15 seconds long.
- It is vertical `1080x1920`.
- The website remains the main subject.
- `www.ryota.top` is readable in the opening and final card.
- HUD lines and scanlines do not block the website content.
- The pacing feels suitable for short-form platforms.

- [ ] **Step 6: Commit scripts**

Run:

```powershell
git add package.json package-lock.json
git commit -m "chore: add teaser render scripts"
```

Expected:

```text
[main ...] chore: add teaser render scripts
```

## Task 8: Final Delivery Check

**Files:**

- Read: `C:\Users\25384\Desktop\ryota-site-video\out\ryota-teaser.mp4`
- Read: `C:\Users\25384\Desktop\ryota-site-video\out\opening.png`
- Read: `C:\Users\25384\Desktop\ryota-site-video\out\final-url.png`

- [ ] **Step 1: Confirm git status**

Run:

```powershell
git status --short
```

Expected:

```text
No output
```

- [ ] **Step 2: Confirm render artifacts exist**

Run:

```powershell
Get-Item out\ryota-teaser.mp4,out\opening.png,out\final-url.png | Select-Object Name,Length
```

Expected:

```text
Name             Length
----             ------
ryota-teaser.mp4 greater than 0
opening.png      greater than 0
final-url.png    greater than 0
```

- [ ] **Step 3: Prepare final handoff**

Report these paths to the user:

```text
C:\Users\25384\Desktop\ryota-site-video\out\ryota-teaser.mp4
C:\Users\25384\Desktop\ryota-site-video\docs\voiceover-script.md
```

Also report the validation results from:

```text
npm run check
npm run still:opening
npm run still:final
npm run render
```

## Self-Review Notes

Spec coverage:

- Vertical `9:16`, `1080x1920`, `30fps`, `15s`: covered in Task 2.
- Recording-driven approach using `个人网页.mp4`: covered in Task 1 and Task 3.
- Website visual remains the main subject: covered in Task 3, Task 4, and Task 7 review criteria.
- Cool cinematic technology style: covered in Task 4 and Task 5.
- Opening, middle beats, and final URL card: covered in Task 5.
- `www.ryota.top` as the unified brand display: covered in Task 2 and Task 5.
- No built-in voiceover and a separate口播稿: covered in Task 6.
- Hybrid source asset extension point: covered in Task 6 with `SourceAssetFlash enabled={false}`.
- Validation through Studio/stills/full render: covered in Task 7 and Task 8.

Red-flag scan:

- The plan contains no unfinished markers and no incomplete implementation steps.
- `SourceAssetFlash` is a complete disabled component with concrete asset paths for the future hybrid pass.

Type consistency:

- Composition ID is consistently `RyotaVerticalTeaser`.
- Constants are imported from `src/constants.ts`.
- Timing helpers are imported from `src/lib/timing.ts`.
- Component names match file names and imports.
