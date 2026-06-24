# Ryota Remotion Teaser Design

## Context

The goal is to create a short Remotion video for the personal website at `www.ryota.top`.

Confirmed direction:

- Format: vertical short video, `9:16`
- Primary version: `15s`
- Style: cool, cinematic, technology-forward
- Focus: the visual experience of the website itself
- Main asset: `C:\Users\25384\Desktop\remotion素材\个人网页.mp4`
- Website source reference: `C:\Users\25384\Desktop\cl\web前端\scene_scroll_web_frontend\scene_scroll_web_frontend`
- Brand display: `www.ryota.top`
- Audio approach: no built-in voiceover in the first version; provide a voiceover script for later recording

The website is a static cinematic portfolio built with native HTML, CSS, and JavaScript. It uses fullscreen video scenes, scroll-driven transitions, glassmorphism cards, gallery content, contact content, water ripple effects, and audio controls.

## Recommended Approach

Use a recording-driven Remotion composition for the first version.

The screen recording should be the main visual layer. Remotion will add vertical composition, cropping, camera motion, rhythm cuts, HUD overlays, title beats, scanline texture, and the final URL card. This preserves the real site feel and avoids rebuilding complex website interactions in Remotion.

The design should leave a clear extension point for a later hybrid version. In that later version, original website assets such as `assets/scene1.mp4`, `assets/scene2.mp4`, `assets/scene3.mp4`, gallery images, and project SVGs can be inserted as fast flashes or detail shots.

## Composition

- Composition ID: `RyotaVerticalTeaser`
- Canvas: `1080x1920`
- FPS: `30`
- Duration: `450` frames
- Runtime: `15s`
- Primary asset: `个人网页.mp4`
- Output intent: short-form platforms such as Douyin, Xiaohongshu, Reels, or Shorts

## Timeline

### 0.0-1.2s: Opening Pulse

The video starts from black or a very dark frame, then quickly reveals the website footage through a fast digital pulse.

On-screen text:

- `CINEMATIC WEB EXPERIENCE`
- `www.ryota.top`

Visual treatment:

- Fast opacity reveal
- Subtle chromatic aberration
- Fine scanline texture
- Small HUD marks near the frame edges

### 1.2-4.0s: First Impression

Show the homepage or entrance portion of the recording. The shot should feel like the viewer is entering a digital space.

Visual treatment:

- Slow push-in
- Dark vignette
- Slight camera drift
- Minimal HUD lines that do not cover the site content

### 4.0-7.4s: Scroll Scene Transition

Use the recorded scroll or scene switch as the main motion event. Cut on beat and emphasize the transition with controlled flashes.

On-screen text:

- `SCROLL-DRIVEN SCENES`

Visual treatment:

- Two or three short rhythm flashes
- Edge light sweep
- Brief frame-scale punch on the strongest transition moment

### 7.4-10.8s: Interface Detail

Show project cards, glass panels, or a visually strong interface section from the recording.

On-screen text:

- `MOTION / GLASS / INTERACTION`

Visual treatment:

- Local zoom crop
- Slight perspective tilt
- Thin HUD box or corner brackets around the active content area
- Controlled noise grain

### 10.8-13.4s: Fast Experience Sweep

Show a quick pass across the gallery, contact, or late-stage website content. This should compress the site's range into one short visual sequence.

Visual treatment:

- Faster cuts
- Short hold on the strongest visual frame
- Leave room for future source-asset flashes from the website project

### 13.4-15.0s: URL Lockup

End on a dark, clean lockup that prioritizes the website address.

On-screen text:

- `www.ryota.top`
- Optional small line: `ENTER THE SITE`

Visual treatment:

- Footage fades or scales back
- URL remains crisp and centered
- HUD lines resolve into a stable final frame

## Visual System

The video's effects should support the website rather than overpower it.

Use:

- Dark cinematic base
- Cyan and green highlights
- Thin technical lines
- Subtle scanlines
- Light grain
- Small digital pulses
- Slight chromatic aberration on transition beats

Avoid:

- Heavy glitch effects that obscure the website
- Excessive text
- Overly busy overlays
- Rebuilding the whole website in Remotion for the first version

## Remotion Structure

Suggested project path:

`C:\Users\25384\Desktop\ryota-site-video`

Suggested components:

- `RyotaVerticalTeaser`: root composition
- `FootageLayer`: imports the recording, crops it to vertical, and controls scale/position over time
- `HudOverlay`: scanlines, corner brackets, light sweeps, and technical marks
- `TitleBeats`: timed text overlays for the opening and mid-video beats
- `FinalUrlCard`: clean final website lockup
- `SourceAssetFlash`: reserved extension component for future use with original website assets

The first version should rely on the recording. `SourceAssetFlash` can be stubbed or deferred until the hybrid enhancement pass.

## Asset Handling

The recording should be copied or referenced from:

`C:\Users\25384\Desktop\remotion素材\个人网页.mp4`

If the Remotion project is created separately, store imported assets under:

`public/assets/`

Potential future enhancement assets from the website source:

- `assets/scene1.mp4`
- `assets/transition_1_2.mp4`
- `assets/scene2.mp4`
- `assets/scene2_idle_loop.mp4`
- `assets/scene3.mp4`
- `public/videos/scene3-loop-after.mp4`
- `assets/gallery/*.jpg`
- `assets/projects/*.svg`
- `public/projects/*.png`

## Voiceover Script

The first version will not include recorded voiceover, but it should leave enough rhythm space for this later script:

```text
欢迎进入 www.ryota.top。
这里不是一张静态主页，
而是一段可以滚动探索的视觉场景。
视频、玻璃卡片、相册和交互，
被组织成一个电影感的个人网站。
打开 www.ryota.top，
进入我的数字空间。
```

## Validation

The implementation should be checked with:

- Remotion Studio preview
- A still-frame render around the first second
- A still-frame render near the final URL card
- Full render review for readable text, non-obscured website content, and smooth vertical composition

Success criteria:

- The video reads clearly as a preview of `www.ryota.top`
- The website visual experience remains the main subject
- The pace feels suitable for short-form vertical platforms
- The final URL is readable and memorable
- The structure can later accept original source assets for a hybrid enhancement pass
