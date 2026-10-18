// Artwork cards are the source of truth for the viewer and collection count.
const cards = [...document.querySelectorAll('.artwork-card')];
const artworks = cards.map(card => ({
  src: card.querySelector('img').getAttribute('src'),
  title: card.querySelector('.artwork-title').textContent.trim(),
  sub: [card.querySelector('.artwork-number')?.textContent.trim(), card.querySelector('.artwork-medium')?.textContent.trim()].filter(Boolean).join(' · ')
}));
const viewer = document.getElementById('lightbox');
const closeButton = viewer.querySelector('.lightbox-close');
let currentIndex = 0, returnFocus = null, inertNodes = [], previousOverflow = '';
viewer.setAttribute('role', 'dialog');
viewer.setAttribute('aria-modal', 'true');
viewer.setAttribute('aria-labelledby', 'lightbox-title');
viewer.setAttribute('aria-hidden', 'true');
closeButton.setAttribute('aria-label', 'Close artwork');
viewer.querySelector('.lightbox-prev').setAttribute('aria-label', 'Previous artwork');
viewer.querySelector('.lightbox-next').setAttribute('aria-label', 'Next artwork');
document.getElementById('lightbox-sub').setAttribute('aria-live', 'polite');
cards.forEach((card, index) => {
  card.setAttribute('role', 'button'); card.tabIndex = 0;
  card.setAttribute('aria-label', 'View ' + artworks[index].title);
  card.setAttribute('aria-haspopup', 'dialog');
  card.classList.add('visible');
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); }
  });
});
const count = document.querySelector('.artist-detail-value');
if (count) count.textContent = artworks.length;
window.addEventListener('scroll', () => document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 80), {passive:true});
function updateLightbox() {
  const art = artworks[currentIndex];
  document.getElementById('lightbox-img').src = art.src;
  document.getElementById('lightbox-img').alt = art.title;
  document.getElementById('lightbox-title').textContent = art.title;
  document.getElementById('lightbox-sub').textContent = `${currentIndex + 1} of ${artworks.length} · ${art.sub}`;
}
function openLightbox(index) {
  currentIndex = index; updateLightbox();
  if (viewer.classList.contains('active')) return;
  returnFocus = document.activeElement === document.body ? cards[index] : document.activeElement;
  previousOverflow = document.body.style.overflow;
  viewer.classList.add('active'); viewer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; closeButton.focus();
  inertNodes = [...document.body.children].filter(el => el !== viewer && !el.inert && !['SCRIPT','STYLE'].includes(el.tagName));
  inertNodes.forEach(el => el.inert = true);
}
function closeLightbox() {
  if (!viewer.classList.contains('active')) return;
  inertNodes.forEach(el => el.inert = false); inertNodes = [];
  viewer.classList.remove('active'); document.body.style.overflow = previousOverflow;
  returnFocus?.focus({preventScroll:true}); viewer.setAttribute('aria-hidden', 'true');
}
function prevImage(e) { e?.stopPropagation(); currentIndex = (currentIndex - 1 + artworks.length) % artworks.length; updateLightbox(); }
function nextImage(e) { e?.stopPropagation(); currentIndex = (currentIndex + 1) % artworks.length; updateLightbox(); }
viewer.addEventListener('click', e => { if (e.target === viewer) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!viewer.classList.contains('active')) return;
  if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevImage(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); nextImage(); }
  if (e.key === 'Tab') {
    const buttons = [...viewer.querySelectorAll('button')];
    const first = buttons[0], last = buttons.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
let touchX;
viewer.addEventListener('touchstart', e => { touchX = e.touches.length === 1 ? e.touches[0].clientX : undefined; }, {passive:true});
viewer.addEventListener('touchend', e => {
  if (touchX === undefined) return;
  const delta = e.changedTouches[0].clientX - touchX; touchX = undefined;
  if (Math.abs(delta) > 60) delta < 0 ? nextImage() : prevImage();
}, {passive:true});
