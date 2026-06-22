# GRC Academy — Deployment Guide

This app is a **static site** (one `index.html` plus a couple of plain `.js` files, no build step). That means it runs on almost any host, and on the free tier of every major platform. This guide covers, in order:

1. [Step 0 — Put the code on GitHub](#step-0--put-the-code-on-github)
2. [Azure Static Web Apps](#1-azure-static-web-apps-recommended--0) ⭐ recommended, $0
3. [AWS](#2-aws-amplify-hosting-or-s3--cloudfront)
4. [Lovable](#3-lovable)
5. [Google — Firebase Hosting & AI Studio](#4-google--firebase-hosting-and-ai-studio)
6. [Netlify / Vercel / Cloudflare Pages](#5-netlify--vercel--cloudflare-pages-fastest-options)
7. [Enabling real cross-device accounts (Supabase)](#6-optional-enable-real-accounts-with-supabase)
8. [Cost summary](#cost-summary)

> **Before you deploy the full courses:** run `node scripts/build-frameworks.js "G:/My Drive/CyberSecurity Studies/GRC/Frameworks"` once so `js/frameworks.generated.js` contains all 24 complete curricula, then commit it. Without it, the site still works but shows the ISO 27001 full course plus overviews for the rest.

---

## Step 0 — Put the code on GitHub

Most hosts deploy straight from a GitHub repo, and it doubles as your portfolio piece.

**Easiest (Windows):** double-click or run the included helper:
```powershell
powershell -ExecutionPolicy Bypass -File .\push-to-github.ps1 -RepoName "grc-academy"
```
**macOS/Linux/Git Bash:**
```bash
./push-to-github.sh grc-academy public
```

**Manual alternative:**
```bash
git init
git add .
git commit -m "Initial commit: GRC Academy"
git branch -M main
# create an empty repo at https://github.com/new named grc-academy, then:
git remote add origin https://github.com/<your-username>/grc-academy.git
git push -u origin main
```

---

## 1. Azure Static Web Apps (recommended · $0)

Best fit for your Azure tenant. The **Free** plan includes global hosting, free SSL, and a generous quota — ideal for this app, with no ongoing cost. ([pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/static/))

**Portal steps:**
1. Push the code to GitHub (Step 0).
2. In the [Azure Portal](https://portal.azure.com), choose **Create a resource → Static Web App**.
3. **Plan type:** select **Free**.
4. **Deployment details:** sign in to GitHub and pick your `grc-academy` repo and `main` branch.
5. **Build details:**
   - **Build Presets:** `Custom`
   - **App location:** `/`
   - **Api location:** *(leave blank)*
   - **Output location:** *(leave blank — there is no build step)*
6. Click **Review + create → Create**. Azure adds a GitHub Actions workflow that builds and deploys automatically. Every `git push` to `main` redeploys.
7. Your site goes live at a `https://<name>.azurestaticapps.net` URL within ~2 minutes. Add a custom domain free under **Custom domains**.

**CLI alternative:**
```bash
npm install -g @azure/static-web-apps-cli
az login
az staticwebapp create -n grc-academy -g <resource-group> \
  -s https://github.com/<you>/grc-academy -b main --app-location "/" --login-with-github
```

> Official walkthrough: [Quickstart: Build your first static web app](https://learn.microsoft.com/en-us/azure/static-web-apps/get-started-portal).

---

## 2. AWS (Amplify Hosting, or S3 + CloudFront)

**Option A — AWS Amplify Hosting (easiest, connects to GitHub):**
1. Open the [Amplify Console](https://console.aws.amazon.com/amplify) → **Create new app → Host web app**.
2. Choose **GitHub**, authorize, and select your `grc-academy` repo / `main` branch.
3. When asked for build settings, since there's no build step use this `amplify.yml`:
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands: []
     artifacts:
       baseDirectory: /
       files:
         - '**/*'
   ```
4. **Save and deploy.** Amplify gives you an `https://main.<id>.amplifyapp.com` URL with free SSL and auto-redeploys on push. Free tier covers low-traffic personal sites.

**Option B — S3 + CloudFront (cheapest at scale, pennies/month):**
1. Create an S3 bucket, enable **Static website hosting**, and upload all files (keep the folder structure: `index.html`, `js/`, `scripts/`).
2. Create a **CloudFront** distribution in front of the bucket for HTTPS + CDN, with **Default root object** = `index.html`.
3. (Optional) Point Route 53 / your domain at the CloudFront distribution.

---

## 3. Lovable

Lovable treats a connected **GitHub repo as the source of truth**, so the cleanest path is to import this repo, then publish. ([import guide](https://medium.com/@XAndroid/how-to-import-your-existing-code-into-lovable-using-github-119d0d79d483))

1. Push to GitHub (Step 0).
2. In Lovable: **Settings → Connectors → GitHub** (or the GitHub icon) and connect your account.
3. Import/link the `grc-academy` repository. Lovable will sync the code two-way and let you keep refining with AI prompts.
4. Use Lovable's **Publish** (one-click) to host it, or export and deploy elsewhere. ([publishing guide](https://www.nocode.mba/articles/publish-app-bolt-lovable))

> Note: Lovable is optimized for React/Node projects. This app is framework-free static HTML, which Lovable serves fine — but if you want to *edit it inside Lovable with AI*, you may prefer to deploy the static files directly to Azure/Netlify and use Lovable only for prototyping new features.

---

## 4. Google — Firebase Hosting and AI Studio

**Firebase Hosting (the practical Google path · free Spark tier):**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # choose "current directory", public dir = "." , single-page app = No
firebase deploy
```
You get a free `https://<project>.web.app` URL with SSL and CDN.

**Google AI Studio:** AI Studio's *Build* feature is designed for prototyping Gemini-powered apps and deploying them to **Cloud Run**, rather than hosting a pre-built static site. If you want to use the Google ecosystem, **Firebase Hosting (above) is the right home for this app.** You can still open AI Studio and use it to *extend* GRC Academy — e.g., add an "Ask the framework" Q&A assistant powered by Gemini — then deploy the enhanced app via Cloud Run or Firebase.

---

## 5. Netlify / Vercel / Cloudflare Pages (fastest options)

All three deploy from GitHub in ~60 seconds, free, with SSL:

- **Netlify:** New site → import from GitHub → build command *empty*, publish directory `/`. Or drag-and-drop the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel:** New Project → import repo → Framework Preset **Other** → Deploy.
- **Cloudflare Pages:** Create project → connect repo → build command *empty*, output dir `/`.

---

## 6. (Optional) Enable real accounts with Supabase

By default, accounts and progress are stored privately in each browser (`localStorage`). To enable **real accounts with cross-device sync**, use Supabase's free tier:

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Open `index.html`, find the `GRC_CONFIG` block near the bottom, and paste them:
   ```js
   window.GRC_CONFIG = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseAnonKey: "eyJhbGciOi...",
     appName: "GRC Academy"
   };
   ```
4. In Supabase, enable **Email** auth (Authentication → Providers) and create a `progress` table keyed by user id to store completion. (A ready-to-run SQL snippet and the client wiring can be added on request — the app is structured so this drops in without touching the UI.)
5. Redeploy. The sign-in screen will now use cloud accounts.

> The anon key is safe to ship in client code **only** when you enable Supabase **Row Level Security** so each user can read/write only their own progress. Never commit your service-role key.

---

## Cost summary

| Platform | Free tier | Custom domain | Auto-deploy on push | Best for |
|----------|-----------|---------------|---------------------|----------|
| **Azure Static Web Apps** | Yes ($0) | Free | Yes (GitHub Actions) | Your Azure tenant ⭐ |
| AWS Amplify | Yes (low traffic) | Yes | Yes | AWS shops |
| AWS S3 + CloudFront | ~pennies/mo | Yes | Manual / CI | Cheapest at scale |
| Lovable | Yes | Yes | Yes | AI-assisted iteration |
| Firebase Hosting | Yes (Spark) | Yes | With CLI/Actions | Google ecosystem |
| Netlify / Vercel / Cloudflare | Yes | Yes | Yes | Fastest setup |

**Bottom line:** for your stated goal — low cost on an Azure tenant — deploy via **Azure Static Web Apps Free plan** from your GitHub repo. Total ongoing cost: **$0**.

---

### Sources
- [Azure Static Web Apps — Quickstart (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/static-web-apps/get-started-portal)
- [Azure Static Web Apps — Pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/static/)
- [How to Import Your Existing Code into Lovable Using GitHub](https://medium.com/@XAndroid/how-to-import-your-existing-code-into-lovable-using-github-119d0d79d483)
- [How to Publish Bolt & Lovable Apps (No Code MBA)](https://www.nocode.mba/articles/publish-app-bolt-lovable)
