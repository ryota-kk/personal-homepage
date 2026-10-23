# Scene2 Collection Subsite Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Scene2 collection modal and give visitors a direct route to the three-project showcase.

**Architecture:** Add a plain external anchor beneath the existing collection list. Preserve the row buttons and modal event handlers. Update only the bitmap project's demo URL so its existing dynamic link opens the vector tool route.

**Tech Stack:** Static HTML, CSS, JavaScript, Node.js build script.

---

### Task 1: Add The Collection Entry

**Files:**
- Modify: `index.html:140`
- Modify: `styles.css:990`

- [x] **Step 1: Add the anchor immediately after the collection list**

```html
<a class="project-collection-site-link" href="https://svg.ryota.top/" target="_blank" rel="noopener noreferrer">
  查看完整项目展示 <span aria-hidden="true">↗</span>
</a>
```

- [x] **Step 2: Add focused styling after the collection row styles**

```css
.project-collection-site-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  color: #264d43;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.project-collection-site-link:hover,
.project-collection-site-link:focus-visible {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.project-collection-site-link:focus-visible {
  outline: 2px solid #376a5d;
  outline-offset: 4px;
}
```

- [x] **Step 3: Confirm the three existing row buttons still open their detail overlays and the link opens a new tab**

Run the static site with `npm run dev`; use a browser at desktop and mobile widths. Expected: existing row actions and Close work; the new link targets `https://svg.ryota.top/` with `rel="noopener noreferrer"`.

### Task 2: Route The Bitmap Demo

**Files:**
- Modify: `project-cards.js:59`

- [x] **Step 1: Update the data value**

```js
demoUrl: "https://svg.ryota.top/vector",
```

- [x] **Step 2: Verify the existing dynamic View Demo link**

Open the bitmap detail overlay. Expected: View Demo targets `https://svg.ryota.top/vector` in a new tab; other project links stay unchanged.

### Task 3: Build And Review

**Files:**
- Verify: `index.html`, `project-cards.js`, `styles.css`

- [x] **Step 1: Run `npm run build`**

Expected: exit code 0 and built site under `dist`.

- [x] **Step 2: Run `git diff --check` and inspect the diff**

Expected: no whitespace errors or accidental changes outside the scoped edits. Preserve all previously modified page files and untracked media.
