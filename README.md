# Arcane Dungeon Builder

An immersive isometric dungeon building experience with procedural generation, multi-layered depth, and distinct arcane aesthetics.
Built with Three.js, Vite, and the Web Audio API for a fully reactive environment.

## Features

- **Procedural 3D Building Components:** Placed objects aren't just blocks; they are procedural structures (Crystal Spires, Arcane Towers, Monoliths, etc.) created with Three.js primitives and animated via shaders/materials.
- **💥 Break Mode:** Shatter existing structures into physical debris. Watch as shards bounce, shrink, and vanish into the arcane floor.
- **🔊 Procedural Sound Engine:** High-fidelity "magic" sound effects synthesized in real-time using the Web Audio API. Experience shimmering placement notes and resonating crystalline shatters without external audio files.
- **Dungeon Layer System (Descent):** Place a set number of objects to reveal the next layer of the dungeon. Descend from the grassy surface through 4 unique themed layers: Surface (bright green), Dungeon (earthy tones), Ice Cavern (pale blue-green), and The Void (dark abyss). Each layer has its own unique fog, lighting, grass textures, and ground colors.
- **Dynamic Grid & Terrain:** Textured grass floor with animated grid overlay. The grid expands as you descend to deeper layers, creating a sense of scale and progression.
- **Theme Engine:** Instantly toggle between Dark Arcane theme (dark green grass) and Light mode (light green grass). The theme engine updates CSS custom properties as well as the active Three.js Scene lighting, fog, and textures dynamically.
- **Interactive UI:** Hand-drawn 'wired-elements' interface merged with modern utility-based Tailwind CSS design. Includes a hotbar, configuration panels, depth indicators, and on-screen cinematic announcements.
- **Vite & Tailwind Build:** Fast HMR, optimized production builds, and clean CSS workflow.

## Technology Stack

- **Core:** Three.js (v0.132.2) — locally installed via npm
- **Post-Processing:** Bloom & Glow effects via UnrealBloomPass
- **Audio:** Web Audio API (Real-time synthesis)
- **Tooling:** Vite
- **Styling:** Tailwind CSS (Utility classes and custom `@layer` directives) + CSS Variables
- **UI Components:** wired-elements

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *This starts the Vite server on localhost (typically port 5173).*

3. **Build for Production**
   ```bash
   npm run build
   ```
   *Optimizes the app into the `dist` folder.*

## Key Controls

- **Left Click:** Place a building (or shatter one in Break Mode).
- **Right Click & Drag:** Rotate the isometric camera.
- **Scroll Wheel:** Zoom in and out.
- **Number keys (1-6):** Select a building from the hotbar.
- **B:** Toggle **Break Mode** (Shatter structures).
- **Z:** Undo the last placement.
- **R:** Reset the foundation/layer.

## Dungeon Layers & Themes

As you place blocks and progress deeper, you'll unlock 4 distinct dungeon layers, each with unique visual themes:

| Layer | Name | Colors | Blocks to Unlock | Grass Color |
|-------|------|--------|------------------|------------|
| 0 | ✦ Surface | Purple/Cyan | 10 | Dark Green |
| 1 | ⚔ Dungeon | Orange/Warm | 20 | Earthy Green-Brown |
| 2 | 🧊 Ice Cavern | Blue/Cyan | 30 | Pale Blue-Green |
| 3 | 🌀 The Void | Cyan/Magenta | 40 | Deep Dark Green |

Each layer transformation includes: sky color shift, fog density change, lighting recolor, terrain tint, grid expansion, and cinematic announcement.

## CI/CD & Deployment

This project is configured for automated deployment to **Vercel** via **GitHub Actions**.

### Prerequisites

To enable automated deployments, you must add the following **Secrets** to your GitHub repository (**Settings > Secrets and variables > Actions**):

1.  **`VERCEL_TOKEN`**: Your Vercel Personal Access Token. Get it here: [vercel.com/account/tokens](https://vercel.com/account/tokens).
2.  **`VERCEL_ORG_ID`**: Your Vercel Team/User ID.
3.  **`VERCEL_PROJECT_ID`**: Your Vercel Project ID.

> [!TIP]
> You can find the `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` in your project's `.vercel/project.json` file after running `vercel link` locally, or by checking the project settings in the Vercel dashboard.

### Automated Workflow

Every push or Pull Request to the `main` branch will trigger the [GitHub Action](.github/workflows/deploy.yml) which:
1.  Installs dependencies.
2.  Builds the production-ready `dist` bundle.
3.  Deploys the bundle directly to your Vercel production environment.

## Architecture & Styles

The application relies on `style.css` for a centralized definition of CSS variables that map directly into `tailwind.config.js`. This creates a robust bridge between the CSS custom properties dynamically controlled by the theme toggle and the Tailwind rendering engine. Repeated structures (like the `b-slot` building hotbar items) utilize Tailwind's `@layer components` and `@apply` to maintain clean, DRY HTML.
