// Scene2 project cards and detail overlay. Add new projects by appending here.
const projects = [
  {
    id: "visual-draft-editor",
    title: "Visual Draft Editor",
    type: "AI Frontend Annotation Tool",
    description: "一个辅助 AI 前端开发的可视化标注工具，支持拖拽标注并导出修改指令。",
    summary: "一个辅助 AI 前端开发的可视化标注工具。",
    background: "传统 AI 前端修改只能通过文字描述，表达不够直观。这个工具让用户可以直接在页面上可视化调整，再交给 AI 执行。",
    features: ["页面元素选择", "拖拽移动组件", "文本标注", "修改记录生成", "导出给 Codex"],
    role: ["产品设计", "前端交互设计", "功能规划", "测试反馈整理"],
    tech: ["React", "TypeScript", "DOM Overlay", "CSS Transform"],
    tags: ["React", "TypeScript", "AI Tool"],
    status: "Private Beta",
    image: "/projects/visual-draft-editor-cover.png",
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: "bitmap-to-vector",
    title: "Bitmap to Vector Tool",
    type: "Computer Vision Web Tool",
    description: "一个将位图自动转换为可编辑 SVG 矢量图的 Web 工具。",
    summary: "把位图素材转换为更容易编辑和复用的 SVG 矢量图。",
    background: "位图素材在放大、编辑和复用时容易失真。这个工具探索把图形识别、路径生成和前端预览结合起来，降低矢量化处理门槛。",
    features: ["位图上传", "自动路径识别", "SVG 预览", "参数调整", "矢量文件导出"],
    role: ["产品规划", "交互流程设计", "前端界面设计", "测试反馈整理"],
    tech: ["FastAPI", "SVG", "Computer Vision", "JavaScript"],
    tags: ["FastAPI", "SVG", "Vision"],
    status: "Prototype",
    image: "/projects/bitmap-to-vector-cover.png",
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: "cinematic-portfolio",
    title: "Cinematic Portfolio",
    type: "Motion Portfolio Website",
    description: "一个基于场景切换、视频背景和沉浸式交互的个人作品集网站。",
    summary: "用电影化场景切换展示个人作品、相册和联系信息。",
    background: "传统个人主页容易变成静态信息列表。这个项目用视频背景、滚轮转场、水波互动和玻璃卡片，让作品集更像一段可进入的场景。",
    features: ["视频背景场景", "滚轮切换", "项目详情弹窗", "相册展示", "联系页反馈表单"],
    role: ["整体视觉方向", "前端实现", "动效调试", "响应式优化"],
    tech: ["HTML", "CSS", "JavaScript", "Animation"],
    tags: ["Animation", "Portfolio", "Motion"],
    status: "Live Iteration",
    image: "assets/projects/cinematic-portfolio.svg",
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: "instant-feedback",
    title: "Instant Feedback System",
    type: "Frontend Feedback UI",
    description: "一个用于收集用户反馈并快速展示交互反馈的前端系统。",
    summary: "让用户提交反馈后立刻得到清晰、轻量的前端响应。",
    background: "反馈表单经常缺少即时回应，用户不知道内容是否被接收。这个项目把表单状态、成功提示和界面动效组织成更完整的体验。",
    features: ["反馈表单", "即时提示", "输入状态", "响应式布局", "按钮反馈"],
    role: ["UI 设计", "UX 优化", "前端实现", "交互测试"],
    tech: ["UI", "UX", "Frontend", "CSS"],
    tags: ["UI", "UX", "Frontend"],
    status: "Concept",
    image: "assets/projects/instant-feedback.svg",
    demoUrl: "#",
    githubUrl: "#"
  }
];

let activeProject = null;
let isAnimating = false;
let modalElements = {};

function initProjectCards() {
  modalElements = {
    overlay: document.getElementById("projectModal"),
    backdrop: document.getElementById("projectModalBackdrop") || document.querySelector(".project-modal-backdrop"),
    card: document.getElementById("projectModalCard"),
    closeBtn: document.getElementById("projectModalClose"),
    closeTextBtn: document.getElementById("projectModalCloseText"),
    media: document.getElementById("projectModalMedia"),
    type: document.getElementById("projectModalType"),
    title: document.getElementById("projectModalTitle"),
    summary: document.getElementById("projectModalSummary"),
    background: document.getElementById("projectModalBackground"),
    features: document.getElementById("projectModalFeatures"),
    role: document.getElementById("projectModalRole"),
    tech: document.getElementById("projectModalTech"),
    status: document.getElementById("projectModalStatus"),
    demo: document.getElementById("projectModalDemo"),
    github: document.getElementById("projectModalGithub")
  };

  if (!modalElements.overlay || !modalElements.card) return;

  if (modalElements.overlay.parentElement !== document.body) {
    document.body.appendChild(modalElements.overlay);
  }

  renderProjectCards();
  bindCardEvents();
  bindModalEvents();
}

function renderProjectCards() {
  const grid = document.querySelector(".project-cards-grid");
  if (!grid) return;

  grid.innerHTML = projects.map((project) => `
    <article class="project-card" data-project-id="${project.id}">
      <div class="project-image-wrap">
        <img class="project-card-image" src="${project.image}" alt="${project.title}">
      </div>
      <div class="project-card-info">
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-description">${project.description}</p>
        <div class="project-tags">
          ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
      </div>
    </article>
  `).join("");
}

function bindCardEvents() {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", handleCardClick);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCardClick(event);
      }
    });
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
  });
}

function bindModalEvents() {
  modalElements.backdrop?.addEventListener("click", closeProjectModal);
  modalElements.closeBtn?.addEventListener("click", closeProjectModal);
  modalElements.closeTextBtn?.addEventListener("click", closeProjectModal);
  modalElements.demo?.addEventListener("click", handlePlaceholderLink);
  modalElements.github?.addEventListener("click", handlePlaceholderLink);
  modalElements.card.addEventListener("click", (event) => event.stopPropagation());
  modalElements.card.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
  modalElements.card.addEventListener("touchstart", (event) => event.stopPropagation(), { passive: true });
  modalElements.card.addEventListener("touchend", (event) => event.stopPropagation(), { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeProject) closeProjectModal();
  });
}

function handlePlaceholderLink(event) {
  const href = event.currentTarget.getAttribute("href");
  if (!href || href === "#") {
    event.preventDefault();
  }
}

function handleCardClick(event) {
  if (isAnimating || activeProject) return;
  const project = projects.find((item) => item.id === String(event.currentTarget.dataset.projectId));
  if (!project) return;
  openProjectModal(project);
}

function openProjectModal(project) {
  isAnimating = true;
  activeProject = project;
  renderProject(project);

  document.body.classList.add("project-detail-open");
  modalElements.overlay.style.display = "grid";
  modalElements.overlay.setAttribute("aria-hidden", "false");
  modalElements.card.scrollTop = 0;

  requestAnimationFrame(() => {
    modalElements.overlay.classList.add("is-open");
    modalElements.card.focus({ preventScroll: true });
  });

  setTimeout(() => {
    isAnimating = false;
  }, 360);
}

function closeProjectModal() {
  if (isAnimating || !activeProject) return;
  isAnimating = true;
  modalElements.overlay.classList.remove("is-open");
  modalElements.overlay.classList.add("is-closing");

  setTimeout(() => {
    modalElements.overlay.classList.remove("is-closing");
    modalElements.overlay.style.display = "none";
    modalElements.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-detail-open");
    activeProject = null;
    isAnimating = false;
  }, 280);
}

function forceCloseProjectModal() {
  modalElements.overlay?.classList.remove("is-open", "is-closing");
  if (modalElements.overlay) {
    modalElements.overlay.style.display = "none";
    modalElements.overlay.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("project-detail-open");
  activeProject = null;
  isAnimating = false;
}

function renderProject(project) {
  modalElements.type.textContent = project.type;
  modalElements.title.textContent = project.title;
  modalElements.summary.textContent = project.summary;
  modalElements.background.textContent = project.background || project.description;
  modalElements.status.textContent = `Status / ${project.status}`;
  modalElements.demo.href = project.demoUrl || "#";
  modalElements.github.href = project.githubUrl || "#";
  renderMedia(project);
  renderList(modalElements.features, project.features);
  renderList(modalElements.role, project.role);
  renderTech(project.tech);
}

function renderMedia(project) {
  modalElements.media.textContent = "";
  if (project.video) {
    const video = document.createElement("video");
    video.src = project.video;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    modalElements.media.appendChild(video);
    return;
  }

  const image = document.createElement("img");
  image.src = project.image;
  image.alt = `${project.title} preview`;
  modalElements.media.appendChild(image);
}

function renderList(container, items = []) {
  container.textContent = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderTech(items = []) {
  modalElements.tech.textContent = "";
  items.forEach((item) => {
    const chip = document.createElement("span");
    chip.textContent = item;
    modalElements.tech.appendChild(chip);
  });
}

window.addEventListener("scene:change", () => {
  if (activeProject) forceCloseProjectModal();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectCards);
} else {
  initProjectCards();
}
