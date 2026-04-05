---
description: Deploy the project to Vercel
---

This workflow guides you through deploying the Arcane Builder to Vercel. 

### Prerequisites
- A Vercel account.
- `vercel` CLI installed (or use `npx vercel`).

### Deployment Options

#### 1. Automated GitHub Actions (Recommended)
This project is configured with a GitHub Action to deploy to Vercel automatically on every push to `main`.
1.  Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` to your GitHub Repository Secrets.
2.  Push your changes to the `main` branch.
3.  Monitor the **Actions** tab on GitHub.

#### 2. Manual CLI Deployment
If you prefer to deploy manually from your terminal:
1. **Build the project locally**:
   // turbo
   `npm run build`

2. **Deploy to Vercel**:
   // turbo
   `npx vercel --prod`

   - If this is your first time, follow the prompts:
     - Log in if required.
     - Set up and deploy? **Yes**
     - Which scope? **[Your Scope]**
     - Link to existing project? **No**
     - Project name? **arcane-builder**
     - In which directory? **./**
     - Auto-detected settings? **Yes** (Vite settings are usually correct)

3. **Verify Deployment**:
   - Once complete, the CLI will provide a production URL.
   - Open that URL in your browser to verify the live site.

### Vercel Configuration (Automatic)
The Vite configuration in this project outputs to the `dist` directory, which Vercel usually detects automatically. If you need to manually configure it in the Vercel dashboard:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
