const grid = document.getElementById('projects-grid');
const modal = document.getElementById('modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalTags = document.getElementById('modal-tags');
const modalDescription = document.getElementById('modal-description');
const modalGallery = document.getElementById('modal-gallery');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightbox-close');
const lbImg = document.getElementById('lb-img');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

let lbImages = [];
let lbIndex = 0;

// ── Lightbox ──────────────────────────────────────────────
function openLightbox(images, index) {
  lbImages = images;
  lbIndex = index;
  lbImg.src = lbImages[lbIndex];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateLbNav();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = modal.classList.contains('open') ? 'hidden' : '';
}

function updateLbNav() {
  lbPrev.style.opacity = lbIndex > 0 ? '1' : '0.2';
  lbNext.style.opacity = lbIndex < lbImages.length - 1 ? '1' : '0.2';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; lbImg.src = lbImages[lbIndex]; updateLbNav(); } });
lbNext.addEventListener('click', () => { if (lbIndex < lbImages.length - 1) { lbIndex++; lbImg.src = lbImages[lbIndex]; updateLbNav(); } });

// ── Modal ──────────────────────────────────────────────────
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

function openModal(project) {
  modalTitle.textContent = project.title;
  modalDate.textContent = formatDate(project.date);

  modalTags.innerHTML = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  modalDescription.textContent = project.description || '';

  const images = project.images || [];
  modalGallery.innerHTML = '';
  images.forEach((src, i) => {
    const img = document.createElement('img');
    img.className = 'gallery-img';
    img.src = src;
    img.alt = `${project.title} — image ${i + 1}`;
    img.loading = 'lazy';
    img.addEventListener('click', () => openLightbox(images, i));
    modalGallery.appendChild(img);
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Keyboard nav ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (lightbox.classList.contains('open')) {
    if (e.key === 'ArrowLeft') lbPrev.click();
    else if (e.key === 'ArrowRight') lbNext.click();
    else if (e.key === 'Escape') closeLightbox();
  } else if (modal.classList.contains('open') && e.key === 'Escape') {
    closeModal();
  }
});

// ── Helpers ───────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Render card ────────────────────────────────────────────
function renderCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View project: ${project.title}`);

  const thumb = project.cover
    ? `<img class="card-thumb" src="${project.cover}" alt="${project.title}" loading="lazy">`
    : `<div class="card-thumb-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
       </div>`;

  const tags = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  card.innerHTML = `
    ${thumb}
    <div class="card-body">
      <div class="card-date">${formatDate(project.date)}</div>
      <h3 class="card-title">${project.title}</h3>
      <p class="card-desc">${project.description || ''}</p>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
    </div>
  `;

  const open = () => openModal(project);
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });

  return card;
}

// ── Load projects ──────────────────────────────────────────
async function loadProjects() {
  try {
    const indexRes = await fetch('projects/projects.json');
    if (!indexRes.ok) throw new Error('index not found');
    const slugs = await indexRes.json();

    if (!slugs.length) {
      grid.innerHTML = '<p class="empty-state">Projects coming soon — check back after our next build session!</p>';
      return;
    }

    const projects = await Promise.all(
      slugs.map(async slug => {
        const res = await fetch(`projects/${slug}/meta.json`);
        if (!res.ok) return null;
        const meta = await res.json();
        const base = `projects/${slug}/images/`;
        meta.images = (meta.images || []).map(img => img.startsWith('http') ? img : base + img);
        if (meta.cover && !meta.cover.startsWith('http')) meta.cover = base + meta.cover;
        return meta;
      })
    );

    const valid = projects.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));

    grid.innerHTML = '';
    if (!valid.length) {
      grid.innerHTML = '<p class="empty-state">Projects coming soon!</p>';
      return;
    }
    valid.forEach(p => grid.appendChild(renderCard(p)));

  } catch {
    grid.innerHTML = '<p class="empty-state">Projects coming soon — check back after our next build session!</p>';
  }
}

loadProjects();
