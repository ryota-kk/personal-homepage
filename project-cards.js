// Scene2 project cards and detail overlay. Add new projects by appending here.
const projects = [
  {
    id: "ai-customer-service",
    title: "AI 智能客服",
    type: "AI Customer Service / Case Study",
    description: "从智能对话到订单查询与后台管理，串起完整的客服体验。",
    summary: "通过真实演示，了解客服对话、订单查询与管理后台如何协同工作。",
    background: "这项演示将用户咨询、订单信息和管理流程放在同一体验中，呈现 AI 客服从回应问题到处理业务的过程。",
    features: ["多轮客服对话", "订单与商品信息查询", "订单管理后台", "人工审核记录"],
    roleLabel: "Demo Scope",
    role: ["客服对话界面", "订单查询流程", "后台管理界面", "人工审核流程"],
    techLabel: "Experience",
    tech: ["AI Workflow", "Chat UI", "Order Tools", "Admin UI"],
    tags: ["AI", "Customer Service", "Case Study"],
    status: "Case Study",
    image: "/projects/ai-customer-service-cover.jpg",
    previewVideo: "",
    demoUrl: "https://vector.ryota.top/",
    githubUrl: "",
    demoAvailable: true,
    githubPublic: false,
    demoUnavailableText: "Site Preparing",
    githubUnavailableText: "Repo Pending"
  },
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
    image: "/projects/visual-draft-editor-detail.png",
    detailImage: "/projects/visual-draft-editor-detail.png",
    demoUrl: "",
    githubUrl: "https://github.com/ryota-kk/AI-Visual-Draft-Editor.git",
    demoAvailable: false,
    githubPublic: true
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
    image: "/projects/bitmap-to-vector-detail.png",
    detailImage: "/projects/bitmap-to-vector-detail.png",
    demoUrl: "https://svg.ryota.top/vector",
    githubUrl: "https://github.com/ryota-kk/svg.tool.git",
    demoAvailable: true,
    githubPublic: true
  },
  {
    id: "esports-data-platform",
    title: "电竞数据管理平台",
    type: "Client Website / Frontend Delivery",
    description: "为电竞领域客户制作的数据管理前端，结合水墨场景、数据界面与五屏导航。",
    summary: "以水墨视觉串联门面、数据工作区与多场景导航的客户网页。",
    background: "客户需要一套兼顾品牌表达和实际操作的数据库前端。交付内容聚焦页面视觉、场景衔接与跨设备交互；业务数据接口由客户现有后端接入。",
    features: ["门面场景与视频转场", "五屏数据库导航", "数据工作区界面", "桌面与移动端切换"],
    role: ["前端页面实现", "场景动效衔接", "响应式适配", "交付整理"],
    tech: ["HTML", "CSS", "JavaScript", "Video"],
    tags: ["Client Work", "Frontend", "Motion"],
    status: "Frontend Delivered",
    image: "/projects/esports-data-platform-cover.jpg",
    demoUrl: "",
    githubUrl: "",
    demoAvailable: false,
    githubPublic: false,
    demoUnavailableText: "Demo Unavailable",
    githubUnavailableText: "Private Repo"
  }
];

const otherProjects = projects.slice(1);

let activeProject = null;
let collectionOpen = false;
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
    github: document.getElementById("projectModalGithub"),
    collection: document.getElementById("projectCollectionModal"),
    collectionCard: document.querySelector(".project-collection-card"),
    collectionList: document.getElementById("projectCollectionList")
  };

  if (!modalElements.overlay || !modalElements.card) return;

  if (modalElements.overlay.parentElement !== document.body) {
    document.body.appendChild(modalElements.overlay);
  }
  if (modalElements.collection?.parentElement !== document.body) {
    document.body.appendChild(modalElements.collection);
  }

  renderProjectCards();
  renderCollectionList();
  bindCardEvents();
  bindModalEvents();
}

function renderProjectCards() {
  const grid = document.querySelector(".project-cards-grid");
  if (!grid) return;

  const featured = projects[0];
  grid.innerHTML = `
    <article class="project-card project-card-featured" data-project-id="${featured.id}">
      <div class="project-image-wrap">
        <img class="project-card-image" src="${featured.image}" alt="AI 智能客服对话界面">
      </div>
      <div class="project-card-info">
        <span class="project-card-label">Featured / 主项目</span>
        <h3 class="project-card-title">${featured.title}</h3>
        <p class="project-card-description">${featured.description}</p>
        <div class="project-tags">
          ${featured.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
      </div>
    </article>
    <article class="project-card project-card-collection" data-project-id="other-projects">
      <div class="project-card-info">
        <span class="project-card-label">Selected work / ${String(otherProjects.length).padStart(2, "0")}</span>
        <h3 class="project-card-title">其他项目</h3>
        <p class="project-card-description">工具、实验与个人作品，收在这里。</p>
        <div class="project-collection-names">${otherProjects.map((project) => `<span>${project.title}</span>`).join("")}</div>
        <span class="project-collection-action">查看项目 <span aria-hidden="true">↗</span></span>
      </div>
    </article>
  `;
}

function renderCollectionList() {
  if (!modalElements.collectionList) return;
  modalElements.collectionList.innerHTML = otherProjects.map((project) => `
    <button class="project-collection-row" type="button" data-project-id="${project.id}">
      <img src="${project.image}" alt="" loading="lazy">
      <span class="project-collection-row-copy">
        <strong>${project.title}</strong>
        <small>${project.description}</small>
      </span>
      <span class="project-collection-row-arrow" aria-hidden="true">↗</span>
    </button>
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
  modalElements.collection?.querySelectorAll("[data-collection-close]").forEach((element) => {
    element.addEventListener("click", closeCollectionModal);
  });
  modalElements.collectionList?.addEventListener("click", (event) => {
    const row = event.target.closest("[data-project-id]");
    if (!row) return;
    const project = otherProjects.find((item) => item.id === row.dataset.projectId);
    if (!project) return;
    hideCollectionImmediately();
    openProjectModal(project);
  });
  modalElements.demo?.addEventListener("click", handlePlaceholderLink);
  modalElements.github?.addEventListener("click", handlePlaceholderLink);
  modalElements.card.addEventListener("click", (event) => event.stopPropagation());
  modalElements.card.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
  modalElements.card.addEventListener("touchstart", (event) => event.stopPropagation(), { passive: true });
  modalElements.card.addEventListener("touchend", (event) => event.stopPropagation(), { passive: true });
  modalElements.collectionCard?.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (activeProject) closeProjectModal();
    else if (collectionOpen) closeCollectionModal();
  });
}

function handlePlaceholderLink(event) {
  const target = event.currentTarget;
  const href = target.getAttribute("href");
  if (target.classList.contains("is-disabled") || target.getAttribute("aria-disabled") === "true" || !href || href === "#") {
    event.preventDefault();
  }
}

function handleCardClick(event) {
  if (isAnimating || activeProject || collectionOpen) return;
  if (event.currentTarget.dataset.projectId === "other-projects") {
    openCollectionModal();
    return;
  }
  const project = projects.find((item) => item.id === String(event.currentTarget.dataset.projectId));
  if (!project) return;
  openProjectModal(project);
}

function openCollectionModal() {
  if (!modalElements.collection) return;
  collectionOpen = true;
  document.body.classList.add("project-detail-open");
  modalElements.collection.style.display = "grid";
  modalElements.collection.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    modalElements.collection.classList.add("is-open");
    modalElements.collectionCard.focus({ preventScroll: true });
  });
}

function hideCollectionImmediately() {
  collectionOpen = false;
  modalElements.collection.classList.remove("is-open");
  modalElements.collection.style.display = "none";
  modalElements.collection.setAttribute("aria-hidden", "true");
}

function closeCollectionModal() {
  if (!collectionOpen) return;
  collectionOpen = false;
  modalElements.collection.classList.remove("is-open");
  window.setTimeout(() => {
    if (collectionOpen || activeProject) return;
    modalElements.collection.style.display = "none";
    modalElements.collection.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-detail-open");
  }, 280);
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
  modalElements.media.querySelector("video")?.pause();
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
  modalElements.media?.querySelector("video")?.pause();
  modalElements.overlay?.classList.remove("is-open", "is-closing");
  if (modalElements.overlay) {
    modalElements.overlay.style.display = "none";
    modalElements.overlay.setAttribute("aria-hidden", "true");
  }
  document.body.classList.remove("project-detail-open");
  if (collectionOpen) hideCollectionImmediately();
  activeProject = null;
  isAnimating = false;
}

function renderProject(project) {
  modalElements.type.textContent = project.type;
  modalElements.title.textContent = project.title;
  modalElements.summary.textContent = project.summary;
  modalElements.background.textContent = project.background || project.description;
  modalElements.role.closest(".project-detail-section").querySelector("h4").textContent = project.roleLabel || "My Role";
  modalElements.tech.closest(".project-detail-section").querySelector("h4").textContent = project.techLabel || "Tech Stack";
  modalElements.status.textContent = `Status / ${project.status}`;
  renderProjectLink(modalElements.demo, {
    isAvailable: project.demoAvailable,
    url: project.demoUrl,
    availableText: "View Demo",
    unavailableText: project.demoUnavailableText || "Coming Soon",
  });
  renderProjectLink(modalElements.github, {
    isAvailable: project.githubPublic,
    url: project.githubUrl,
    availableText: "GitHub",
    unavailableText: project.githubUnavailableText || "Private Repo",
  });
  renderMedia(project);
  renderList(modalElements.features, project.features);
  renderList(modalElements.role, project.role);
  renderTech(project.tech);
}

function renderProjectLink(element, { isAvailable, url, availableText, unavailableText }) {
  const canOpen = Boolean(isAvailable && url);
  element.textContent = canOpen ? availableText : unavailableText;
  element.classList.toggle("is-disabled", !canOpen);
  element.setAttribute("aria-disabled", canOpen ? "false" : "true");

  if (canOpen) {
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
    element.tabIndex = 0;
    return;
  }

  element.removeAttribute("href");
  element.removeAttribute("target");
  element.removeAttribute("rel");
  element.tabIndex = -1;
}

function renderMedia(project) {
  modalElements.media.querySelector("video")?.pause();
  modalElements.media.textContent = "";
  modalElements.media.dataset.projectId = project.id;
  const previewVideo = project.previewVideo || project.video;
  const detailImage = project.detailImage || project.image;
  modalElements.media.classList.toggle("has-video", Boolean(previewVideo));
  if (previewVideo) {
    const video = document.createElement("video");
    video.src = previewVideo;
    video.poster = project.image;
    video.controls = true;
    video.playsInline = true;
    video.preload = "none";
    modalElements.media.appendChild(video);
    return;
  }

  const image = document.createElement("img");
  image.src = detailImage;
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

window.addEventListener("scene:change", (event) => {
  if (event.detail?.scene === 2) return;
  if (activeProject || collectionOpen) forceCloseProjectModal();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProjectCards);
} else {
  initProjectCards();
}
