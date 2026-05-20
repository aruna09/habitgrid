# HabitGrid

A GitHub/LeetCode-style habit tracker PWA. Build streaks, visualise consistency, and share your progress — all stored locally, no account needed.

<p align="center">
  <img src="screenshots/1-splash.png" width="200" alt="Splash screen" />
  <img src="screenshots/2-main-grid.png" width="200" alt="Main grid" />
  <img src="screenshots/4-consolidated.png" width="200" alt="Combined view" />
  <img src="screenshots/5-settings.png" width="200" alt="Settings" />
</p>

---

## Features

- **Contribution grids** — each habit gets its own month-block grid, styled after LeetCode's dark-mode palette
- **Per-habit check-in** — tap the checkbox next to a habit name to log today; the cell fills instantly
- **Stats per habit** — active days, current streak, and max streak shown inline on every card
- **Year selector** — switch between the rolling 12-month view and any past calendar year
- **Combined grid** — merge all habits into one intensity-shaded grid (darker = fewer habits done, brighter = all done)
- **Share as PNG** — exports a clean card image via the native share sheet; falls back to download on desktop
- **Custom accent colour** — pick from 8 presets or use the native colour picker; the grid, UI, and splash all update instantly
- **Splash screen** — black background with a flickering matrix of the current month's grid on every launch
- **Private notes** — attach a personal memo to each habit; stored locally, never shown publicly
- **Profile** — set your name to personalise the greeting
- **Installable PWA** — add to home screen on iOS/Android for a native-feeling experience

---

## Screenshots

| Splash | Main grid | Add habit | Combined |
|--------|-----------|-----------|----------|
| ![Splash](screenshots/1-splash.png) | ![Main](screenshots/2-main-grid.png) | ![Add](screenshots/3-add-habit.png) | ![Combined](screenshots/4-consolidated.png) |

| Settings (colour picker) | Profile |
|--------------------------|---------|
| ![Settings](screenshots/5-settings.png) | ![Profile](screenshots/6-profile.png) |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 4 |
| State / persistence | Zustand with `persist` middleware → localStorage |
| Styling | Tailwind CSS v3 + inline CSS variables for theming |
| PWA | Manual `manifest.json` + `sw.js` (cache-first) |
| Share image | Canvas API drawn programmatically — no extra deps |

---

## Local development

```bash
# Node 18+ required
git clone https://github.com/aruna09/habitgrid.git
cd habitgrid
npm install
npm run dev        # http://localhost:5173
```

### Build for production

```bash
npm run build      # output in dist/
npm run preview    # preview the built PWA locally
```

---

## Data & privacy

Everything lives in your browser's `localStorage` under the key `habitgrid-storage`. Nothing is sent to any server. Clearing site data resets the app.

---

## Roadmap

- [ ] Streak notifications / reminders
- [ ] iCloud / Google Drive backup
- [ ] Friend codes — share a read-only view of your grid
- [ ] Widget (iOS 16+ WidgetKit via PWA)
