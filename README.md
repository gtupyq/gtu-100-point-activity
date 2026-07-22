# GTU 100 Point Activity

A free, always-updated listing of certificates, quizzes, hackathons, internships and webinars for GTU engineering students. Pure HTML/CSS/JS/JSON — built to run on GitHub Pages with no backend.

## Files
```
GTU-100-Point-Activity/
├── index.html      → homepage
├── privacy.html     → privacy policy page
├── contact.html      → contact page (mailto form, no backend)
├── style.css       → all styling (Material Design inspired)
├── script.js       → all logic (loads quizzes.json, countdowns, sorting, mobile menu)
├── quizzes.json     → THE ONLY FILE YOU EDIT WEEKLY
└── images/
    ├── logo.png     → placeholder logo — replace with your own anytime
    └── favicon.ico    → placeholder favicon — replace with your own anytime
```

## Theme

The site is built in the **Electric Cyan dark theme**. All colors live in one place — the `:root` block at the top of `style.css` — so the whole look can be changed later by editing values there, nothing else.

## One-line setup: your YouTube link

The YouTube button appears in 3 places — the top nav, a floating button (bottom-right on every page), and the footer. All three currently point to a placeholder:
```
https://youtube.com/@your-channel
```
Replace this with your real channel URL in `index.html`, `privacy.html`, and `contact.html` (search for `your-channel` in each file — 2 spots per page).

## Design choices worth knowing about

- **Pulsing "Ending Soon" badge** — a subtle animation on activities closing within 48 hours. This uses a real deadline, not a fake one, so it's an honest urgency cue rather than a dark pattern.
- **Bookmark nudge in the hero** — a one-line, one-time suggestion to bookmark the page. This is the actual highest-leverage way to get repeat visits (a real bookmark beats any in-site trick), and it never nags or repeats itself.
- Deliberately **not included**: fake visitor counts, fake "X people just joined," push notifications, or countdown timers on things that aren't real deadlines. These erode trust with students fast and weren't worth the tradeoff.

## Step 1 — Preview it in VS Code (before going live)

1. Open the `GTU-100-Point-Activity` folder in VS Code (File → Open Folder).
2. Install the **Live Server** extension (Extensions icon in the sidebar → search "Live Server" by Ritwick Dey → Install).
3. Right-click `index.html` in the file list → **Open with Live Server**.
4. Your browser opens automatically at `http://127.0.0.1:5500`. Any time you save a file, it refreshes automatically.

> Don't just double-click `index.html` — browsers block JSON loading (`fetch`) for files opened directly from disk. Live Server (or any local server) fixes this.

## Checking the mobile view

**While testing in VS Code (before going live):**
1. Start Live Server as above so the site opens in your browser.
2. Open Chrome/Edge DevTools: press `F12` (or `Ctrl+Shift+I` / `Cmd+Option+I` on Mac).
3. Click the small **device toolbar icon** (looks like a phone+tablet, top-left of DevTools) — or press `Ctrl+Shift+M` (`Cmd+Shift+M` on Mac).
4. Pick a device from the dropdown at the top (e.g. "iPhone 14", "Galaxy S20") to preview exactly how it looks on that screen size.

**On your actual phone (still before going live):**
1. Make sure your phone and laptop are on the same Wi-Fi.
2. In VS Code's Live Server, note the local network address it gives (something like `http://192.168.1.5:5500` — check the bottom status bar or Live Server settings for "useLocalIp": true).
3. Open that address in your phone's browser.

**Once it's live on GitHub Pages:** just open your `https://yourusername.github.io/...` link directly on your phone — simplest option, no setup needed.

## Step 2 — Put it online for free (GitHub Pages)

1. Create a free account at github.com if you don't have one.
2. Create a new repository, e.g. `gtu-100-point-activity`.
3. Upload the entire contents of this folder (drag-and-drop on github.com works — no command line needed).
4. Go to **Settings → Pages** in the repo, set source to the `main` branch / root folder, and save.
5. Your site goes live at `https://yourusername.github.io/gtu-100-point-activity/` within a couple of minutes.

## Step 3 — Your weekly 20-minute update

You only ever touch `quizzes.json`. Each activity is one block:

```json
{
  "title": "Activity name here",
  "description": "One or two SEO-friendly lines about it.",
  "image": "https://link-to-image.jpg",
  "link": "https://your-affiliate-link.com",
  "deadline": "2026-09-10T23:59:00"
}
```

**Simplest way (recommended for you):** every week, just message me the title, description, image URL, affiliate link, and deadline for each new activity, and I'll write back the exact `quizzes.json` block — polished into SEO-friendly wording — ready for you to paste in. I won't change `index.html`, `style.css`, or `script.js` unless you specifically ask for a new feature.

**To paste it in yourself on GitHub:** open `quizzes.json` in your repo → pencil (edit) icon → paste the new block in (comma-separated between entries) → commit. Works fine from your phone browser.

Everything else is automatic:
- Status badge (**Live** / **Ending Soon** / **Expired**) is calculated from the deadline — nothing to set manually.
- The live countdown timer starts and stops itself.
- Expired activities move to the bottom and their button disables itself.
- The "Featured" card always shows the most urgent live activity.
- The "Last updated" date on the homepage updates itself whenever `quizzes.json` changes.

## A few things worth improving when you have time

- **Replace the placeholder logo/favicon** in `images/` — I generated simple stand-ins so the site works out of the box; swap them for a real logo whenever convenient.
- **Real image links**: the sample data uses stock photos from Unsplash — replace with each opportunity's actual banner/poster image where you have one; it looks more trustworthy and loads faster if hosted on a fast image host.
- **Contact email**: `contact.html` currently points to `your-email@example.com` — replace with your real email address (one-line edit).
- **Google Search Console**: once live, submit your GitHub Pages URL to Google Search Console — this is what actually gets the site indexed and ranking, separate from the on-page SEO tags already built in.
- **Sitemap.xml + robots.txt**: small, optional files that help Google crawl the site faster. Easy to add later — just ask and I'll generate them.
- **Category filter**: right now all opportunity types (quizzes, hackathons, internships, webinars) show in one grid. If the list grows large, a simple filter (All / Quizzes / Hackathons / Internships) would help — happy to add this as a feature update whenever you want it, without disturbing your weekly workflow.

## Email subscriptions (Brevo) — 2-minute setup

There's now a dedicated **`subscribe.html`** page that captures emails via Brevo, with no backend needed (safe for GitHub Pages, no secret API key anywhere in the code). The homepage only shows a short teaser card with a "Subscribe Now" button that links to this page — the actual form lives in one place, not duplicated across the site.

1. Create a free account at brevo.com if you don't have one.
2. Go to **Contacts → Lists** → create a list, e.g. "GTU Site Subscribers."
3. Go to **Contacts → Forms → Create a form → Embedded form**, select that list.
4. Brevo gives you an HTML snippet — find the `<form action="...">` URL. It looks like:
   `https://xxxxxx.sibforms.com/serve/MUIxxxxxxxxxxxxxxxxxxxxxxxx`
5. Open `script.js`, find this line near the top:
   ```js
   const BREVO_FORM_ACTION_URL = 'https://REPLACE-ME.sibforms.com/serve/REPLACE-ME';
   ```
   and replace it with your real URL.

**Welcome email:** In Brevo, go to **Automation → Create a workflow** → trigger "Contact added to a list" → pick your list → add a "Send email" step with your welcome message.

**Unsubscribe link:** Brevo automatically includes an unsubscribe link in the footer of every campaign/automation email built with its template editor — just don't delete that footer block when designing your emails.

That's it — nothing else on the site changes. Quiz cards, countdowns, affiliate links, SEO tags, and navigation are untouched.

## Design update — new look

- **Logo & favicon**: replaced with a hexagon + graduation-cap "100" badge (`images/logo.svg` for the header, `images/favicon.ico` for the browser tab). The header now shows a two-line wordmark ("GTU 100" / "POINT ACTIVITY").
- **Palette**: `#00D4FF` cyan accent on `#0F172A` / `#1E293B` dark surfaces.
- **Font**: Poppins throughout (was Roboto).
- **Nav**: active page now shows an underline; the YouTube link is a filled cyan pill button instead of a plain text link.
- **YouTube floating button**: redesigned as a rounded-square icon button (matches the app-icon style) instead of a plain circle.
- Want a fully custom logo instead of the generated placeholder? Happy to iterate further, or you can drop in your own `logo.svg`/`favicon.ico` any time — nothing else in the code depends on their exact design.

## Latest update — nav redesign, teal theme, cleanup

**Header nav** now matches your reference layout: Home / Activities / Certificates / Updates / Contact, plus a filled "Subscribe" pill button on the right (replacing the earlier "Login/Register"-style slot, since the site doesn't have accounts — it links straight to the email subscribe section instead).

Since this is a one-page site, some nav items are anchor links to sections already on the homepage rather than separate pages:
- **Activities** → the "All Activities" grid
- **Certificates** → the "About" section explaining how these count for GTU points
- **Updates** → the email subscribe section
- **Contact** → the real Contact page

If you'd rather these be genuinely separate pages later (e.g. a real "Certificates" page), that's a bigger addition — just ask and I'll scope it out.

**Removed:** the YouTube button from the header nav (kept the floating button + footer link, only the header one looked off), the hero subtitle paragraph, the "bookmark this page" hint line, and the subscribe disclaimer line under the email form.

**Theme:** switched from Electric Cyan to the teal **Dark Campus** palette (`#1DBE96` accent on `#10151F`/`#1A2130`) — logo and favicon regenerated to match.

**About the favicon not showing in your browser tab:** this is almost always a caching issue, not a code issue — try a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) or open the page in a new incognito/private tab.

## New: Courses page

A new **`courses.html`** page + **`courses.json`** data file, separate from activities — courses don't expire, so there's no deadline, countdown, or status badge, just image / title / description / Enroll Now button.

To add a new course, add a block to `courses.json` (same paste-it-in workflow as `quizzes.json`):
```json
{
  "title": "Course name here",
  "description": "One or two lines about the course.",
  "image": "https://link-to-image.jpg",
  "enrollLink": "https://your-course-link.com"
}
```
The header's "Course" nav link goes straight to this page (not an anchor scroll, since it's a full separate page as you asked).

## Alternatives to Brevo (if you ever want to switch)

Since you asked — here's how the free tiers compare right now (checked mid-2026):

| Provider | Free contacts | Free sends | Notes |
|---|---|---|---|
| **Brevo** (current) | Unlimited stored | 300/day (~9,000/mo) | Best if your list grows large but you send in smaller batches; adds "Sent with Brevo" branding on free plan |
| **MailerLite** | 500 | 12,000/mo | Good if your list stays under 500; forces their logo on emails, no custom domain on free plan |
| **Sender** | 2,500 | 15,000/mo | Generous free limits, less commonly used but solid |
| **Mailchimp** | 250–500 | 500/mo | Automation was removed from the free plan in 2025 — not a great fit anymore for this use case |

For your situation (a growing student list, sending updates every couple of weeks rather than daily), Brevo's unlimited contact storage is likely still the best fit — the 300/day cap only matters if you want to blast your entire list in a single day. If your list stays modest for a while, MailerLite is a reasonable alternative with no daily cap. Switching later just means repeating the same "Embedded form" setup on the new provider and swapping the URL in `script.js` — the rest of the site doesn't change.

## Editing guide — how to change one thing without touching the rest

The code is organized so you (or I, next time) can make small changes in one place only. Quick reference:

| I want to... | Edit this | Where |
|---|---|---|
| Add/update an activity, quiz, hackathon | `quizzes.json` | Add or edit one JSON block |
| Add/update a course | `courses.json` | Add or edit one JSON block |
| Change colors / theme | `style.css` | The `:root { ... }` block at the very top — every color on the site is a variable there |
| Change fonts | `index.html` (and other pages) + `style.css` | The Google Fonts `<link>` in `<head>`, plus `font-family` in `body` in `style.css` |
| Remove/add a nav link | Each `.html` file | The `<nav class="nav-links">` block near the top — same block is repeated on every page |
| Remove/change the YouTube floating button | Each `.html` file | The `<a class="yt-fab">` block near the bottom of the file |
| Change footer text or links | Each `.html` file | The `<footer>` block near the bottom |
| Change the hero headline/text | `index.html` | The `<section class="hero">` block |
| Change "Ending Soon" timing (currently 48 hrs) | `script.js` | The `ENDING_SOON_HOURS` constant near the top |
| Change the Brevo form endpoint | `script.js` | The `BREVO_FORM_ACTION_URL` constant near the top |

Each of these is a self-contained block — deleting or editing one doesn't require touching the JS logic or any other section.
