// ============================================
// Gallery Focus Mode
// ============================================

let currentPhotoId = null;
let isActive = false;

const overlay = document.getElementById('photoDetail');
const detailImage = document.getElementById('detailImage');
const detailTitle = document.getElementById('detailTitle');
const detailDescription = document.getElementById('detailDescription');
const detailDate = document.getElementById('detailDate');
const closeButton = document.getElementById('detailClose');

if (overlay && overlay.parentElement !== document.body) {
  document.body.appendChild(overlay);
}

function enterFocusMode(photoId) {
  if (!window.gallerySystem) {
    console.error('gallerySystem not available');
    return;
  }

  const photo = window.gallerySystem.getPhotoById(photoId);

  if (!photo) {
    console.error('Photo not found for id:', photoId);
    return;
  }

  currentPhotoId = photo.id;
  isActive = true;

  // Pause photo flow
  window.gallerySystem.pause();

  // Populate content
  detailImage.src = photo.src;
  detailImage.alt = photo.title;
  detailTitle.textContent = photo.title;
  detailDescription.textContent = photo.description;
  detailDate.textContent = photo.date;

  // Show overlay
  overlay.classList.add('is-active');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function exitFocusMode() {
  if (!isActive) return;

  isActive = false;
  currentPhotoId = null;

  // Hide overlay
  overlay.classList.remove('is-active');

  // Resume photo flow
  if (window.gallerySystem) {
    window.gallerySystem.resume();
  }

  // Restore body scroll
  document.body.style.overflow = '';
}

function navigateToNext() {
  if (!window.gallerySystem || !currentPhotoId) return;

  const photos = window.gallerySystem.getAllPhotos();
  const currentIndex = photos.findIndex(p => p.id === currentPhotoId);
  const nextIndex = (currentIndex + 1) % photos.length;
  const nextPhoto = photos[nextIndex];

  enterFocusMode(nextPhoto.id);
}

function navigateToPrevious() {
  if (!window.gallerySystem || !currentPhotoId) return;

  const photos = window.gallerySystem.getAllPhotos();
  const currentIndex = photos.findIndex(p => p.id === currentPhotoId);
  const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
  const prevPhoto = photos[prevIndex];

  enterFocusMode(prevPhoto.id);
}

document.addEventListener('keydown', (e) => {
  if (!isActive) return;

  switch (e.key) {
    case 'Escape':
      exitFocusMode();
      break;
    case 'ArrowRight':
      navigateToNext();
      break;
    case 'ArrowLeft':
      navigateToPrevious();
      break;
  }
});

// Listen for focus requests
window.addEventListener('gallery:focus', (e) => {
  const detail = e.detail;
  const photoId = typeof detail === 'object' && detail !== null
    ? detail.photoId || detail.id || detail
    : detail;

  enterFocusMode(photoId);
});

// Close button
if (closeButton) {
  closeButton.addEventListener('click', exitFocusMode);
}

// Click overlay background to close
if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      exitFocusMode();
    }
  });
}
