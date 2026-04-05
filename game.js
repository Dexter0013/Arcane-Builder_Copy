/**
 * Copyright (C) 2026 Deepraj Singha (Dexter0013)
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * * This project is a 2.5D Isometric World Builder built with Three.js.
 * See the LICENSE file in the root directory for full details.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ============================================================
//                    ARCANE ISOMETRIC BUILDER
// ============================================================

// --- 0. TEXTURE LOADER ---
const textureLoader = new THREE.TextureLoader();

// Stone/terrain texture tiled across the arcane floor
const floorTexture = textureLoader.load(
    'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(8, 8); // tiles across the default 20x20 grid

// A second, dark rough texture for block surfaces
const stoneTexture = textureLoader.load(
    'https://threejs.org/examples/textures/brick_diffuse.jpg'
);
stoneTexture.wrapS = THREE.RepeatWrapping;
stoneTexture.wrapT = THREE.RepeatWrapping;
stoneTexture.repeat.set(1, 1);

// --- 1. SCENE & RENDERER ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a14);
scene.fog = new THREE.FogExp2(0x0a0a14, 0.018);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// --- 2. POST-PROCESSING (BLOOM) ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, null); // camera set later
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,   // strength
    0.4,   // radius
    0.85   // threshold
);
composer.addPass(bloomPass);

// --- 3. ISOMETRIC CAMERA ---
let d = 10;
let aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

function updateCameraFrustum() {
    // Dynamically adjust 'd' based on screen width to keep the grid well-framed
    const W = window.innerWidth;
    if (W < 480) d = 16;
    else if (W < 768) d = 13;
    else d = 10;

    aspect = W / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
}

updateCameraFrustum();
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);
renderPass.camera = camera;

// --- 4. ORBIT CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.8;
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
};
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
controls.maxPolarAngle = Math.PI / 2.2;
controls.minZoom = 0.5;
controls.maxZoom = 3;

// --- 5. ARCANE LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.4);
scene.add(ambientLight);

// Main purple directional
const directionalLight = new THREE.DirectionalLight(0x8866cc, 0.7);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

// Arcane cyan rim light
const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.3);
rimLight.position.set(-10, 15, -10);
scene.add(rimLight);

// Point lights for magical glow
const arcaneGlow1 = new THREE.PointLight(0x7733ff, 1.5, 25);
arcaneGlow1.position.set(5, 3, 5);
scene.add(arcaneGlow1);

const arcaneGlow2 = new THREE.PointLight(0x00ccff, 1.0, 20);
arcaneGlow2.position.set(-5, 2, -3);
scene.add(arcaneGlow2);

const arcaneGlow3 = new THREE.PointLight(0xff33aa, 0.6, 15);
arcaneGlow3.position.set(0, 4, -6);
scene.add(arcaneGlow3);

// --- 6. THE GRID & FLOOR ---
let GRID_SIZE = 20;
let HALF_GRID = GRID_SIZE / 2;

// Create visible grid using a custom canvas texture
function createGridTexture(size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, 512, 512);
    
    // Bright grid lines - highly visible
    ctx.strokeStyle = '#ff99ff';
    ctx.lineWidth = 2;
    
    const gridSpacing = 512 / size;
    for (let i = 0; i <= size; i++) {
        const pos = i * gridSpacing;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, 512);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(512, pos);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

const gridTexture = createGridTexture(GRID_SIZE);
let gridMat = new THREE.MeshBasicMaterial({
    map: gridTexture,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
});
let grid = new THREE.Mesh(new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE), gridMat);
grid.position.y = -0.01;  // Below the floor so it doesn't interfere with raycasts
grid.rotation.x = -Math.PI / 2;
scene.add(grid);

// Invisible floor for raycasting
let floorGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
let floorMat = new THREE.MeshBasicMaterial({ visible: false });
let floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.name = 'floor';
scene.add(floor);

// Glowing floor plane — textured with the arcane stone/terrain map
let shadowGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
let shadowMat = new THREE.MeshStandardMaterial({
    map: floorTexture,          // terrain texture adds surface detail
    color: 0x1a3a1a,            // Dark green base for dark mode
    emissiveMap: floorTexture,  // Emit the grass texture directly
    emissive: 0x2d5a2d,         // Dark green emissive
    emissiveIntensity: 0.7,     // Show texture in dark mode
    roughness: 0.85,
    metalness: 0.15,
    transparent: false,
    opacity: 1.0,
});
let shadowFloor = new THREE.Mesh(shadowGeo, shadowMat);
shadowFloor.rotation.x = -Math.PI / 2;
shadowFloor.position.y = 0.01;
shadowFloor.receiveShadow = true;
scene.add(shadowFloor);

// --- 7. ARCANE RUNE CIRCLES ---
function createRuneCircle(radius, color, y) {
    const segments = 64;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
    return new THREE.Line(geo, mat);
}

const rune1 = createRuneCircle(4, 0x7733ff, 0.02);
const rune2 = createRuneCircle(6.5, 0x00ccff, 0.02);
const rune3 = createRuneCircle(9, 0x7733ff, 0.02);
scene.add(rune1, rune2, rune3);

// --- 8. FLOATING PARTICLES ---
const PARTICLE_COUNT = 600;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
const particleColors = new Float32Array(PARTICLE_COUNT * 3);
const particleSpeeds = new Float32Array(PARTICLE_COUNT);
const particlePhases = new Float32Array(PARTICLE_COUNT);

const arcaneColors = [
    new THREE.Color(0x7733ff),
    new THREE.Color(0x00ccff),
    new THREE.Color(0xff33aa),
    new THREE.Color(0x00ffcc),
    new THREE.Color(0xaa44ff),
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particlePositions[i * 3]     = (Math.random() - 0.5) * 30;
    particlePositions[i * 3 + 1] = Math.random() * 15;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

    const c = arcaneColors[Math.floor(Math.random() * arcaneColors.length)];
    particleColors[i * 3]     = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;

    particleSpeeds[i] = 0.2 + Math.random() * 0.5;
    particlePhases[i] = Math.random() * Math.PI * 2;
}

particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));

const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// --- 9. GHOST BLOCK ---
const ghostGeo = new THREE.BoxGeometry(1, 1, 1);
const ghostMat = new THREE.MeshBasicMaterial({
    color: 0x7733ff,
    transparent: true,
    opacity: 0.25,
    wireframe: false,
});
const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
ghostMesh.visible = false;
scene.add(ghostMesh);

const ghostWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(ghostGeo),
    new THREE.LineBasicMaterial({ color: 0x7733ff, transparent: true, opacity: 0.7 })
);
ghostMesh.add(ghostWire);

// --- 9.b TARGET BLOCK (Break Mode) ---
const targetGeo = new THREE.BoxGeometry(1, 1, 1);
const targetWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(targetGeo),
    new THREE.LineBasicMaterial({ color: 0xff3344, transparent: true, opacity: 0.8 })
);
targetWire.scale.set(1.05, 1.05, 1.05);
const targetMesh = new THREE.Mesh(targetGeo, new THREE.MeshBasicMaterial({ visible: false }));
targetMesh.add(targetWire);
targetMesh.visible = false;
scene.add(targetMesh);

// --- 10. STATE ---
const placedBlocks = [];       // holds THREE.Group buildings
let currentColor = '#00ffcc';
const burstParticles = [];
const clock = new THREE.Clock();
const animatedBuildings = [];  // buildings with animated child parts
let selectedBuildingIdx = 0;
let isBreakMode = false;       // toggled via UI
const physicsDebris = [];      // shattered fragments currently falling

// ---- BUILDING MATERIAL HELPERS ----
function matStone(hexColor) {
    return new THREE.MeshStandardMaterial({
        map: stoneTexture, color: new THREE.Color(hexColor),
        roughness: 0.85, metalness: 0.15,
    });
}
function matGlow(hexColor, intensity = 1.8) {
    const c = new THREE.Color(hexColor);
    return new THREE.MeshStandardMaterial({
        color: c, emissive: c, emissiveIntensity: intensity,
        roughness: 0, metalness: 1, transparent: true, opacity: 0.9,
    });
}
function markAnim(mesh, role, extras = {}) {
    Object.assign(mesh.userData, { animRole: role, ...extras });
    return mesh;
}

// ---- 6 ARCANE BUILDING FACTORIES ----
function buildCrystalSpire(color) {
    const g = new THREE.Group();
    const col = new THREE.Color(color);
    const crystal = new THREE.MeshStandardMaterial({
        color: col, emissive: col.clone().multiplyScalar(0.25),
        emissiveIntensity: 0.8, roughness: 0.05, metalness: 0.9,
        transparent: true, opacity: 0.78,
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.28, 6), matStone(0x221133));
    base.position.y = 0.14; base.castShadow = true; g.add(base);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 1.8, 6), crystal);
    body.position.y = 1.18; body.castShadow = true; g.add(body);
    const tip = markAnim(
        new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.1, 6), matGlow(color, 2.0)),
        'pulse', { pulseMin: 1.2, pulseMax: 2.8, pulseSpeed: 2.0, pulsePhase: 0 }
    );
    tip.position.y = 2.6; g.add(tip);
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const shard = markAnim(
            new THREE.Mesh(new THREE.OctahedronGeometry(0.08), matGlow(color, 2.5)),
            'orbit', { orbitR: 0.44, orbitY: 1.85, orbitPhase: a, orbitSpeed: 1.6 }
        );
        shard.position.set(Math.cos(a) * 0.44, 1.85, Math.sin(a) * 0.44);
        g.add(shard);
    }
    return g;
}

function buildArcaneWatchtower(color) {
    const g = new THREE.Group();
    const col = new THREE.Color(color);
    const stone = matStone(0x332244);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.4, 12), stone);
    base.position.y = 0.2; base.castShadow = true; g.add(base);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 2.5, 12), stone);
    tower.position.y = 1.65; tower.castShadow = true; g.add(tower);
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.14), stone);
        m.position.set(Math.cos(a) * 0.38, 3.05, Math.sin(a) * 0.38); g.add(m);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.9, 12), new THREE.MeshStandardMaterial({
        color: col, emissive: col.clone().multiplyScalar(0.15), emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.6,
    }));
    roof.position.y = 3.35; roof.castShadow = true; g.add(roof);
    const gem = markAnim(new THREE.Mesh(new THREE.OctahedronGeometry(0.1), matGlow(color, 2.2)), 'pulse', { pulseMin: 1.5, pulseMax: 3.0, pulseSpeed: 1.8, pulsePhase: 0.5 });
    gem.position.y = 3.82; g.add(gem);
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const win = markAnim(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, 0.07), matGlow(color, 2.8)), 'pulse', { pulseMin: 2.0, pulseMax: 3.5, pulseSpeed: 1.2, pulsePhase: i * 1.3 });
        win.position.set(Math.cos(a) * 0.44, 1.3 + i * 0.5, Math.sin(a) * 0.44); g.add(win);
    }
    return g;
}

function buildRunicMonolith(color) {
    const g = new THREE.Group();
    const col = new THREE.Color(color);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.9), matStone(0x221133));
    base.position.y = 0.1; base.castShadow = true; base.receiveShadow = true; g.add(base);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.54, 2.9, 0.27), new THREE.MeshStandardMaterial({
        map: stoneTexture, color: 0x1a0f33,
        emissive: col.clone().multiplyScalar(0.06), emissiveIntensity: 0.5, roughness: 0.9, metalness: 0.1,
    }));
    slab.position.y = 1.65; slab.castShadow = true; g.add(slab);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.38, 4), new THREE.MeshStandardMaterial({
        color: col, emissive: col, emissiveIntensity: 1.0, roughness: 0.3,
    }));
    cap.position.y = 3.28; cap.rotation.y = Math.PI / 4; g.add(cap);
    for (let i = 0; i < 4; i++) {
        const ring = markAnim(
            new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 4, 20), matGlow(color, 1.4)),
            'pulse', { pulseMin: 0.8, pulseMax: 2.2, pulseSpeed: 1.0, pulsePhase: i * 0.9 }
        );
        ring.position.y = 0.6 + i * 0.7; ring.rotation.x = Math.PI / 2; g.add(ring);
    }
    return g;
}

function buildMysticAltar(color) {
    const g = new THREE.Group();
    const col = new THREE.Color(color);
    const stone = matStone(0x221133);
    [[0.92, 0.3, 0.92, 0.15], [0.64, 0.28, 0.64, 0.44], [0.38, 0.24, 0.38, 0.695]].forEach(([w,h,d,y]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
        m.position.y = y; m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    const gem = markAnim(
        new THREE.Mesh(new THREE.OctahedronGeometry(0.18), matGlow(color, 2.2)),
        'spinPulse', { spinSpeed: 0.9, pulseMin: 1.5, pulseMax: 3.0, pulsePhase: 0 }
    );
    gem.position.y = 1.06; g.add(gem);
    for (let i = 0; i < 2; i++) {
        const torus = markAnim(
            new THREE.Mesh(new THREE.TorusGeometry(0.28 + i * 0.09, 0.024, 6, 32), matGlow(color, 1.2)),
            'spin', { spinSpeed: (i === 0 ? 0.7 : -0.5) }
        );
        torus.position.y = 1.06;
        torus.rotation.set(i === 0 ? 0.4 : -0.5, 0, i === 0 ? 0.2 : -0.3);
        g.add(torus);
    }
    [-1,1].forEach((s,i) => {
        const flame = markAnim(
            new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 6), matGlow(color, 2.5)),
            'pulse', { pulseMin: 1.8, pulseMax: 3.2, pulseSpeed: 3.0, pulsePhase: i * 1.5 }
        );
        flame.position.set(s * 0.44, 1.0, s * 0.44); g.add(flame);
    });
    return g;
}

function buildVoidPortal(color) {
    const g = new THREE.Group();
    const col = new THREE.Color(color);
    const stone = matStone(0x110022);
    [-0.38, 0.38].forEach(x => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.2, 8), stone);
        pillar.position.set(x, 1.1, 0); pillar.castShadow = true; g.add(pillar);
        const cap = markAnim(new THREE.Mesh(new THREE.OctahedronGeometry(0.09), matGlow(color, 2.2)), 'pulse', { pulseMin: 1.5, pulseMax: 3.0, pulsePhase: x * 5, pulseSpeed: 1.5 });
        cap.position.set(x, 2.28, 0); g.add(cap);
    });
    const arch = markAnim(
        new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.065, 8, 40), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0.9 })),
        'spin', { spinSpeed: 0.35, spinAxis: 'z' }
    );
    arch.position.y = 1.82; arch.rotation.x = Math.PI / 2; g.add(arch);
    const fill = markAnim(
        new THREE.Mesh(new THREE.CircleGeometry(0.41, 32), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.7, transparent: true, opacity: 0.35, side: THREE.DoubleSide })),
        'portal', { pulsePhase: 0 }
    );
    fill.position.y = 1.82; g.add(fill);
    const key = markAnim(new THREE.Mesh(new THREE.OctahedronGeometry(0.13), matGlow(color, 2.8)), 'pulse', { pulseMin: 2.0, pulseMax: 3.5, pulsePhase: 0, pulseSpeed: 2.2 });
    key.position.y = 2.3; g.add(key);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.32), stone);
    base.position.y = 0.07; base.castShadow = true; g.add(base);
    return g;
}

function buildShadowObelisk(color) {
    const g = new THREE.Group();
    const col = new THREE.Color(color);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.2, 0.84), matStone(0x0a0510));
    base.position.y = 0.1; base.castShadow = true; base.receiveShadow = true; g.add(base);
    // Tapered obelisk body via scaled BoxGeometry
    const bodyGeo = new THREE.BoxGeometry(0.42, 3.0, 0.42);
    const pos2 = bodyGeo.attributes.position.array;
    for (let i = 0; i < pos2.length; i += 3) {
        if (pos2[i + 1] > 0) { pos2[i] *= 0.25; pos2[i + 2] *= 0.25; }
    }
    bodyGeo.attributes.position.needsUpdate = true;
    bodyGeo.computeVertexNormals();
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({
        map: stoneTexture, color: 0x080412, emissive: col.clone().multiplyScalar(0.06),
        emissiveIntensity: 0.4, roughness: 0.92, metalness: 0.08,
    }));
    body.position.y = 1.7; body.castShadow = true; g.add(body);
    const edgeLine = markAnim(
        new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.6 })),
        'pulseLine', { pulsePhase: 0.5 }
    );
    edgeLine.position.y = 1.7; g.add(edgeLine);
    const apex = markAnim(new THREE.Mesh(new THREE.OctahedronGeometry(0.13), matGlow(color, 2.6)), 'pulse', { pulseMin: 1.8, pulseMax: 3.2, pulsePhase: 0, pulseSpeed: 1.4 });
    apex.position.y = 3.38; g.add(apex);
    return g;
}

// ---- BUILDING CATALOG ----
const BUILDING_CATALOG = [
    { id: 'crystal_spire',      name: 'Crystal Spire', icon: '🔮', create: buildCrystalSpire },
    { id: 'arcane_watchtower',  name: 'Arc. Tower',    icon: '🗼', create: buildArcaneWatchtower },
    { id: 'runic_monolith',     name: 'Rune Monolith', icon: '🪨', create: buildRunicMonolith },
    { id: 'mystic_altar',       name: 'Mystic Altar',  icon: '⛩',  create: buildMysticAltar },
    { id: 'void_portal',        name: 'Void Portal',   icon: '🌀', create: buildVoidPortal },
    { id: 'shadow_obelisk',     name: 'Shadow Obelisk',icon: '🗿', create: buildShadowObelisk },
];

// Recursive disposal helper for Groups
function disposeGroup(obj) {
    obj.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach(m => m.dispose());
        }
    });
}

// ============================================================
// --- DUNGEON LAYER SYSTEM ---
// ============================================================
let BLOCKS_PER_LAYER = 10;  // blocks needed to unlock next layer
const LAYER_DEPTH      = 6;   // world units between floors
let   currentLayer     = 0;
let   currentLayerBase = 0;   // Y of active floor
let   layerBlockCount  = 0;   // blocks placed in current layer
let   isTransitioning  = false;
let   cameraTargetY    = 0;   // lerp target for controls.target.y
let   cameraMoving     = false;

// Per-layer visual themes
const LAYER_THEMES = [
    { name: '✦ Surface',
      skyHex: 0x0a0a14, fogDensity: 0.018,
      floorColor: 0x2d5a2d, floorEmissive: 0x3d7a3d,
      gridMain: 0x4422aa, gridSub: 0x221155,
      wallColor: 0x150025, wallEmissive: 0x0a0020,
      lanternColors: [0x7733ff, 0x00ccff] },
    { name: '⚔ Dungeon',
      skyHex: 0x0d0202, fogDensity: 0.022,
      floorColor: 0x3d4a2d, floorEmissive: 0x4d5a3d,
      gridMain: 0xaa3311, gridSub: 0x551100,
      wallColor: 0x1a0500, wallEmissive: 0x0f0200,
      lanternColors: [0xff4400, 0xff8800] },
    { name: '🧊 Ice Cavern',
      skyHex: 0x020810, fogDensity: 0.020,
      floorColor: 0x2d5a4a, floorEmissive: 0x3d7a5a,
      gridMain: 0x1155cc, gridSub: 0x001177,
      wallColor: 0x001020, wallEmissive: 0x000a16,
      lanternColors: [0x0088ff, 0x00eeff] },
    { name: '🌀 The Void',
      skyHex: 0x000006, fogDensity: 0.026,
      floorColor: 0x1a2d1a, floorEmissive: 0x2d4a2d,
      gridMain: 0x00aacc, gridSub: 0x004455,
      wallColor: 0x000810, wallEmissive: 0x00060c,
      lanternColors: [0x00ffcc, 0x00ccee] },
];

function getTheme(idx) {
    return LAYER_THEMES[Math.min(idx, LAYER_THEMES.length - 1)];
}

// ---- Layer UI helpers ----
function updateLayerUI() {
    const nameEl   = document.getElementById('layer-name');
    const fillEl   = document.getElementById('layer-progress-fill');
    const textEl   = document.getElementById('layer-progress-text');
    if (!nameEl) return;
    const theme = getTheme(currentLayer);
    nameEl.textContent  = theme.name + ' — Layer ' + (currentLayer + 1);
    const pct = Math.min(layerBlockCount / BLOCKS_PER_LAYER * 100, 100);
    fillEl.style.width  = pct + '%';
    textEl.textContent  = layerBlockCount + ' / ' + BLOCKS_PER_LAYER + ' to descend';
}

function showLayerAnnouncement(theme, depth) {
    const box   = document.getElementById('layer-announcement');
    const title = document.getElementById('announce-title');
    const sub   = document.getElementById('announce-sub');
    if (!box) return;
    title.textContent = theme.name;
    title.style.color = '#' + LAYER_THEMES[Math.min(currentLayer, LAYER_THEMES.length - 1)]
                                   .lanternColors[0].toString(16).padStart(6, '0');
    sub.textContent   = 'Layer ' + (currentLayer + 1) + ' — ' + (depth * LAYER_DEPTH) + 'm deep';
    box.style.display = 'block';
    // auto-hide after animation
    setTimeout(() => { box.style.display = 'none'; }, 2200);
}

// ---- Apply scene-wide theme (fog, sky, lights) ----
function applyLayerTheme(theme) {
    scene.background = new THREE.Color(theme.skyHex);
    scene.fog        = new THREE.FogExp2(theme.skyHex, theme.fogDensity);

    const primary = new THREE.Color(theme.lanternColors[0]);
    const secondary = new THREE.Color(theme.lanternColors[1]);
    directionalLight.color.copy(primary);
    rimLight.color.copy(secondary);
    arcaneGlow1.color.copy(primary);
    arcaneGlow2.color.copy(secondary);

    // Dynamically restyle the HTML UI to match the expanding layer theme
    const primaryStr = theme.lanternColors[0].toString(16).padStart(6, '0');
    const secondaryStr = theme.lanternColors[1].toString(16).padStart(6, '0');
    const root = document.documentElement;

    root.style.setProperty('--layer-accent', '#' + primaryStr);
    root.style.setProperty('--layer-glow', '#' + primaryStr + '99');
    root.style.setProperty('--bar-fill-from', '#' + primaryStr);
    root.style.setProperty('--bar-fill-to', '#' + secondaryStr);
    root.style.setProperty('--bar-fill-glow', '#' + primaryStr + 'b3');

    // Keep floor visuals aligned with per-layer theme (grid is now independent)
    shadowFloor.material.color.set(theme.floorColor);
    shadowFloor.material.emissive.set(theme.floorEmissive);
}

// ---- Main expand trigger ----
function expandLayer() {
    // isTransitioning is already true from the timeout trigger.
    currentLayer++;

    // Shift grid to include +1 grid on each side (+2 total)
    const expandedGrid = GRID_SIZE + 2;
    rebuildGrid(expandedGrid);

    // Increase block requirements per layer
    BLOCKS_PER_LAYER += 10;

    const theme = getTheme(currentLayer);
    showLayerAnnouncement(theme, currentLayer);

    // Big burst ring effect at the current floor level
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        spawnBurst(
            new THREE.Vector3(Math.cos(angle) * 4, currentLayerBase + 0.1, Math.sin(angle) * 4),
            '#' + theme.lanternColors[0].toString(16).padStart(6, '0')
        );
    }

    // Apply new scene-wide theme color
    applyLayerTheme(theme);

    layerBlockCount  = 0;
    updateLayerUI();

    // Update vignette overlay tint
    const vig = document.getElementById('depth-vignette');
    if (vig) {
        const alpha = Math.min(currentLayer * 0.08, 0.35);
        vig.style.background =
            `radial-gradient(ellipse at center, transparent 40%,
             rgba(0,0,0,${alpha}) 100%)`;
    }

    // Complete transition after effects
    isTransitioning = false;
}

// --- 11. PLACEMENT BURST EFFECT ---
function spawnBurst(position, color) {
    const count = 30;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
        positions[i * 3] = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        velocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 4
        ));
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.12,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    burstParticles.push({
        mesh: points,
        velocities,
        life: 1.0,
        decay: 1.5 + Math.random() * 0.5,
    });
}

function updateBursts(delta) {
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const burst = burstParticles[i];
        burst.life -= delta * burst.decay;

        if (burst.life <= 0) {
            scene.remove(burst.mesh);
            burst.mesh.geometry.dispose();
            burst.mesh.material.dispose();
            burstParticles.splice(i, 1);
            continue;
        }

        burst.mesh.material.opacity = burst.life;
        const positions = burst.mesh.geometry.attributes.position.array;

        for (let j = 0; j < burst.velocities.length; j++) {
            positions[j * 3]     += burst.velocities[j].x * delta;
            positions[j * 3 + 1] += burst.velocities[j].y * delta;
            positions[j * 3 + 2] += burst.velocities[j].z * delta;
            burst.velocities[j].y -= 3 * delta; // gravity
        }

        burst.mesh.geometry.attributes.position.needsUpdate = true;
    }
}

// ============================================================
// --- 11.b ARCANE AUDIO MANAGER ---
// ============================================================
const ArcaneAudio = {
    ctx: null,
    
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) { console.warn("AudioContext not supported", e); }
    },

    playPlace() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const now = this.ctx.currentTime;
        
        // Shimmering Magic Sound: Rising Sine + High Triangle Ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        
        const ping = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        ping.type = 'triangle';
        ping.frequency.setValueAtTime(1400, now);
        ping.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        pg.gain.setValueAtTime(0.12, now);
        pg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        ping.connect(pg);
        pg.connect(this.ctx.destination);
        ping.start(now);
        ping.stop(now + 0.12);
    },

    playBreak() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const now = this.ctx.currentTime;
        
        // Crystalline Shatter: Noise Burst + Low Thump + High Sparkles
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'bandpass';
        nFilter.frequency.setValueAtTime(1200, now);
        nFilter.frequency.exponentialRampToValueAtTime(400, now + 0.22);
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.2, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        
        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(now);
        
        // Low Frequency Thump
        const thump = this.ctx.createOscillator();
        const tGain = this.ctx.createGain();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(80, now);
        thump.frequency.exponentialRampToValueAtTime(40, now + 0.18);
        tGain.gain.setValueAtTime(0.5, now);
        tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        thump.connect(tGain);
        tGain.connect(this.ctx.destination);
        thump.start(now);
        thump.stop(now + 0.18);
    },

    playUndo() {
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }
};

// --- 12. RAYCASTING ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// groundPlane is updated on each descent (constant = -currentLayerBase)
let groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function getSnappedPosition(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Check for blocks (but skip grid)
    if (placedBlocks.length > 0) {
        const blockHits = raycaster.intersectObjects(placedBlocks, true).filter(h => h.face);
        if (blockHits.length > 0) {
            const hit = blockHits[0];
            const normal = hit.face.normal.clone();
            const pos = hit.object.position.clone().add(normal);
            pos.x = Math.max(-HALF_GRID + 0.5, Math.min(HALF_GRID - 0.5, Math.round(pos.x)));
            pos.z = Math.max(-HALF_GRID + 0.5, Math.min(HALF_GRID - 0.5, Math.round(pos.z)));
            pos.y = Math.max(currentLayerBase + 0.5, Math.round(pos.y * 2) / 2);
            if (pos.y % 1 !== 0.5) pos.y = Math.floor(pos.y) + 0.5;
            return pos;
        }
    }

    // Raycast to the invisible floor plane (groundPlane)
    const intersectPoint = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(groundPlane, intersectPoint);
    if (!hit) return null;

    return new THREE.Vector3(
        Math.max(-HALF_GRID + 0.5, Math.min(HALF_GRID - 0.5, Math.round(intersectPoint.x))),
        currentLayerBase + 0.5,
        Math.max(-HALF_GRID + 0.5, Math.min(HALF_GRID - 0.5, Math.round(intersectPoint.z)))
    );
}

function updateBlockCount() {
    const el = document.getElementById('block-count');
    if (el) el.textContent = `${placedBlocks.length} block${placedBlocks.length !== 1 ? 's' : ''}`;
}

function undoBlock() {
    if (placedBlocks.length > 0) {
        // Remove from animated list too
        const last = placedBlocks[placedBlocks.length - 1];
        const ai = animatedBuildings.indexOf(last);
        if (ai !== -1) animatedBuildings.splice(ai, 1);
        const removed = placedBlocks.pop();
        scene.remove(removed);
        disposeGroup(removed);
        if (layerBlockCount > 0) layerBlockCount--;
        updateLayerUI();
        updateBlockCount();
        ArcaneAudio.playUndo();
    }
}

function resetBlocks() {
    while (placedBlocks.length > 0) {
        const b = placedBlocks.pop();
        scene.remove(b);
        disposeGroup(b);
    }
    animatedBuildings.length = 0;
    
    // Clear loose debris
    for (let i = physicsDebris.length - 1; i >= 0; i--) {
        const d = physicsDebris[i];
        scene.remove(d);
        if (d.geometry) d.geometry.dispose();
        if (d.material) {
            if (Array.isArray(d.material)) d.material.forEach(m => m.dispose());
            else d.material.dispose();
        }
        physicsDebris.splice(i, 1);
    }
    animatedBuildings.length = 0;
    // Reset layer state
    currentLayer     = 0;
    currentLayerBase = 0;
    layerBlockCount  = 0;
    BLOCKS_PER_LAYER = 10;
    isTransitioning  = false;
    cameraMoving     = false;
    groundPlane.constant = 0;

    // Reset grid to default
    rebuildGrid(20);
    
    // Return camera to surface
    controls.target.set(0, 0, 0);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    // Restore surface theme
    applyLayerTheme(getTheme(0));
    const vig = document.getElementById('depth-vignette');
    if (vig) vig.style.background = 'transparent';
    updateLayerUI();
    updateBlockCount();
}

function rebuildGrid(newSize) {
    scene.remove(grid);
    scene.remove(floor);
    scene.remove(shadowFloor);

    GRID_SIZE = newSize;
    HALF_GRID = GRID_SIZE / 2;

    // Create new grid with texture
    const texture = createGridTexture(GRID_SIZE);
    gridMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
    grid = new THREE.Mesh(new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE), gridMat);
    grid.position.y = -0.01;  // Below the floor so it doesn't interfere with raycasts
    grid.rotation.x = -Math.PI / 2;
    scene.add(grid);

    floorGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
    floorMat = new THREE.MeshBasicMaterial({ visible: false });
    floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.name = 'floor';
    scene.add(floor);

    shadowGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
    // Recalculate texture repeat so tiles stay consistent across different grid sizes
    floorTexture.repeat.set(newSize * 0.4, newSize * 0.4);
    const currentTheme = getTheme(currentLayer);
    shadowMat = new THREE.MeshStandardMaterial({
        map: floorTexture,
        color: currentTheme.floorColor,
        emissiveMap: floorTexture,
        emissive: currentTheme.floorEmissive,
        emissiveIntensity: 0.7,
        roughness: 0.85,
        metalness: 0.15,
        transparent: false,
        opacity: 1.0,
    });
    shadowFloor = new THREE.Mesh(shadowGeo, shadowMat);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = 0.01;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);
}

// --- 13. MOUSE EVENTS ---
window.addEventListener('mousemove', (e) => {
    if (isBreakMode) {
        ghostMesh.visible = false;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const blockHits = raycaster.intersectObjects(placedBlocks, true).filter(h => h.object.type !== 'LineSegments');
        if (blockHits.length > 0) {
            // Walk up the hierarchy until we find an object that is in placedBlocks
            let obj = blockHits[0].object;
            let group = null;
            while (obj) {
                if (placedBlocks.includes(obj)) { group = obj; break; }
                obj = obj.parent;
            }
            if (group) {
                targetMesh.visible = true;
                const box = new THREE.Box3().setFromObject(group);
                const center = new THREE.Vector3();
                box.getCenter(center);
                const size = new THREE.Vector3();
                box.getSize(size);
                targetMesh.position.copy(center);
                targetMesh.scale.set(size.x, size.y, size.z);
            } else {
                targetMesh.visible = false;
            }
        } else {
            targetMesh.visible = false;
        }
        return;
    }

    targetMesh.visible = false;
    const pos = getSnappedPosition(e);
    if (pos) {
        ghostMesh.visible = true;
        ghostMesh.position.copy(pos);
    } else {
        ghostMesh.visible = false;
    }
});

// Drag tracking for click-to-place vs drag-to-rotate
let mousedownX = 0;
let mousedownY = 0;
const DRAG_THRESHOLD = 5; // pixels

window.addEventListener('mousedown', (e) => {
    mousedownX = e.clientX;
    mousedownY = e.clientY;
});

window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        mousedownX = e.touches[0].clientX;
        mousedownY = e.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener('mouseup', (e) => handlePlacement(e.clientX, e.clientY, e.button === 0));

window.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
        handlePlacement(e.changedTouches[0].clientX, e.changedTouches[0].clientY, true);
    }
}, { passive: true });

function handlePlacement(clientX, clientY, isLeftClick) {
    if (isTransitioning) return;
    if (!isLeftClick) return;

    // Reject placement if we've dragged more than a tiny bit
    const dx = clientX - mousedownX;
    const dy = clientY - mousedownY;
    if (Math.sqrt(dx*dx + dy*dy) > DRAG_THRESHOLD) return;

    // Check if we hit the renderer (can't use e.target on unified handler easily, check bounds)
    const rect = renderer.domElement.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;

    if (isBreakMode) {
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const blockHits = raycaster.intersectObjects(placedBlocks, true).filter(h => h.object.type !== 'LineSegments');
        if (blockHits.length > 0) {
            // Walk up hierarchy to find exact group in placedBlocks
            let obj = blockHits[0].object;
            let group = null;
            while (obj) {
                if (placedBlocks.includes(obj)) { group = obj; break; }
                obj = obj.parent;
            }
            if (group) {
                placedBlocks.splice(placedBlocks.indexOf(group), 1);
                const animIdx = animatedBuildings.indexOf(group);
                if (animIdx !== -1) animatedBuildings.splice(animIdx, 1);

                const children = [];
                group.traverse(child => { if (child !== group && child.isMesh) children.push(child); });
                const groupPos = new THREE.Vector3();
                group.getWorldPosition(groupPos);

                children.forEach(child => {
                    const childPos = new THREE.Vector3();
                    child.getWorldPosition(childPos);
                    scene.attach(child);

                    const outward = childPos.clone().sub(groupPos).normalize();
                    if (outward.lengthSq() < 0.01) outward.set(Math.random()-0.5, 1, Math.random()-0.5).normalize();

                    child.userData.velocity = new THREE.Vector3(
                        outward.x * (0.08 + Math.random() * 0.14),
                        0.18 + Math.random() * 0.28,
                        outward.z * (0.08 + Math.random() * 0.14)
                    );
                    child.userData.rotSpeed = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5
                    );
                    physicsDebris.push(child);
                });

                scene.remove(group);
                disposeGroup(group);
                ArcaneAudio.playBreak();
                spawnBurst(groupPos, '#ff3344');
                targetMesh.visible = false;

                layerBlockCount = Math.max(0, layerBlockCount - 1);
                updateLayerUI();
                updateBlockCount();
            }
        }
        return;
    }

    const pos = getSnappedPosition({ clientX, clientY });
    if (!pos) return;

    // Collision: no two buildings on the same grid cell (X-Z only)
    const occupied = placedBlocks.some(b => {
        const dist = Math.sqrt(
            Math.pow(b.position.x - pos.x, 2) + 
            Math.pow(b.position.z - pos.z, 2)
        );
        return dist < 0.6;
    });
    if (occupied) return;

    // Build selected building type
    const blueprint = BUILDING_CATALOG[selectedBuildingIdx];
    const group = blueprint.create(currentColor);
    group.position.set(pos.x, currentLayerBase, pos.z); // base sits on the floor
    group.castShadow = true;
    scene.add(group);
    placedBlocks.push(group);
    animatedBuildings.push(group);
    updateBlockCount();

    // Layer progression
    layerBlockCount++;
    updateLayerUI();

    ArcaneAudio.playPlace();
    spawnBurst(new THREE.Vector3(pos.x, currentLayerBase + 0.3, pos.z), currentColor);

    if (layerBlockCount >= BLOCKS_PER_LAYER && !isTransitioning) {
        isTransitioning = true;
        setTimeout(expandLayer, 800);
    }
}

// --- 14. KEYBOARD ---
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'z') undoBlock();
    if (e.key.toLowerCase() === 'r') resetBlocks();
    if (e.key.toLowerCase() === 'b') {
        const next = !isBreakMode;
        setBreakMode(next);
        // must call after setBreakMode so DOM refs exist
        if (toggleBreak) toggleBreak.checked = next;
    }
});

// Expose building selector for non-module script in index.html
window._arcaneSelectBuilding = (idx) => { selectedBuildingIdx = idx; };

// Expose theme setter — adapts the 3D scene between dark and light palettes
window._arcaneSetTheme = (isLight) => {
    if (isLight) {
        // ----- LIGHT (aged parchment / brass / hextech) -----
        scene.background = new THREE.Color(0xF4EFE6);
        scene.fog        = new THREE.FogExp2(0xF0EAD8, 0.010);
        ambientLight.color.set(0xD8C8A0);
        ambientLight.intensity = 0.7;
        directionalLight.color.set(0xC8A870);
        directionalLight.intensity = 1.0;
        rimLight.color.set(0x00BBFF);
        rimLight.intensity = 0.5;
        arcaneGlow1.color.set(0xC29958); arcaneGlow1.intensity = 1.2;
        arcaneGlow2.color.set(0x00BBFF); arcaneGlow2.intensity = 0.9;
        arcaneGlow3.color.set(0xC29958); arcaneGlow3.intensity = 0.5;
        bloomPass.strength = 0.18;
        bloomPass.threshold = 0.92;
        shadowFloor.material.color.set(0x7aad7a);
        shadowFloor.material.emissive.set(0x8fbf8f);
        shadowFloor.material.emissiveIntensity = 0.6;
    } else {
        // ----- DARK (current arcane defaults) -----
        scene.background = new THREE.Color(0x0a0a14);
        scene.fog        = new THREE.FogExp2(0x0a0a14, 0.018);
        ambientLight.color.set(0x1a1a3a);
        ambientLight.intensity = 0.4;
        directionalLight.color.set(0x8866cc);
        directionalLight.intensity = 0.7;
        rimLight.color.set(0x00ffcc);
        rimLight.intensity = 0.3;
        arcaneGlow1.color.set(0x7733ff); arcaneGlow1.intensity = 1.5;
        arcaneGlow2.color.set(0x00ccff); arcaneGlow2.intensity = 1.0;
        arcaneGlow3.color.set(0xff33aa); arcaneGlow3.intensity = 0.6;
        bloomPass.strength = 0.6;
        bloomPass.threshold = 0.85;
        shadowFloor.material.color.set(0x2d5a2d);
        shadowFloor.material.emissive.set(0x3d7a3d);
        shadowFloor.material.emissiveIntensity = 0.7;
    }
};


// --- 15. WIRED ELEMENTS UI ---
document.getElementById('color-grid').addEventListener('click', (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
    swatch.classList.add('active');
    currentColor = swatch.dataset.color;
    ghostMat.color.set(currentColor);
    ghostWire.material.color.set(currentColor);
});

const toggleBreak = document.getElementById('toggle-break');
const breakTrack = document.getElementById('break-toggle-track');
const breakThumb = document.getElementById('break-toggle-thumb');

function applyBreakToggleVisual(on) {
    if (breakTrack) {
        breakTrack.style.background     = on ? 'rgba(255,51,68,0.55)' : 'rgba(255,51,68,0.15)';
        breakTrack.style.borderColor    = on ? '#ff3344'               : 'rgba(255,51,68,0.35)';
        breakTrack.style.boxShadow      = on ? '0 0 10px rgba(255,51,68,0.5)' : 'none';
    }
    if (breakThumb) {
        breakThumb.style.transform      = on ? 'translateX(20px)' : 'translateX(0)';
        breakThumb.style.opacity        = on ? '1'                : '0.4';
        breakThumb.style.boxShadow      = on ? '0 0 10px #ff3344, 0 0 20px rgba(255,51,68,0.6)' : '0 0 6px rgba(255,51,68,0.5)';
    }
}

function setBreakMode(on) {
    isBreakMode = on;
    if (toggleBreak) toggleBreak.checked = on;
    applyBreakToggleVisual(on);
    if (on) {
        ghostMesh.visible  = false;
        targetMesh.visible = false;
        renderer.domElement.style.cursor = 'crosshair';
    } else {
        targetMesh.visible = false;
        ghostMesh.visible  = false;   // mousemove will restore naturally
        renderer.domElement.style.cursor = '';
    }
}

if (toggleBreak) {
    toggleBreak.addEventListener('change', () => setBreakMode(toggleBreak.checked));
}

document.getElementById('btn-undo')?.addEventListener('click', undoBlock);
document.getElementById('btn-reset')?.addEventListener('click', resetBlocks);

// --- 16. WINDOW RESIZE ---
window.addEventListener('resize', () => {
    updateCameraFrustum();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// --- 18. WIRED ELEMENTS ANIMATION ---
let lastWiredUpdate = 0;
function animateWiredUI(elapsed) {
    // Update every ~150ms for a hand-drawn "boiling" animation effect
    if (elapsed - lastWiredUpdate > 0.15) {
        lastWiredUpdate = elapsed;
        const wiredEls = document.querySelectorAll('wired-card, wired-button, wired-slider, wired-toggle');
        wiredEls.forEach(el => {
            // Setting a random seed forces rough.js to redraw the sketchy lines differently
            el.setAttribute('seed', Math.floor(Math.random() * 1000));
        });
    }
}

// --- 17. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    controls.update();

    // PHYSICS LOOP (Debris)
    for (let i = physicsDebris.length - 1; i >= 0; i--) {
        const d = physicsDebris[i];
        d.position.add(d.userData.velocity);
        d.rotation.x += d.userData.rotSpeed.x;
        d.rotation.y += d.userData.rotSpeed.y;
        d.rotation.z += d.userData.rotSpeed.z;
        
        // Gravity
        d.userData.velocity.y -= 0.015;

        // Collide with floor
        if (d.position.y < currentLayerBase + 0.1) {
            d.position.y = currentLayerBase + 0.1;
            d.userData.velocity.y *= -0.5; // bounce damper
            d.userData.velocity.x *= 0.6;  // friction
            d.userData.velocity.z *= 0.6;
            d.userData.rotSpeed.multiplyScalar(0.7);
            
            // Shrink on floor progressively
            d.scale.multiplyScalar(0.95);
            
            // Reached nothingness
            if (d.scale.x < 0.05) {
                scene.remove(d);
                if (d.geometry) d.geometry.dispose();
                if (d.material) {
                    if (Array.isArray(d.material)) d.material.forEach(m => m.dispose());
                    else d.material.dispose();
                }
                physicsDebris.splice(i, 1);
            }
        }
    }

    // --- Camera lerp during dungeon descent ---
    if (cameraMoving) {
        controls.target.y = THREE.MathUtils.lerp(controls.target.y, cameraTargetY, 0.035);
        // Keep camera position tracking the same offset
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraTargetY + 20, 0.035);
        if (Math.abs(controls.target.y - cameraTargetY) < 0.05) {
            controls.target.y = cameraTargetY;
            camera.position.y = cameraTargetY + 20;
            cameraMoving     = false;
            isTransitioning  = false;
        }
    }

    // --- Animate floor texture (subtle arcane shimmer / drift) ---
    floorTexture.offset.x = Math.sin(elapsed * 0.15) * 0.04;
    floorTexture.offset.y = Math.cos(elapsed * 0.12) * 0.04;

    // Animate floating particles
    const posArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        posArr[i * 3 + 1] += particleSpeeds[i] * delta;
        posArr[i * 3]     += Math.sin(elapsed * 0.5 + particlePhases[i]) * 0.003;
        posArr[i * 3 + 2] += Math.cos(elapsed * 0.4 + particlePhases[i]) * 0.003;

        // Reset particles that float too high
        if (posArr[i * 3 + 1] > 15) {
            posArr[i * 3]     = (Math.random() - 0.5) * 30;
            posArr[i * 3 + 1] = -1;
            posArr[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Animate rune circles
    rune1.rotation.y = elapsed * 0.15;
    rune2.rotation.y = -elapsed * 0.1;
    rune3.rotation.y = elapsed * 0.08;

    // Pulse rune opacity
    rune1.material.opacity = 0.25 + Math.sin(elapsed * 1.5) * 0.15;
    rune2.material.opacity = 0.25 + Math.sin(elapsed * 1.2 + 1) * 0.15;
    rune3.material.opacity = 0.25 + Math.sin(elapsed * 0.9 + 2) * 0.15;

    // Animate arcane point lights
    arcaneGlow1.position.x = 5 + Math.sin(elapsed * 0.7) * 3;
    arcaneGlow1.position.z = 5 + Math.cos(elapsed * 0.5) * 3;
    arcaneGlow1.intensity = 1.2 + Math.sin(elapsed * 2) * 0.3;

    arcaneGlow2.position.x = -5 + Math.cos(elapsed * 0.6) * 4;
    arcaneGlow2.position.z = -3 + Math.sin(elapsed * 0.4) * 4;

    arcaneGlow3.intensity = 0.4 + Math.sin(elapsed * 1.5 + 1) * 0.2;

    // Ghost pulse
    if (ghostMesh.visible) {
        ghostMat.opacity = 0.15 + Math.sin(elapsed * 3) * 0.1;
        ghostWire.material.opacity = 0.5 + Math.sin(elapsed * 3) * 0.2;
    }

    // --- Animate buildings ---
    animatedBuildings.forEach(grp => {
        grp.traverse(child => {
            const r = child.userData.animRole;
            if (!r) return;
            if (r === 'orbit') {
                child.userData._a = (child.userData._a || child.userData.orbitPhase) + child.userData.orbitSpeed * delta;
                child.position.x = Math.cos(child.userData._a) * child.userData.orbitR;
                child.position.z = Math.sin(child.userData._a) * child.userData.orbitR;
            } else if (r === 'pulse' || r === 'spinPulse') {
                if (child.material && child.material.emissiveIntensity !== undefined) {
                    const lo = child.userData.pulseMin || 0.8;
                    const hi = child.userData.pulseMax || 2.5;
                    const sp = child.userData.pulseSpeed || 1.5;
                    child.material.emissiveIntensity = lo + (Math.sin(elapsed * sp + (child.userData.pulsePhase || 0)) * 0.5 + 0.5) * (hi - lo);
                }
                if (r === 'spinPulse') child.rotation.y += (child.userData.spinSpeed || 0.8) * delta;
            } else if (r === 'spin') {
                const axis = child.userData.spinAxis || 'y';
                child.rotation[axis] += (child.userData.spinSpeed || 0.7) * delta;
            } else if (r === 'portal') {
                child.rotation.z += 0.4 * delta;
                if (child.material) child.material.opacity = 0.25 + Math.sin(elapsed * 1.5 + (child.userData.pulsePhase || 0)) * 0.15;
            } else if (r === 'pulseLine') {
                if (child.material) child.material.opacity = 0.3 + Math.sin(elapsed * 1.8 + (child.userData.pulsePhase || 0)) * 0.3;
            }
        });
    });

    // Update placement bursts
    updateBursts(delta);

    // Update UI animation
    animateWiredUI(elapsed);

    // Render with bloom
    composer.render();
}
animate();