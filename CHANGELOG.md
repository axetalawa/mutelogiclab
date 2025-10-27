# CHANGELOG.md — Commit Story of the Meta Repository

> *The project unfolded as a layered shell — each phase a ring of form around a core of thought.*

---

## Phase I — Manifest & Ground (July 2025)

**Objective:** establish a static scaffold to house the browser prototypes — a living index.

**Key work**
- Created `index.html` as the **meta portal** connecting all simulations.  
- Defined visual identity (Bahia palette: dende gold · deep ocean · clay tone · dark accent).  
- Integrated [Tailwind CSS](https://tailwindcss.com) for responsive layout and typography.  
- Added multilingual framework (`translations.js`).

**Artifacts**
- `/index.html` — navigation and framing logic  
- `/translations.js` — bilingual strings and UI mapping  
- `/videos/` — opening sequence (`crabs.mp4`)

**Decisions**
- No build system; each page is a **standalone ritual** served statically.  
- English and Portuguese coexist at the file level, not through runtime translation engines.

---

## Phase II — Prototype Integration (August 2025)

**Objective:** embed existing instruments — *Constellation*, *Atlas*, *Ledger*, and *Onion* — into the meta-frame.

**Key work**
- Linked all prototype iframes from `index.html`.  
- Unified typography, palette, and gradient logic across simulations.  
- Established consistent filenames and load order.  
- Standardized quickstart instructions and static-serve method.

**Artifacts**
- `/constellation.html` — conversation as starfield (Three.js)  
- `/atlas.html` — latent topology visualizer  
- `/ledger.html` — dialogue balance chart  
- `/onion.html` — recursive 3-D field model

**Decisions**
- Browser-native rendering only; **no external servers**.  
- All simulations reference `Three.js` via CDN for portability.  
- Each prototype self-initializes to prevent shared-state interference.

---

## Phase III — Local Deployment & Serve (September 2025)

**Objective:** make the system trivially runnable on any machine.

**Key work**
- Added **Quickstart section** and server script instructions (`npx serve -p 5050`).  
- Verified compatibility on Node ≥ 18 LTS.  
- Defined URL map for all simulations.

**Artifacts**
- Documentation block now included in `README.md`.  
- Added `.gitignore` for local cache, node_modules, and logs.  
- Optional `serve.json` for custom port configuration.

**Decisions**
- Keep repo self-contained: *clone → serve → explore*.  
- Focus on first-launch immediacy — no setup friction.

---

## Phase IV — Aesthetic & Interaction Refinement (October 2025)

**Objective:** tune the interfaces for coherence and cinematic unity.

**Key work**
- Introduced glow and bloom effects to 3-D environments (`onion.html`, `constellation.html`).  
- Added tooltips, HUD overlays, and minimal UI icons.  
- Synced typography across prototypes (`Inter`, `Space Grotesk`).  
- Implemented color-coded phase indicators in `atlas.html` and `ledger.html`.  
- Optimized for **Vercel / Cloudflare Pages** static hosting.

**Decisions**
- Performance > pixel-density; prefer light geometry over heavy shaders.  
- Use bloom and palette to evoke “cosmic cognition,” not spectacle.  
- Silence as interaction — simulations load without audio auto-play.

---

## Phase V — Documentation & Release (October 2025)

**Objective:** prepare repository for public viewing and professional review.

**Key work**
- Authored `README.md` (overview, quickstart, contents, philosophy).  
- Authored this `CHANGELOG.md` (commit story and reasoning).  
- Ensured semantic versioning and license metadata.  
- Validated CDN dependencies and link integrity.

**Artifacts**
- `/README.md` — technical + philosophical index  
- `/CHANGELOG.md` — this narrative  
- `/LICENSE` — MIT license  
- `/docs/` — optional folder for screenshots and diagrams

**Decisions**
- Treat documentation as narrative: every line doubles as invitation and map.  
- Use commit conventions going forward:

```bash
add: object — purpose
fix: object — correction
refactor: object — reasoning
docs: section — update

## Forward Trajectory

- [ ] Integrate live data stream from **Chroma / Local Embeddings** for interactive semantic search.  
- [ ] Add lightweight **Module Indexer** to auto-generate gallery manifests.  
- [ ] Explore **Audio-Reactive Layer** linking sound amplitude to geometric bloom.  
- [ ] Publish **v1.0 static release** on GitHub Pages and Vercel.

---

## ✴︎ Coda

> *Each page is a mind.*  
> *Each click, a small act of cosmogenesis.*

---

*Authored by **Javed Saunja Jaghai / Mute Logic Lab**, Salvador — Bahia (2025)*  
*License — MIT*
