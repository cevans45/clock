// Shape orbits tool — animated shapes with mirroring and modes

let orbitParams = {
  count: 3,
  speed: 60,       // pixels per second equivalent
  mode: 'orbit',   // horizontal | vertical | diagonal | orbit | mixed
  shape: 'circle', // circle | square | triangle | mixed
  size: 20,
  mirror: 1,       // 1..4
  scalePct: 90,
  bg: '#f6f6f4',
  color: '#111111',
  wrap: 'wrap',    // wrap | bounce
};

let orbitShapes = [];
let orbitSelected = -1;
let orbitCanvasWidth;

function createOrbitShapes() {
  orbitShapes = [];
  const n = constrain(orbitParams.count, 1, 5);
  const baseRadius = min(width, height) * 0.12;
  for (let i = 0; i < orbitParams.count; i++) {
    const x = width / 2;
    const y = height / 2;
    const angle = random(TWO_PI);
    const radius = baseRadius + i * (orbitParams.size * 2.4);
    const dir = random([-1, 1]);
    const vx = random([-1, 1]);
    const vy = random([-1, 1]);
    orbitShapes.push({
      x,
      y,
      angle,
      radius,
      dir,
      vx,
      vy,
      sizeFactor: 1,
      speedFactor: 1,
      modeOverride: null,
      kindOverride: null,
      filled: true,
      strokeW: 0,
    });
  }
  orbitSelected = orbitShapes.length ? 0 : -1;
}

function resizeOrbitCanvas() {
  const container = document.getElementById('orbit-canvas');
  if (!container) return;
  const bounds = container.getBoundingClientRect();
  const maxW = window.innerWidth - 420;
  const maxH = window.innerHeight - 140;
  const base = min(maxW, maxH);
  const scale = (orbitParams.scalePct || 90) / 100;
  const target = max(260, base * scale);
  orbitCanvasWidth = target;
  if (typeof resizeCanvas === 'function') {
    resizeCanvas(target, target);
  }
}

function setup() {
  const container = document.getElementById('orbit-canvas');
  if (!container) return;
  orbitCanvasWidth = min(windowWidth - 420, windowHeight - 140);
  orbitCanvasWidth = max(260, orbitCanvasWidth);
  const canvas = createCanvas(orbitCanvasWidth, orbitCanvasWidth);
  canvas.parent('orbit-canvas');
  rectMode(CENTER);
  angleMode(RADIANS);
  noStroke();

  bindOrbitControls();
  createOrbitShapes();
}

function windowResized() {
  resizeOrbitCanvas();
}

function bindOrbitControls() {
  const countEl = document.getElementById('orbit-count');
  const speedEl = document.getElementById('orbit-speed');
  const scaleEl = document.getElementById('orbit-scale');
  const mirrorEl = document.getElementById('orbit-mirror');
  const modeEl = document.getElementById('orbit-mode');
  const shapeEl = document.getElementById('orbit-shape');
  const sizeEl = document.getElementById('orbit-size');
  const bgEl = document.getElementById('orbit-bg');
  const colorEl = document.getElementById('orbit-color');
  const randBtn = document.getElementById('btn-orbit-random-colors');
  const wrapEl = document.getElementById('orbit-wrap');
  const selSizeEl = document.getElementById('orbit-selected-size');
  const selSpeedEl = document.getElementById('orbit-selected-speed');
  const selModeEl = document.getElementById('orbit-selected-mode');
  const selLabel = document.getElementById('label-selected-index');
  const selFillEl = document.getElementById('orbit-selected-fill');
  const selStrokeEl = document.getElementById('orbit-selected-stroke');

  if (countEl) {
    countEl.addEventListener('input', () => {
      orbitParams.count = parseInt(countEl.value, 10);
      const v = document.getElementById('value-orbit-count');
      if (v) v.textContent = countEl.value;
      createOrbitShapes();
    });
  }
  if (speedEl) {
    speedEl.addEventListener('input', () => {
      orbitParams.speed = parseInt(speedEl.value, 10);
      const v = document.getElementById('value-orbit-speed');
      if (v) v.textContent = speedEl.value;
    });
  }
  if (scaleEl) {
    scaleEl.addEventListener('input', () => {
      const pct = parseInt(scaleEl.value, 10);
      orbitParams.scalePct = pct;
      const v = document.getElementById('value-orbit-scale');
      if (v) v.textContent = pct + '%';
      resizeOrbitCanvas();
    });
  }
  if (mirrorEl) {
    mirrorEl.addEventListener('input', () => {
      orbitParams.mirror = parseInt(mirrorEl.value, 10);
      const v = document.getElementById('value-orbit-mirror');
      if (v) v.textContent = mirrorEl.value;
    });
  }
  if (modeEl) {
    modeEl.addEventListener('change', () => {
      orbitParams.mode = modeEl.value;
    });
  }
  if (shapeEl) {
    shapeEl.addEventListener('change', () => {
      orbitParams.shape = shapeEl.value;
    });
  }
  if (sizeEl) {
    sizeEl.addEventListener('input', () => {
      orbitParams.size = parseInt(sizeEl.value, 10);
      const v = document.getElementById('value-orbit-size');
      if (v) v.textContent = sizeEl.value;
    });
  }
  if (bgEl) {
    bgEl.addEventListener('input', () => {
      orbitParams.bg = bgEl.value;
    });
  }
  if (colorEl) {
    colorEl.addEventListener('input', () => {
      orbitParams.color = colorEl.value;
    });
  }
  if (randBtn) {
    randBtn.addEventListener('click', () => {
      // Randomize foreground and background colors only.
      const hue = random(360);
      const sat = random(40, 90);
      const lit = random(35, 65);
      const fg = hslToCss(hue, sat, lit);
      const bg = hslToCss(hue, sat * 0.2, 96);
      orbitParams.color = fg;
      orbitParams.bg = bg;
      if (colorEl) colorEl.value = fg;
      if (bgEl) bgEl.value = bg;
    });
  }

  if (wrapEl) {
    wrapEl.addEventListener('change', () => {
      orbitParams.wrap = wrapEl.value;
    });
  }

  const updateSelectedLabel = () => {
    if (!selLabel) return;
    selLabel.textContent = orbitSelected >= 0 ? `Shape #${orbitSelected + 1}` : 'None';
  };

  const syncSelectedControls = () => {
    const s = orbitShapes[orbitSelected];
    if (!s) return;
    if (selSizeEl) {
      const v = Math.round(orbitParams.size * (s.sizeFactor || 1));
      selSizeEl.value = constrain(v, parseInt(selSizeEl.min, 10), parseInt(selSizeEl.max, 10));
      const out = document.getElementById('value-orbit-selected-size');
      if (out) out.textContent = selSizeEl.value;
    }
    if (selSpeedEl) {
      const v = (s.speedFactor || 1);
      selSpeedEl.value = Math.round(v * 100);
      const out = document.getElementById('value-orbit-selected-speed');
      if (out) out.textContent = (v.toFixed(2) + 'x');
    }
    if (selModeEl) {
      selModeEl.value = s.modeOverride || 'inherit';
    }
    if (selFillEl) {
      selFillEl.checked = s.filled !== false;
    }
    if (selStrokeEl) {
      selStrokeEl.value = s.strokeW || 0;
      const out = document.getElementById('value-orbit-selected-stroke');
      if (out) out.textContent = selStrokeEl.value;
    }
  };

  if (selSizeEl) {
    selSizeEl.addEventListener('input', () => {
      const s = orbitShapes[orbitSelected];
      if (!s) return;
      const absSize = parseInt(selSizeEl.value, 10);
      s.sizeFactor = absSize / orbitParams.size;
      const out = document.getElementById('value-orbit-selected-size');
      if (out) out.textContent = selSizeEl.value;
    });
  }

  if (selSpeedEl) {
    selSpeedEl.addEventListener('input', () => {
      const s = orbitShapes[orbitSelected];
      if (!s) return;
      const pct = parseInt(selSpeedEl.value, 10); // 25–400
      s.speedFactor = pct / 100;
      const out = document.getElementById('value-orbit-selected-speed');
      if (out) out.textContent = (s.speedFactor.toFixed(2) + 'x');
    });
  }

  if (selModeEl) {
    selModeEl.addEventListener('change', () => {
      const s = orbitShapes[orbitSelected];
      if (!s) return;
      const v = selModeEl.value;
      s.modeOverride = v === 'inherit' ? null : v;
    });
  }

  if (selFillEl) {
    selFillEl.addEventListener('change', () => {
      const s = orbitShapes[orbitSelected];
      if (!s) return;
      s.filled = selFillEl.checked;
    });
  }

  if (selStrokeEl) {
    selStrokeEl.addEventListener('input', () => {
      const s = orbitShapes[orbitSelected];
      if (!s) return;
      s.strokeW = parseInt(selStrokeEl.value, 10) || 0;
      const out = document.getElementById('value-orbit-selected-stroke');
      if (out) out.textContent = selStrokeEl.value;
    });
  }

  updateSelectedLabel();
  syncSelectedControls();
}

function hslToCss(h, s, l) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function mousePressed() {
  const container = document.getElementById('orbit-canvas');
  if (!container) return;
  const bounds = container.getBoundingClientRect();
  const mx = mouseX;
  const my = mouseY;
  if (mx < 0 || my < 0 || mx > width || my > height) return;

  let closest = -1;
  let closestDist = Infinity;
  for (let i = 0; i < orbitShapes.length; i++) {
    const s = orbitShapes[i];
    const d = dist(mx, my, s.x, s.y);
    const radius = (orbitParams.size * (s.sizeFactor || 1)) * 0.7;
    if (d < radius && d < closestDist) {
      closestDist = d;
      closest = i;
    }
  }
  if (closest !== -1) {
    orbitSelected = closest;
    const selLabel = document.getElementById('label-selected-index');
    if (selLabel) {
      selLabel.textContent = `Shape #${orbitSelected + 1}`;
    }
    // Sync selected controls with this shape
    const s = orbitShapes[orbitSelected];
    if (s) {
      const selSizeEl = document.getElementById('orbit-selected-size');
      const selSpeedEl = document.getElementById('orbit-selected-speed');
      const selModeEl = document.getElementById('orbit-selected-mode');
      const selFillEl = document.getElementById('orbit-selected-fill');
      const selStrokeEl = document.getElementById('orbit-selected-stroke');
      if (selSizeEl) {
        const v = Math.round(orbitParams.size * (s.sizeFactor || 1));
        selSizeEl.value = v;
        const out = document.getElementById('value-orbit-selected-size');
        if (out) out.textContent = selSizeEl.value;
      }
      if (selSpeedEl) {
        const v = (s.speedFactor || 1);
        selSpeedEl.value = Math.round(v * 100);
        const out = document.getElementById('value-orbit-selected-speed');
        if (out) out.textContent = v.toFixed(2) + 'x';
      }
      if (selModeEl) {
        selModeEl.value = s.modeOverride || 'inherit';
      }
      if (selFillEl) {
        selFillEl.checked = s.filled !== false;
      }
      if (selStrokeEl) {
        selStrokeEl.value = s.strokeW || 0;
        const out = document.getElementById('value-orbit-selected-stroke');
        if (out) out.textContent = selStrokeEl.value;
      }
    }
  }
}

function draw() {
  background(orbitParams.bg);
  const t = millis() / 1000;
  const baseSpeed = orbitParams.speed / 200;

  // Draw artboard stroke
  push();
  noFill();
  stroke('#111');
  strokeWeight(1);
  rectMode(CORNER);
  rect(0.5, 0.5, width - 1, height - 1);
  pop();

  for (let i = 0; i < orbitShapes.length; i++) {
    const s = orbitShapes[i];
    updateShapePosition(s, t, baseSpeed, i);
    const isSelected = i === orbitSelected;
    drawMirroredShape(s.x, s.y, isSelected, s);
  }
}

function updateShapePosition(s, t, baseSpeed, idx) {
  const globalMode = orbitParams.mode;
  let mode = globalMode;
  if (s.modeOverride) {
    mode = s.modeOverride;
  } else if (globalMode === 'mixed') {
    mode = ['horizontal', 'vertical', 'diagonal', 'orbit'][idx % 4];
  }

  const sp = baseSpeed * (1 + (idx % 7) * 0.15) * (s.speedFactor || 1);

  if (mode === 'orbit') {
    const localAngle = s.angle + t * sp * s.dir * TWO_PI;
    const r = s.radius;
    s.x = width / 2 + cos(localAngle) * r;
    s.y = height / 2 + sin(localAngle) * r;
  } else {
    if (mode === 'horizontal') {
      s.x += s.vx * sp * 120;
    } else if (mode === 'vertical') {
      s.y += s.vy * sp * 120;
    } else if (mode === 'diagonal') {
      s.x += s.vx * sp * 100;
      s.y += s.vy * sp * 100;
    }
    // Wrap around edges.
    const margin = orbitParams.size * (s.sizeFactor || 1);
    if (orbitParams.wrap === 'wrap') {
      if (s.x < -margin) s.x = width + margin;
      if (s.x > width + margin) s.x = -margin;
      if (s.y < -margin) s.y = height + margin;
      if (s.y > height + margin) s.y = -margin;
    } else {
      // bounce
      if (s.x < margin || s.x > width - margin) s.vx *= -1;
      if (s.y < margin || s.y > height - margin) s.vy *= -1;
      s.x = constrain(s.x, margin, width - margin);
      s.y = constrain(s.y, margin, height - margin);
    }
  }
}

function drawMirroredShape(x, y, isSelected, shapeObj) {
  const m = orbitParams.mirror || 1;
  const positions = [{ x, y }];
  if (m >= 2) positions.push({ x: width - x, y });
  if (m >= 3) positions.push({ x, y: height - y });
  if (m >= 4) positions.push({ x: width - x, y: height - y });

  positions.forEach((p) => {
    if (isSelected) {
      stroke(orbitParams.color);
      strokeWeight(2);
      noFill();
      const pad = orbitParams.size * 0.6;
      rectMode(CENTER);
      rect(p.x, p.y, orbitParams.size + pad, orbitParams.size + pad);
      noStroke();
    }
    drawOrbitShape(p.x, p.y, shapeObj);
  });
}

function pickShapeForIndex() {
  if (orbitParams.shape !== 'mixed') return orbitParams.shape;
  const options = ['circle', 'square', 'triangle'];
  return random(options);
}

function drawOrbitShape(x, y, shapeObj) {
  const baseSize = orbitParams.size;
  const kind = pickShapeForIndex();

  const sizeFactor = shapeObj && shapeObj.sizeFactor ? shapeObj.sizeFactor : 1;
  const strokeW = shapeObj && typeof shapeObj.strokeW === 'number' ? shapeObj.strokeW : 0;
  const filled = !shapeObj || shapeObj.filled !== false;
  const sz = baseSize * sizeFactor;

  if (strokeW > 0) {
    stroke(orbitParams.color);
    strokeWeight(strokeW);
  } else {
    noStroke();
  }

  if (filled) {
    fill(orbitParams.color);
  } else {
    noFill();
  }

  if (kind === 'square') {
    rectMode(CENTER);
    rect(x, y, sz, sz);
  } else if (kind === 'triangle') {
    const h = sz * 1.15;
    triangle(
      x,
      y - h / 2,
      x - sz / 2,
      y + h / 2,
      x + sz / 2,
      y + h / 2
    );
  } else {
    circle(x, y, sz);
  }
}

