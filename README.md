# GRC Academy

**Executive-friendly training for IT, cybersecurity, privacy, and AI governance frameworks.**

GRC Academy turns dense compliance standards into short, plain-English daily lessons aimed at directors and senior leadership — people who need the strategic picture, not the technical weeds. Learners sign in, work through any of 24 frameworks at their own pace, take a knowledge check after each lesson, and their progress is saved automatically.

![Status](https://img.shields.io/badge/status-active-0f6e56) ![Stack](https://img.shields.io/badge/stack-static%20HTML%2FCSS%2FJS-1f3a4d) ![Hosting](https://img.shields.io/badge/hosting-Azure%20%7C%20AWS%20%7C%20any%20static-7a3e9d)

---

## Why it exists

Boards and executives are increasingly accountable for cyber and AI risk, yet most framework material is written for auditors and engineers. GRC Academy was built to brief leaders the way you'd brief a board: clear language, business context, and a real-world analogy for every concept.

## Features

- **24 frameworks** across six domains — ISO/IEC, NIST, US Government & Defense, Privacy & Industry Regulations, AI Governance, and Governance & Controls.
- **Daily micro-lessons** with analogies, highlight boxes, and an end-of-lesson knowledge check.
- **Sign-in with saved progress** — per-framework completion is remembered across sessions and devices.
- **Executive dashboard** — progress bars, completion stats, and a clean catalog grouped by domain.
- **Fully responsive** — optimized for both desktop and mobile browsers.
- **Zero-backend by default** — ships as a static site; optional Supabase cloud accounts for real cross-device sync.

## Tech stack

Plain HTML, CSS, and vanilla JavaScript in a single self-contained `index.html`. No build step, no framework, no dependencies. This keeps hosting costs near zero and lets the app deploy to virtually any static host.

```
grc-academy/
├─ index.html                    # the entire app (UI, auth, content, logic)
├─ js/
│  └─ frameworks.generated.js    # full curricula (created by the build script)
├─ scripts/
│  └─ build-frameworks.js        # ingests your source HTML curricula
├─ DEPLOYMENT.md                 # step-by-step hosting guides
├─ README.md
├─ LICENSE
└─ .gitignore
```

## Run it locally

Just open `index.html` in any modern browser — no server required. Sign in with any email and a password (6+ characters); the demo stores accounts privately in your browser.

## Loading the full curricula

`index.html` ships with **all 24 frameworks built in** — each as a self-contained, executive-level module with multiple lessons and knowledge-check quizzes. No build step is required; the app is complete on its own.

**Optional — load the full 30-day curricula.** The built-in modules are concise (roughly 6–12 lessons each). To replace them with the *complete* 30-day curricula extracted directly from your own source HTML files, run the build script once:

```bash
node scripts/build-frameworks.js "G:/My Drive/CyberSecurity Studies/GRC/Frameworks"
```

This scans your `*_curriculum.html` files, extracts each full lesson set, and writes `js/frameworks.generated.js`. When that file is present the app automatically prefers it; when it is absent the app uses the built-in modules. Re-run it any time you add or update a framework.

## Authentication & data

| Mode | How it works | Best for |
|------|--------------|----------|
| **Local (default)** | Accounts and progress are stored in the browser (`localStorage`), passwords hashed with SHA-256. No backend. | Demos, single-device use, fastest setup. |
| **Cloud (optional)** | Set your Supabase URL + anon key in the `GRC_CONFIG` block in `index.html` to enable real accounts and cross-device sync. | Production use across devices. |

See `DEPLOYMENT.md` for the Supabase setup walkthrough.

## Content & licensing

Lesson content is for educational use. Framework names (ISO, NIST, HIPAA, etc.) are the property of their respective owners; this project is an independent study aid and is not affiliated with or endorsed by any standards body. Application code is released under the MIT License.

---

*Built as a portfolio project demonstrating GRC domain expertise and front-end engineering.*
