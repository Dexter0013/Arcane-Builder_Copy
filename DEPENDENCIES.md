# Project Dependencies

This file actively tracks all internal/external libraries, utilities, and frameworks required by the **Arcane Isometric Builder** project.

## Development Dependencies (NPM)
These dependencies are used strictly for local development, hot-module-replacement, and the Tailwind build pipeline. They are tracked inside `package.json`.

- **Vite** (`^5.2.11`): The frontend dev-server and build bundler.
- **Tailwind CSS** (`^3.4.3`): Utility-first CSS framework parsing `style.css` and `index.html`.
- **PostCSS** (`^8.4.38`): Required processing engine for Tailwind.
- **Autoprefixer** (`^10.4.19`): Parses CSS and adds vendor prefixes (used alongside PostCSS).

## Runtime Dependencies (Bundled via CDN)
Currently, to facilitate rapid browser delivery without dense Node.js `node_modules` bundling, the game logic relies on CDN imports (via Skypack and Unpkg). 

- **Three.js** (`0.132.2`): The core 3D WebGL rendering engine. Loaded inside `game.js`.
   - *Dependencies Include:* `OrbitControls`, `EffectComposer`, `RenderPass`, `UnrealBloomPass`, and `GLTFLoader`.
- **Wired-Elements** (`3.0.0-rc.6`): Provides the hand-drawn web components (like `wired-card`, `wired-slider`, `wired-toggle`). Loaded inside `<head>` of `index.html`.
- **Google Fonts API**: Fetches the Arcane themed typeface: *Architects Daughter*.

> **Note on Upgrading:** If you plan to fully migrate the runtime modules (Three.js / Wired-Elements) to local NPM dependencies in the future, you will run `npm install three@0.132.2 wired-elements` and update the import paths inside `game.js` to strip the `https://cdn.skypack.dev/` prefixes.
