if (typeof GeneratorSystem === 'undefined') {
  throw new Error('GeneratorSystem is missing. Load generators/generators.js before game.js.');
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const screens = $$('.screen');

const ui = {
  stubs: $('#stubs'),
  glow: $('#glow'),
  balls: $('#balls'),
  weaponLv: $('#weaponLv'),
  beatLv: $('#beatLv'),
  runCrew: $('#runCrew'),
  runProgress: $('#runProgress'),
  phase: $('#phaseLabel'),
  overlay: $('#gameOverlay'),
  statsList: $('#statsList'),
  crewList: $('#crewList'),
  shopResult: $('#shopResult'),
  festivalProgress: $('#festivalProgress')
};

const defaultState = {
  stubs: 0,
  glow: 0,
  balls: 0,
  bestStage: 0,
  stats: {
    damage: 1,
    health: 1,
    crit: 1
  },
  crew: [
    { id: 'animal', name: 'Animal', role: 'Drummer', emoji: '🥁', level: 1, unlocked: true },
    { id: 'echo', name: 'Echo', role: 'Vocalist', emoji: '🎤', level: 1, unlocked: true },
    { id: 'lux', name: 'Lux', role: 'Lighting Tech', emoji: '💡', level: 1, unlocked: true }
  ]
};

let state =
  JSON.parse(localStorage.getItem('np_alpha01') || 'null') ||
  JSON.parse(JSON.stringify(defaultState));

function save() {
  localStorage.setItem('np_alpha01', JSON.stringify(state));
  refreshMeta();
  renderMenus();
}

function refreshMeta() {
  ui.stubs.textContent = state.stubs;
  ui.glow.textContent = state.glow;
  ui.balls.textContent = state.balls;
}

function show(id) {
  screens.forEach(x => x.classList.remove('active'));
  $('#' + id).classList.add('active');
  if (id === 'gameScreen') resize();
}

$$('.navCard').forEach(b => {
  b.onclick = () => show(b.dataset.open);
});

$$('.back').forEach(b => {
  b.onclick = () => show('menu');
});

$('#playBtn').onclick = () => {
  show('gameScreen');
  startRun();
};

function renderMenus() {
  const stats = [
    ['Damage', 'damage', '+8% starting damage per level', '🎤'],
    ['Health', 'health', '+10 starting HP per level', '❤️'],
    ['Crit', 'crit', '+1.5% starting crit chance per level', '💥']
  ];

  ui.statsList.innerHTML = stats.map(([name, key, desc, ico]) => {
    const lv = state.stats[key];
    const cost = 40 + lv * 25;

    return `
      <div class="card statRow">
        <div class="row">
          <div class="avatar">${ico}</div>
          <div class="grow">
            <b>${name} Lv ${lv}</b>
            <div class="tiny muted">${desc}</div>
          </div>
          <button class="secondary" onclick="buyStat('${key}',${cost})">${cost} 🎟</button>
        </div>
      </div>
    `;
  }).join('');

  ui.crewList.innerHTML = state.crew.map(c => {
    const cost = 25 + c.level * 15;

    return `
      <div class="card crewRow">
        <div class="row">
          <div class="avatar">${c.emoji}</div>
          <div class="grow">
            <b>${c.name}</b>
            <span class="badge">${c.role}</span>
            <div class="tiny muted">Permanent Lv ${c.level}</div>
          </div>
        </div>

        <div style="height:8px"></div>

        <div class="grid">
          <button class="secondary" onclick="renameCrew('${c.id}')">✏️ Rename</button>
          <button class="secondary" onclick="upgradeCrew('${c.id}',${cost})">${cost} ✨</button>
        </div>
      </div>
    `;
  }).join('');

  const festivals = [
    ['Basement Rave', 0, '🪩'],
    ['Warehouse Rave', 3, '🏭'],
    ['Neon Harbor', 6, '🌊'],
    ['Electric Forest', 10, '🌲'],
    ['Desert Pulse', 15, '🏜️']
  ];

  ui.festivalProgress.innerHTML = festivals.map(([name, req, ico]) => `
    <div class="card festivalRow" style="opacity:${state.bestStage >= req ? 1 : .45}">
      <b>${ico} ${name}</b>
      <div class="tiny muted">
        ${state.bestStage >= req ? 'Reached' : 'Reach stage ' + req + ' to unlock'}
      </div>
    </div>
  `).join('');
}

window.buyStat = (key, cost) => {
  if (state.stubs < cost) return alert('Not enough Ticket Stubs.');
  state.stubs -= cost;
  state.stats[key]++;
  save();
};

window.renameCrew = id => {
  const c = state.crew.find(x => x.id === id);
  const n = prompt('Rename ' + c.role, c.name);

  if (n && n.trim()) {
    c.name = n.trim().slice(0, 18);
    save();
  }
};

window.upgradeCrew = (id, cost) => {
  if (state.glow < cost) return alert('Not enough Glow Sticks.');
  state.glow -= cost;
  state.crew.find(x => x.id === id).level++;
  save();
};

$('#buyBall').onclick = () => {
  if (state.stubs < 75) return alert('You need 75 Ticket Stubs.');

  state.stubs -= 75;
  state.balls++;

  const roll = Math.random();
  let msg = '';

  if (roll < .38) {
    const n = 50 + Math.floor(Math.random() * 76);
    state.stubs += n;
    msg = `🎟 ${n} Ticket Stubs`;
  } else if (roll < .68) {
    const n = 15 + Math.floor(Math.random() * 31);
    state.glow += n;
    msg = `✨ ${n} Glow Sticks`;
  } else if (roll < .88) {
    msg = '👕 Merch Drop: Neon Warehouse Hoodie';
  } else {
    const c = state.crew[Math.floor(Math.random() * state.crew.length)];
    c.level++;
    msg = `⭐ Crew Upgrade: ${c.name} +1 Level`;
  }

  ui.shopResult.innerHTML = `
    <div class="card reward">
      <h3>🪩 DISCO BALL OPENED</h3>
      <p style="color:white">${msg}</p>
    </div>
  `;

  save();
};

const canvas = $('#game');
const ctx = canvas.getContext('2d');

let W = 0;
let H = 0;
let dpr = 1;
let last = 0;
let raf = 0;
let active = false;
let paused = false;
let pointer = null;

const player = {
  x: 0,
  y: 0,
  r: 18
};

let enemies = [];
let shots = [];
let gates = [];
let targets = [];
let run = {};

function resize() {
  const r = canvas.getBoundingClientRect();

  W = r.width;
  H = r.height;
  dpr = Math.min(2, devicePixelRatio || 1);

  canvas.width = W * dpr;
  canvas.height = H * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  player.y = H * .82;
  if (!player.x) player.x = W / 2;
}

addEventListener('resize', resize);

canvas.addEventListener('pointerdown', e => {
  pointer = e.clientX;
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', e => {
  if (pointer !== null) pointer = e.clientX;
});

canvas.addEventListener('pointerup', () => {
  pointer = null;
});

function startRun() {
  resize();

  run = {
    stage: 0,
    progress: 0,
    phase: 'run',
    weaponLv: 1,
    beats: 0,
    beatBonus: 'Local',
    stubs: 0,
    glow: 0,

    hp: 100 + (state.stats.health - 1) * 10,
    maxHp: 100 + (state.stats.health - 1) * 10,
    damage: 12 * (1 + (state.stats.damage - 1) * .08),
    crit: .05 + (state.stats.crit - 1) * .015,

    crew: [],
    gateClock: 0,
    enemyClock: 0,
    fireClock: 0,
    distance: 0,
    progressionDone: 0
  };

  enemies = [];
  shots = [];
  gates = [];
  targets = [];

  player.x = W / 2;

  paused = true;
  active = true;

  updateHud();

  showOverlay(`
    <div class="card">
      <div class="tiny muted">FESTIVAL 1</div>
      <h2>🪩 Basement Rave</h2>
      <p>
        Pick tracks, level your mic, build Beats, collect rewards,
        then break through the progression zone.
      </p>
      <button class="primary" onclick="resumeRun()">START SET</button>
    </div>
  `);

  last = performance.now();

  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

window.resumeRun = () => {
  ui.overlay.classList.add('hidden');
  paused = false;
  last = performance.now();
};

function showOverlay(html) {
  ui.overlay.innerHTML = html;
  ui.overlay.classList.remove('hidden');
  paused = true;
}

function spawnTrackChoice() {
  if (gates.length) return;

  const opts = [
    { type: 'weapon', name: 'SOUND CHECK', sub: '+1 Weapon Level', emoji: '🎛️' },
    { type: 'beats', name: 'SPEAKERS', sub: '+1 Beat', emoji: '🔊' },
    { type: 'stubs', name: 'STUB PILE', sub: '+ Ticket Stubs', emoji: '🎟' },
    { type: 'glow', name: 'GLOW PILE', sub: '+ Glow Sticks', emoji: '✨' },
    { type: 'crew', name: 'CREW', sub: '+1 Crew', emoji: '👥' }
  ]
    .sort(() => Math.random() - .5)
    .slice(0, 2);

  gates = [
    { x: W * .28, y: -95, w: 130, h: 82, ...opts[0] },
    { x: W * .72, y: -95, w: 130, h: 82, ...opts[1] }
  ];
}

function useGate(g) {
  gates = [];

  if (g.type === 'weapon') run.weaponLv++;

  if (g.type === 'beats') {
    run.beats++;
    updateBeatBonus();
  }

  if (g.type === 'stubs') {
    run.stubs += 20 + run.beats * 6;
  }

  if (g.type === 'glow') {
    run.glow += 8 + run.beats * 3;
  }

  if (g.type === 'crew') {
    chooseCrew();
  }

  updateHud();
}

function updateBeatBonus() {
  const b = run.beats;

  run.beatBonus =
    b < 3 ? 'Local' :
    b < 6 ? 'Club' :
    b < 9 ? 'Festival' :
    b < 13 ? 'Headliner' :
    'Iconic';
}

function chooseCrew() {
  const buttons = state.crew.map(c => `
    <button class="choice" onclick="pickCrew('${c.id}')">
      <b>${c.emoji} ${c.name}</b>
      <small>${c.role} • permanent Lv ${c.level}</small>
    </button>
  `).join('');

  showOverlay(`
    <div class="card">
      <h2>👥 Choose Crew</h2>
      <p>Your selected crew joins this run.</p>
      <div class="choiceGrid">${buttons}</div>
    </div>
  `);
}

window.pickCrew = id => {
  if (run.crew.length < 3) {
    run.crew.push(id);
  } else {
    run.crew[Math.floor(Math.random() * run.crew.length)] = id;
  }

  ui.overlay.classList.add('hidden');
  paused = false;
  updateHud();
};

function beginProgression() {
  run.phase = 'progression';
  run.progressionDone = 0;
  run.generatorRows = 8;

  gates = [];
  enemies = [];
  targets = [];

  for (let i = 0; i < 3; i++) {
    targets.push({
      kind: 'merch',
      x: W * (.25 + i * .25),
      y: -160 - i * 240,
      r: 24,
      hp: 30,
      max: 30,
      emoji: '📦',
      dead: false
    });
  }

  const lanePositions = [
    W * .26,
    W * .42,
    W * .58,
    W * .74
  ];

  const rowGap = 300;

  for (let row = 0; row < 8; row++) {
    for (const x of lanePositions) {
      targets.push(
        GeneratorSystem.create(
          row,
          x,
          -520 - row * rowGap,
          run.beats
        )
      );
    }
  }

  updateHud();
}

function rewardTarget(t) {
  if (t.kind === 'merch') {
    const roll = Math.random();

    if (roll < .45) {
      run.stubs += 30 + run.beats * 5;
    } else if (roll < .8) {
      run.glow += 12 + run.beats * 2;
    } else {
      state.balls++;
    }
  } else {
    const roll = Math.random();

    if (roll < .35) {
      run.stubs += 45 + run.stage * 10;
    } else if (roll < .6) {
      run.glow += 18 + run.stage * 3;
    } else if (roll < .66) {
      state.balls++;
    }
  }
}

function finishStage() {
  run.stage++;

  state.bestStage = Math.max(state.bestStage, run.stage);
  state.stubs += run.stubs;
  state.glow += run.glow;

  run.stubs = 0;
  run.glow = 0;

  save();

  const festival =
    run.stage < 3 ? 'Basement Rave' :
    run.stage < 6 ? 'Warehouse Rave' :
    run.stage < 10 ? 'Neon Harbor' :
    'Electric Forest';

  showOverlay(`
    <div class="card">
      <div class="tiny muted">STAGE CLEARED</div>
      <h2>🎪 ${festival}</h2>
      <p>You pushed deeper into the festival circuit.</p>

      <div class="card" style="margin-bottom:10px">
        <b>Career Progress: Stage ${run.stage}</b>
        <div class="tiny muted">Best: ${state.bestStage}</div>
      </div>

      <button class="primary" onclick="nextStage()">NEXT STAGE</button>
    </div>
  `);
}

window.nextStage = () => {
  run.phase = 'run';
  run.distance = 0;
  run.gateClock = 0;
  run.enemyClock = 0;
  run.progressionDone = 0;

  targets = [];

  ui.overlay.classList.add('hidden');
  paused = false;

  updateHud();
};

function die() {
  active = false;
  paused = true;

  state.stubs += run.stubs;
  state.glow += run.glow;
  state.bestStage = Math.max(state.bestStage, run.stage);

  save();

  showOverlay(`
    <div class="card">
      <h2>💀 SET OVER</h2>

      <p>
        You made it to Stage ${run.stage}.
        Current-run upgrades reset; permanent stats stay.
      </p>

      <div class="grid">
        <div class="card"><b>🎟 +${run.stubs}</b></div>
        <div class="card"><b>✨ +${run.glow}</b></div>
      </div>

      <div style="height:10px"></div>

      <button class="primary" onclick="backToMenu()">RETURN TO HUB</button>
    </div>
  `);
}

window.backToMenu = () => {
  ui.overlay.classList.add('hidden');
  show('menu');
  renderMenus();
  refreshMeta();
};

function spawnEnemy() {
  const hp = 20 + run.stage * 8;

  enemies.push({
    x: 30 + Math.random() * (W - 60),
    y: -35,
    r: 16,
    hp,
    max: hp,
    speed: 88 + run.stage * 5
  });
}

function fire() {
  const target = [
    ...targets.filter(t => !t.dead),
    ...enemies.filter(e => !e.dead)
  ]
    .sort((a, b) =>
      Math.hypot(player.x - a.x, player.y - a.y) -
      Math.hypot(player.x - b.x, player.y - b.y)
    )[0];

  if (!target) return;

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const l = Math.hypot(dx, dy) || 1;

  shots.push({
    x: player.x,
    y: player.y - 12,
    vx: dx / l * 760,
    vy: dy / l * 760,
    r: 7,
    life: 1.3,
    dmg: run.damage * (1 + .18 * (run.weaponLv - 1)),
    emoji:
      run.weaponLv < 3 ? '🎤' :
      run.weaponLv < 5 ? '🥁' :
      '💿'
  });

  run.crew.forEach((id, i) => {
    const c = state.crew.find(x => x.id === id);

    const angle = (i - (run.crew.length - 1) / 2) * .15;
    const cs = Math.cos(angle);
    const sn = Math.sin(angle);

    const vx =
      (dx / l * 690) * cs -
      (dy / l * 690) * sn;

    const vy =
      (dx / l * 690) * sn +
      (dy / l * 690) * cs;

    shots.push({
      x: player.x + (i - (run.crew.length - 1) / 2) * 14,
      y: player.y + 14,
      vx,
      vy,
      r: 5,
      life: 1.2,
      dmg: run.damage * (.28 + c.level * .05),
      emoji: c.emoji
    });
  });
}

function updateHud() {
  ui.weaponLv.textContent = run.weaponLv;
  ui.beatLv.textContent = run.beats;
  ui.runCrew.textContent = run.crew.length;

  ui.phase.textContent =
    run.phase === 'run'
      ? 'RUN • ' + run.beatBonus.toUpperCase()
      : 'PROGRESSION ZONE';

  const progressionTotal = Math.max(1, targets.length);

  ui.runProgress.style.width =
    Math.min(
      100,
      (
        run.phase === 'run'
          ? run.distance / 38
          : run.progressionDone / progressionTotal
      ) * 100
    ) + '%';
}

function update(dt) {
  if (pointer !== null) {
    player.x +=
      Math.sign(pointer - player.x) *
      Math.min(Math.abs(pointer - player.x), 430 * dt);
  }

  player.x = Math.max(24, Math.min(W - 24, player.x));

  run.fireClock -= dt;

  if (run.fireClock <= 0) {
    fire();
    run.fireClock = .46;
  }

  if (run.phase === 'run') {
    run.distance += dt;
    run.gateClock += dt;
    run.enemyClock -= dt;

    if (run.enemyClock <= 0) {
      spawnEnemy();
      run.enemyClock = .8;
    }

    if (run.gateClock > 6) {
      run.gateClock = 0;
      spawnTrackChoice();
    }

    if (run.distance > 38) {
      beginProgression();
    }
  } else {
    for (const t of targets) {
      t.y += 112 * dt;
    }

    for (const t of targets) {
      if (t.dead) continue;

      if (
        t.kind === 'gen' &&
        GeneratorSystem.playerCollides(t, player)
      ) {
        die();
        return;
      }

      if (
        t.kind === 'merch' &&
        Math.hypot(player.x - t.x, player.y - t.y) <
        player.r + t.r
      ) {
        die();
        return;
      }
    }

    if (targets.length && targets.every(t => t.dead)) {
      finishStage();
    }
  }

  for (const g of gates) {
    g.y += 125 * dt;
  }

  for (const e of enemies) {
    e.y += e.speed * dt;
  }

  for (const s of shots) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
  }

  for (const s of shots) {
    if (s.life <= 0) continue;

    for (const t of [...targets, ...enemies]) {
      if (t.dead) continue;

      const hit =
        t.kind === 'gen'
          ? GeneratorSystem.shotCollides(t, s)
          : Math.hypot(s.x - t.x, s.y - t.y) < s.r + t.r;

      if (!hit) continue;

      t.hp -= s.dmg * (Math.random() < run.crit ? 2 : 1);
      s.life = 0;

      if (t.hp <= 0) {
        t.dead = true;

        if (targets.includes(t)) {
          run.progressionDone++;
          rewardTarget(t);
        }
      }

      break;
    }
  }

  for (const e of enemies) {
    if (
      !e.dead &&
      Math.hypot(player.x - e.x, player.y - e.y) <
      player.r + e.r
    ) {
      e.dead = true;
      run.hp -= 18;

      if (run.hp <= 0) {
        die();
        return;
      }
    }
  }

  for (const g of gates) {
    if (
      g.y + g.h / 2 > player.y - player.r &&
      g.y - g.h / 2 < player.y + player.r &&
      Math.abs(player.x - g.x) < g.w / 2
    ) {
      useGate(g);
      break;
    }

    if (g.y > H + 120) {
      gates = [];
    }
  }

  enemies = enemies.filter(
    e => !e.dead && e.y < H + 60
  );

  shots = shots.filter(
    s => s.life > 0
  );

  targets = targets.filter(
    t => !(t.dead && t.y > H + 50)
  );

  updateHud();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  const grd = ctx.createLinearGradient(0, 0, 0, H);

  grd.addColorStop(0, '#191440');
  grd.addColorStop(.55, '#0a0d1b');
  grd.addColorStop(1, '#05060b');

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#35dbff22';
  ctx.lineWidth = 1;

  for (let i = 0; i < 12; i++) {
    const y =
      (i * 90 + (performance.now() / 8) % 90) - 90;

    ctx.beginPath();
    ctx.moveTo(W * .18, y);
    ctx.lineTo(W * .82, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#ff3eb534';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(W * .18, 0);
  ctx.lineTo(W * .08, H);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W * .82, 0);
  ctx.lineTo(W * .92, H);
  ctx.stroke();

  for (const g of gates) {
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#35dbff';
    ctx.strokeStyle = '#35dbff';
    ctx.lineWidth = 4;

    ctx.strokeRect(
      g.x - g.w / 2,
      g.y - g.h / 2,
      g.w,
      g.h
    );

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = '900 16px Arial';

    ctx.fillText(
      g.emoji + ' ' + g.name,
      g.x,
      g.y - 4
    );

    ctx.font = '800 11px Arial';
    ctx.fillStyle = '#d7def7';

    ctx.fillText(
      g.sub,
      g.x,
      g.y + 17
    );
  }

  ctx.textAlign = 'center';

  for (const t of targets) {
    if (t.dead) continue;

    if (t.kind === 'gen') {
      GeneratorSystem.draw(ctx, t);
      continue;
    }

    ctx.font = '28px Arial';
    ctx.fillText(t.emoji, t.x, t.y + 8);

    ctx.fillStyle = '#ffffff20';
    ctx.fillRect(
      t.x - 28,
      t.y - t.r - 10,
      56,
      5
    );

    ctx.fillStyle = '#63efa5';
    ctx.fillRect(
      t.x - 28,
      t.y - t.r - 10,
      56 * (t.hp / t.max),
      5
    );
  }

  for (const e of enemies) {
    ctx.beginPath();
    ctx.fillStyle = '#191d35';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff3eb5';

    ctx.arc(
      e.x,
      e.y,
      e.r,
      0,
      Math.PI * 2
    );

    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = '17px Arial';
    ctx.fillText('👾', e.x, e.y + 6);
  }

  for (const s of shots) {
    ctx.font = (s.r > 6 ? '20px' : '17px') + ' Arial';
    ctx.fillText(s.emoji, s.x, s.y);
  }

  run.crew?.forEach((id, i) => {
    const c = state.crew.find(x => x.id === id);

    ctx.font = '18px Arial';

    ctx.fillText(
      c.emoji,
      player.x +
      (i - (run.crew.length - 1) / 2) * 28,
      player.y + 39
    );
  });

  ctx.beginPath();
  ctx.fillStyle = '#35dbff';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#35dbff';

  ctx.arc(
    player.x,
    player.y,
    player.r + 4,
    0,
    Math.PI * 2
  );

  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.fillStyle = '#18172f';

  ctx.arc(
    player.x,
    player.y,
    player.r,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.font = '21px Arial';

  ctx.fillText(
    '🎧',
    player.x,
    player.y + 7
  );

  if (run.hp) {
    ctx.fillStyle = '#ffffff20';

    ctx.fillRect(
      player.x - 31,
      player.y + 25,
      62,
      5
    );

    ctx.fillStyle = '#ff5f79';

    ctx.fillRect(
      player.x - 31,
      player.y + 25,
      62 * (run.hp / run.maxHp),
      5
    );
  }
}

function loop(now) {
  const dt = Math.min(
    .033,
    (now - last) / 1000 || 0
  );

  last = now;

  if (
    $('#gameScreen').classList.contains('active') &&
    active &&
    !paused
  ) {
    update(dt);
  }

  if (
    $('#gameScreen').classList.contains('active')
  ) {
    draw();
  }

  raf = requestAnimationFrame(loop);
}

refreshMeta();
renderMenus();
resize();

raf = requestAnimationFrame(loop);
