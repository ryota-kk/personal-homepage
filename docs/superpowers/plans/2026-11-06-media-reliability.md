# Media Reliability Implementation Plan

**Goal:** Complete the approved audit fixes without changing scene content or project interactions.

**Architecture:** Keep the static application and existing scene functions. Bound media playback attempts, make navigation independent of downloads, and preserve a poster or previous frame during playback failures. Generate delivery assets from retained originals.

## Stage 1: Reliable Playback

- [x] Make entry independent of music playback.
- [x] Add bounded, cancellable video activation and poster fallbacks.
- [x] Complete every scene transition even when media fails or stalls.
- [x] Verify music stalls, video failures, delayed playback, and desktop/mobile scene navigation.

## Stage 2: Media Delivery

- [x] Generate faststart H.264 desktop/mobile variants and JPEG posters while retaining originals.
- [x] Load videos on demand and remove duplicate intro video decoding.
- [x] Generate screen-sized WebP gallery previews while retaining original photographs.
- [x] Verify file sizes, frame dimensions, MP4 metadata placement, and desktop/mobile presentation.

## Stage 3: Serving And Lifecycle

- [x] Implement HTTP Range, HEAD, and correct media response headers in the local server.
- [x] Pause video, music, and gallery animation when the document is hidden; resume safely.
- [x] Limit persistent compositing hints and use the static intro image instead of a full-screen live-video blur.
- [x] Run regression checks, static build, asset-reference verification, and Git diff review.

## Verification

Use browser fault injection to delay music indefinitely, abort individual videos, and reject video play promises. The content must remain navigable, no transition lock may survive the bounded transition, and every scene must retain a visible background. Test normal forward/back navigation at desktop and mobile sizes. HTTP tests must check 200, 206, 416, HEAD, and suffix byte ranges.

## Results

- Browser fault checks passed on source and production builds: music stalls, rejected video playback, delayed scene responses, stale playback cancellation, and failed loop videos.
- Desktop wheel and mobile touch simulation passed full scene round trips, project modal interactions, background-tab pause/resume, nonblank decoded video frames, and desktop/mobile source selection.
- Infinite waiting for all video requests still reaches an unlocked Scene2 with its scene poster.
- Desktop/mobile gallery screenshots use 1920/960-pixel WebP previews; no original photo requests or horizontal overflow were observed.
- Cold entry produces no MP4/MP3 requests until the enter button is clicked. A simulated mobile rotation retained a 390-pixel visible viewport, fallback, and shell height.
- HTTP range checks, media checks, production asset checks, static build, and diff review passed.
- Video delivery totals: desktop 20.15 MB, mobile 9.00 MB (originals approximately 71 MB).
- Gallery delivery totals: desktop 3.78 MB, mobile 1.28 MB (originals approximately 56.71 MB).
- Original media remain in the source repository and are omitted from production output.
- Validation used the local production preview at http://127.0.0.1:4173/. Physical Safari and phone-specific browsers remain to be checked on devices.
