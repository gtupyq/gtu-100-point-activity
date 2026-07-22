/* ============================================================================
   GTU 100 Point Activity — script.js
   ----------------------------------------------------------------------------
   WHAT THIS FILE DOES:
   1. Fetches quizzes.json
   2. Works out, for every activity, whether it is LIVE / ENDING SOON / EXPIRED
      based on the "deadline" field vs. the current date/time.
   3. Sorts activities so live ones show first, expired ones show last.
   4. Picks the Featured card — uses an explicit "featured": true entry if you
      set one, otherwise automatically picks the most urgent live activity.
   5. Builds one card per activity inside #activity-grid.
   6. Starts a live countdown timer that updates every second.
   7. Adds Live / Ending Soon / Expired / All filter chips.
   8. Wires up the mobile hamburger menu + scroll shadow on the app bar.
   9. Adds a small Material "ripple" effect to buttons.
   10. Shows a "Last updated" date, based on quizzes.json's Last-Modified
       HTTP header (works automatically on GitHub Pages).

   YOU DO NOT NEED TO EDIT THIS FILE for weekly updates.
   Only quizzes.json changes week to week.

   DATA FIELDS SUPPORTED per activity in quizzes.json:
     title           (required)
     description     (required)
     image           (required)
     affiliateLink    (required — also accepts "link" for backward compatibility)
     deadline        (required, format "YYYY-MM-DDTHH:MM:SS")
     featured        (optional, true/false — force this card to be Featured)
   ============================================================================ */

const ENDING_SOON_HOURS = 48; // hours before deadline that counts as "Ending Soon"

/* ----------------------------------------------------------------------------
   BREVO EMAIL SUBSCRIPTION — SETUP REQUIRED
   ----------------------------------------------------------------------------
   Replace this with your real Brevo embedded-form action URL:
     1. Log in to Brevo → Contacts → Forms → Create a new form → "Embedded form"
     2. Choose the list you want new subscribers added to
     3. Brevo shows you an HTML snippet — copy the <form action="..."> URL
        (looks like https://xxxxxx.sibforms.com/serve/MUIxxxxxxxxxxxxxxxxxxxxxxxx)
     4. Paste it below, replacing the placeholder.

   This is Brevo's own hosted endpoint — no API key is used or exposed here,
   which is what makes this safe to run from a static GitHub Pages site with
   no backend server.

   To trigger a welcome email automatically: in Brevo, go to Automation →
   create a workflow with trigger "Contact added to list" → choose your list
   → add a "Send email" step. Brevo's email templates include an unsubscribe
   link by default in the footer — keep that footer when you design the email.
   ---------------------------------------------------------------------------- */
const BREVO_FORM_ACTION_URL = 'https://REPLACE-ME.sibforms.com/serve/REPLACE-ME';

// Keeps the full processed activity list in memory so filter chips can
// re-render instantly without re-fetching quizzes.json.
let state = { activities: [], currentFilter: 'all' };

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupScrollShadow();
  setupSubscribeForm();
  setFooterYear();
  loadActivities();
  loadCourses();
});

/* ----------------------------------------------------------------------------
   Footer copyright year — always current, never needs manual updating
   ---------------------------------------------------------------------------- */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ----------------------------------------------------------------------------
   Brevo subscribe form — validates the email, submits to Brevo's hosted
   form endpoint, and shows a success/error message without leaving the page.

   IMPORTANT LIMITATION (documented honestly, not hidden):
   Because this is a cross-origin request to Brevo's server with no backend
   in between, the browser cannot read Brevo's actual response (this is a
   standard "no-cors" request). We validate the email format ourselves
   before sending, and show a success message once the request is sent
   without a network error. This is the standard, expected behavior for a
   no-backend/static-site integration with Brevo's embedded form endpoint.
   ---------------------------------------------------------------------------- */
function setupSubscribeForm() {
  const form = document.getElementById('brevo-subscribe-form');
  if (!form) return; // this page has no subscribe form

  const emailInput = document.getElementById('subscribe-email');
  const msgEl = document.getElementById('subscribe-message');
  const btn = document.getElementById('subscribe-btn');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (!isValidEmail(email)) {
      showSubscribeMessage(msgEl, 'Please enter a valid email address.', 'error');
      return;
    }

    if (BREVO_FORM_ACTION_URL.includes('REPLACE-ME')) {
      showSubscribeMessage(msgEl, 'Subscription form is not set up yet — add your Brevo form URL in script.js.', 'error');
      return;
    }

    btn.disabled = true;
    const originalLabel = btn.textContent;
    btn.textContent = 'Subscribing\u2026';

    try {
      const formData = new FormData();
      formData.append('EMAIL', email);
      formData.append('locale', 'en');

      await fetch(BREVO_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors', // required for a static site posting to Brevo's endpoint directly
        body: formData,
      });

      showSubscribeMessage(msgEl, "You're subscribed! Check your inbox for a welcome email.", 'success');
      form.reset();
    } catch (err) {
      showSubscribeMessage(msgEl, 'Something went wrong. Please check your connection and try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSubscribeMessage(el, text, type) {
  el.textContent = text;
  el.className = `subscribe-message ${type}`;
}

/* ----------------------------------------------------------------------------
   Courses page — loads courses.json (courses never expire, so there's no
   countdown/status logic here, unlike activities).
   DATA FIELDS per course in courses.json: title, description, image, enrollLink
   ---------------------------------------------------------------------------- */
async function loadCourses() {
  const grid = document.getElementById('course-grid');
  if (!grid) return; // this page has no course grid

  let courses = [];
  try {
    const response = await fetch('courses.json', { cache: 'no-store' });
    courses = await response.json();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Could not load courses right now. If you're testing this locally, run a local server (e.g. VS Code's "Live Server" extension) instead of opening the page directly.</div>`;
    return;
  }

  if (courses.length === 0) {
    grid.innerHTML = '<div class="empty-state">No courses listed right now. Check back soon.</div>';
    return;
  }

  grid.innerHTML = courses.map((c, index) => `
    <article class="activity-card" style="animation-delay:${Math.min(index * 60, 360)}ms">
      <div class="card-img-wrap" data-clickable="true">
        <img src="${escapeAttr(c.image)}" alt="${escapeAttr(c.title)}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${escapeHtml(c.title)}</h3>
        <p class="desc">${escapeHtml(c.description)}</p>
        <button class="btn-participate">Enroll Now</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.activity-card').forEach((card, i) => {
    const c = courses[i];
    const imgWrap = card.querySelector('.card-img-wrap');
    const btn = card.querySelector('.btn-participate');
    if (imgWrap) imgWrap.addEventListener('click', () => openLink(c.enrollLink));
    if (btn) btn.addEventListener('click', (e) => { spawnRipple(e, btn); openLink(c.enrollLink); });
  });
}

/* ----------------------------------------------------------------------------
   Mobile menu (hamburger toggle)
   ---------------------------------------------------------------------------- */
function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
}

/* ----------------------------------------------------------------------------
   App bar gets a slightly stronger shadow once the page is scrolled —
   a small Material touch that adds depth without being distracting.
   ---------------------------------------------------------------------------- */
function setupScrollShadow() {
  const appBar = document.querySelector('.app-bar');
  if (!appBar) return;
  window.addEventListener('scroll', () => {
    appBar.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ----------------------------------------------------------------------------
   Main loader — fetches quizzes.json and kicks everything off
   ---------------------------------------------------------------------------- */
async function loadActivities() {
  const grid = document.getElementById('activity-grid');
  const featuredWrap = document.getElementById('featured-wrap');
  if (!grid) return; // this page has no activity grid (privacy/contact page)

  showSkeletons(grid);

  let rawData = [];
  let lastModifiedHeader = null;

  try {
    const response = await fetch('quizzes.json', { cache: 'no-store' });
    lastModifiedHeader = response.headers.get('Last-Modified');
    rawData = await response.json();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">Could not load activities right now. If you're testing this locally, run a local server (e.g. VS Code's "Live Server" extension) instead of opening index.html directly.</div>`;
    return;
  }

  const activities = rawData.map(computeActivityStatus);

  // Sort: live/ending-soon first (soonest deadline first), expired last
  activities.sort((a, b) => {
    if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
    return a.msRemaining - b.msRemaining;
  });

  state.activities = activities;

  renderLastUpdated(lastModifiedHeader);
  renderFeatured(activities, featuredWrap);
  setupFilterChips();
  renderGrid(getFilteredActivities(), grid);
  startCountdownLoop();
}

/* ----------------------------------------------------------------------------
   Works out status for a single activity based on "deadline"
   ---------------------------------------------------------------------------- */
function computeActivityStatus(activity) {
  const deadlineDate = new Date(activity.deadline);
  const now = new Date();
  const msRemaining = deadlineDate.getTime() - now.getTime();
  const isExpired = msRemaining <= 0;
  const isEndingSoon = !isExpired && msRemaining <= ENDING_SOON_HOURS * 60 * 60 * 1000;

  // Accept either "affiliateLink" (preferred) or "link" (legacy) as the field name
  const resolvedLink = activity.affiliateLink || activity.link || '';

  return { ...activity, link: resolvedLink, deadlineDate, msRemaining, isExpired, isEndingSoon };
}

/* ----------------------------------------------------------------------------
   Skeleton loading placeholders (shown briefly while quizzes.json loads)
   ---------------------------------------------------------------------------- */
function showSkeletons(grid) {
  grid.innerHTML = Array.from({ length: 3 }).map(() => `
    <div class="activity-card skeleton-card" aria-hidden="true">
      <div class="skeleton skeleton-img"></div>
      <div class="card-body">
        <div class="skeleton skeleton-line" style="width:80%"></div>
        <div class="skeleton skeleton-line" style="width:60%"></div>
        <div class="skeleton skeleton-line" style="width:40%; margin-top:auto;"></div>
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------------------
   Renders the "Last updated" badge in the hero section
   ---------------------------------------------------------------------------- */
function renderLastUpdated(lastModifiedHeader) {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const date = lastModifiedHeader ? new Date(lastModifiedHeader) : new Date();
  const formatted = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  el.textContent = `Last updated: ${formatted}`;
}

/* ----------------------------------------------------------------------------
   Renders the single Featured activity.
   Priority: an entry with "featured": true (and not expired) wins.
   Otherwise, falls back to the most urgent live activity.
   ---------------------------------------------------------------------------- */
function renderFeatured(activities, container) {
  if (!container) return;

  const explicitFeatured = activities.find(a => a.featured === true && !a.isExpired);
  const featured = explicitFeatured || activities.find(a => !a.isExpired);

  if (!featured) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <div class="featured-card">
      <span class="ribbon">Featured</span>
      <div class="img-wrap">
        <img src="${escapeAttr(featured.image)}" alt="${escapeAttr(featured.title)}" class="featured-img-link" loading="lazy">
      </div>
      <div class="content">
        <h3>${escapeHtml(featured.title)}</h3>
        <p class="desc">${escapeHtml(featured.description)}</p>
        <div class="card-meta">
          <span class="countdown" data-deadline="${featured.deadlineDate.toISOString()}"></span>
        </div>
        <button class="btn-participate featured-btn">Participate Now</button>
      </div>
    </div>
  `;

  const img = container.querySelector('.featured-img-link');
  const btn = container.querySelector('.featured-btn');
  if (img) img.addEventListener('click', () => openLink(featured.link));
  if (btn) btn.addEventListener('click', (e) => { spawnRipple(e, btn); openLink(featured.link); });
}

/* ----------------------------------------------------------------------------
   Filter chips: All / Live / Ending Soon / Expired
   ---------------------------------------------------------------------------- */
function setupFilterChips() {
  const chipBar = document.getElementById('filter-chips');
  if (!chipBar) return;

  chipBar.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chipBar.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentFilter = chip.getAttribute('data-filter');
      const grid = document.getElementById('activity-grid');
      renderGrid(getFilteredActivities(), grid);
    });
  });
}

function getFilteredActivities() {
  if (state.currentFilter === 'all') return state.activities;
  if (state.currentFilter === 'live') return state.activities.filter(a => !a.isExpired && !a.isEndingSoon);
  if (state.currentFilter === 'soon') return state.activities.filter(a => a.isEndingSoon);
  if (state.currentFilter === 'expired') return state.activities.filter(a => a.isExpired);
  return state.activities;
}

/* ----------------------------------------------------------------------------
   Renders every activity card into the grid, with a staggered entrance
   animation (skipped automatically if the user prefers reduced motion).
   ---------------------------------------------------------------------------- */
function renderGrid(activities, grid) {
  if (activities.length === 0) {
    grid.innerHTML = '<div class="empty-state">No activities match this filter.</div>';
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  grid.innerHTML = activities.map((a, index) => {
    const statusClass = a.isExpired ? 'expired' : (a.isEndingSoon ? 'soon' : 'live');
    const statusLabel = a.isExpired ? 'Expired' : (a.isEndingSoon ? 'Ending Soon' : 'Live');
    const cardClass = a.isExpired ? 'activity-card is-expired' : 'activity-card';
    const imgClass = a.isExpired ? 'disabled-img' : '';
    const delay = reduceMotion ? 0 : Math.min(index * 60, 360);

    return `
      <article class="${cardClass}" style="animation-delay:${delay}ms" data-index="${index}">
        <div class="card-img-wrap" ${a.isExpired ? '' : 'data-clickable="true"'}>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          <img class="${imgClass}" src="${escapeAttr(a.image)}" alt="${escapeAttr(a.title)}" loading="lazy">
        </div>
        <div class="card-body">
          <h3>${escapeHtml(a.title)}</h3>
          <p class="desc">${escapeHtml(a.description)}</p>
          <div class="card-meta">
            <span>Deadline: ${formatDate(a.deadlineDate)}</span>
          </div>
          <span class="countdown ${a.isExpired ? 'expired-text' : ''}" data-deadline="${a.deadlineDate.toISOString()}">
            ${a.isExpired ? 'Expired' : ''}
          </span>
          <button class="btn-participate ${a.isExpired ? 'disabled' : ''}" ${a.isExpired ? 'disabled' : ''}>
            ${a.isExpired ? 'Expired' : 'Participate Now'}
          </button>
        </div>
      </article>
    `;
  }).join('');

  // Wire up clicks — image and button both open the affiliate link
  grid.querySelectorAll('.activity-card').forEach((card, i) => {
    const a = activities[i];
    const imgWrap = card.querySelector('.card-img-wrap[data-clickable]');
    const btn = card.querySelector('.btn-participate:not(.disabled)');
    if (imgWrap) imgWrap.addEventListener('click', () => openLink(a.link));
    if (btn) btn.addEventListener('click', (e) => { spawnRipple(e, btn); openLink(a.link); });
  });
}

/* ----------------------------------------------------------------------------
   Live countdown — updates every card's countdown text once per second
   ---------------------------------------------------------------------------- */
function startCountdownLoop() {
  updateAllCountdowns();
  if (window.__countdownInterval) clearInterval(window.__countdownInterval);
  window.__countdownInterval = setInterval(updateAllCountdowns, 1000);
}

function updateAllCountdowns() {
  const now = Date.now();
  document.querySelectorAll('.countdown[data-deadline]').forEach(el => {
    const deadline = new Date(el.getAttribute('data-deadline')).getTime();
    const msRemaining = deadline - now;
    if (msRemaining <= 0) {
      el.textContent = 'Expired';
      el.classList.add('expired-text');
      return;
    }
    el.textContent = formatCountdown(msRemaining);
  });
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m left`;
  if (hours > 0) return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s left`;
  return `${pad(minutes)}m ${pad(seconds)}s left`;
}

function pad(n) { return String(n).padStart(2, '0'); }

/* ----------------------------------------------------------------------------
   Material "ripple" click effect for buttons
   ---------------------------------------------------------------------------- */
function spawnRipple(event, button) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height) * 1.4;
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

/* ----------------------------------------------------------------------------
   Small helpers
   ---------------------------------------------------------------------------- */
function formatDate(date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function openLink(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;');
}
