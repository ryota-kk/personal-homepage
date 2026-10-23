# Scene2 Collection Subsite Link

## Goal

Connect the existing Scene2 "其他项目" collection modal on the main portfolio to the live three-project showcase at `https://svg.ryota.top/`, while preserving the collection modal and each project's detail overlay.

## Behavior

- The Scene2 collection card continues to open its current modal. Its three rows continue to open their current detail overlays.
- Add one distinct text link below the collection list: "查看完整项目展示 ↗". It opens `https://svg.ryota.top/` in a new tab with `rel="noopener noreferrer"`.
- The Bitmap to Vector Tool detail overlay's View Demo opens `https://svg.ryota.top/vector` so the single-project action goes directly to the working tool.
- Closing either modal, Escape handling, scroll locking, and scene transitions remain unchanged.

## Presentation

Use the modal's existing pale editorial styling. The link is an unframed footer action with a subtle top rule, not another card. It remains visible and keyboard-focusable on desktop and mobile; the modal may retain its existing internal mobile scroll.

## Verification

Build the static site, check the collection and detail interactions in desktop and mobile browser viewports, confirm the external destination and new-tab attributes, and verify the Scene2 overlay does not introduce horizontal overflow. Review the pre-existing uncommitted main-site changes separately before any deployment commit or push.
