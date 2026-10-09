import './style.css';

// Roblox Rivals Aim Training // RANGE Precision Engine & Blue Interface
(function () {
  "use strict";

  // ==================== DATA CONFIGURATION ====================
  const MODES = [
    { id: 'standing', name: 'Standing Dummies', cat: 'dummies', desc: 'Static articulated human dummies with precision headshot zones. Snap cleanly between targets.' },
    { id: 'moving', name: 'Moving Dummies', cat: 'dummies', desc: 'Dummies strafe across range lanes. Track dynamic movement and click the head for instant bonus.' },
    { id: 'strafeduel', name: 'Strafe Duel 1v1', cat: 'dummies', desc: 'High-speed duel against an erratic strafing dummy simulating competitive Roblox Rivals movement.' },
    { id: 'gridshot', name: 'Gridshot 6-Target', cat: 'clicking', desc: 'Fast tactical circular targets scattered across range. Clear targets and trigger immediate respawns.' },
    { id: 'flick', name: 'Flick Precision', cat: 'clicking', desc: 'Single targets spawn at random positions with decay timers. React rapidly before expiration.' },
    { id: 'reflex360', name: 'Reflex Snap 360', cat: 'clicking', desc: 'Wide-angle peripheral targets appearing across range sightlines to train full-arm snap acquisition.' },
    { id: 'tracking', name: 'Smooth Tracking', cat: 'tracking', desc: 'Keep reticle smoothly centered on a wandering sphere. Earn continuous score while holding on target.' },
    { id: 'orbit', name: 'Micro-Orbit Tracking', cat: 'tracking', desc: 'High-frequency orbital tracking drill requiring tight circular micro-adjustments.' },
    { id: 'headshot', name: 'Headshot Gauntlet', cat: 'dummies', desc: 'Sequential solitary dummies appearing across lanes. Pure headshot speed and snap accuracy.' },
    { id: 'headspeed', name: 'Headshot Speedrun', cat: 'dummies', desc: 'Rapid-fire solitary dummy headshots with accelerated respawns and precision twitch snapping.' },
    { id: 'microshot', name: 'Microshot Flicks', cat: 'clicking', desc: 'Ultra-small micro targets requiring fine sensor control and subtle wrist adjustments.' },
    { id: 'targetstorm', name: 'Target Storm', cat: 'clicking', desc: 'Swarm of floating reactive targets occupying the 3D space simultaneously.' },
    { id: 'dualtracking', name: 'Dual Tracking', cat: 'tracking', desc: 'Two targets orbit with varying velocities. Track either sphere to continuously stack DPS.' },
    { id: 'headsonly', name: 'Headshots Only', cat: 'dummies', desc: 'Four dummies active across lanes, but ONLY direct headshots register. Body shots count as misses.' }
  ];

  const WEAPONS = {
    sniper: {
      id: 'sniper',
      name: 'Sniper',
      type: 'Semi-Automatic Rifle',
      desc: 'High-caliber precision sniper rifle. Headshots deliver 150 damage, immediately neutralizing full-health dummies in one shot.',
      body: 50,
      head: 150,
      auto: false,
      interval: 650,
      info: '50 body · 150 head · 1-shot headshot'
    },
    ar: {
      id: 'ar',
      name: 'Assault Rifle',
      type: 'Full-Automatic Rifle',
      desc: 'Rapid-fire automatic rifle. Hold left-click to sustain a continuous bullet stream for tracking strafing targets.',
      body: 12,
      head: 15,
      auto: true,
      interval: 100,
      info: '12 body · 15 head · continuous fire'
    }
  };

  const GAME_PRESETS = {
    roblox: { sens: 55, dpi: 800, fov: 103, robloxMult: 0.5 },
    valorant: { sens: 0.35, dpi: 800, fov: 103, robloxMult: 1.0 },
    cs2: { sens: 1.15, dpi: 800, fov: 106, robloxMult: 1.0 },
    overwatch: { sens: 4.0, dpi: 800, fov: 103, robloxMult: 1.0 },
    fortnite: { sens: 7.5, dpi: 800, fov: 103, robloxMult: 1.0 }
  };

  const DIFF = {
    easy: { sizeMul: 1.25, speedMul: 0.72, lifeMs: 1700 },
    normal: { sizeMul: 1.0, speedMul: 1.0, lifeMs: 1200 },
    hard: { sizeMul: 0.78, speedMul: 1.35, lifeMs: 850 }
  };

  const BASE_RAD_PER_COUNT = 0.0066;
  const HS_KEY = 'rangeaim_highscores_v3';
  const HISTORY_KEY = 'rangeaim_history_v3';
  const BADGES_KEY = 'rangeaim_badges_v3';

  // Structured Training Routines & Playlists
  const ROUTINES = {
    ranked: {
      id: 'ranked',
      name: 'Rivals Ranked Warmup',
      drills: [
        { mode: 'gridshot', dur: 30, wep: 'sniper' },
        { mode: 'moving', dur: 30, wep: 'sniper' },
        { mode: 'standing', dur: 30, wep: 'sniper' }
      ]
    },
    sniper: {
      id: 'sniper',
      name: 'Sniper Quickscope Specialist',
      drills: [
        { mode: 'standing', dur: 30, wep: 'sniper' },
        { mode: 'headshot', dur: 30, wep: 'sniper' },
        { mode: 'microshot', dur: 30, wep: 'sniper' }
      ]
    },
    tracking: {
      id: 'tracking',
      name: 'Smooth Tracking & AR Spray',
      drills: [
        { mode: 'tracking', dur: 30, wep: 'ar' },
        { mode: 'dualtracking', dur: 30, wep: 'ar' }
      ]
    },
    reflex: {
      id: 'reflex',
      name: 'Iron Reflexes Gauntlet',
      drills: [
        { mode: 'flick', dur: 30, wep: 'sniper' },
        { mode: 'microshot', dur: 30, wep: 'sniper' },
        { mode: 'targetstorm', dur: 30, wep: 'ar' }
      ]
    }
  };

  const BADGES = [
    { id: 'first_blood', name: 'First Blood', desc: 'Complete your first training session in the range.', icon: '🎯' },
    { id: 'lightning_hands', name: 'Lightning Hands', desc: 'Achieve average reaction time below 200ms.', icon: '⚡' },
    { id: 'headshot_demon', name: 'Headshot Fiend', desc: 'Land 5 or more headshots in a single drill.', icon: '👑' },
    { id: 'century_marksman', name: 'Century Marksman', desc: 'Score over 1,000 points in any drill.', icon: '🏆' },
    { id: 'flawless_streak', name: 'Flawless Streak', desc: 'Achieve an uninterrupted hit streak of 10+.', icon: '🔥' },
    { id: 'range_veteran', name: 'Range Veteran', desc: 'Complete 5 or more training sessions.', icon: '🎖️' },
    { id: 'grandmaster_aim', name: 'Grandmaster Aim', desc: 'Reach 2,500 total XP score progression.', icon: '💎' }
  ];

  // ==================== STATE ====================
  let selectedMode = 'standing';
  let selectedWeapon = 'sniper';
  let selectedDuration = 30;
  let selectedDifficulty = 'normal';
  let activeTab = 'drills';
  let modeFilter = 'all';
  let searchQuery = '';

  let crosshairStyle = 'cross';
  let crosshairColor = '#38bdf8';
  let crosshairSize = 'medium';
  let crosshairOutline = true;
  let crosshairDot = false;
  let selectedSoundProfile = 'rivals';
  let soundPitchMultiplier = 1.0;
  let selectedTargetTheme = 'classic';

  const TARGET_THEMES = {
    classic: { outer: '#ff5b3e', mid: '#ff8a6e', inner: '#fff3ed', glow: 'rgba(255, 91, 62, 0.22)' },
    cyan: { outer: '#0284c7', mid: '#38bdf8', inner: '#f0f9ff', glow: 'rgba(56, 189, 248, 0.25)' },
    green: { outer: '#16a34a', mid: '#4ade80', inner: '#f0fdf4', glow: 'rgba(74, 222, 128, 0.25)' },
    ruby: { outer: '#e11d48', mid: '#f43f5e', inner: '#fff1f2', glow: 'rgba(244, 63, 94, 0.25)' },
    amber: { outer: '#d97706', mid: '#facc15', inner: '#fefce8', glow: 'rgba(250, 204, 21, 0.25)' }
  };

  let selectedScopeZoom = 2.5;

  let activeRoutine = null;
  let routineStepIndex = 0;
  let routineDrillResults = [];
  let routineCountdownTimer = null;

  // Real-time tracking accuracy telemetry
  let trackingTimeTotal = 0;
  let trackingTimeOnTarget = 0;
  let isTrackingOnTarget = false;

  let masterVolume = 0.75;
  let isMuted = false;

  let W = 0, H = 0, CX = 0, CY = 0, DPR = 1;
  let SENS = null, focalLength = 0;
  let yaw = 0, pitch = 0;
  let running = false, paused = true, sessionEnd = 0, lastFrame = 0;
  let hits = 0, misses = 0, score = 0, streak = 0, maxStreak = 0, headshots = 0, reactionTimes = [];
  let targets = [], lastSpawn = 0;
  let mouseDown = false, lastAutoShot = 0, shotFlashUntil = 0;
  let currentHealth = 150;

  // FPS tracking
  let fpsFrames = 0, lastFpsTime = 0, currentFps = 144;

  // ==================== DOM ELEMENTS ====================
  let canvas = document.getElementById('glCanvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  const crosshairEl = document.getElementById('crosshair');
  const hitmarkerEl = document.getElementById('hitmarker');
  const hitFlashEl = document.getElementById('hitFlash');
  const lockOverlay = document.getElementById('lockOverlay');
  const pauseModal = document.getElementById('pauseModal');
  const keybindsModal = document.getElementById('keybindsModal');

  // ==================== UTILITIES ====================
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function choice(a) { return a[Math.floor(Math.random() * a.length)]; }
  function distance(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }

  function getHighScores() {
    try { return JSON.parse(localStorage.getItem(HS_KEY)) || {}; } catch (e) { return {}; }
  }
  function setHighScore(mId, wId, v) {
    try {
      const hs = getHighScores();
      const k = mId + '_' + wId;
      if (!hs[k] || v > hs[k]) hs[k] = v;
      localStorage.setItem(HS_KEY, JSON.stringify(hs));
    } catch (e) {}
  }

  function getSessionHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; }
  }

  // Calculate genuine competitive earned EXP (Anti-cheat & Difficulty scaling)
  function calculateSessionExp(drillScore, accuracy, headshotPct, difficulty, durationSec, hitsCount) {
    if ((hitsCount || 0) < 3 || (durationSec && durationSec < 15 && durationSec !== null)) {
      return 0; // Anti-exploit / instant abort protection
    }

    // Base XP: scaled sensibly so 1500-2500 drill score gives ~120-200 base XP
    let base = Math.round(drillScore * 0.08);

    // Accuracy multiplier: rewarding precision snaps, penalizing spam
    let accMul = 1.0;
    if (accuracy >= 95) accMul = 1.35;
    else if (accuracy >= 85) accMul = 1.20;
    else if (accuracy >= 70) accMul = 1.05;
    else if (accuracy < 50) accMul = 0.65;
    else if (accuracy < 30) accMul = 0.35;

    // Headshot mastery bonus
    let hsMul = 1.0;
    if (headshotPct >= 80) hsMul = 1.30;
    else if (headshotPct >= 60) hsMul = 1.15;
    else if (headshotPct >= 40) hsMul = 1.05;

    // Difficulty factor: training on hard yields accelerated progression
    const diffMul = difficulty === 'hard' ? 1.4 : (difficulty === 'normal' ? 1.0 : 0.7);

    // Duration normalization (30s baseline)
    let durMul = 1.0;
    if (durationSec === 60) durMul = 1.75;
    else if (durationSec === 15) durMul = 0.55;
    else if (durationSec === null) durMul = Math.min(2.0, Math.max(0.6, (hitsCount || 10) / 25));

    let finalExp = Math.round(base * accMul * hsMul * diffMul * durMul);

    // Enforce rigorous competitive cap for 30s session so ranks remain difficult & prestigious
    if (durationSec === 30 && finalExp > 360) {
      finalExp = 360;
    }
    return Math.max(15, finalExp);
  }

  // Cleanly recalibrate legacy corrupted sessions (e.g. bugged 70,000 scores)
  function getCalibratedHistory() {
    const history = getSessionHistory();
    let modified = false;
    history.forEach(h => {
      // Fix legacy unscaled scores
      if (h.score > 5000) {
        h.score = Math.min(3200, Math.round(h.score * 0.04));
        modified = true;
      }
      if (!h.exp || h.exp > 1000) {
        const hsRatio = (h.hits && h.headshots) ? (h.headshots / h.hits) * 100 : 50;
        h.exp = calculateSessionExp(h.score, h.accuracy || 75, hsRatio, 'normal', 30, h.hits || 15);
        modified = true;
      }
    });
    if (modified) {
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) {}
    }
    return history;
  }

  function recordSession(entry) {
    try {
      const list = getSessionHistory();
      list.unshift(entry);
      if (list.length > 30) list.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      updateRankProgression();
      if (typeof checkAndUpdateDailyMissions === 'function') {
        checkAndUpdateDailyMissions(entry);
      }
    } catch (e) {}
  }

  // ==================== AUDIO SYNTHESIS & SOUND PROFILES ====================
  let actx = null;
  let audioAnalyser = null;
  let masterGainNode = null;

  function audioCtx() {
    if (!actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
        audioAnalyser = actx.createAnalyser();
        audioAnalyser.fftSize = 128;
        masterGainNode = actx.createGain();
        masterGainNode.gain.value = 1.0;
        masterGainNode.connect(audioAnalyser);
        audioAnalyser.connect(actx.destination);
      } catch (e) {}
    }
    return actx;
  }

  function beep(freq, dur, type, vol) {
    if (isMuted || masterVolume <= 0) return;
    const c = audioCtx();
    if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.value = (vol ?? 0.08) * masterVolume;
      o.connect(g);
      g.connect(masterGainNode || c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.stop(c.currentTime + dur);
    } catch (e) {}
  }

  // Atmospheric Cyber Synthesizer Ambience Engine
  let isAmbienceActive = false;
  let ambienceNodes = null;

  function toggleCyberAmbience() {
    const c = audioCtx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();

    const btn = document.getElementById('btnToggleAmbience');

    if (isAmbienceActive) {
      if (ambienceNodes && ambienceNodes.gain) {
        ambienceNodes.gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.5);
        setTimeout(() => {
          if (ambienceNodes) {
            ambienceNodes.oscs.forEach(o => { try { o.stop(); } catch (e) {} });
            ambienceNodes = null;
          }
        }, 550);
      }
      isAmbienceActive = false;
      if (btn) btn.classList.remove('active');
      showToast('Cyber Ambience soundtrack paused', '⏸');
    } else {
      try {
        const gain = c.createGain();
        gain.gain.setValueAtTime(0.0001, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.038 * masterVolume, c.currentTime + 1.2);

        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, c.currentTime);

        const freqs = [55, 110.2, 164.8];
        const oscs = freqs.map((f, i) => {
          const osc = c.createOscillator();
          osc.type = i === 0 ? 'sine' : (i === 1 ? 'triangle' : 'sine');
          osc.frequency.setValueAtTime(f, c.currentTime);
          osc.connect(filter);
          osc.start();
          return osc;
        });

        const lfo = c.createOscillator();
        const lfoGain = c.createGain();
        lfo.frequency.setValueAtTime(0.22, c.currentTime);
        lfoGain.gain.setValueAtTime(75, c.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        filter.connect(gain);
        gain.connect(masterGainNode || c.destination);

        ambienceNodes = { gain, oscs: [...oscs, lfo] };
        isAmbienceActive = true;
        if (btn) btn.classList.add('active');
        showToast('Cyber Ambience soundtrack activated', '🎧');
      } catch (err) {}
    }
  }

  function playHitSound(head = false) {
    const pitch = soundPitchMultiplier || 1.0;
    if (selectedSoundProfile === 'tactical') {
      if (head) {
        beep(1400 * pitch, 0.05, 'triangle', 0.12);
        setTimeout(() => beep(1850 * pitch, 0.06, 'sine', 0.1), 30);
      } else {
        beep(920 * pitch, 0.04, 'triangle', 0.08);
      }
    } else if (selectedSoundProfile === 'arcade') {
      if (head) {
        beep(880 * pitch, 0.06, 'square', 0.08);
        setTimeout(() => beep(1320 * pitch, 0.08, 'square', 0.08), 40);
      } else {
        beep(580 * pitch, 0.05, 'square', 0.06);
      }
    } else if (selectedSoundProfile === 'thud') {
      if (head) {
        beep(260 * pitch, 0.1, 'sawtooth', 0.12);
        setTimeout(() => beep(440 * pitch, 0.08, 'sine', 0.1), 25);
      } else {
        beep(140 * pitch, 0.08, 'triangle', 0.1);
      }
    } else if (selectedSoundProfile === 'quake') {
      if (head) {
        beep(1600 * pitch, 0.06, 'sine', 0.14);
        setTimeout(() => beep(2100 * pitch, 0.07, 'triangle', 0.12), 20);
      } else {
        beep(1100 * pitch, 0.05, 'sine', 0.1);
      }
    } else if (selectedSoundProfile === 'laser') {
      if (head) {
        beep(1800 * pitch, 0.07, 'sawtooth', 0.1);
        setTimeout(() => beep(1200 * pitch, 0.08, 'sine', 0.08), 30);
      } else {
        beep(950 * pitch, 0.06, 'sawtooth', 0.08);
      }
    } else {
      // Rivals Classic
      if (head) {
        beep(1180 * pitch, 0.09, 'square', 0.12);
        setTimeout(() => beep(1550 * pitch, 0.06, 'square', 0.09), 35);
      } else {
        beep(760 * pitch, 0.07, 'square', 0.09);
      }
    }
  }

  const sfxHit = () => playHitSound(false);
  const sfxHead = () => playHitSound(true);
  const sfxMiss = () => beep(160, 0.08, 'sawtooth', 0.05);
  const sfxElimination = () => {
    const pitch = soundPitchMultiplier || 1.0;
    beep(1320 * pitch, 0.05, 'triangle', 0.12);
    setTimeout(() => beep(1760 * pitch, 0.08, 'sine', 0.15), 45);
  };
  const sfxUiClick = () => beep(850, 0.02, 'sine', 0.04);
  const sfxStart = () => {
    beep(520, 0.05, 'sine', 0.07);
    setTimeout(() => beep(780, 0.08, 'sine', 0.07), 75);
  };
  const sfxEnd = () => beep(320, 0.15, 'triangle', 0.09);
  const sfxSniper = () => {
    beep(130, 0.07, 'sawtooth', 0.09);
    setTimeout(() => beep(65, 0.12, 'triangle', 0.05), 20);
  };
  const sfxAR = () => beep(420, 0.025, 'square', 0.04);
  const sfxReload = () => {
    beep(340, 0.05, 'triangle', 0.08);
    setTimeout(() => beep(620, 0.06, 'sine', 0.09), 55);
    setTimeout(() => beep(880, 0.07, 'triangle', 0.1), 120);
  };

  let reloadToastTimeout = null;
  function showReloadToast() {
    const el = document.getElementById('reloadNotification');
    if (!el) return;
    el.classList.remove('hidden');
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    if (reloadToastTimeout) clearTimeout(reloadToastTimeout);
    reloadToastTimeout = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(-6px)';
      setTimeout(() => el.classList.add('hidden'), 300);
    }, 1200);
  }

  // ==================== COMPETITIVE RANK PROGRESSION SYSTEM ====================
  const RANK_TIERS = [
    { title: 'BRONZE RIVAL I', minXp: 0, maxXp: 1200, emblem: '🥉', color: '#cd7f32' },
    { title: 'BRONZE RIVAL II', minXp: 1200, maxXp: 2600, emblem: '🥉', color: '#cd7f32' },
    { title: 'BRONZE RIVAL III', minXp: 2600, maxXp: 4500, emblem: '🥉', color: '#d97706' },
    { title: 'SILVER MARKSMAN I', minXp: 4500, maxXp: 7000, emblem: '🥈', color: '#94a3b8' },
    { title: 'SILVER MARKSMAN II', minXp: 7000, maxXp: 10500, emblem: '🥈', color: '#cbd5e1' },
    { title: 'SILVER MARKSMAN III', minXp: 10500, maxXp: 15000, emblem: '🥈', color: '#e2e8f0' },
    { title: 'GOLD SHARPSHOOTER I', minXp: 15000, maxXp: 21000, emblem: '🥇', color: '#facc15' },
    { title: 'GOLD SHARPSHOOTER II', minXp: 21000, maxXp: 28500, emblem: '🥇', color: '#fbbf24' },
    { title: 'GOLD SHARPSHOOTER III', minXp: 28500, maxXp: 38000, emblem: '🥇', color: '#f59e0b' },
    { title: 'PLATINUM GUNSLINGER I', minXp: 38000, maxXp: 50000, emblem: '💠', color: '#38bdf8' },
    { title: 'PLATINUM GUNSLINGER II', minXp: 50000, maxXp: 65000, emblem: '💠', color: '#0ea5e9' },
    { title: 'PLATINUM GUNSLINGER III', minXp: 65000, maxXp: 83000, emblem: '💠', color: '#0284c7' },
    { title: 'DIAMOND SNIPER I', minXp: 83000, maxXp: 105000, emblem: '💎', color: '#818cf8' },
    { title: 'DIAMOND SNIPER II', minXp: 105000, maxXp: 132000, emblem: '💎', color: '#6366f1' },
    { title: 'DIAMOND SNIPER III', minXp: 132000, maxXp: 165000, emblem: '💎', color: '#4f46e5' },
    { title: 'MASTER AIMER', minXp: 165000, maxXp: 210000, emblem: '🔮', color: '#c084fc' },
    { title: 'GRANDMASTER PRO', minXp: 210000, maxXp: 275000, emblem: '👑', color: '#ec4899' },
    { title: 'UNREAL CHAMPION', minXp: 275000, maxXp: 350000, emblem: '⚡', color: '#22d3ee' }
  ];

  function updateRankProgression() {
    const history = getCalibratedHistory();
    let totalExp = 0;
    history.forEach(h => totalExp += (h.exp || 0));

    // Support persistent lifetime XP key
    let lifetimeXp = 0;
    try {
      const stored = localStorage.getItem('rangeaim_lifetime_xp_v5');
      if (stored) lifetimeXp = parseInt(stored, 10) || 0;
    } catch (e) {}

    const currentXp = Math.max(totalExp, lifetimeXp);

    // Determine current rank tier
    let currentTier = RANK_TIERS[0];
    let nextTier = RANK_TIERS[1];

    for (let i = 0; i < RANK_TIERS.length; i++) {
      if (currentXp >= RANK_TIERS[i].minXp) {
        currentTier = RANK_TIERS[i];
        nextTier = RANK_TIERS[i + 1] || null;
      }
    }

    const rankTitle = currentTier.title;
    const rankEmblem = currentTier.emblem;
    const rankColor = currentTier.color;

    const spanMin = currentTier.minXp;
    const spanMax = nextTier ? nextTier.minXp : currentTier.maxXp;
    const tierProgress = Math.max(0, currentXp - spanMin);
    const tierTarget = Math.max(1, spanMax - spanMin);
    const pct = nextTier ? clamp(Math.round((tierProgress / tierTarget) * 100), 5, 100) : 100;
    const nextRankText = nextTier ? `${nextTier.title} (${nextTier.minXp.toLocaleString()} XP)` : 'MAXIMUM RANK (UNREAL CHAMPION)';

    const heroBadge = document.getElementById('heroRankBadge');
    if (heroBadge) {
      heroBadge.textContent = `${rankEmblem} ${rankTitle}`;
      heroBadge.style.color = rankColor;
    }

    const navIcon = document.getElementById('navRankIcon');
    const navText = document.getElementById('navRankText');
    if (navIcon) navIcon.textContent = rankEmblem;
    if (navText) {
      navText.textContent = rankTitle;
      navText.style.color = rankColor;
    }

    const heroEmblem = document.getElementById('heroRankEmblem');
    const heroTitle = document.getElementById('heroRankTitle');
    const heroPoints = document.getElementById('heroRankTierPoints');
    const heroFill = document.getElementById('heroRankProgressFill');
    const heroNext = document.getElementById('heroNextRankName');

    if (heroEmblem) heroEmblem.textContent = rankEmblem;
    if (heroTitle) {
      heroTitle.textContent = rankTitle;
      heroTitle.style.color = rankColor;
    }
    if (heroPoints) {
      heroPoints.textContent = nextTier
        ? `${currentXp.toLocaleString()} / ${nextTier.minXp.toLocaleString()} XP`
        : `${currentXp.toLocaleString()} XP (MAX TIER)`;
    }
    if (heroFill) {
      heroFill.style.width = pct + '%';
      heroFill.style.background = `linear-gradient(90deg, #38bdf8, ${rankColor})`;
    }
    if (heroNext) heroNext.textContent = nextRankText;
  }

  // ==================== SENSITIVITY CALCULATOR ====================
  function computeSensitivity() {
    const sensPct = parseFloat(document.getElementById('inSens').value) || 0;
    const robloxMult = parseFloat(document.getElementById('inRoblox').value) || 0;
    const dpi = parseFloat(document.getElementById('inDpi').value) || 800;
    const fov = parseFloat(document.getElementById('inFov').value) || 103;
    const radiansPerCount = (sensPct / 100) * robloxMult * (dpi / 800) * BASE_RAD_PER_COUNT;
    const pixelsFor360 = (2 * Math.PI) / Math.max(radiansPerCount, 1e-9);
    const cm360 = (pixelsFor360 / dpi) * 2.54;
    const edpi = (sensPct / 100) * robloxMult * dpi;
    const degPer1000 = radiansPerCount * 1000 * (180 / Math.PI);
    return { sensPct, robloxMult, dpi, fov, radiansPerCount, cm360, edpi, degPer1000 };
  }

  function updateFocalLength() {
    const fov = parseFloat(document.getElementById('inFov').value) || 103;
    focalLength = (W / 2) / Math.tan((fov * Math.PI / 180) / 2);
  }

  function refreshSensReadout() {
    SENS = computeSensitivity();
    document.getElementById('outCm360').textContent = SENS.cm360.toFixed(1);
    document.getElementById('outEdpi').textContent = Math.round(SENS.edpi);
    document.getElementById('outRad').textContent = SENS.degPer1000.toFixed(1) + '°';

    // 90°, 180°, and 360° turn distances
    const cm90 = (SENS.cm360 / 4).toFixed(1);
    const cm180 = (SENS.cm360 / 2).toFixed(1);
    const turn90El = document.getElementById('turn90Dist');
    const turn180El = document.getElementById('turn180Dist');
    const profileEl = document.getElementById('aimerSensProfile');

    if (turn90El) turn90El.textContent = `${cm90} cm`;
    if (turn180El) turn180El.textContent = `${cm180} cm`;

    if (profileEl) {
      if (SENS.cm360 > 45) {
        profileEl.textContent = 'Low Sens · Arm Aimer';
        profileEl.className = 'turn-val text-cyan';
      } else if (SENS.cm360 >= 28) {
        profileEl.textContent = 'Medium Sens · Hybrid';
        profileEl.className = 'turn-val text-green';
      } else {
        profileEl.textContent = 'High Sens · Wrist Aimer';
        profileEl.className = 'turn-val text-yellow';
      }
    }

    // Mousepad visualizer
    const cm = SENS.cm360;
    document.getElementById('mousepadCmLabel').textContent = cm.toFixed(1) + ' cm swipe';
    const pct = clamp((cm / 70) * 100, 8, 100);
    document.getElementById('mousepadBar').style.width = pct + '%';

    updateScopeScaler();
    updateLaunchBar();
  }

  function updateScopeScaler() {
    if (!SENS) SENS = computeSensitivity();
    const zoom = selectedScopeZoom || 2.5;
    const halfHipFovRad = (SENS.fov * Math.PI) / 360;
    const halfScopeFovRad = Math.atan(Math.tan(halfHipFovRad) / zoom);

    const focalScale = Math.tan(halfScopeFovRad) / Math.tan(halfHipFovRad);
    const recommendedScopeSens = SENS.sensPct * focalScale;
    const scopedCm360 = SENS.cm360 / Math.max(focalScale, 0.001);
    const inGameScopeSlider = (focalScale * 100).toFixed(1);

    const outScopeSensEl = document.getElementById('outScopeSens');
    const outScopeCm360El = document.getElementById('outScopeCm360');
    const outScopeSliderEl = document.getElementById('outScopeSlider');

    if (outScopeSensEl) outScopeSensEl.textContent = recommendedScopeSens.toFixed(1);
    if (outScopeCm360El) outScopeCm360El.textContent = scopedCm360.toFixed(1) + ' cm';
    if (outScopeSliderEl) outScopeSliderEl.textContent = inGameScopeSlider + '% (or ' + (focalScale).toFixed(2) + 'x)';
  }

  function updateLaunchBar() {
    const curMode = MODES.find(m => m.id === selectedMode) || MODES[0];
    const curWep = WEAPONS[selectedWeapon] || WEAPONS.sniper;
    const durLabel = selectedDuration === null ? '∞' : `${selectedDuration}s`;

    const navLaunchBtn = document.getElementById('navLaunchBtn');
    if (navLaunchBtn) {
      navLaunchBtn.title = `Launch ${curMode.name} (${curWep.name}, ${durLabel})`;
    }

    const btnStartEl = document.getElementById('btnStart');
    if (btnStartEl) {
      btnStartEl.title = `Start ${curMode.name} (${curWep.name}, ${durLabel})`;
    }
  }

  // ==================== RENDERING & UI UPDATES ====================
  function resize() {
    if (!canvas) {
      canvas = document.getElementById('glCanvas');
      if (canvas) ctx = canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = window.innerWidth;
    H = window.innerHeight;
    CX = W / 2;
    CY = H / 2;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    updateFocalLength();
  }
  window.addEventListener('resize', resize);

  // Weapon SVGs
  function getWeaponSvg(id) {
    if (id === 'sniper') {
      return `<svg viewBox="0 0 260 40" width="100%" height="100%" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 28 H150 L188 20 H248"/><path d="M82 28 l18 -10 h28 l12 10"/><path d="M168 17 h26 v7 h-26z"/><path d="M55 22 l-18 -8 h-10 l12 10"/><path d="M214 11 v18"/></g></svg>`;
    }
    return `<svg viewBox="0 0 260 40" width="100%" height="100%" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 25 H150 L184 18 H246"/><path d="M68 25 l14 11 h14 l8 -11"/><path d="M150 14 h30 v8 h-30z"/><path d="M46 23 l-12 -9 h-12"/><path d="M120 19 v-9"/></g></svg>`;
  }

  // Mode Grid
  const modeGrid = document.getElementById('modeGrid');
  function renderModeGrid() {
    const hs = getHighScores();
    modeGrid.innerHTML = '';

    const visibleModes = MODES.filter(m => {
      const matchCat = (modeFilter === 'all' || m.cat === modeFilter);
      const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (!visibleModes.length) {
      modeGrid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-500 font-mono">No matching training drills found for "${searchQuery}"</div>`;
      return;
    }

    visibleModes.forEach(m => {
      const k = m.id + '_' + selectedWeapon;
      const best = hs[k] || 0;
      const card = document.createElement('div');
      card.className = 'mode-card' + (m.id === selectedMode ? ' selected' : '');
      card.dataset.id = m.id;

      card.innerHTML = `
        <div class="mode-selected-badge">
          <span class="badge-dot"></span>
          <span>SELECTED</span>
        </div>
        <div class="mode-card-badge">${m.cat}</div>
        <div class="mode-card-title">${m.name}</div>
        <div class="mode-card-desc">${m.desc}</div>
        <div class="mode-card-footer">
          <span class="mode-card-best">BEST ${best}</span>
          <span class="text-xs text-cyan font-bold select-btn-label">SELECT DRILL</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectedMode = m.id;
        modeGrid.querySelectorAll('.mode-card').forEach(c => {
          c.classList.toggle('selected', c.dataset.id === selectedMode);
        });
        updateLaunchBar();
      });

      modeGrid.appendChild(card);
    });
  }

  function updateModeBests() {
    const hs = getHighScores();
    modeGrid.querySelectorAll('.mode-card').forEach(c => {
      const k = c.dataset.id + '_' + selectedWeapon;
      const bestEl = c.querySelector('.mode-card-best');
      if (bestEl) bestEl.textContent = 'BEST ' + (hs[k] || 0);
    });
  }

  // Weapon Grid
  const weaponGrid = document.getElementById('weaponGrid');
  function renderWeaponGrid() {
    weaponGrid.innerHTML = '';
    Object.values(WEAPONS).forEach(w => {
      const card = document.createElement('div');
      card.className = 'weapon-card' + (w.id === selectedWeapon ? ' selected' : '');
      card.dataset.id = w.id;

      card.innerHTML = `
        <div class="weapon-svg-wrap">${getWeaponSvg(w.id)}</div>
        <div class="weapon-name">${w.name}</div>
        <div class="weapon-desc">${w.desc}</div>
        <div class="weapon-specs-grid">
          <div class="spec-item"><span class="spec-label">HEAD DAMAGE</span><span class="spec-value">${w.head}</span></div>
          <div class="spec-item"><span class="spec-label">BODY DAMAGE</span><span class="spec-value">${w.body}</span></div>
          <div class="spec-item"><span class="spec-label">FIRING MODE</span><span class="spec-value">${w.auto ? 'AUTO' : 'SEMI'}</span></div>
        </div>
      `;

      card.addEventListener('click', () => {
        selectedWeapon = w.id;
        weaponGrid.querySelectorAll('.weapon-card').forEach(c => {
          c.classList.toggle('selected', c.dataset.id === selectedWeapon);
        });
        updateModeBests();
        updateWeaponHud();
        updateLaunchBar();
        drawRecoilPatternStatic();
        if (w.id === 'sniper') sfxSniper(); else sfxAR();
      });

      weaponGrid.appendChild(card);
    });
    drawRecoilPatternStatic();
  }

  // ==================== RECOIL SPRAY PATTERN LAB ====================
  const recoilCanvas = document.getElementById('recoilCanvas');
  const recoilCtx = recoilCanvas ? recoilCanvas.getContext('2d') : null;

  function drawRecoilPatternStatic() {
    if (!recoilCtx) return;
    const w = recoilCanvas.width, h = recoilCanvas.height;
    recoilCtx.clearRect(0, 0, w, h);

    // Target grid
    recoilCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    recoilCtx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      recoilCtx.beginPath(); recoilCtx.moveTo(x, 0); recoilCtx.lineTo(x, h); recoilCtx.stroke();
    }
    for (let y = 30; y < h; y += 30) {
      recoilCtx.beginPath(); recoilCtx.moveTo(0, y); recoilCtx.lineTo(w, y); recoilCtx.stroke();
    }

    // Center target bullseye
    const cx = w / 2, cy = h - 40;
    recoilCtx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    recoilCtx.lineWidth = 1.5;
    recoilCtx.beginPath(); recoilCtx.arc(cx, cy, 25, 0, Math.PI * 2); recoilCtx.stroke();
    recoilCtx.beginPath(); recoilCtx.arc(cx, cy, 8, 0, Math.PI * 2); recoilCtx.stroke();

    // Weapon title
    recoilCtx.fillStyle = '#94a3b8';
    recoilCtx.font = '12px "JetBrains Mono"';
    recoilCtx.fillText(`Pattern: ${WEAPONS[selectedWeapon].name} (${selectedWeapon === 'sniper' ? 'Pinpoint Single Shot' : '15-Bullet Vertical Spray'})`, 20, 25);

    if (selectedWeapon === 'sniper') {
      // Sniper: zero spread center point with high kick
      recoilCtx.fillStyle = '#38bdf8';
      recoilCtx.beginPath(); recoilCtx.arc(cx, cy, 5, 0, Math.PI * 2); recoilCtx.fill();
      recoilCtx.strokeStyle = '#ffd23e';
      recoilCtx.beginPath(); recoilCtx.moveTo(cx, cy); recoilCtx.lineTo(cx, cy - 80); recoilCtx.stroke();
      recoilCtx.fillStyle = '#ffd23e';
      recoilCtx.fillText('Heavy Muzzle Jump (Resets instantly)', cx + 15, cy - 40);
    } else {
      // Assault Rifle spray climb
      recoilCtx.beginPath();
      recoilCtx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      recoilCtx.lineWidth = 2;
      recoilCtx.moveTo(cx, cy);

      const bullets = [
        { x: 0, y: 0 }, { x: 2, y: -15 }, { x: -3, y: -30 }, { x: 5, y: -48 },
        { x: 9, y: -65 }, { x: 4, y: -80 }, { x: -6, y: -95 }, { x: -12, y: -110 },
        { x: -5, y: -120 }, { x: 8, y: -125 }, { x: 14, y: -130 }, { x: 6, y: -134 }
      ];

      bullets.forEach(b => recoilCtx.lineTo(cx + b.x * 2.5, cy + b.y));
      recoilCtx.stroke();

      bullets.forEach((b, i) => {
        recoilCtx.fillStyle = '#38bdf8';
        recoilCtx.beginPath();
        recoilCtx.arc(cx + b.x * 2.5, cy + b.y, 4, 0, Math.PI * 2);
        recoilCtx.fill();
      });
    }
  }

  function simulateRecoilFire() {
    if (!recoilCtx) return;
    drawRecoilPatternStatic();
    const cx = recoilCanvas.width / 2, cy = recoilCanvas.height - 40;

    if (selectedWeapon === 'sniper') {
      sfxSniper();
      // Flash blast
      recoilCtx.fillStyle = 'rgba(250, 204, 21, 0.8)';
      recoilCtx.beginPath(); recoilCtx.arc(cx, cy, 14, 0, Math.PI * 2); recoilCtx.fill();
      setTimeout(drawRecoilPatternStatic, 200);
    } else {
      let bIdx = 0;
      const bullets = [
        { x: 0, y: 0 }, { x: 2, y: -15 }, { x: -3, y: -30 }, { x: 5, y: -48 },
        { x: 9, y: -65 }, { x: 4, y: -80 }, { x: -6, y: -95 }, { x: -12, y: -110 },
        { x: -5, y: -120 }, { x: 8, y: -125 }, { x: 14, y: -130 }, { x: 6, y: -134 }
      ];

      const fireTimer = setInterval(() => {
        if (bIdx >= bullets.length) {
          clearInterval(fireTimer);
          return;
        }
        sfxAR();
        const pt = bullets[bIdx];
        recoilCtx.fillStyle = '#f43f5e';
        recoilCtx.beginPath();
        recoilCtx.arc(cx + pt.x * 2.5, cy + pt.y, 6, 0, Math.PI * 2);
        recoilCtx.fill();
        bIdx++;
      }, 70);
    }
  }

  const btnTestSpray = document.getElementById('btnTestSpray');
  if (btnTestSpray) btnTestSpray.addEventListener('click', simulateRecoilFire);

  let customChLength = 8;
  let customChGap = 4;
  let customChThickness = 2;

  // Crosshair Rendering
  function renderCrosshairSvg(style, color, sizePreset) {
    let dim = 24, half = 12, lineLen = 8, gap = 4, stroke = 2, dotR = 2.5;
    if (sizePreset === 'small') { dim = 18; half = 9; lineLen = 6; gap = 3; stroke = 1.5; dotR = 2; }
    else if (sizePreset === 'large') { dim = 30; half = 15; lineLen = 10; gap = 5; stroke = 2.5; dotR = 3.5; }
    else if (sizePreset === 'custom') {
      lineLen = customChLength;
      gap = customChGap;
      stroke = customChThickness;
      dim = Math.max(24, (lineLen + gap) * 2 + 8);
      half = dim / 2;
      dotR = Math.max(1.5, stroke * 1.1);
    }

    const outlineFilter = crosshairOutline ? `style="filter: drop-shadow(0 0 1px #000) drop-shadow(0 0 1.5px #000);"` : '';
    let centerDotSvg = crosshairDot ? `<circle cx="${half}" cy="${half}" r="${dotR * 0.7}" fill="${color}" />` : '';

    if (style === 'cross') {
      return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" ${outlineFilter}>
        <line x1="${half}" y1="0" x2="${half}" y2="${half - gap}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        <line x1="${half}" y1="${half + gap}" x2="${half}" y2="${dim}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        <line x1="0" y1="${half}" x2="${half - gap}" y2="${half}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        <line x1="${half + gap}" y1="${half}" x2="${dim}" y2="${half}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        ${centerDotSvg}
      </svg>`;
    } else if (style === 'tcross') {
      // T-Shape: Left, Right, and Bottom line only (no top line for clear head visibility)
      return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" ${outlineFilter}>
        <line x1="${half}" y1="${half + gap}" x2="${half}" y2="${dim}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        <line x1="0" y1="${half}" x2="${half - gap}" y2="${half}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        <line x1="${half + gap}" y1="${half}" x2="${dim}" y2="${half}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"/>
        ${centerDotSvg}
      </svg>`;
    } else if (style === 'box') {
      const b = gap + 2;
      return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" ${outlineFilter}>
        <rect x="${half - b}" y="${half - b}" width="${b * 2}" height="${b * 2}" fill="none" stroke="${color}" stroke-width="${stroke}" />
        ${centerDotSvg}
      </svg>`;
    } else if (style === 'dot') {
      return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" ${outlineFilter}>
        <circle cx="${half}" cy="${half}" r="${dotR}" fill="${color}" />
      </svg>`;
    } else {
      return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" ${outlineFilter}>
        <circle cx="${half}" cy="${half}" r="${half - 3}" fill="none" stroke="${color}" stroke-width="${stroke}" />
        <circle cx="${half}" cy="${half}" r="1.5" fill="${color}" />
      </svg>`;
    }
  }

  function updateCrosshairs() {
    const svg = renderCrosshairSvg(crosshairStyle, crosshairColor, crosshairSize);
    crosshairEl.innerHTML = svg;
    const previewEl = document.getElementById('reticlePreviewCanvas');
    if (previewEl) previewEl.innerHTML = svg;
  }

  function updateWeaponHud() {
    const w = WEAPONS[selectedWeapon];
    document.getElementById('hudGunName').textContent = w.name.toUpperCase();
    document.getElementById('hudGunInfo').textContent = `${w.info} · target HP ${currentHealth}/150`;
  }

  function updateLaunchBar() {
    const mode = MODES.find(m => m.id === selectedMode);
    const weapon = WEAPONS[selectedWeapon];
    const modeEl = document.getElementById('barModeName');
    if (modeEl && mode) modeEl.textContent = mode.name;
    const wepEl = document.getElementById('barWeaponName');
    if (wepEl && weapon) wepEl.textContent = weapon.name;

    const inSens = document.getElementById('inSens');
    const inDpi = document.getElementById('inDpi');
    const sensEl = document.getElementById('barSensVal');
    if (sensEl && inSens && inDpi) sensEl.textContent = `${inSens.value} · ${inDpi.value} DPI`;

    const durEl = document.getElementById('barDurationVal');
    if (durEl) {
      const dur = selectedDuration === null ? 'Unlimited' : `${selectedDuration}s`;
      const diff = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
      durEl.textContent = `${dur} (${diff})`;
    }
  }

  // ==================== STATS & ANALYTICS ====================
  function getUnlockedBadges() {
    try { return JSON.parse(localStorage.getItem(BADGES_KEY)) || {}; } catch(e) { return {}; }
  }

  function checkAndUnlockBadges(history) {
    const unlocked = getUnlockedBadges();
    let totalScore = 0, maxScore = 0, bestReact = 9999, maxHeadshots = 0, bestStreakRecord = 0;

    history.forEach(h => {
      totalScore += (h.score || 0);
      if (h.score > maxScore) maxScore = h.score;
      if (h.reaction && h.reaction > 0 && h.reaction < bestReact) bestReact = h.reaction;
      if (h.headshots && h.headshots > maxHeadshots) maxHeadshots = h.headshots;
      if (h.maxStreak && h.maxStreak > bestStreakRecord) bestStreakRecord = h.maxStreak;
    });

    if (history.length >= 1) unlocked['first_blood'] = true;
    if (bestReact < 200) unlocked['lightning_hands'] = true;
    if (maxHeadshots >= 5) unlocked['headshot_demon'] = true;
    if (maxScore >= 1000) unlocked['century_marksman'] = true;
    if (bestStreakRecord >= 10) unlocked['flawless_streak'] = true;
    if (history.length >= 5) unlocked['range_veteran'] = true;
    if (totalScore >= 2500) unlocked['grandmaster_aim'] = true;

    try { localStorage.setItem(BADGES_KEY, JSON.stringify(unlocked)); } catch(e) {}
    return unlocked;
  }

  function updateAnalyticsTab() {
    const history = getSessionHistory();
    const totalSessions = history.length;
    let totalHits = 0, totalShots = 0, reactionSum = 0, reactionCount = 0;
    let totalHeadshots = 0, bestStreak = 0;

    history.forEach(item => {
      totalHits += item.hits || 0;
      totalShots += (item.hits || 0) + (item.misses || 0);
      totalHeadshots += item.headshots || 0;
      if (item.maxStreak && item.maxStreak > bestStreak) bestStreak = item.maxStreak;
      if (item.reaction && item.reaction > 0) {
        reactionSum += item.reaction;
        reactionCount++;
      }
    });

    const avgReact = reactionCount ? Math.round(reactionSum / reactionCount) : 0;
    const avgAcc = totalShots ? Math.round((totalHits / totalShots) * 100) : 0;

    document.getElementById('statTotalSessions').textContent = totalSessions;
    document.getElementById('statTotalHits').textContent = totalHits;
    document.getElementById('statAvgAcc').textContent = totalShots ? avgAcc + '%' : '--%';
    document.getElementById('statAvgReaction').textContent = reactionCount ? avgReact + ' ms' : '-- ms';

    // Diagnostics Matrix
    const hsRatio = totalHits ? Math.round((totalHeadshots / totalHits) * 100) : 0;
    const diagHsRatioEl = document.getElementById('diagHsRatio');
    if (diagHsRatioEl) diagHsRatioEl.textContent = totalHits ? hsRatio + '%' : '--%';

    const diagBestStreakEl = document.getElementById('diagBestStreak');
    if (diagBestStreakEl) diagBestStreakEl.textContent = bestStreak;

    const diagFlickTierEl = document.getElementById('diagFlickTier');
    if (diagFlickTierEl) {
      if (avgAcc >= 90 && avgReact > 0 && avgReact <= 180) diagFlickTierEl.textContent = 'GRANDMASTER (S+)';
      else if (avgAcc >= 80 && avgReact > 0 && avgReact <= 210) diagFlickTierEl.textContent = 'PRO MARKSMAN (A)';
      else if (totalHits > 0) diagFlickTierEl.textContent = 'COMPETITIVE (B)';
      else diagFlickTierEl.textContent = 'UNRANKED';
    }

    const diagTrackingTierEl = document.getElementById('diagTrackingTier');
    if (diagTrackingTierEl) {
      diagTrackingTierEl.textContent = avgAcc >= 85 ? 'TIER S (SMOOTH)' : (avgAcc >= 70 ? 'TIER A' : 'TIER B');
    }

    // Benchmark Reaction Pointer
    const benchmarkReactionText = document.getElementById('benchmarkReactionText');
    const benchmarkPointer = document.getElementById('benchmarkPointer');
    if (benchmarkReactionText && benchmarkPointer) {
      if (avgReact > 0) {
        benchmarkReactionText.textContent = `${avgReact} ms (${avgReact < 170 ? 'Pro Tier' : (avgReact <= 210 ? 'Competitive Tier' : 'Recruit Tier')})`;
        // Map 130ms - 270ms to 5% - 95%
        const ptrPct = clamp(((avgReact - 130) / (270 - 130)) * 90 + 5, 5, 95);
        benchmarkPointer.style.left = ptrPct + '%';
      } else {
        benchmarkReactionText.textContent = '-- ms (Complete a session to calibrate)';
        benchmarkPointer.style.left = '50%';
      }
    }

    // Badges / Trophies Room
    const unlockedBadges = checkAndUnlockBadges(history);
    const trophiesGrid = document.getElementById('trophiesGrid');
    if (trophiesGrid) {
      trophiesGrid.innerHTML = BADGES.map(b => {
        const isUnlocked = !!unlockedBadges[b.id];
        return `
          <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-details">
              <div class="badge-name">${b.name}</div>
              <div class="badge-desc">${b.desc}</div>
              <div class="badge-status ${isUnlocked ? 'unlocked' : 'locked'}">${isUnlocked ? '★ UNLOCKED' : 'LOCKED'}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Table
    const tbody = document.getElementById('historyTableBody');
    if (tbody) {
      if (!history.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-slate-500">No session history yet. Enter the range to record your first session!</td></tr>`;
      } else {
        tbody.innerHTML = history.slice(0, 10).map(s => `
          <tr>
            <td class="font-bold text-white">${s.modeName || s.mode}</td>
            <td class="text-cyan">${s.weaponName || s.weapon}</td>
            <td class="text-yellow font-bold">${s.score}</td>
            <td class="text-green">${s.accuracy}%</td>
            <td>${s.reaction ? s.reaction + 'ms' : '--'}</td>
            <td class="text-slate-400 text-xs">${s.date || 'Recent'}</td>
          </tr>
        `).join('');
      }
    }

    renderScoreChart(history.slice(0, 10).reverse());
  }

  function renderScoreChart(data) {
    const svg = document.getElementById('scoreChartSvg');
    if (!svg) return;
    if (data.length < 2) {
      svg.innerHTML = `<text x="350" y="80" text-anchor="middle" fill="#64748b" font-size="12">Complete at least 2 sessions to render the trajectory chart</text>`;
      return;
    }

    const scores = data.map(d => d.score);
    const minS = Math.min(0, ...scores);
    const maxS = Math.max(100, ...scores);
    const width = 700;
    const height = 160;
    const padX = 40;
    const padY = 30;

    const points = scores.map((val, idx) => {
      const x = padX + (idx / (scores.length - 1)) * (width - padX * 2);
      const y = height - padY - ((val - minS) / (maxS - minS || 1)) * (height - padY * 2);
      return { x, y, val };
    });

    const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

    let circles = points.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#38bdf8" stroke="#060911" stroke-width="2"/>
      <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" fill="#7dd3fc" font-size="10" font-family="JetBrains Mono">${p.val}</text>
    `).join('');

    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4"/>
      <path d="${areaD}" fill="url(#chartGrad)"/>
      <path d="${pathD}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
      ${circles}
    `;
  }

  // ==================== 3D PERSPECTIVE ENGINE & ORIGINAL ENEMIES ====================
  // (Original 3D projection & camera mathematics from aim-trainer-weapons (17).html - DO NOT CHANGE)
  function project(x, y, z) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    if (z2 >= -0.25) return null;
    const scale = focalLength / -z2;
    return { x: CX + x1 * scale, y: CY - y2 * scale, scale };
  }

  function resetCamera() { yaw = 0; pitch = 0; }

  const DUMMY_LANES = [-5.8, -3.3, -1.1, 1.1, 3.3, 5.8];
  const DUMMY_DEPTHS = [13.0, 14.2, 14.8, 14.8, 14.2, 13.0];

  // Collision-free slot allocation for standing and moving dummies
  function pickStandingRespawnSlot(excludeSlot) {
    const occupied = new Set(
      targets
        .filter(t => t && t.type === 'dummy' && t.slot !== undefined && t.slot !== null && t.slot !== excludeSlot && t.alive !== false)
        .map(t => t.slot)
    );
    const free = [];
    for (let i = 0; i < DUMMY_LANES.length; i++) {
      if (!occupied.has(i) && i !== excludeSlot) free.push(i);
    }
    if (free.length) return choice(free);
    const fallback = [0, 1, 2, 3, 4, 5].filter(s => s !== excludeSlot);
    return choice(fallback.length ? fallback : [0, 1, 2, 3, 4, 5]);
  }

  // Non-overlapping position generator for Gridshot, Microshot, and reactive circles
  function pickSafeCirclePosition(existingTargets, minDistance = 1.72, bounds = { minX: -4.2, maxX: 4.2, minY: -2.3, maxY: 2.3, minZ: -12.0, maxZ: -9.8 }) {
    let bestPos = { x: 0, y: 0, z: -10.5 };
    let bestDist = -1;
    for (let attempt = 0; attempt < 50; attempt++) {
      const candX = rand(bounds.minX, bounds.maxX);
      const candY = rand(bounds.minY, bounds.maxY);
      const candZ = rand(bounds.minZ, bounds.maxZ);

      let minDist = Infinity;
      for (const t of existingTargets) {
        if (!t || t.alive === false) continue;
        const d = Math.hypot(candX - t.x, candY - t.y);
        if (d < minDist) minDist = d;
      }

      if (minDist >= minDistance) {
        return { x: candX, y: candY, z: candZ };
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestPos = { x: candX, y: candY, z: candZ };
      }
    }
    return bestPos;
  }

  function makeDummy(moving = false, opts = {}) {
    const d = DIFF[selectedDifficulty];
    const depth = opts.depth ?? rand(11.5, 14.5);
    const size = opts.size ?? rand(0.62, 0.72) * d.sizeMul;
    const lane = (opts.slot != null) ? DUMMY_LANES[opts.slot % DUMMY_LANES.length] : null;
    const x = opts.x ?? lane ?? rand(-4.0, 4.0);
    const y = opts.y ?? 0;
    return {
      type: 'dummy',
      x, y, z: -depth,
      baseX: x, baseY: y,
      depth, size, moving,
      dir: choice([-1, 1]),
      speed: rand(0.7, 1.25) * d.speedMul,
      // Constrained strafe amplitude so adjacent lane dummies NEVER overlap or walk into each other
      range: Math.min(0.8, rand(0.48, 0.78)),
      born: performance.now(),
      alive: true,
      hp: 150,
      maxHp: 150,
      phase: rand(0, Math.PI * 2),
      slot: opts.slot ?? null
    };
  }

  function makeCircle() {
    const d = DIFF[selectedDifficulty];
    const safe = pickSafeCirclePosition(targets, 1.75);
    return {
      type: 'flat',
      x: safe.x,
      y: safe.y,
      z: safe.z,
      r: rand(28, 44) * d.sizeMul,
      born: performance.now(),
      lifeMs: d.lifeMs,
      alive: true
    };
  }

  function makeTrack() {
    const d = DIFF[selectedDifficulty];
    return {
      type: 'track',
      x: 0, y: 0, z: -10.8,
      r: 48 * d.sizeMul,
      angle: rand(0, Math.PI * 2),
      radius: rand(1.7, 3.0),
      speed: rand(0.65, 1.15) * d.speedMul,
      cx: 0, cy: 0, held: 0
    };
  }

  function makeMicroshot() {
    const d = DIFF[selectedDifficulty];
    const safe = pickSafeCirclePosition(targets, 1.45);
    return {
      type: 'flat',
      x: safe.x,
      y: safe.y,
      z: safe.z,
      r: rand(22, 29) * d.sizeMul,
      born: performance.now(),
      lifeMs: Math.max(800, d.lifeMs - 100),
      alive: true
    };
  }

  function makeStormCircle(existing = []) {
    const d = DIFF[selectedDifficulty];
    const safe = pickSafeCirclePosition(existing, 1.6);
    return {
      type: 'flat',
      x: safe.x,
      y: safe.y,
      z: safe.z,
      r: rand(27, 39) * d.sizeMul,
      born: performance.now(),
      alive: true,
      movingCircle: true,
      baseX: safe.x, baseY: safe.y,
      phase: rand(0, Math.PI * 2),
      speed: rand(0.7, 1.25) * d.speedMul,
      ampX: rand(0.5, 0.95),
      ampY: rand(0.25, 0.55)
    };
  }

  function setupMode() {
    targets = [];
    lastSpawn = performance.now();
    resetCamera();

    if (selectedMode === 'standing') {
      [0, 2, 3, 5].forEach(i => targets.push(makeDummy(false, { slot: i, depth: DUMMY_DEPTHS[i] })));
    } else if (selectedMode === 'moving') {
      [0, 2, 3, 5].forEach(i => targets.push(makeDummy(true, { slot: i, depth: DUMMY_DEPTHS[i], y: 0.05 })));
    } else if (selectedMode === 'gridshot') {
      const grid = [
        { x: -3.0, y: -0.9, z: -10 },
        { x: 0.0, y: -0.9, z: -10 },
        { x: 3.0, y: -0.9, z: -10 },
        { x: -3.0, y: 1.1, z: -10 },
        { x: 0.0, y: 1.1, z: -10 },
        { x: 3.0, y: 1.1, z: -10 }
      ];
      for (let i = 0; i < 6; i++) {
        targets.push({
          type: 'flat',
          x: grid[i].x,
          y: grid[i].y,
          z: grid[i].z,
          r: 48 * DIFF[selectedDifficulty].sizeMul,
          born: performance.now(),
          alive: true
        });
      }
    } else if (selectedMode === 'flick') {
      targets.push(makeCircle());
    } else if (selectedMode === 'tracking') {
      targets.push(makeTrack());
    } else if (selectedMode === 'headshot') {
      targets.push(makeDummy(false, { x: 0, y: 0.05, size: 0.76, depth: 10.5 }));
    } else if (selectedMode === 'microshot') {
      targets.push(makeMicroshot());
    } else if (selectedMode === 'targetstorm') {
      for (let i = 0; i < 5; i++) targets.push(makeStormCircle(targets));
    } else if (selectedMode === 'dualtracking') {
      const a = makeTrack();
      const b = makeTrack();
      b.angle += Math.PI;
      b.radius *= 0.78;
      b.speed *= 1.08;
      b.z = -11.8;
      targets.push(a, b);
    } else if (selectedMode === 'headsonly') {
      [0, 2, 3, 5].forEach(i => targets.push(makeDummy(false, { slot: i, depth: DUMMY_DEPTHS[i] })));
    } else if (selectedMode === 'strafeduel') {
      const d = makeDummy(true, { x: 0, y: 0.05, size: 0.72, depth: 10.8 });
      d.speed *= 1.35;
      d.range = 1.25;
      targets.push(d);
    } else if (selectedMode === 'headspeed') {
      targets.push(makeDummy(false, { x: rand(-2.5, 2.5), y: 0.05, size: 0.72, depth: rand(10.5, 12.0) }));
    } else if (selectedMode === 'orbit') {
      const t = makeTrack();
      t.radius = 1.3;
      t.speed = 1.4;
      t.r = 38 * DIFF[selectedDifficulty].sizeMul;
      targets.push(t);
    } else if (selectedMode === 'reflex360') {
      targets.push(makeCircle());
    }
  }

  // ==================== RENDERING DUMMIES & ARENA ====================
  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a0d14');
    g.addColorStop(1, '#050608');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(62, 198, 255, 0.11)';
    ctx.lineWidth = 1;
    for (let z = -4; z >= -24; z -= 2) {
      const p1 = project(-8, -1.15, z), p2 = project(8, -1.15, z);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    for (let x = -8; x <= 8; x += 2) {
      const p1 = project(x, -1.15, -3), p2 = project(x, -1.15, -24);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.26);
    ctx.lineTo(W, H * 0.26);
    ctx.stroke();
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawDummy(t) {
    const s = t.size;
    const torsoTop = 1.20 * s, torsoBottom = -0.15 * s, headY = 1.65 * s, footY = -1.18 * s, shoulder = 0.52 * s, bodyW = 0.72 * s;
    const center = project(t.x, t.y, t.z);
    if (!center) return null;
    const head = project(t.x, t.y + headY, t.z);
    const torsoTL = project(t.x - bodyW / 2, t.y + torsoTop, t.z);
    const torsoBR = project(t.x + bodyW / 2, t.y + torsoBottom, t.z);
    const leftHand = project(t.x - shoulder, t.y + 0.55 * s, t.z), rightHand = project(t.x + shoulder, t.y + 0.55 * s, t.z);
    const leftElbow = project(t.x - 0.58 * s, t.y + 0.25 * s, t.z), rightElbow = project(t.x + 0.58 * s, t.y + 0.25 * s, t.z);
    const lf = project(t.x - 0.22 * s, t.y + footY, t.z), rf = project(t.x + 0.22 * s, t.y + footY, t.z);
    const lhip = project(t.x - 0.18 * s, t.y - 0.1 * s, t.z), rhip = project(t.x + 0.18 * s, t.y - 0.1 * s, t.z);
    if (!head || !torsoTL || !torsoBR || !lf || !rf) return null;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
    ctx.beginPath();
    ctx.ellipse(center.x, Math.max(lf.y, rf.y) + 3, Math.max(14, 0.55 * s * center.scale), Math.max(3, 0.08 * s * center.scale), 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#a7b0c4';
    ctx.lineWidth = Math.max(3, Math.min(6, 5 * s));
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lhip.x, lhip.y); ctx.lineTo(lf.x, lf.y);
    ctx.moveTo(rhip.x, rhip.y); ctx.lineTo(rf.x, rf.y);
    ctx.stroke();

    // Arms
    ctx.lineWidth = Math.max(3, 0.11 * s * center.scale);
    ctx.beginPath();
    ctx.moveTo(torsoTL.x + 2, torsoTL.y + 10); ctx.lineTo(leftElbow.x, leftElbow.y); ctx.lineTo(leftHand.x, leftHand.y);
    ctx.moveTo(torsoBR.x - 2, torsoTL.y + 10); ctx.lineTo(rightElbow.x, rightElbow.y); ctx.lineTo(rightHand.x, rightHand.y);
    ctx.stroke();

    // Torso
    ctx.fillStyle = '#333b4d';
    ctx.strokeStyle = '#8b93a7';
    ctx.lineWidth = 1.5;
    roundRect(torsoTL.x, torsoTL.y, torsoBR.x - torsoTL.x, torsoBR.y - torsoTL.y, 5);
    ctx.fill();
    ctx.stroke();

    // Head
    const hr = Math.max(6, 0.22 * s * head.scale);
    ctx.beginPath();
    ctx.fillStyle = '#c68a5e';
    ctx.strokeStyle = '#dfe4ef';
    ctx.lineWidth = 1.5;
    ctx.arc(head.x, head.y, hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing headshot gold ring
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 210, 62, 0.85)';
    ctx.lineWidth = 2;
    ctx.arc(head.x, head.y, hr + 4, 0, Math.PI * 2);
    ctx.stroke();

    // HP Bar
    const torsoScreenW = Math.abs(torsoBR.x - torsoTL.x);
    const barW = clamp(torsoScreenW * 1.15, 44, 88), barH = 5, barX = center.x - barW / 2, barY = Math.min(head.y, torsoTL.y) - 14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = t.hp > 100 ? '#5dffa0' : (t.hp > 50 ? '#ffd23e' : '#ff5b3e');
    ctx.fillRect(barX, barY, barW * (t.hp / t.maxHp), barH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.strokeRect(barX, barY, barW, barH);

    const bodyLeft = Math.min(torsoTL.x, torsoBR.x) - 4;
    const bodyRight = Math.max(torsoTL.x, torsoBR.x) + 4;
    const bodyTop = Math.min(head.y + hr - 2, torsoTL.y);
    const bodyBottom = Math.max(torsoBR.y, head.y + hr + 2);

    return {
      headX: head.x,
      headY: head.y,
      headR: hr,
      bodyX: (torsoTL.x + torsoBR.x) / 2,
      bodyY: (torsoTL.y + torsoBR.y) / 2,
      bodyW: Math.abs(torsoBR.x - torsoTL.x),
      bodyH: Math.abs(torsoBR.y - torsoTL.y),
      bodyLeft,
      bodyRight,
      bodyTop,
      bodyBottom
    };
  }

  function drawFlat(t) {
    const a = t.lifeMs ? 1 - clamp((performance.now() - t.born) / t.lifeMs, 0, 1) : 1;
    ctx.globalAlpha = a;
    const p = project(t.x, t.y, t.z ?? -10);
    if (!p) { ctx.globalAlpha = 1; t._draw = null; return; }
    const rr = t.r * Math.max(0.55, Math.min(1.35, p.scale / 70));
    const theme = TARGET_THEMES[selectedTargetTheme] || TARGET_THEMES.classic;
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, rr);
    g.addColorStop(0, theme.inner);
    g.addColorStop(0.22, theme.mid);
    g.addColorStop(1, theme.outer);
    ctx.fillStyle = g;
    ctx.strokeStyle = '#060911';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, rr * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    t._draw = { x: p.x, y: p.y, r: rr };
  }

  function drawTrack(t) {
    const p = project(t.x, t.y, t.z ?? -10);
    if (!p) { t._draw = null; return; }
    const rr = t.r * Math.max(0.55, Math.min(1.35, p.scale / 70));
    const theme = TARGET_THEMES[selectedTargetTheme] || TARGET_THEMES.cyan;
    ctx.beginPath();
    ctx.fillStyle = theme.glow;
    ctx.strokeStyle = theme.mid;
    ctx.lineWidth = 2;
    ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.arc(p.x, p.y, rr * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    t._draw = { x: p.x, y: p.y, r: rr };
  }

  function flashShot() { shotFlashUntil = performance.now() + 80; }

  function drawWeapon(now) {
    if (now > shotFlashUntil) return;
    ctx.save();
    ctx.translate(W - 285, H - 115);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    if (selectedWeapon === 'sniper') {
      ctx.beginPath(); ctx.moveTo(10, 70); ctx.lineTo(170, 50); ctx.lineTo(270, 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(105, 51); ctx.lineTo(125, 85); ctx.stroke();
      ctx.beginPath(); ctx.arc(178, 36, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255, 210, 62, 0.75)';
      ctx.beginPath(); ctx.arc(270, 50, 7, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(12, 66); ctx.lineTo(155, 50); ctx.lineTo(266, 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(92, 52); ctx.lineTo(104, 88); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(55, 61); ctx.lineTo(37, 44); ctx.stroke();
      ctx.fillStyle = 'rgba(255, 138, 110, 0.75)';
      ctx.beginPath(); ctx.arc(266, 50, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function addDamagePop(x, y, text, head) {
    const el = document.createElement('div');
    el.className = 'damage-pop' + (head ? ' head' : '');
    el.textContent = text;
    el.style.left = (x + rand(-12, 12)) + 'px';
    el.style.top = (y - 8) + 'px';
    document.getElementById('gameScreen').appendChild(el);

    let a = 1, dy = 0;
    const timer = setInterval(() => {
      a -= 0.045;
      dy -= 1.4;
      el.style.opacity = a;
      el.style.transform = `translateY(${dy}px)`;
      if (a <= 0) {
        clearInterval(timer);
        el.remove();
      }
    }, 16);
  }

  function showHitmarker(hit) {
    const hm = hitmarkerEl;
    hm.style.opacity = 0;
    hm.classList.remove('show');
    void hm.offsetWidth;
    if (!hit) hm.style.filter = 'grayscale(1)'; else hm.style.filter = 'none';
    hm.classList.add('show');
  }

  function updateAccuracy() {
    if (selectedMode === 'tracking' || selectedMode === 'dualtracking') {
      const trkAcc = trackingTimeTotal > 0 ? clamp((trackingTimeOnTarget / trackingTimeTotal) * 100, 0, 100) : 0;
      document.getElementById('hudAcc').textContent = trkAcc.toFixed(1) + '%';
    } else {
      const total = hits + misses;
      document.getElementById('hudAcc').textContent = (total > 0 ? Math.round((hits / total) * 100) : 0) + '%';
    }
    const streakEl = document.getElementById('hudStreak');
    if (streakEl) streakEl.textContent = `STREAK ${streak}`;
  }

  // ==================== HIT DETECTION & DAMAGE ====================
  function hitDummy(t, shotX, shotY) {
    const d = WEAPONS[selectedWeapon];
    const box = t._draw;
    if (!box) return false;

    const head = distance(CX, CY, box.headX, box.headY) <= box.headR + 4;
    const body = box.bodyLeft !== undefined
      ? (CX >= box.bodyLeft && CX <= box.bodyRight && CY >= box.bodyTop && CY <= box.bodyBottom)
      : (Math.abs(CX - box.bodyX) <= box.bodyW * 0.55 && Math.abs(CY - box.bodyY) <= box.bodyH * 0.5);

    if (!head && !body) return false;
    if (selectedMode === 'headsonly' && !head) return false;

    const damage = head ? d.head : d.body;
    t.hp = Math.max(0, t.hp - damage);

    hits++;
    streak++;
    if (head) headshots++;
    if (streak > maxStreak) maxStreak = streak;

    const rt = performance.now() - t.born;
    if (rt > 0 && rt < 4000) reactionTimes.push(rt);

    let hitScore = 0;
    if (selectedWeapon === 'ar') {
      // Assault Rifle fires 10 rounds/sec: 15 pts per headshot, 10 pts per body
      hitScore = head ? 15 : 10;
    } else {
      // Sniper: 100 pts on headshot (1-shot lethal), 40 pts on body
      hitScore = head ? 100 : 40;
    }
    score += hitScore;
    document.getElementById('hudHits').textContent = hits;
    document.getElementById('hudScore').textContent = score;
    updateAccuracy();

    addDamagePop(CX, CY, head ? `HEADSHOT +${hitScore}` : `+${hitScore}`, head);

    if (head) sfxHead(); else sfxHit();
    flashShot();

    if (t.hp <= 0) {
      awardKill(t, head, box.headX, box.headY);
    }
    return true;
  }

  function awardKill(t, head, hitX, hitY) {
    let killBonus = 0;
    if (selectedWeapon === 'ar') {
      killBonus = head ? 60 : 40;
    } else {
      killBonus = head ? 50 : 30;
    }
    score += killBonus;
    document.getElementById('hudScore').textContent = score;

    sfxElimination();
    addDamagePop(hitX, hitY, head ? `ELIMINATED! +${killBonus}` : `KILL +${killBonus}`, head);

    if (selectedMode === 'headshot' || selectedMode === 'headspeed' || selectedMode === 'standing' || selectedMode === 'moving' || selectedMode === 'headsonly' || selectedMode === 'strafeduel') {
      const idx = targets.indexOf(t);
      if (idx >= 0) {
        if (selectedMode === 'headshot' || selectedMode === 'headspeed') {
          targets.splice(idx, 1);
        } else if (selectedMode === 'strafeduel') {
          const d = makeDummy(true, { x: rand(-1.5, 1.5), y: 0.05, size: 0.72, depth: 10.8 });
          d.speed *= 1.35;
          d.range = 1.25;
          targets[idx] = d;
        } else if (selectedMode === 'standing' || selectedMode === 'headsonly') {
          const newSlot = pickStandingRespawnSlot(t.slot);
          targets[idx] = makeDummy(false, { slot: newSlot, depth: DUMMY_DEPTHS[newSlot], y: t.baseY });
        } else {
          const newSlot = pickStandingRespawnSlot(t.slot);
          targets[idx] = makeDummy(true, { slot: newSlot, depth: DUMMY_DEPTHS[newSlot], y: t.baseY });
        }
      }
    }
  }

  function registerCircleHit(t) {
    hits++;
    streak++;
    if (streak > maxStreak) maxStreak = streak;
    const rt = performance.now() - t.born;
    if (rt > 0 && rt < 4000) reactionTimes.push(rt);
    score += 100;
    document.getElementById('hudHits').textContent = hits;
    document.getElementById('hudScore').textContent = score;
    updateAccuracy();
    sfxHit();
    addDamagePop(CX, CY, '+100', false);

    if (selectedMode === 'gridshot') {
      // Non-overlapping spawn positioning in Gridshot
      const safe = pickSafeCirclePosition(targets.filter(x => x !== t && x.alive !== false), 1.72);
      t.x = safe.x;
      t.y = safe.y;
      t.z = safe.z;
      t.born = performance.now();
      t.alive = true;
    } else if (selectedMode === 'microshot') {
      const n = makeMicroshot();
      Object.assign(t, n);
    } else if (selectedMode === 'targetstorm') {
      const n = makeStormCircle(targets.filter(x => x !== t));
      Object.assign(t, n);
    } else {
      targets = targets.filter(x => x !== t);
    }
  }

  function handleShot() {
    let hit = false;
    for (const t of targets) {
      if (t.type === 'dummy') {
        if (hitDummy(t, CX, CY)) { hit = true; break; }
      } else if (t.type === 'flat' && t._draw) {
        const dx = CX - t._draw.x, dy = CY - t._draw.y;
        if (Math.hypot(dx, dy) <= t._draw.r) {
          hit = true;
          t.alive = false;
          registerCircleHit(t);
          break;
        }
      } else if (t.type === 'track' && t._draw) {
        if (distance(CX, CY, t._draw.x, t._draw.y) <= t._draw.r) {
          hit = true;
          break;
        }
      }
    }

    if (!hit && selectedMode !== 'tracking' && selectedMode !== 'dualtracking' && selectedMode !== 'orbit') {
      misses++;
      streak = 0;
      document.getElementById('hudMisses').textContent = misses;
      sfxMiss();
      updateAccuracy();
    }
    showHitmarker(hit);
  }

  function fireWeapon() {
    if (!running || paused) return;
    if (selectedWeapon === 'sniper') sfxSniper(); else sfxAR();
    flashShot();
    handleShot();
  }

  // ==================== TICK ENGINE ====================
  function tickSpawns(now, dt) {
    if (selectedMode === 'moving' || selectedMode === 'strafeduel') {
      targets.forEach(t => {
        t.x = t.baseX + Math.sin(now / 1000 * t.speed + t.phase) * t.range;
        t.y = t.baseY + Math.cos(now / 1400 * t.speed + t.phase) * 0.25;
      });
    } else if (selectedMode === 'tracking' || selectedMode === 'dualtracking' || selectedMode === 'orbit') {
      let isAnyTargetTracked = false;
      targets.forEach(t => {
        t.angle += t.speed * dt;
        t.x = t.cx + Math.cos(t.angle) * t.radius;
        t.y = t.cy + Math.sin(t.angle * 1.3) * t.radius * 0.55;
        if (t._draw && distance(CX, CY, t._draw.x, t._draw.y) <= t._draw.r) {
          isAnyTargetTracked = true;
          t.held += dt;
          if (t.held > 0.08) {
            score += Math.round(25 * dt * 10);
            t.held = 0;
            document.getElementById('hudScore').textContent = score;
          }
        }
      });

      trackingTimeTotal += dt;
      if (isAnyTargetTracked) {
        trackingTimeOnTarget += dt;
        if (!isTrackingOnTarget) {
          sfxHit();
          isTrackingOnTarget = true;
        }
      } else {
        isTrackingOnTarget = false;
      }

      const trkAcc = trackingTimeTotal > 0 ? clamp((trackingTimeOnTarget / trackingTimeTotal) * 100, 0, 100) : 0;
      document.getElementById('hudAcc').textContent = trkAcc.toFixed(1) + '%';
      document.getElementById('hudHits').textContent = trackingTimeOnTarget.toFixed(1) + 's';
      document.getElementById('hudMisses').textContent = Math.max(0, trackingTimeTotal - trackingTimeOnTarget).toFixed(1) + 's';
    } else if (selectedMode === 'flick' || selectedMode === 'microshot' || selectedMode === 'reflex360') {
      targets = targets.filter(t => t.alive && now - t.born < t.lifeMs);
      if (!targets.length && now - lastSpawn > 100) {
        targets.push(selectedMode === 'microshot' ? makeMicroshot() : makeCircle());
        lastSpawn = now;
      }
    } else if (selectedMode === 'targetstorm') {
      targets.forEach(t => {
        t.x = t.baseX + Math.sin(now / 1000 * t.speed + t.phase) * t.ampX;
        t.y = t.baseY + Math.cos(now / 1200 * t.speed + t.phase) * 0.4;
      });
      if (targets.length < 5 && now - lastSpawn > 120) {
        targets.push(makeStormCircle(targets));
        lastSpawn = now;
      }
    } else if ((selectedMode === 'headshot' || selectedMode === 'headspeed') && !targets.length && now - lastSpawn > 320) {
      targets.push(makeDummy(false, { x: rand(-2.8, 2.8), y: rand(-0.05, 0.55), size: 0.76, depth: rand(10.2, 12.0) }));
      lastSpawn = now;
    }

    currentHealth = targets.find(t => t.type === 'dummy')?.hp ?? 150;
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;

    // Track FPS
    fpsFrames++;
    if (now - lastFpsTime >= 500) {
      currentFps = Math.round((fpsFrames * 1000) / (now - lastFpsTime));
      const fpsEl = document.getElementById('hudFps');
      if (fpsEl) fpsEl.textContent = currentFps;
      fpsFrames = 0;
      lastFpsTime = now;
    }

    drawBackground();
    targets.forEach(t => {
      if (t.type === 'dummy') t._draw = drawDummy(t);
      else if (t.type === 'flat') drawFlat(t);
      else if (t.type === 'track') drawTrack(t);
    });

    drawWeapon(now);
    updateWeaponHud();

    if (!paused) {
      tickSpawns(now, dt);
      if (selectedDuration === null) {
        document.getElementById('hudTimer').textContent = '∞';
      } else {
        const remain = Math.max(0, (sessionEnd - now) / 1000);
        document.getElementById('hudTimer').textContent = remain.toFixed(1);
        if (remain <= 0) {
          endSession();
          return;
        }
      }

      const w = WEAPONS[selectedWeapon];
      if (w.auto && mouseDown && now - lastAutoShot >= w.interval) {
        fireWeapon();
        lastAutoShot = now;
      }
    } else {
      document.getElementById('hudTimer').textContent = (selectedDuration === null ? '∞' : selectedDuration.toFixed(1));
    }

    requestAnimationFrame(frame);
  }

  // ==================== POINTER LOCK & INPUT ====================
  function requestLock() {
    if (document.pointerLockElement === canvas) {
      lockOverlay.classList.add('hidden');
      if (running) {
        paused = false;
        pauseModal.classList.add('hidden');
        if (!sessionEnd || sessionEnd <= performance.now()) {
          sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
        }
      }
      return;
    }
    if (!canvas.requestPointerLock) return;
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  function onMouseMove(e) {
    if (document.pointerLockElement !== canvas || !SENS || paused) return;
    yaw += e.movementX * SENS.radiansPerCount;
    pitch += e.movementY * SENS.radiansPerCount;
    const maxPitch = (SENS.fov * Math.PI / 180) * 0.46;
    pitch = clamp(pitch, -maxPitch, maxPitch);
  }
  document.addEventListener('mousemove', onMouseMove);

  document.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (document.pointerLockElement !== canvas) return;
    if (!running || paused) return;
    mouseDown = true;
    if (selectedWeapon === 'sniper') fireWeapon();
    else if (selectedWeapon === 'ar' && performance.now() - lastAutoShot >= WEAPONS.ar.interval) {
      fireWeapon();
      lastAutoShot = performance.now();
    }
  });

  document.addEventListener('mouseup', e => {
    if (e.button === 0) mouseDown = false;
  });
  window.addEventListener('blur', () => { mouseDown = false; });
  document.addEventListener('contextmenu', e => { if (running) e.preventDefault(); });

  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === canvas;
    lockOverlay.classList.toggle('hidden', locked);

    if (locked && running) {
      paused = false;
      pauseModal.classList.add('hidden');
      sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
      sfxStart();
    } else if (running) {
      paused = true;
      mouseDown = false;
      openPauseModal();
    }
  });

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  lockOverlay.addEventListener('click', () => {
    if (isTouchDevice) {
      lockOverlay.classList.add('hidden');
      if (running) {
        paused = false;
        pauseModal.classList.add('hidden');
        if (!sessionEnd || sessionEnd <= performance.now()) {
          sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
        }
      }
      return;
    }
    if (document.pointerLockElement === canvas) {
      lockOverlay.classList.add('hidden');
      if (running) {
        paused = false;
        pauseModal.classList.add('hidden');
        if (!sessionEnd || sessionEnd <= performance.now()) {
          sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
        }
      }
    } else {
      requestLock();
    }
  });

  canvas.addEventListener('click', () => {
    if (isTouchDevice) {
      if (paused && running) {
        lockOverlay.classList.add('hidden');
        paused = false;
        if (!sessionEnd || sessionEnd <= performance.now()) {
          sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
        }
      }
      return;
    }
    if (document.pointerLockElement !== canvas) {
      requestLock();
    } else if (paused && running && pauseModal.classList.contains('hidden')) {
      lockOverlay.classList.add('hidden');
      paused = false;
      if (!sessionEnd || sessionEnd <= performance.now()) {
        sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
      }
    }
  });

  // Touch Drag Aiming & Touch Tapping for Mobile & Tablet Range Play
  let lastTouchX = 0, lastTouchY = 0;
  canvas.addEventListener('touchstart', e => {
    if (!running) return;
    if (paused) {
      paused = false;
      lockOverlay.classList.add('hidden');
      pauseModal.classList.add('hidden');
      if (!sessionEnd || sessionEnd <= performance.now()) {
        sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
      }
    }
    if (e.touches && e.touches.length >= 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      mouseDown = true;
      if (selectedWeapon === 'sniper') fireWeapon();
      else if (selectedWeapon === 'ar' && performance.now() - lastAutoShot >= WEAPONS.ar.interval) {
        fireWeapon();
        lastAutoShot = performance.now();
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    if (!running || paused) return;
    e.preventDefault();
    if (e.touches && e.touches.length >= 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchX;
      const dy = touch.clientY - lastTouchY;
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      yaw += dx * 0.0035;
      pitch -= dy * 0.0035;
      pitch = clamp(pitch, -Math.PI * 0.44, Math.PI * 0.44);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    mouseDown = false;
  });

  // ==================== PAUSE MODAL & ESC HANDLING ====================
  function openPauseModal() {
    if (!running) return;
    const mode = MODES.find(m => m.id === selectedMode);
    const weapon = WEAPONS[selectedWeapon];
    document.getElementById('pauseModeDetails').textContent = `${mode ? mode.name : selectedMode} · ${weapon ? weapon.name : selectedWeapon}`;
    document.getElementById('pauseScore').textContent = score;
    document.getElementById('pauseHits').textContent = hits;
    const total = hits + misses;
    document.getElementById('pauseAcc').textContent = (total ? Math.round((hits / total) * 100) : 100) + '%';
    pauseModal.classList.remove('hidden');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (keybindsModal && !keybindsModal.classList.contains('hidden')) {
        keybindsModal.classList.add('hidden');
        return;
      }
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      } else if (running && !pauseModal.classList.contains('hidden')) {
        requestLock();
      }
    } else if (e.key.toLowerCase() === 'm' && !running) {
      isMuted = !isMuted;
      document.getElementById('svgSoundOn').classList.toggle('hidden', isMuted);
      document.getElementById('svgSoundOff').classList.toggle('hidden', !isMuted);
    } else if (e.key.toLowerCase() === 'k' && !running) {
      toggleKeybinds();
    } else if (e.key.toLowerCase() === 'r') {
      const summaryVisible = !document.getElementById('summaryScreen').classList.contains('hidden');
      if (running || summaryVisible) {
        pauseModal.classList.add('hidden');
        startSession();
        if (document.pointerLockElement === canvas) {
          showReloadToast();
        }
      }
    } else if (e.key === 'Enter' || e.key === 'NumpadEnter') {
      // If keybinds modal is open, dismiss it
      if (keybindsModal && !keybindsModal.classList.contains('hidden')) {
        keybindsModal.classList.add('hidden');
        return;
      }
      // If paused, resume session
      if (running && !pauseModal.classList.contains('hidden')) {
        pauseModal.classList.add('hidden');
        requestLock();
        return;
      }
      // If on Start Screen or Summary Screen, launch session!
      const startVisible = !document.getElementById('startScreen').classList.contains('hidden');
      const summaryVisible = !document.getElementById('summaryScreen').classList.contains('hidden');
      if (startVisible || summaryVisible) {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          document.activeElement.blur();
        }
        startSession();
      }
    }
  });

  document.getElementById('btnResume').addEventListener('click', () => {
    pauseModal.classList.add('hidden');
    requestLock();
  });

  document.getElementById('btnRestart').addEventListener('click', () => {
    pauseModal.classList.add('hidden');
    startSession();
  });

  document.getElementById('btnPauseReturnMenu').addEventListener('click', () => {
    returnToMenu();
  });

  document.getElementById('btnExit').addEventListener('click', () => {
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    } else {
      openPauseModal();
    }
  });

  function returnToMenu() {
    running = false;
    paused = true;
    mouseDown = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    pauseModal.classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('summaryScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    renderModeGrid();
    renderWeaponGrid();
    updateLaunchBar();
    updateRankProgression();
  }

  // ==================== SESSION LIFECYCLE ====================
  function startSession() {
    if (routineCountdownTimer) {
      clearInterval(routineCountdownTimer);
      routineCountdownTimer = null;
    }

    SENS = computeSensitivity();
    updateFocalLength();
    hits = 0;
    misses = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    headshots = 0;
    reactionTimes = [];
    mouseDown = false;
    lastAutoShot = 0;
    shotFlashUntil = 0;
    currentHealth = 150;
    fpsFrames = 0;
    lastFpsTime = performance.now();

    // Reset tracking metrics
    trackingTimeTotal = 0;
    trackingTimeOnTarget = 0;
    isTrackingOnTarget = false;

    setupMode();

    ['hudHits', 'hudMisses', 'hudScore'].forEach(id => document.getElementById(id).textContent = '0');
    document.getElementById('hudAcc').textContent = (selectedMode === 'tracking' || selectedMode === 'dualtracking' || selectedMode === 'orbit') ? '0%' : '100%';
    const streakEl = document.getElementById('hudStreak');
    if (streakEl) streakEl.textContent = 'STREAK 0';
    updateWeaponHud();

    // Routine Badge update
    const routineBadge = document.getElementById('hudRoutineBadge');
    const routineText = document.getElementById('hudRoutineText');
    if (activeRoutine) {
      if (routineBadge) routineBadge.classList.remove('hidden');
      if (routineText) routineText.textContent = `ROUTINE: ${routineStepIndex + 1}/${activeRoutine.drills.length}`;
    } else {
      if (routineBadge) routineBadge.classList.add('hidden');
    }

    pauseModal.classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('summaryScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    running = true;
    lastFrame = performance.now();

    const isLocked = document.pointerLockElement === canvas;
    if (isLocked) {
      paused = false;
      lockOverlay.classList.add('hidden');
      sessionEnd = (selectedDuration === null ? Infinity : performance.now() + selectedDuration * 1000);
      sfxReload();
    } else {
      paused = true;
      lockOverlay.classList.remove('hidden');
    }

    requestAnimationFrame(frame);
  }

  function advanceRoutineStep() {
    if (!activeRoutine) return;
    if (routineCountdownTimer) {
      clearInterval(routineCountdownTimer);
      routineCountdownTimer = null;
    }
    routineStepIndex++;
    if (routineStepIndex < activeRoutine.drills.length) {
      const step = activeRoutine.drills[routineStepIndex];
      selectedMode = step.mode;
      selectedWeapon = step.wep;
      selectedDuration = step.dur;
      startSession();
    } else {
      activeRoutine = null;
      returnToMenu();
    }
  }

  function endSession() {
    running = false;
    mouseDown = false;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    sfxEnd();

    setHighScore(selectedMode, selectedWeapon, score);
    const hs = getHighScores();
    const k = selectedMode + '_' + selectedWeapon;

    // Accurate calculation for tracking and shooting modes
    const isTrackingMode = (selectedMode === 'tracking' || selectedMode === 'dualtracking' || selectedMode === 'orbit');
    const total = hits + misses;
    let acc = 0;
    if (isTrackingMode) {
      acc = trackingTimeTotal > 0 ? clamp(Math.round((trackingTimeOnTarget / trackingTimeTotal) * 100), 0, 100) : 0;
    } else {
      acc = total > 0 ? clamp(Math.round((hits / total) * 100), 0, 100) : 0;
    }

    const avgReact = reactionTimes.length ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;

    const mode = MODES.find(m => m.id === selectedMode);
    const weapon = WEAPONS[selectedWeapon];

    // Compute genuine competitive EXP
    const hsPct = hits > 0 ? Math.round((headshots / hits) * 100) : 0;
    const earnedExp = calculateSessionExp(score, acc, hsPct, selectedDifficulty, selectedDuration, hits);

    // Save to lifetime XP
    try {
      let curLifetime = parseInt(localStorage.getItem('rangeaim_lifetime_xp_v5') || '0', 10);
      curLifetime += earnedExp;
      localStorage.setItem('rangeaim_lifetime_xp_v5', curLifetime.toString());
    } catch (e) {}

    recordSession({
      mode: selectedMode,
      modeName: mode ? mode.name : selectedMode,
      weapon: selectedWeapon,
      weaponName: weapon ? weapon.name : selectedWeapon,
      score,
      exp: earnedExp,
      accuracy: acc,
      reaction: avgReact,
      hits,
      misses,
      headshots,
      maxStreak,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('summaryScreen').classList.remove('hidden');

    const durationLabel = selectedDuration === null ? 'Unlimited' : selectedDuration + 's';
    document.getElementById('summaryMode').textContent = `${mode ? mode.name : selectedMode} · ${weapon ? weapon.name : selectedWeapon} · ${durationLabel} · ${selectedDifficulty}`;
    document.getElementById('sumScore').textContent = score;
    document.getElementById('sumBest').textContent = hs[k] || score;
    document.getElementById('sumAcc').textContent = acc + '%';
    document.getElementById('sumReact').textContent = avgReact ? avgReact + 'ms' : '--';

    // Performance Tier / Grade calculation
    let grade = 'C';
    let gradeTitle = 'WARMUP COMPLETE';
    let gradeColor = '#94a3b8';
    if (acc >= 90 && (score >= 1800 || hits >= 22)) {
      grade = 'S+';
      gradeTitle = 'DIVINE SHARPSHOOTER';
      gradeColor = '#facc15';
    } else if (acc >= 80 && (score >= 1200 || hits >= 15)) {
      grade = 'S';
      gradeTitle = 'APEX MARKSMAN';
      gradeColor = '#38bdf8';
    } else if (acc >= 65 && (score >= 700 || hits >= 10)) {
      grade = 'A';
      gradeTitle = 'PRO CONTENDER';
      gradeColor = '#4ade80';
    } else if (acc >= 45) {
      grade = 'B';
      gradeTitle = 'COMPETITIVE RIVAL';
      gradeColor = '#c084fc';
    }

    const gradeBadge = document.getElementById('sumGradeBadge');
    const gradeTitleEl = document.getElementById('sumGradeTitle');
    const xpEarnedEl = document.getElementById('sumXpEarned');
    if (gradeBadge) {
      gradeBadge.textContent = grade;
      gradeBadge.style.color = gradeColor;
      gradeBadge.style.borderColor = gradeColor;
      gradeBadge.style.boxShadow = `0 0 25px ${gradeColor}40`;
    }
    if (gradeTitleEl) gradeTitleEl.textContent = gradeTitle;
    if (xpEarnedEl) xpEarnedEl.textContent = `+${earnedExp.toLocaleString()} EXP EARNED`;

    // Dynamic stats and labels
    const sumHitsLabel = document.getElementById('sumHitsLabel');
    const sumMissesLabel = document.getElementById('sumMissesLabel');
    if (isTrackingMode) {
      if (sumHitsLabel) sumHitsLabel.textContent = 'Time On Target';
      if (sumMissesLabel) sumMissesLabel.textContent = 'Time Off Target';
      document.getElementById('sumHits').textContent = trackingTimeOnTarget.toFixed(1) + 's';
      document.getElementById('sumMisses').textContent = Math.max(0, trackingTimeTotal - trackingTimeOnTarget).toFixed(1) + 's';
    } else {
      if (sumHitsLabel) sumHitsLabel.textContent = 'Total Hits';
      if (sumMissesLabel) sumMissesLabel.textContent = 'Total Misses';
      document.getElementById('sumHits').textContent = hits;
      document.getElementById('sumMisses').textContent = misses;
    }

    const sumHeadshotsEl = document.getElementById('sumHeadshots');
    const sumStreakEl = document.getElementById('sumStreak');
    if (sumHeadshotsEl) sumHeadshotsEl.textContent = headshots;
    if (sumStreakEl) sumStreakEl.textContent = maxStreak;

    // Accuracy Breakdown Bar
    const sumAccuracyLabel = document.getElementById('sumAccuracyLabel');
    const sumBarHits = document.getElementById('sumBarHits');
    const sumBarMisses = document.getElementById('sumBarMisses');
    const sumLegendHits = document.getElementById('sumLegendHits');
    const sumLegendMisses = document.getElementById('sumLegendMisses');
    const sumLegendHs = document.getElementById('sumLegendHs');

    if (sumAccuracyLabel) sumAccuracyLabel.textContent = `${acc}% Accuracy`;
    if (sumBarHits) sumBarHits.style.width = acc + '%';
    if (sumBarMisses) sumBarMisses.style.width = (100 - acc) + '%';
    if (sumLegendHits) sumLegendHits.textContent = isTrackingMode ? trackingTimeOnTarget.toFixed(1) + 's' : hits;
    if (sumLegendMisses) sumLegendMisses.textContent = isTrackingMode ? Math.max(0, trackingTimeTotal - trackingTimeOnTarget).toFixed(1) + 's' : misses;
    if (sumLegendHs) sumLegendHs.textContent = headshots;

    // Routine Intermission Logic
    const nextBanner = document.getElementById('routineNextBanner');
    if (activeRoutine && routineStepIndex < activeRoutine.drills.length - 1) {
      const nextStep = activeRoutine.drills[routineStepIndex + 1];
      const nextMode = MODES.find(m => m.id === nextStep.mode);
      const nextWeapon = WEAPONS[nextStep.wep];
      const nextTitleEl = document.getElementById('routineNextTitle');
      if (nextTitleEl) nextTitleEl.textContent = `Next Stage (${routineStepIndex + 2}/${activeRoutine.drills.length}): ${nextMode ? nextMode.name : nextStep.mode} (${nextWeapon ? nextWeapon.name : nextStep.wep})`;
      if (nextBanner) nextBanner.classList.remove('hidden');

      let cd = 4;
      const countdownEl = document.getElementById('routineCountdownNum');
      if (countdownEl) countdownEl.textContent = cd;
      if (routineCountdownTimer) clearInterval(routineCountdownTimer);
      routineCountdownTimer = setInterval(() => {
        cd--;
        if (countdownEl) countdownEl.textContent = cd;
        if (cd <= 0) {
          clearInterval(routineCountdownTimer);
          routineCountdownTimer = null;
          advanceRoutineStep();
        }
      }, 1000);
    } else {
      if (nextBanner) nextBanner.classList.add('hidden');
      if (activeRoutine) {
        document.getElementById('summaryMode').textContent = `★ ${activeRoutine.name} COMPLETE ★ · All stages finished!`;
        activeRoutine = null;
      }
    }
  }

  // ==================== KEYBINDS MODAL ====================
  function toggleKeybinds() {
    if (!keybindsModal) return;
    keybindsModal.classList.toggle('hidden');
  }

  const btnOpenKeybinds = document.getElementById('btnOpenKeybinds');
  const btnCloseKeybinds = document.getElementById('btnCloseKeybinds');
  const btnDismissKeybinds = document.getElementById('btnDismissKeybinds');

  if (btnOpenKeybinds) btnOpenKeybinds.addEventListener('click', toggleKeybinds);
  if (btnCloseKeybinds) btnCloseKeybinds.addEventListener('click', toggleKeybinds);
  if (btnDismissKeybinds) btnDismissKeybinds.addEventListener('click', toggleKeybinds);

  // ==================== DIRECT WINDOWS .EXE DOWNLOAD (TOP RIGHT BUTTON) ====================
  const btnNavDownload = document.getElementById('btnNavDownload');
  const btnHeroOpenDownload = document.getElementById('btnHeroOpenDownload');
  const btnHeroEnterRange = document.getElementById('btnHeroEnterRange');

  if (btnHeroEnterRange) btnHeroEnterRange.addEventListener('click', startSession);

  function triggerExeDownload(e) {
    sfxUiClick();
    showToast('Downloading Roblox_Rivals_RANGE_Aim_Trainer.exe...', '⬇');

    // Hidden iframe stream ensures download starts instantly in all browser environments
    try {
      let dlIframe = document.getElementById('dlHiddenIframe');
      if (!dlIframe) {
        dlIframe = document.createElement('iframe');
        dlIframe.id = 'dlHiddenIframe';
        dlIframe.style.display = 'none';
        document.body.appendChild(dlIframe);
      }
      dlIframe.src = '/Roblox_Rivals_RANGE_Aim_Trainer.exe?t=' + Date.now();
    } catch (err) {}

    setTimeout(() => {
      showToast('Download started! Check your downloads folder.', '⚡');
    }, 1200);
  }

  if (btnNavDownload) {
    btnNavDownload.addEventListener('click', triggerExeDownload);
  }
  if (btnHeroOpenDownload) {
    btnHeroOpenDownload.addEventListener('click', triggerExeDownload);
  }

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        navigator.serviceWorker.register('/public/sw.js').catch(() => {});
      });
    });
  }

  // ==================== EVENT LISTENERS & CHIP CONTROLS ====================
  // Search Input for Drills
  const drillSearchInput = document.getElementById('drillSearchInput');
  if (drillSearchInput) {
    drillSearchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      renderModeGrid();
    });
  }

  // Hub Tabs
  const hubTabs = document.getElementById('hubTabs');
  hubTabs.addEventListener('click', e => {
    const tabBtn = e.target.closest('.hub-tab');
    if (!tabBtn) return;
    const tabName = tabBtn.dataset.tab;
    activeTab = tabName;
    sfxUiClick();

    hubTabs.querySelectorAll('.hub-tab').forEach(b => b.classList.toggle('active', b === tabBtn));

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === 'panel' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    });

    if (tabName === 'analytics') updateAnalyticsTab();
    if (tabName === 'weapons') setTimeout(drawRecoilPatternStatic, 50);
  });

  // Mode Filter Chips
  const modeFilterChips = document.getElementById('modeFilterChips');
  if (modeFilterChips) {
    modeFilterChips.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      modeFilter = chip.dataset.filter;
      modeFilterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c === chip));
      renderModeGrid();
      sfxUiClick();
    });
  }

  // Duration & Difficulty Chips
  function wireChipGroup(containerId, onSelect) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      [...el.children].forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      onSelect(chip.dataset.v);
      updateLaunchBar();
      sfxUiClick();
    });
  }

  wireChipGroup('durationChips', v => selectedDuration = (v === 'unlimited' ? null : parseInt(v, 10)));
  wireChipGroup('difficultyChips', v => selectedDifficulty = v);
  wireChipGroup('crosshairChips', v => { crosshairStyle = v; updateCrosshairs(); });
  wireChipGroup('crosshairSizeChips', v => { crosshairSize = v; updateCrosshairs(); });
  wireChipGroup('soundProfileChips', v => { selectedSoundProfile = v; playHitSound(true); });

  // Crosshair Swatches
  const swatchesEl = document.getElementById('crosshairSwatches');
  if (swatchesEl) {
    swatchesEl.addEventListener('click', e => {
      const sw = e.target.closest('.swatch');
      if (!sw) return;
      [...swatchesEl.children].forEach(c => c.classList.remove('active'));
      sw.classList.add('active');
      crosshairColor = sw.dataset.v;
      updateCrosshairs();
      sfxUiClick();
    });
  }

  // Target Color Swatches
  const targetSwatchesEl = document.getElementById('targetColorSwatches');
  if (targetSwatchesEl) {
    targetSwatchesEl.addEventListener('click', e => {
      const sw = e.target.closest('.swatch');
      if (!sw) return;
      [...targetSwatchesEl.children].forEach(c => c.classList.remove('active'));
      sw.classList.add('active');
      selectedTargetTheme = sw.dataset.v || 'classic';
      sfxUiClick();
    });
  }

  // Audition Hit Sound
  const btnAuditionSound = document.getElementById('btnAuditionSound');
  if (btnAuditionSound) {
    btnAuditionSound.addEventListener('click', () => {
      playHitSound(false);
    });
  }

  const btnAuditionHead = document.getElementById('btnAuditionHead');
  if (btnAuditionHead) {
    btnAuditionHead.addEventListener('click', () => {
      playHitSound(true);
    });
  }

  // Scope Zoom Chips
  const scopeZoomChips = document.getElementById('scopeZoomChips');
  if (scopeZoomChips) {
    scopeZoomChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      scopeZoomChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedScopeZoom = parseFloat(chip.dataset.zoom) || 2.5;
      updateScopeScaler();
    });
  }

  // Pro Reticle Presets
  const proPresetChips = document.getElementById('proPresetChips');
  if (proPresetChips) {
    proPresetChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      proPresetChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const p = chip.dataset.preset;
      if (p === 'tanqr') {
        crosshairStyle = 'dot'; crosshairColor = '#38bdf8'; crosshairSize = 'small'; crosshairOutline = true; crosshairDot = false;
      } else if (p === 'viper') {
        crosshairStyle = 'cross'; crosshairColor = '#5dffa0'; crosshairSize = 'small'; crosshairOutline = true; crosshairDot = false;
      } else if (p === 'holo') {
        crosshairStyle = 'circle'; crosshairColor = '#38bdf8'; crosshairSize = 'medium'; crosshairOutline = true; crosshairDot = true;
      } else if (p === 'tcross') {
        crosshairStyle = 'tcross'; crosshairColor = '#ffd23e'; crosshairSize = 'medium'; crosshairOutline = true; crosshairDot = false;
      } else if (p === 'box') {
        crosshairStyle = 'box'; crosshairColor = '#ffffff'; crosshairSize = 'medium'; crosshairOutline = true; crosshairDot = true;
      }
      const chkOutline = document.getElementById('chkCrosshairOutline');
      const chkDot = document.getElementById('chkCrosshairDot');
      if (chkOutline) chkOutline.checked = crosshairOutline;
      if (chkDot) chkDot.checked = crosshairDot;

      // Update crosshairChips UI active state
      const chChips = document.getElementById('crosshairChips');
      if (chChips) {
        chChips.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.v === crosshairStyle));
      }
      // Update swatch active state
      const swatches = document.getElementById('crosshairSwatches');
      if (swatches) {
        swatches.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.v === crosshairColor));
      }

      updateCrosshairs();
    });
  }

  const chkCrosshairOutline = document.getElementById('chkCrosshairOutline');
  if (chkCrosshairOutline) {
    chkCrosshairOutline.addEventListener('change', e => {
      crosshairOutline = e.target.checked;
      updateCrosshairs();
    });
  }

  const chkCrosshairDot = document.getElementById('chkCrosshairDot');
  if (chkCrosshairDot) {
    chkCrosshairDot.addEventListener('change', e => {
      crosshairDot = e.target.checked;
      updateCrosshairs();
    });
  }

  // Routine Launchers
  document.querySelectorAll('.btn-start-routine').forEach(btn => {
    btn.addEventListener('click', () => {
      const routineId = btn.dataset.routine;
      const routine = ROUTINES[routineId];
      if (!routine) return;
      activeRoutine = routine;
      routineStepIndex = 0;
      routineDrillResults = [];
      const firstStep = routine.drills[0];
      selectedMode = firstStep.mode;
      selectedWeapon = firstStep.wep;
      selectedDuration = firstStep.dur;
      startSession();
    });
  });

  const btnNextRoutineDrill = document.getElementById('btnNextRoutineDrill');
  if (btnNextRoutineDrill) {
    btnNextRoutineDrill.addEventListener('click', advanceRoutineStep);
  }

  // Rivals Pro Guide Navbar Trigger
  const btnOpenGuide = document.getElementById('btnOpenGuide');
  if (btnOpenGuide) {
    btnOpenGuide.addEventListener('click', () => {
      activeTab = 'guide';
      hubTabs.querySelectorAll('.hub-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === 'guide'));
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === 'panelGuide');
      });
      document.getElementById('panelGuide').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Discord Stats Share Card generator
  function copyDiscordStatsCard() {
    const history = getSessionHistory();
    const latest = history[0];
    const mode = latest ? (latest.modeName || latest.mode) : selectedMode;
    const wep = latest ? (latest.weaponName || latest.weapon) : selectedWeapon;
    const sc = latest ? latest.score : score;
    const ac = latest ? latest.accuracy : 100;
    const hs = latest ? (latest.headshots || 0) : headshots;
    const rt = latest && latest.reaction ? latest.reaction + 'ms' : '185ms';

    const cardText = [
      `🎯 **ROBLOX RIVALS AIM TRAINING // REPORT**`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⚡ **Mode**: ${mode}`,
      `🔫 **Weapon**: ${wep}`,
      `🏆 **Score**: ${sc}`,
      `🎯 **Accuracy**: ${ac}%`,
      `👑 **Headshots**: ${hs}`,
      `⚡ **Avg Reaction**: ${rt}`,
      `🏅 **Tier**: Ranked Ready`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Trained on ROBLOX RIVALS // RANGE*`
    ].join('\n');

    navigator.clipboard.writeText(cardText).then(() => {
      const origText = event && event.currentTarget ? event.currentTarget.innerText : '';
      if (event && event.currentTarget) {
        event.currentTarget.innerText = '✓ COPIED!';
        setTimeout(() => { if (event.currentTarget) event.currentTarget.innerText = origText; }, 1500);
      }
    }).catch(() => {
      prompt('Copy Discord Stats Card:', cardText);
    });
  }

  const btnCopyDiscordStats = document.getElementById('btnCopyDiscordStats');
  if (btnCopyDiscordStats) btnCopyDiscordStats.addEventListener('click', copyDiscordStatsCard);

  const btnSummaryDiscord = document.getElementById('btnSummaryDiscord');
  if (btnSummaryDiscord) btnSummaryDiscord.addEventListener('click', copyDiscordStatsCard);

  // Export JSON history
  const btnExportHistory = document.getElementById('btnExportHistory');
  if (btnExportHistory) {
    btnExportHistory.addEventListener('click', () => {
      const history = getSessionHistory();
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roblox_rivals_aim_history_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ==================== NEW FEATURES: PRO PRESETS, STRETCHED RES, PROFILES, TTK ====================
  // Rivals Pro Presets
  const PRO_PLAYERS = {
    tanqr: { sens: 52, dpi: 800, fov: 103, mult: 0.5, wep: 'sniper', reticle: 'tanqr' },
    viper: { sens: 38, dpi: 800, fov: 103, mult: 0.5, wep: 'sniper', reticle: 'viper' },
    bandites: { sens: 65, dpi: 800, fov: 100, mult: 0.5, wep: 'ar', reticle: 'holo' },
    minish: { sens: 45, dpi: 1600, fov: 105, mult: 0.5, wep: 'ar', reticle: 'tcross' }
  };

  const proPlayerChips = document.getElementById('proPlayerChips');
  if (proPlayerChips) {
    proPlayerChips.addEventListener('click', e => {
      const btn = e.target.closest('.pro-chip');
      if (!btn) return;
      const proKey = btn.dataset.pro;
      const p = PRO_PLAYERS[proKey];
      if (p) {
        document.getElementById('inSens').value = p.sens;
        document.getElementById('inDpi').value = p.dpi;
        document.getElementById('inFov').value = p.fov;
        document.getElementById('inRoblox').value = p.mult;
        proPlayerChips.querySelectorAll('.pro-chip').forEach(b => b.classList.toggle('active', b === btn));
        selectedWeapon = p.wep;
        updateWeaponHud();
        updateWeaponGridSelection();
        refreshSensReadout();
        updateFocalLength();

        // Apply Pro Reticle
        const reticleChip = document.querySelector(`#proPresetChips .chip[data-preset="${p.reticle}"]`);
        if (reticleChip) reticleChip.click();

        sfxStart();
      }
    });
  }

  function updateWeaponGridSelection() {
    if (weaponGrid) {
      weaponGrid.querySelectorAll('.weapon-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.id === selectedWeapon);
      });
      updateModeBests();
      updateLaunchBar();
      drawRecoilPatternStatic();
    }
  }

  // Stretched Resolution Simulator
  const ASPECT_CONFIGS = {
    '16:9': { mult: 1.0, fov: 103, label: '+0% (Standard)', speed: '1.00x (Neutral)', scaleX: 1.0, desc: '16:9 native aspect ratio. Standard baseline hitbox width.' },
    '16:10': { mult: 1.11, fov: 97, label: '+11% Wider', speed: '1.11x Faster', scaleX: 1.11, desc: '16:10 stretched: Subtle 11% target expansion with moderate speed increase.' },
    '4:3': { mult: 1.33, fov: 90, label: '+33% (Meta Stretched)', speed: '1.33x Accelerated', scaleX: 1.33, desc: '4:3 stretched expands enemy heads & torsos by 33% on screen.' },
    '5:4': { mult: 1.42, fov: 86, label: '+42% (Ultra-Stretched)', speed: '1.42x Max Speed', scaleX: 1.42, desc: '5:4 ultra-stretched: Maximum 42% model width expansion used by flick specialists.' }
  };

  const resAspectChips = document.getElementById('resAspectChips');
  if (resAspectChips) {
    resAspectChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      resAspectChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const resKey = chip.dataset.res;
      const conf = ASPECT_CONFIGS[resKey] || ASPECT_CONFIGS['16:9'];

      const widthMultEl = document.getElementById('resWidthMult');
      const speedCompEl = document.getElementById('resSpeedComp');
      const equivFovEl = document.getElementById('resEquivFov');
      const hitboxLabelEl = document.getElementById('resHitboxLabel');
      const silhouetteRenderEl = document.getElementById('dummySilhouetteRender');

      if (widthMultEl) widthMultEl.textContent = conf.label;
      if (speedCompEl) speedCompEl.textContent = conf.speed;
      if (equivFovEl) equivFovEl.textContent = conf.fov + '°';
      if (hitboxLabelEl) hitboxLabelEl.textContent = conf.desc;
      if (silhouetteRenderEl) silhouetteRenderEl.style.transform = `scaleX(${conf.scaleX})`;

      sfxUiClick();
    });
  }

  // Custom Config Profiles Manager
  const PROFILES_STORAGE_KEY = 'rangeaim_custom_profiles_v3';
  function getCustomProfiles() {
    try {
      return JSON.parse(localStorage.getItem(PROFILES_STORAGE_KEY)) || [
        { name: 'Tanqr Aggressive Sniper', sens: 52, dpi: 800, fov: 103, wep: 'sniper', reticle: 'dot', color: '#38bdf8' }
      ];
    } catch (e) {
      return [];
    }
  }

  function saveCustomProfiles(list) {
    try { localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function renderProfilesList() {
    const listEl = document.getElementById('savedProfilesList');
    if (!listEl) return;
    const profiles = getCustomProfiles();

    if (!profiles.length) {
      listEl.innerHTML = `<div class="col-span-full text-xs text-slate-500 font-mono py-2">No custom profiles saved yet. Enter a name above to save your current configuration!</div>`;
      return;
    }

    listEl.innerHTML = profiles.map((p, idx) => `
      <div class="profile-item" data-idx="${idx}">
        <div class="profile-item-meta" title="Click to load this profile">
          <span class="profile-item-name">${p.name}</span>
          <span class="profile-item-details">${p.sens} Sens · ${p.dpi} DPI · ${p.wep.toUpperCase()}</span>
        </div>
        <button class="btn-delete-profile" data-del="${idx}" title="Delete profile">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `).join('');

    listEl.querySelectorAll('.profile-item-meta').forEach(meta => {
      meta.addEventListener('click', e => {
        const item = e.target.closest('.profile-item');
        const idx = parseInt(item.dataset.idx, 10);
        const p = profiles[idx];
        if (p) {
          document.getElementById('inSens').value = p.sens;
          document.getElementById('inDpi').value = p.dpi;
          document.getElementById('inFov').value = p.fov || 103;
          selectedWeapon = p.wep || 'sniper';
          if (p.reticle) crosshairStyle = p.reticle;
          if (p.color) crosshairColor = p.color;
          updateCrosshairs();
          updateWeaponHud();
          updateWeaponGridSelection();
          refreshSensReadout();
          updateFocalLength();
          sfxStart();
        }
      });
    });

    listEl.querySelectorAll('.btn-delete-profile').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const delIdx = parseInt(btn.dataset.del, 10);
        profiles.splice(delIdx, 1);
        saveCustomProfiles(profiles);
        renderProfilesList();
        sfxUiClick();
      });
    });
  }

  const btnSaveProfile = document.getElementById('btnSaveProfile');
  const inProfileName = document.getElementById('inProfileName');
  if (btnSaveProfile && inProfileName) {
    btnSaveProfile.addEventListener('click', () => {
      const name = inProfileName.value.trim();
      if (!name) {
        alert('Please enter a name for your custom profile');
        return;
      }
      const profiles = getCustomProfiles();
      const newProf = {
        name,
        sens: parseFloat(document.getElementById('inSens').value) || 55,
        dpi: parseFloat(document.getElementById('inDpi').value) || 800,
        fov: parseFloat(document.getElementById('inFov').value) || 103,
        mult: parseFloat(document.getElementById('inRoblox').value) || 0.5,
        wep: selectedWeapon,
        reticle: crosshairStyle,
        color: crosshairColor
      };
      profiles.unshift(newProf);
      saveCustomProfiles(profiles);
      inProfileName.value = '';
      renderProfilesList();
      sfxReload();
    });
  }

  // Weapon TTK Calculator
  const ttkHpChips = document.getElementById('ttkHpChips');
  let selectedTtkHp = 150;
  function updateTtkMatrix() {
    const hp = selectedTtkHp;
    const sniperHeadEl = document.getElementById('sniperHeadTtk');
    const sniperBodyEl = document.getElementById('sniperBodyTtk');
    const sniperBodyShotsEl = document.getElementById('sniperBodyShots');
    const arHeadEl = document.getElementById('arHeadTtk');
    const arHeadShotsEl = document.getElementById('arHeadShots');
    const arBodyEl = document.getElementById('arBodyTtk');
    const arBodyShotsEl = document.getElementById('arBodyShots');

    if (sniperHeadEl) sniperHeadEl.textContent = '0 ms';

    if (hp === 100) {
      if (sniperBodyEl) sniperBodyEl.textContent = '650 ms';
      if (sniperBodyShotsEl) sniperBodyShotsEl.textContent = '2 Bullets · 50 DMG each';
      if (arHeadEl) arHeadEl.textContent = '600 ms';
      if (arHeadShotsEl) arHeadShotsEl.textContent = '7 Bullets · 15 DMG each';
      if (arBodyEl) arBodyEl.textContent = '800 ms';
      if (arBodyShotsEl) arBodyShotsEl.textContent = '9 Bullets · 12 DMG each';
    } else {
      // 150 HP
      if (sniperBodyEl) sniperBodyEl.textContent = '1,300 ms';
      if (sniperBodyShotsEl) sniperBodyShotsEl.textContent = '3 Bullets · 50 DMG each';
      if (arHeadEl) arHeadEl.textContent = '900 ms';
      if (arHeadShotsEl) arHeadShotsEl.textContent = '10 Bullets · 15 DMG each';
      if (arBodyEl) arBodyEl.textContent = '1,200 ms';
      if (arBodyShotsEl) arBodyShotsEl.textContent = '13 Bullets · 12 DMG each';
    }
  }

  if (ttkHpChips) {
    ttkHpChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      ttkHpChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedTtkHp = parseInt(chip.dataset.hp, 10) || 150;
      updateTtkMatrix();
      sfxUiClick();
    });
  }

  // Hit Sound Pitch Slider
  const rngSoundPitch = document.getElementById('rngSoundPitch');
  const lblSoundPitch = document.getElementById('lblSoundPitch');
  if (rngSoundPitch && lblSoundPitch) {
    rngSoundPitch.addEventListener('input', e => {
      soundPitchMultiplier = parseFloat(e.target.value) || 1.0;
      lblSoundPitch.textContent = soundPitchMultiplier.toFixed(2) + 'x';
    });
    rngSoundPitch.addEventListener('change', () => {
      playHitSound(true);
    });
  }

  // Custom Color Picker & Geometry Sliders
  const crosshairColorPicker = document.getElementById('crosshairColorPicker');
  if (crosshairColorPicker) {
    crosshairColorPicker.addEventListener('input', e => {
      crosshairColor = e.target.value;
      if (swatchesEl) {
        [...swatchesEl.children].forEach(c => c.classList.remove('active'));
      }
      updateCrosshairs();
    });
  }

  const customCrosshairSliders = document.getElementById('customCrosshairSliders');
  const crosshairSizeChips = document.getElementById('crosshairSizeChips');
  if (crosshairSizeChips) {
    crosshairSizeChips.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      if (chip.dataset.v === 'custom') {
        if (customCrosshairSliders) customCrosshairSliders.classList.remove('hidden');
      } else {
        if (customCrosshairSliders) customCrosshairSliders.classList.add('hidden');
      }
    });
  }

  const rngChLength = document.getElementById('rngChLength');
  const rngChGap = document.getElementById('rngChGap');
  const rngChThickness = document.getElementById('rngChThickness');
  const lblChLength = document.getElementById('lblChLength');
  const lblChGap = document.getElementById('lblChGap');
  const lblChThickness = document.getElementById('lblChThickness');

  if (rngChLength && lblChLength) {
    rngChLength.addEventListener('input', e => {
      customChLength = parseInt(e.target.value, 10);
      lblChLength.textContent = customChLength + 'px';
      crosshairSize = 'custom';
      updateCrosshairs();
    });
  }
  if (rngChGap && lblChGap) {
    rngChGap.addEventListener('input', e => {
      customChGap = parseInt(e.target.value, 10);
      lblChGap.textContent = customChGap + 'px';
      crosshairSize = 'custom';
      updateCrosshairs();
    });
  }
  if (rngChThickness && lblChThickness) {
    rngChThickness.addEventListener('input', e => {
      customChThickness = parseInt(e.target.value, 10);
      lblChThickness.textContent = customChThickness + 'px';
      crosshairSize = 'custom';
      updateCrosshairs();
    });
  }

  // Sensitivity inputs
  ['inSens', 'inFov', 'inRoblox', 'inDpi'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      refreshSensReadout();
      updateFocalLength();
    });
  });

  // Game Presets
  const presetChips = document.getElementById('presetChips');
  if (presetChips) {
    presetChips.addEventListener('click', e => {
      const btn = e.target.closest('.preset-btn');
      if (!btn) return;
      const game = btn.dataset.game;
      const p = GAME_PRESETS[game];
      if (p) {
        document.getElementById('inSens').value = p.sens;
        document.getElementById('inDpi').value = p.dpi;
        document.getElementById('inFov').value = p.fov;
        document.getElementById('inRoblox').value = p.robloxMult;
        presetChips.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b === btn));
        refreshSensReadout();
        updateFocalLength();
      }
    });
  }

  // Sound Controls
  const volumeSlider = document.getElementById('volumeSlider');
  const btnToggleMute = document.getElementById('btnToggleMute');
  const svgSoundOn = document.getElementById('svgSoundOn');
  const svgSoundOff = document.getElementById('svgSoundOff');

  volumeSlider.addEventListener('input', e => {
    masterVolume = parseInt(e.target.value, 10) / 100;
    if (masterVolume > 0 && isMuted) {
      isMuted = false;
      svgSoundOn.classList.remove('hidden');
      svgSoundOff.classList.add('hidden');
    }
  });

  btnToggleMute.addEventListener('click', () => {
    isMuted = !isMuted;
    svgSoundOn.classList.toggle('hidden', isMuted);
    svgSoundOff.classList.toggle('hidden', !isMuted);
  });

  // Reset Records
  const btnResetStats = document.getElementById('btnResetStats');
  if (btnResetStats) {
    btnResetStats.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your local session history and reset rank progression?')) {
        localStorage.removeItem(HISTORY_KEY);
        localStorage.removeItem('rangeaim_lifetime_xp_v5');
        updateAnalyticsTab();
        updateRankProgression();
        showToast('Local history and rank progression reset cleanly.', '✓');
      }
    });
  }

  // ==================== TOAST NOTIFICATIONS ====================
  let toastTimer = null;
  function showToast(text, icon = '✓') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="text-cyan font-bold">${icon}</span><span>${text}</span>`;
    toast.classList.remove('hidden');
    toast.style.display = 'flex';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // ==================== INTERACTIVE AMBIENT CYBER CANVAS ====================
  function initAmbientCanvas() {
    const ambCanvas = document.getElementById('ambientCyberCanvas');
    if (!ambCanvas) return;
    const ambCtx = ambCanvas.getContext('2d');
    let aW = 0, aH = 0;
    const particles = [];
    const tacticalShapes = [];
    const ripples = [];
    const count = 55;
    let mouse = { x: -1000, y: -1000 };
    let scanOffset = 0;

    function resizeAmb() {
      aW = ambCanvas.width = window.innerWidth;
      aH = ambCanvas.height = window.innerHeight;
    }
    resizeAmb();
    window.addEventListener('resize', resizeAmb);

    const onPointerMove = e => {
      mouse.x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : -1000);
      mouse.y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : -1000);
    };
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // Interactive Energy Pulse / Shockwave Ripple on Click or Tap
    const triggerRipple = (x, y) => {
      if (running) return;
      ripples.push({
        x: x || aW / 2,
        y: y || aH / 2,
        radius: 4,
        maxRadius: Math.min(220, Math.max(120, aW * 0.2)),
        alpha: 0.85,
        speed: 3.5
      });
      if (ripples.length > 8) ripples.shift();
    };
    window.triggerAmbientRipple = triggerRipple;

    window.addEventListener('mousedown', e => {
      if (e.target.closest('#glCanvas')) return;
      triggerRipple(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', e => {
      if (e.target.closest('#glCanvas')) return;
      if (e.touches && e.touches[0]) {
        triggerRipple(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Generate Ambient Particles
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        r: Math.random() * 2.2 + 1,
        alpha: Math.random() * 0.45 + 0.2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI
      });
    }

    // Generate Floating Tactical Cyber Shapes (diamonds, reticle crosses)
    for (let i = 0; i < 9; i++) {
      tacticalShapes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vy: -0.2 - Math.random() * 0.35,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        size: 14 + Math.random() * 16,
        type: i % 2 === 0 ? 'diamond' : 'cross',
        alpha: 0.12 + Math.random() * 0.14
      });
    }

    function renderAmb() {
      requestAnimationFrame(renderAmb);
      // Skip rendering background canvas in active 3D game to allocate 100% CPU/GPU to the range
      if (running) return;

      ambCtx.clearRect(0, 0, aW, aH);
      scanOffset = (scanOffset + 0.4) % 40;

      // 1. Perspective Cyber Horizon Grid at the bottom
      const gridH = Math.min(220, aH * 0.35);
      const gridTop = aH - gridH;
      const numLines = 7;
      ambCtx.save();
      for (let i = 0; i < numLines; i++) {
        const ratio = (i / numLines);
        const y = gridTop + Math.pow(ratio, 1.8) * gridH;
        const lineAlpha = (ratio * 0.12);
        ambCtx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
        ambCtx.lineWidth = 1;
        ambCtx.beginPath();
        ambCtx.moveTo(0, y);
        ambCtx.lineTo(aW, y);
        ambCtx.stroke();
      }

      // Vertical perspective lines converging to horizon center
      const centerX = aW / 2;
      const numPersp = Math.floor(aW / 80);
      for (let i = -numPersp; i <= numPersp; i++) {
        const bottomX = centerX + i * 90;
        const topX = centerX + i * 35;
        ambCtx.strokeStyle = `rgba(56, 189, 248, 0.05)`;
        ambCtx.beginPath();
        ambCtx.moveTo(topX, gridTop);
        ambCtx.lineTo(bottomX, aH);
        ambCtx.stroke();
      }
      ambCtx.restore();

      // 2. Interactive Expanding Shockwave Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += rp.speed;
        rp.alpha *= 0.965;
        if (rp.alpha <= 0.01 || rp.radius >= rp.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ambCtx.save();
        ambCtx.strokeStyle = `rgba(56, 189, 248, ${rp.alpha})`;
        ambCtx.lineWidth = 2;
        ambCtx.beginPath();
        ambCtx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ambCtx.stroke();

        // Secondary subtle inner ring
        if (rp.radius > 20) {
          ambCtx.strokeStyle = `rgba(56, 189, 248, ${rp.alpha * 0.45})`;
          ambCtx.lineWidth = 1;
          ambCtx.beginPath();
          ambCtx.arc(rp.x, rp.y, rp.radius * 0.65, 0, Math.PI * 2);
          ambCtx.stroke();
        }
        ambCtx.restore();
      }

      // 3. Floating Tactical Cyber Shapes
      for (let i = 0; i < tacticalShapes.length; i++) {
        const ts = tacticalShapes[i];
        ts.y += ts.vy;
        ts.rot += ts.rotSpeed;
        if (ts.y < -50) {
          ts.y = aH + 40;
          ts.x = Math.random() * aW;
        }

        ambCtx.save();
        ambCtx.translate(ts.x, ts.y);
        ambCtx.rotate(ts.rot);
        ambCtx.strokeStyle = `rgba(56, 189, 248, ${ts.alpha})`;
        ambCtx.lineWidth = 1.2;

        if (ts.type === 'diamond') {
          ambCtx.beginPath();
          ambCtx.moveTo(0, -ts.size);
          ambCtx.lineTo(ts.size * 0.7, 0);
          ambCtx.lineTo(0, ts.size);
          ambCtx.lineTo(-ts.size * 0.7, 0);
          ambCtx.closePath();
          ambCtx.stroke();
        } else {
          // Tactical Reticle Cross
          const arm = ts.size * 0.6;
          ambCtx.beginPath();
          ambCtx.moveTo(-arm, 0); ambCtx.lineTo(arm, 0);
          ambCtx.moveTo(0, -arm); ambCtx.lineTo(0, arm);
          ambCtx.stroke();
          ambCtx.beginPath();
          ambCtx.arc(0, 0, arm * 0.45, 0, Math.PI * 2);
          ambCtx.stroke();
        }
        ambCtx.restore();
      }

      // 4. Particle Constellation Network
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = aW;
        if (p.x > aW) p.x = 0;
        if (p.y < 0) p.y = aH;
        if (p.y > aH) p.y = 0;

        // Pointer Deflection
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 110) {
          const factor = (1 - dist / 110) * 2.2;
          p.x -= (dx / dist) * factor;
          p.y -= (dy / dist) * factor;
        }

        const dynamicR = p.r + Math.sin(p.pulseVal) * 0.4;
        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.12;

        // Draw particle dot with glow
        ambCtx.fillStyle = `rgba(56, 189, 248, ${currentAlpha})`;
        ambCtx.beginPath();
        ambCtx.arc(p.x, p.y, Math.max(0.5, dynamicR), 0, Math.PI * 2);
        ambCtx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 125) {
            const lineAlpha = (1 - d / 125) * 0.16;
            ambCtx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ambCtx.lineWidth = 1;
            ambCtx.beginPath();
            ambCtx.moveTo(p.x, p.y);
            ambCtx.lineTo(p2.x, p2.y);
            ambCtx.stroke();
          }
        }
      }
    }
    renderAmb();
  }

  // ==================== CYBER ESPORTS THEME SWITCHER ====================
  const THEMES = {
    cyan: { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.28)', bright: '#7dd3fc' },
    crimson: { primary: '#ff5b3e', glow: 'rgba(255, 91, 62, 0.28)', bright: '#ff8a76' },
    gold: { primary: '#ffd23e', glow: 'rgba(250, 204, 21, 0.28)', bright: '#fef08a' },
    emerald: { primary: '#4ade80', glow: 'rgba(74, 222, 128, 0.28)', bright: '#86efac' },
    violet: { primary: '#c084fc', glow: 'rgba(192, 132, 252, 0.28)', bright: '#e9d5ff' }
  };
  const THEME_STORAGE_KEY = 'rangeaim_theme_v3';

  function applyTheme(themeKey) {
    const t = THEMES[themeKey] || THEMES.cyan;
    document.documentElement.style.setProperty('--cyan-primary', t.primary);
    document.documentElement.style.setProperty('--cyan-glow', t.glow);
    document.documentElement.style.setProperty('--cyan-bright', t.bright);
    document.documentElement.style.setProperty('--border-active', t.primary);

    const wrap = document.getElementById('themePickerWrap');
    if (wrap) {
      wrap.querySelectorAll('.theme-chip').forEach(c => c.classList.toggle('active', c.dataset.theme === themeKey));
    }
    try { localStorage.setItem(THEME_STORAGE_KEY, themeKey); } catch (e) {}
  }

  function initThemeSwitcher() {
    const wrap = document.getElementById('themePickerWrap');
    if (wrap) {
      wrap.addEventListener('click', e => {
        const chip = e.target.closest('.theme-chip');
        if (!chip) return;
        applyTheme(chip.dataset.theme);
        sfxUiClick();
        showToast(`Theme activated: ${chip.title}`);
      });
    }
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'cyan';
    applyTheme(saved);
  }

  // ==================== DAILY TACTICAL AIM CONTRACTS ====================
  const MISSIONS_KEY = 'rangeaim_daily_missions_v3';
  function getDailyMissions() {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const data = JSON.parse(localStorage.getItem(MISSIONS_KEY));
      if (data && data.date === today) return data;
    } catch (e) {}
    return { date: today, m1: 0, m2: 0, m3: 0, claimed: false };
  }

  function saveDailyMissions(m) {
    try { localStorage.setItem(MISSIONS_KEY, JSON.stringify(m)); } catch (e) {}
  }

  function renderDailyMissions() {
    const m = getDailyMissions();
    const m1Fill = document.getElementById('m1Fill');
    const m1Val = document.getElementById('m1Val');
    const m2Fill = document.getElementById('m2Fill');
    const m2Val = document.getElementById('m2Val');
    const m3Fill = document.getElementById('m3Fill');
    const m3Val = document.getElementById('m3Val');
    const btnClaim = document.getElementById('btnClaimDailyXp');
    const r1 = document.getElementById('missionRow1');
    const r2 = document.getElementById('missionRow2');
    const r3 = document.getElementById('missionRow3');

    if (m1Fill) m1Fill.style.width = Math.min(100, (m.m1 / 5) * 100) + '%';
    if (m1Val) m1Val.textContent = `${Math.min(5, m.m1)}/5`;
    if (r1) r1.classList.toggle('completed', m.m1 >= 5);

    if (m2Fill) m2Fill.style.width = (m.m2 ? 100 : 0) + '%';
    if (m2Val) m2Val.textContent = m.m2 ? '1/1' : '0/1';
    if (r2) r2.classList.toggle('completed', !!m.m2);

    if (m3Fill) m3Fill.style.width = (m.m3 ? 100 : 0) + '%';
    if (m3Val) m3Val.textContent = m.m3 ? '1/1' : '0/1';
    if (r3) r3.classList.toggle('completed', !!m.m3);

    if (btnClaim) {
      const allDone = (m.m1 >= 5 && m.m2 >= 1 && m.m3 >= 1);
      if (m.claimed) {
        btnClaim.disabled = true;
        btnClaim.innerHTML = '<span>✓ +500 XP CLAIMED</span>';
        btnClaim.className = 'secondary-btn py-1.5 px-3 text-xs text-green';
      } else if (allDone) {
        btnClaim.disabled = false;
        btnClaim.innerHTML = '<span>CLAIM +500 XP!</span>';
        btnClaim.className = 'primary-launch-btn py-1.5 px-3 text-xs';
      } else {
        btnClaim.disabled = true;
        btnClaim.innerHTML = '<span>Claim +500 XP</span>';
        btnClaim.className = 'secondary-btn py-1.5 px-3 text-xs text-slate-500';
      }
    }
  }

  function checkAndUpdateDailyMissions(entry) {
    const m = getDailyMissions();
    if (entry.weapon === 'sniper' && entry.headshots) {
      m.m1 = Math.min(5, m.m1 + entry.headshots);
    }
    if (entry.accuracy >= 70) {
      m.m2 = 1;
    }
    if (entry.isRoutine || activeRoutine) {
      m.m3 = 1;
    }
    saveDailyMissions(m);
    renderDailyMissions();
  }

  function initDailyMissions() {
    const btnClaim = document.getElementById('btnClaimDailyXp');
    if (btnClaim) {
      btnClaim.addEventListener('click', () => {
        const m = getDailyMissions();
        if (m.claimed) return;
        m.claimed = true;
        saveDailyMissions(m);

        // Add 250 XP to session history
        const list = getSessionHistory();
        list.unshift({
          mode: 'daily_reward',
          modeName: 'Daily Mission Contract Bonus',
          weapon: 'sniper',
          weaponName: 'All Weapons',
          score: 250,
          exp: 250,
          accuracy: 100,
          reaction: 0,
          hits: 5,
          misses: 0,
          date: 'Daily Mission Bonus'
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
        try {
          let curLifetime = parseInt(localStorage.getItem('rangeaim_lifetime_xp_v5') || '0', 10);
          curLifetime += 250;
          localStorage.setItem('rangeaim_lifetime_xp_v5', curLifetime.toString());
        } catch (e) {}
        updateRankProgression();
        renderDailyMissions();
        sfxElimination();
        showToast('★ +250 XP CLAIMED! Rank points updated!', '👑');
      });
    }
    renderDailyMissions();
  }

  // ==================== LIVE TELEMETRY & ESPORTS TICK ENGINE ====================
  function initLiveTelemetry() {
    const fpsEl = document.getElementById('navLiveFps');
    const pingEl = document.getElementById('navLivePing');
    if (!fpsEl && !pingEl) return;

    let baseFps = 144;
    let basePing = 12;

    setInterval(() => {
      // Subtle realistic tick & refresh variance
      const jitter = Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0;
      const curFps = Math.max(138, Math.min(144, baseFps + jitter));
      const pingJitter = Math.random() < 0.15 ? Math.floor(Math.random() * 3) : 0;
      const curPing = basePing + pingJitter;

      if (fpsEl) fpsEl.textContent = `${curFps} FPS`;
      if (pingEl) pingEl.textContent = `${curPing}ms TICK`;
    }, 1200);
  }

  // ==================== VISUAL REACTION TIME REFLEX BENCHMARK ====================
  function initReflexBenchmark() {
    const screen = document.getElementById('reflexTestScreen');
    const title = document.getElementById('reflexTitle');
    const sub = document.getElementById('reflexSub');
    const icon = document.getElementById('reflexIcon');
    const bestScoreEl = document.getElementById('reflexBestScore');
    const listEl = document.getElementById('reflexHistoryList');
    const btnClear = document.getElementById('btnClearReflexHistory');

    if (!screen) return;

    let state = 'idle'; // idle | waiting | ready | toosoon | result
    let waitTimer = null;
    let greenStartTime = 0;
    let attempts = [];
    const REFLEX_STORAGE_KEY = 'rangeaim_reflex_history_v3';

    try { attempts = JSON.parse(localStorage.getItem(REFLEX_STORAGE_KEY)) || []; } catch (e) {}

    function updateBestScore() {
      if (!attempts.length) {
        if (bestScoreEl) bestScoreEl.textContent = 'Personal Best: -- ms';
        return;
      }
      const valid = attempts.filter(a => a > 0);
      if (valid.length) {
        const best = Math.min(...valid);
        if (bestScoreEl) bestScoreEl.textContent = `Personal Best: ${best} ms`;
      }
    }

    function renderAttempts() {
      if (!listEl) return;
      if (!attempts.length) {
        listEl.innerHTML = `<div class="text-xs text-slate-500 font-mono py-2 text-center">No attempts yet</div>`;
        return;
      }
      listEl.innerHTML = attempts.slice(0, 6).map((ms, i) => {
        let tag = 'RECRUIT';
        let col = 'text-slate-400';
        if (ms < 165) { tag = 'GOD TIER (S+)'; col = 'text-yellow-400 font-bold'; }
        else if (ms < 195) { tag = 'PRO RIVAL (S)'; col = 'text-sky-400 font-bold'; }
        else if (ms < 230) { tag = 'COMPETITIVE (A)'; col = 'text-green-400'; }

        return `
          <div class="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800 text-xs">
            <span class="font-mono text-slate-300">Attempt #${attempts.length - i}</span>
            <span class="font-mono ${col}">${ms} ms</span>
            <span class="text-[10px] font-bold ${col}">${tag}</span>
          </div>
        `;
      }).join('');
    }

    updateBestScore();
    renderAttempts();

    const handleReflexAction = e => {
      if (e && e.type === 'touchstart') e.preventDefault();
      if (state === 'idle' || state === 'result' || state === 'toosoon') {
        // Start waiting
        state = 'waiting';
        screen.className = 'reflex-test-screen waiting';
        if (icon) icon.textContent = '⏳';
        if (title) title.textContent = 'WAIT FOR NEON GREEN...';
        if (sub) sub.textContent = 'Do not click/tap until the screen flashes green!';
        sfxUiClick();

        const delay = 1400 + Math.random() * 3200;
        waitTimer = setTimeout(() => {
          state = 'ready';
          screen.className = 'reflex-test-screen ready';
          if (icon) icon.textContent = '⚡';
          if (title) title.textContent = 'CLICK / TAP NOW!';
          if (sub) sub.textContent = 'CLICK OR TAP AS FAST AS YOU CAN!';
          greenStartTime = performance.now();
          sfxHit();
        }, delay);
      } else if (state === 'waiting') {
        // Clicked too early
        clearTimeout(waitTimer);
        state = 'toosoon';
        screen.className = 'reflex-test-screen toosoon';
        if (icon) icon.textContent = '⚠️';
        if (title) title.textContent = 'TOO EARLY!';
        if (sub) sub.textContent = 'You reacted before the green flash. Click/tap to try again.';
        sfxMiss();
      } else if (state === 'ready') {
        // Successful reaction!
        const latency = Math.round(performance.now() - greenStartTime);
        state = 'result';
        screen.className = 'reflex-test-screen result';
        attempts.unshift(latency);
        if (attempts.length > 20) attempts.pop();
        try { localStorage.setItem(REFLEX_STORAGE_KEY, JSON.stringify(attempts)); } catch (e) {}

        let tierLabel = 'RECRUIT TIER';
        if (latency < 165) tierLabel = '👑 ESPORTS GOD TIER (<165ms)';
        else if (latency < 195) tierLabel = '⚡ PRO RIVAL TIER (165-195ms)';
        else if (latency < 230) tierLabel = '🎯 COMPETITIVE MARKSMAN (195-230ms)';

        if (icon) icon.textContent = '🎯';
        if (title) title.textContent = `${latency} ms`;
        if (sub) sub.textContent = `${tierLabel} · Tap/click anywhere to test again!`;

        updateBestScore();
        renderAttempts();
        if (latency < 195) sfxHead(); else sfxHit();
      }
    };

    screen.addEventListener('mousedown', handleReflexAction);
    screen.addEventListener('touchstart', handleReflexAction, { passive: false });

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        attempts = [];
        localStorage.removeItem(REFLEX_STORAGE_KEY);
        updateBestScore();
        renderAttempts();
        sfxUiClick();
      });
    }
  }

  // ==================== ROBLOX RIVALS CROSSHAIR CODE STUDIO ====================
  function getCrosshairCodeString() {
    return `RR;s:${crosshairStyle};c:${crosshairColor};sz:${crosshairSize};o:${crosshairOutline ? 1 : 0};d:${crosshairDot ? 1 : 0};l:${customChLength};g:${customChGap};t:${customChThickness}`;
  }

  function applyCrosshairCodeString(code) {
    if (!code || !code.startsWith('RR;')) {
      alert('Invalid Roblox Rivals crosshair code. Format: RR;s:cross;c:#38bdf8...');
      return false;
    }
    const parts = code.slice(3).split(';');
    parts.forEach(part => {
      const [k, v] = part.split(':');
      if (k === 's') crosshairStyle = v;
      if (k === 'c') crosshairColor = v;
      if (k === 'sz') crosshairSize = v;
      if (k === 'o') crosshairOutline = (v === '1');
      if (k === 'd') crosshairDot = (v === '1');
      if (k === 'l') customChLength = parseInt(v, 10) || 8;
      if (k === 'g') customChGap = parseInt(v, 10) || 4;
      if (k === 't') customChThickness = parseInt(v, 10) || 2;
    });

    updateCrosshairs();
    const chkOutline = document.getElementById('chkCrosshairOutline');
    const chkDot = document.getElementById('chkCrosshairDot');
    if (chkOutline) chkOutline.checked = crosshairOutline;
    if (chkDot) chkDot.checked = crosshairDot;

    const outCode = document.getElementById('outCrosshairCode');
    if (outCode) outCode.value = getCrosshairCodeString();

    return true;
  }

  function initCrosshairCodeStudio() {
    const outCode = document.getElementById('outCrosshairCode');
    if (outCode) outCode.value = getCrosshairCodeString();

    const btnCopy = document.getElementById('btnCopyCrosshairCode');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const code = getCrosshairCodeString();
        navigator.clipboard.writeText(code).then(() => {
          showToast('Crosshair code copied to clipboard!', '📋');
          sfxUiClick();
        }).catch(() => {
          prompt('Copy Crosshair Code:', code);
        });
      });
    }

    const btnImport = document.getElementById('btnImportCrosshairCode');
    const inImport = document.getElementById('inImportCrosshairCode');
    if (btnImport && inImport) {
      btnImport.addEventListener('click', () => {
        const val = inImport.value.trim();
        if (applyCrosshairCodeString(val)) {
          showToast('Reticle code imported successfully!', '✓');
          sfxStart();
        }
      });
    }
  }

  // ==================== COUNTER-STRAFING PHYSICS SIMULATOR ====================
  function initCounterStrafeSimulator() {
    const marker = document.getElementById('simInertiaMarker');
    const status = document.getElementById('simMomentumStatus');
    const keyA = document.getElementById('simKeyA');
    const keyD = document.getElementById('simKeyD');

    if (!marker || !status) return;

    let posX = 50; // 0 to 100 percentage
    let velocity = 0; // -1 to 1
    let aPressed = false;
    let dPressed = false;

    window.addEventListener('keydown', e => {
      if (running) return;
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;

      if (e.key === 'a' || e.key === 'A') {
        aPressed = true;
        if (keyA) keyA.classList.add('active');
        if (velocity > 0.15) {
          // Dead stop counter strafe!
          velocity = 0;
          status.textContent = '⚡ DEAD-STOP COUNTER-STRAFE (0 ACCURACY PENALTY)';
          status.className = 'text-green font-bold';
        }
      }
      if (e.key === 'd' || e.key === 'D') {
        dPressed = true;
        if (keyD) keyD.classList.add('active');
        if (velocity < -0.15) {
          velocity = 0;
          status.textContent = '⚡ DEAD-STOP COUNTER-STRAFE (0 ACCURACY PENALTY)';
          status.className = 'text-green font-bold';
        }
      }
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'a' || e.key === 'A') {
        aPressed = false;
        if (keyA) keyA.classList.remove('active');
      }
      if (e.key === 'd' || e.key === 'D') {
        dPressed = false;
        if (keyD) keyD.classList.remove('active');
      }
    });

    if (keyA) {
      keyA.addEventListener('mousedown', () => {
        aPressed = true;
        keyA.classList.add('active');
      });
      window.addEventListener('mouseup', () => {
        aPressed = false;
        dPressed = false;
        if (keyA) keyA.classList.remove('active');
        if (keyD) keyD.classList.remove('active');
      });
    }
    if (keyD) {
      keyD.addEventListener('mousedown', () => {
        dPressed = true;
        keyD.classList.add('active');
      });
    }

    function simLoop() {
      requestAnimationFrame(simLoop);
      const panel = document.getElementById('panelGuide');
      if (!panel || !panel.classList.contains('active')) return;

      if (aPressed) {
        velocity = Math.max(-0.9, velocity - 0.08);
        status.textContent = '← ACCELERATING LEFT (INERTIA SWAY ACTIVE)';
        status.className = 'text-cyan font-bold';
      } else if (dPressed) {
        velocity = Math.min(0.9, velocity + 0.08);
        status.textContent = 'ACCELERATING RIGHT → (INERTIA SWAY ACTIVE)';
        status.className = 'text-cyan font-bold';
      } else {
        // Momentum glide friction
        if (Math.abs(velocity) > 0.02) {
          velocity *= 0.92;
          status.textContent = 'GLIDING ON INERTIA (SLIGHT SPREAD SWAY)';
          status.className = 'text-yellow font-bold';
        } else {
          velocity = 0;
          status.textContent = 'DEAD STOPPED (PERFECT PINPOINT ACCURACY)';
          status.className = 'text-green font-bold';
        }
      }

      posX = clamp(posX + velocity * 2.2, 5, 95);
      marker.style.left = posX + '%';
    }
    simLoop();
  }

  // ==================== CYBER AMBIENCE NAVBAR CONTROLLER ====================
  function initCyberAmbienceButton() {
    const btn = document.getElementById('btnToggleAmbience');
    if (btn) {
      btn.addEventListener('click', toggleCyberAmbience);
    }
  }

  // ==================== HOLOGRAPHIC QUICK-AIM WARMUP STATION ====================
  function initHoloWarmupStation() {
    const card = document.getElementById('holoWarmupCard');
    const sphere = document.getElementById('holoTargetSphere');
    const hitsEl = document.getElementById('holoHitsCount');
    const cpsEl = document.getElementById('holoCpsCount');
    const streakEl = document.getElementById('holoBestStreak');
    const comboBadge = document.getElementById('holoComboBadge');
    const btnQuick = document.getElementById('btnQuickWarmupAction');

    if (!card || !sphere) return;

    let hits = 0;
    let streak = 0;
    let bestStreak = 0;
    let clickTimestamps = [];
    let comboTimer = null;

    function handleWarmupClick(e) {
      if (e && e.preventDefault && e.type === 'touchstart') e.preventDefault();
      const now = performance.now();

      // CPS Calculation
      clickTimestamps.push(now);
      clickTimestamps = clickTimestamps.filter(t => now - t <= 2000);
      const cps = (clickTimestamps.length / 2).toFixed(1);

      hits++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;

      if (hitsEl) hitsEl.textContent = hits;
      if (cpsEl) cpsEl.textContent = cps;
      if (streakEl) streakEl.textContent = bestStreak;

      // Combo management
      if (comboBadge) {
        comboBadge.textContent = `COMBO x${streak}`;
        comboBadge.classList.toggle('streak-hot', streak >= 5);
      }
      clearTimeout(comboTimer);
      comboTimer = setTimeout(() => {
        streak = 0;
        if (comboBadge) {
          comboBadge.textContent = 'COMBO x0';
          comboBadge.classList.remove('streak-hot');
        }
      }, 1600);

      // Animation recoil
      sphere.classList.remove('hit-recoil');
      void sphere.offsetWidth;
      sphere.classList.add('hit-recoil');

      // Floating damage number
      const rect = card.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);

      const pop = document.createElement('div');
      pop.className = 'holo-hit-pop' + (streak >= 5 ? ' crit' : '');
      const labels = ['CRIT +150', 'HEADSHOT!', 'SNAP +100', '100% ACC', 'PERFECT!', 'FAST FLICK!'];
      const text = (streak % 5 === 0 && streak > 0) ? `★ ${streak}x STREAK!` : choice(labels);
      pop.textContent = text;
      pop.style.left = (clientX - rect.left) + 'px';
      pop.style.top = (clientY - rect.top) + 'px';
      card.appendChild(pop);
      setTimeout(() => pop.remove(), 700);

      // Sound feedback
      if (streak >= 5) sfxHead(); else sfxHit();

      // Trigger ambient particle ripple
      if (typeof window.triggerAmbientRipple === 'function') {
        window.triggerAmbientRipple(clientX, clientY);
      }
    }

    card.addEventListener('mousedown', handleWarmupClick);
    card.addEventListener('touchstart', handleWarmupClick, { passive: false });

    if (btnQuick) {
      btnQuick.addEventListener('click', () => {
        handleWarmupClick({ clientX: window.innerWidth / 2, clientY: 200 });
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }

  // ==================== INTERACTIVE 3D HOLOGRAPHIC DUMMY HITBOX INSPECTOR ====================
  function initDummyHitboxInspector() {
    const figure = document.getElementById('holoDummyFigure');
    const stage = document.getElementById('dummyInspectorStage');
    const btnWire = document.getElementById('btnToggleHitboxWireframe');
    const txtWire = document.getElementById('txtWireframe');
    const btnTest = document.getElementById('btnTestHitDummy');
    const zoneTitle = document.getElementById('dummyZoneTitle');
    const zoneDesc = document.getElementById('dummyZoneDesc');
    const sniperDmg = document.getElementById('dummySniperDmg');
    const arDmg = document.getElementById('dummyArDmg');

    if (!figure) return;

    const ZONES = {
      head: { title: 'HEADSHOT ZONE (150 HP LETHAL)', desc: '1-tap lethal elimination with Sniper rifle. Snapping to the head is the decisive factor in Roblox Rivals duels.', sniper: '150 DMG', ar: '15 DMG' },
      torso: { title: 'TORSO / UPPER BODY ZONE', desc: 'Standard center-mass hitbox. Assault Rifle tracking locks here for maximum DPS consistency.', sniper: '50 DMG', ar: '12 DMG' },
      arms: { title: 'ARMS & SHOULDER ZONE', desc: 'Hitbox register identical to torso damage models. Useful target zone during strafing maneuvers.', sniper: '50 DMG', ar: '12 DMG' },
      legs: { title: 'LOWER LEGS ZONE', desc: 'Base body damage applies. Ground level strafe target when opponent crouch-slides.', sniper: '50 DMG', ar: '12 DMG' }
    };

    let currentZone = 'head';

    function setZone(zKey) {
      const z = ZONES[zKey] || ZONES.head;
      currentZone = zKey;
      if (zoneTitle) zoneTitle.textContent = z.title;
      if (zoneDesc) zoneDesc.textContent = z.desc;
      if (sniperDmg) sniperDmg.textContent = z.sniper;
      if (arDmg) arDmg.textContent = z.ar;
      figure.querySelectorAll('.hitbox-zone').forEach(el => el.classList.toggle('active', el.dataset.zone === zKey));
    }

    figure.querySelectorAll('.hitbox-zone').forEach(el => {
      el.addEventListener('mouseenter', () => setZone(el.dataset.zone));
      el.addEventListener('click', e => {
        e.stopPropagation();
        setZone(el.dataset.zone);
        fireTestShot(el.dataset.zone === 'head');
      });
    });

    function fireTestShot(isHead = false) {
      if (selectedWeapon === 'sniper') sfxSniper(); else sfxAR();
      setTimeout(() => {
        if (isHead) sfxHead(); else sfxHit();
      }, 70);

      figure.classList.remove('hit-recoil');
      void figure.offsetWidth;
      figure.classList.add('hit-recoil');

      const pop = document.createElement('div');
      pop.className = 'reticle-test-hit-tag';
      const dmg = isHead ? (selectedWeapon === 'sniper' ? '150 HEADSHOT!' : '15 HEADSHOT!') : (selectedWeapon === 'sniper' ? '50 BODY' : '12 BODY');
      pop.textContent = dmg;
      if (stage) stage.appendChild(pop);
      setTimeout(() => pop.remove(), 850);
    }

    if (btnTest) btnTest.addEventListener('click', () => fireTestShot(currentZone === 'head'));

    if (btnWire && stage) {
      btnWire.addEventListener('click', () => {
        stage.classList.toggle('wireframe');
        const isWire = stage.classList.contains('wireframe');
        if (txtWire) txtWire.textContent = isWire ? 'Solid Hitbox View' : 'Toggle Wireframe Bounds';
        sfxUiClick();
      });
    }
  }

  // ==================== LIVE AUDIO FREQUENCY OSCILLOSCOPE ====================
  function initAudioOscilloscope() {
    const oscCanvas = document.getElementById('audioOscilloscopeCanvas');
    if (!oscCanvas) return;
    const oscCtx = oscCanvas.getContext('2d');
    const statusEl = document.getElementById('audioWaveStatus');

    const dataArray = new Uint8Array(64);

    function drawWave() {
      requestAnimationFrame(drawWave);
      const w = oscCanvas.width;
      const h = oscCanvas.height;
      oscCtx.clearRect(0, 0, w, h);

      // Grid backdrop
      oscCtx.fillStyle = 'rgba(6, 9, 17, 0.45)';
      oscCtx.fillRect(0, 0, w, h);

      oscCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      oscCtx.lineWidth = 1;
      oscCtx.beginPath();
      oscCtx.moveTo(0, h / 2);
      oscCtx.lineTo(w, h / 2);
      oscCtx.stroke();

      if (audioAnalyser) {
        audioAnalyser.getByteTimeDomainData(dataArray);
      }

      // Neon Waveform
      oscCtx.lineWidth = 2;
      oscCtx.strokeStyle = isAmbienceActive ? '#ffd23e' : '#38bdf8';
      oscCtx.shadowBlur = 8;
      oscCtx.shadowColor = isAmbienceActive ? 'rgba(250, 204, 21, 0.5)' : 'rgba(56, 189, 248, 0.5)';
      oscCtx.beginPath();

      const sliceWidth = w / dataArray.length;
      let x = 0;
      let hasSignal = false;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        if (Math.abs(v - 1.0) > 0.02) hasSignal = true;
        const y = (v * h) / 2;
        if (i === 0) oscCtx.moveTo(x, y);
        else oscCtx.lineTo(x, y);
        x += sliceWidth;
      }
      oscCtx.lineTo(w, h / 2);
      oscCtx.stroke();
      oscCtx.shadowBlur = 0;

      if (statusEl) {
        statusEl.textContent = hasSignal ? 'LIVE SIGNAL DETECTED' : (isAmbienceActive ? 'CYBER AMBIENCE RUNNING' : 'SPECTRUM IDLE');
        statusEl.style.color = hasSignal ? '#4ade80' : (isAmbienceActive ? '#ffd23e' : '#38bdf8');
      }
    }
    drawWave();
  }

  // ==================== ANIMATING ESPORTS LOADING SCREEN ENGINE ====================
  function initLoadingScreen() {
    const overlay = document.getElementById('appLoadingScreen');
    const loadingCanvas = document.getElementById('loadingCanvas');
    const progressFill = document.getElementById('loadingProgressFill');
    const percentText = document.getElementById('loadingPercentText');
    const statusText = document.getElementById('loadingStatusText');
    const stageName = document.getElementById('loadingStageName');

    if (!overlay) return;

    // Loading background canvas matrix particle simulation
    let lctx = null;
    let lW = 0, lH = 0;
    let particles = [];

    if (loadingCanvas) {
      lctx = loadingCanvas.getContext('2d');
      const resizeLoading = () => {
        lW = loadingCanvas.width = window.innerWidth;
        lH = loadingCanvas.height = window.innerHeight;
      };
      resizeLoading();
      window.addEventListener('resize', resizeLoading);

      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * (lW || 800),
          y: Math.random() * (lH || 600),
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#ffd23e' : '#22c55e')
        });
      }

      function drawLoadingParticles() {
        if (!overlay || overlay.classList.contains('loaded')) return;
        lctx.clearRect(0, 0, lW, lH);
        lctx.fillStyle = 'rgba(6, 10, 18, 0.4)';
        lctx.fillRect(0, 0, lW, lH);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = lW;
          if (p.x > lW) p.x = 0;
          if (p.y < 0) p.y = lH;
          if (p.y > lH) p.y = 0;

          lctx.fillStyle = p.color;
          lctx.shadowColor = p.color;
          lctx.shadowBlur = 8;
          lctx.beginPath();
          lctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          lctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 100) {
              lctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 100) * 0.2})`;
              lctx.lineWidth = 1;
              lctx.beginPath();
              lctx.moveTo(p.x, p.y);
              lctx.lineTo(p2.x, p2.y);
              lctx.stroke();
            }
          }
        }
        lctx.shadowBlur = 0;
        requestAnimationFrame(drawLoadingParticles);
      }
      requestAnimationFrame(drawLoadingParticles);
    }

    // Step-by-step diagnostic calibration sequence
    const stages = [
      { pct: 18, status: 'INITIALIZING BALLISTICS MATRIX...', stage: 'CALIBRATING 1:1 ROBLOX FOV & SENSITIVITY' },
      { pct: 38, status: 'MOUNTING WEAPON ARSENAL & RECOIL CURVES...', stage: 'SNIPER 200/100 · ASSAULT RIFLE 38/26' },
      { pct: 64, status: 'INITIALIZING HITBOX SENSORS...', stage: 'PRECISION HEAD, TORSO & LIMB MULTIPLIERS' },
      { pct: 86, status: 'SYNTHESIZING ESPORTS COMBAT ARENA...', stage: '14 DRILL SCENARIOS LOADED & VERIFIED' },
      { pct: 100, status: 'SYSTEM READY // ALL SUBSYSTEMS NOMINAL', stage: 'COMBAT SIMULATION INITIALIZED' }
    ];

    let currentStageIndex = 0;
    const interval = setInterval(() => {
      currentStageIndex++;
      if (currentStageIndex < stages.length) {
        const item = stages[currentStageIndex];
        if (progressFill) progressFill.style.width = item.pct + '%';
        if (percentText) percentText.textContent = item.pct + '%';
        if (statusText) statusText.textContent = item.status;
        if (stageName) stageName.textContent = item.stage;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          overlay.classList.add('loaded');
          setTimeout(() => {
            overlay.remove();
          }, 700);
        }, 350);
      }
    }, 280);
  }

  // ==================== HERO COMBAT VIDEO CANVAS STREAM ENGINE ====================
  function initHeroCombatVideoCanvas() {
    const vCanvas = document.getElementById('heroCombatVideoCanvas');
    if (!vCanvas) return;
    const vctx = vCanvas.getContext('2d');

    const resizeVideo = () => {
      const rect = vCanvas.getBoundingClientRect();
      vCanvas.width = rect.width || 800;
      vCanvas.height = rect.height || 300;
    };
    resizeVideo();
    window.addEventListener('resize', resizeVideo);

    // Simulated animated combat bots and projectile tracers
    const bots = [
      { x: 120, y: 140, vx: 1.2, vy: 0.4, color: '#38bdf8', label: 'RIVAL_BOT_01', hp: 100 },
      { x: 380, y: 160, vx: -1.0, vy: 0.3, color: '#f43f5e', label: 'TARGET_ALPHA', hp: 80 },
      { x: 620, y: 120, vx: 0.8, vy: -0.5, color: '#ffd23e', label: 'DRONE_SENTINEL', hp: 60 }
    ];
    let tracers = [];
    let sparks = [];
    let crosshairPos = { x: 380, y: 150 };
    let lastShotTime = 0;

    function renderCombatVideo(now) {
      const w = vCanvas.width;
      const h = vCanvas.height;
      vctx.clearRect(0, 0, w, h);

      // Subtle dynamic grid floor perspective
      vctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      vctx.lineWidth = 1;
      const horizonY = h * 0.45;

      for (let x = -w; x < w * 2; x += 60) {
        vctx.beginPath();
        vctx.moveTo(w / 2, horizonY);
        vctx.lineTo(x + ((now * 0.03) % 60), h);
        vctx.stroke();
      }

      // Update & Draw bots
      bots.forEach((b, idx) => {
        b.x += b.vx;
        b.y += Math.sin(now * 0.002 + idx) * 0.6;
        if (b.x < 60 || b.x > w - 60) b.vx *= -1;

        // Draw bot hologram
        vctx.fillStyle = 'rgba(6, 10, 18, 0.6)';
        vctx.strokeStyle = b.color;
        vctx.lineWidth = 1.5;
        vctx.shadowColor = b.color;
        vctx.shadowBlur = 10;

        // Head
        vctx.beginPath();
        vctx.arc(b.x, b.y - 20, 10, 0, Math.PI * 2);
        vctx.fill();
        vctx.stroke();

        // Torso
        vctx.strokeRect(b.x - 14, b.y - 8, 28, 30);

        // Name tag
        vctx.font = '8px monospace';
        vctx.fillStyle = b.color;
        vctx.fillText(b.label, b.x - 24, b.y - 36);

        // Health bar
        vctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        vctx.strokeRect(b.x - 16, b.y - 34, 32, 3);
        vctx.fillStyle = b.color;
        vctx.fillRect(b.x - 16, b.y - 34, 32 * (b.hp / 100), 3);
      });

      // Automated aim tracking & shooting simulation
      const targetBot = bots[1];
      crosshairPos.x += (targetBot.x - crosshairPos.x) * 0.06;
      crosshairPos.y += (targetBot.y - 20 - crosshairPos.y) * 0.06;

      // Draw crosshair
      vctx.strokeStyle = '#38bdf8';
      vctx.shadowColor = '#38bdf8';
      vctx.shadowBlur = 8;
      vctx.lineWidth = 1.5;
      vctx.beginPath();
      vctx.arc(crosshairPos.x, crosshairPos.y, 14, 0, Math.PI * 2);
      vctx.stroke();

      vctx.beginPath();
      vctx.moveTo(crosshairPos.x - 20, crosshairPos.y);
      vctx.lineTo(crosshairPos.x - 14, crosshairPos.y);
      vctx.moveTo(crosshairPos.x + 14, crosshairPos.y);
      vctx.lineTo(crosshairPos.x + 20, crosshairPos.y);
      vctx.moveTo(crosshairPos.x, crosshairPos.y - 20);
      vctx.lineTo(crosshairPos.x, crosshairPos.y - 14);
      vctx.moveTo(crosshairPos.x, crosshairPos.y + 14);
      vctx.lineTo(crosshairPos.x, crosshairPos.y + 20);
      vctx.stroke();

      // Simulated sniper firing laser tracer every 1.6s
      if (now - lastShotTime > 1600) {
        lastShotTime = now;
        tracers.push({
          x1: w * 0.15,
          y1: h * 0.9,
          x2: crosshairPos.x + (Math.random() - 0.5) * 4,
          y2: crosshairPos.y + (Math.random() - 0.5) * 4,
          alpha: 1.0
        });

        // Sparks
        for (let i = 0; i < 8; i++) {
          sparks.push({
            x: crosshairPos.x,
            y: crosshairPos.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1.0,
            color: '#ffd23e'
          });
        }
      }

      // Draw Tracers
      tracers.forEach(t => {
        vctx.strokeStyle = `rgba(56, 189, 248, ${t.alpha})`;
        vctx.shadowColor = '#38bdf8';
        vctx.shadowBlur = 12;
        vctx.lineWidth = 2.5;
        vctx.beginPath();
        vctx.moveTo(t.x1, t.y1);
        vctx.lineTo(t.x2, t.y2);
        vctx.stroke();
        t.alpha -= 0.05;
      });
      tracers = tracers.filter(t => t.alpha > 0);

      // Draw Sparks
      sparks.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.05;
        vctx.fillStyle = s.color;
        vctx.shadowColor = s.color;
        vctx.shadowBlur = 6;
        vctx.beginPath();
        vctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        vctx.fill();
      });
      sparks = sparks.filter(s => s.life > 0);

      vctx.shadowBlur = 0;
      requestAnimationFrame(renderCombatVideo);
    }
    requestAnimationFrame(renderCombatVideo);
  }

  // ==================== 3D CARD PARALLAX TILT & SPECULAR FOIL ====================
  function init3DCardTilt() {
    const cardSelectors = '.mode-card, .weapon-card, .routine-card, .hero-holo-warmup-card';

    document.addEventListener('mousemove', e => {
      const card = e.target.closest(cardSelectors);
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;

      const rotateY = ((x - midX) / midX) * 7.5;
      const rotateX = -((y - midY) / midY) * 7.5;

      const glareX = ((x / rect.width) * 100).toFixed(1) + '%';
      const glareY = ((y / rect.height) * 100).toFixed(1) + '%';

      card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      card.style.setProperty('--glare-x', glareX);
      card.style.setProperty('--glare-y', glareY);
    });

    document.addEventListener('mouseout', e => {
      const card = e.target.closest(cardSelectors);
      if (card && (!e.relatedTarget || !card.contains(e.relatedTarget))) {
        card.style.transform = '';
      }
    });
  }

  // ==================== APP INITIALIZATION & BINDINGS ====================
  function initApp() {
    if (!canvas) {
      canvas = document.getElementById('glCanvas');
      if (canvas) ctx = canvas.getContext('2d');
    }

    // Navigation Links & Buttons
    const navBrandLogo = document.getElementById('navBrandLogo');
    if (navBrandLogo) navBrandLogo.addEventListener('click', returnToMenu);
    const navLaunchBtn = document.getElementById('navLaunchBtn');
    if (navLaunchBtn) navLaunchBtn.addEventListener('click', startSession);
    const btnStartEl = document.getElementById('btnStart');
    if (btnStartEl) btnStartEl.addEventListener('click', startSession);
    const btnRetry = document.getElementById('btnRetry');
    if (btnRetry) btnRetry.addEventListener('click', startSession);
    const btnMenu = document.getElementById('btnMenu');
    if (btnMenu) btnMenu.addEventListener('click', returnToMenu);

    // Initial renders
    resize();
    refreshSensReadout();
    updateCrosshairs();
    renderWeaponGrid();
    renderModeGrid();
    updateWeaponHud();
    updateLaunchBar();
    updateRankProgression();
    renderProfilesList();
    updateTtkMatrix();
    initAmbientCanvas();
    initThemeSwitcher();
    initDailyMissions();
    initLiveTelemetry();
    initReflexBenchmark();
    initCrosshairCodeStudio();
    initCounterStrafeSimulator();
    initCyberAmbienceButton();
    initHoloWarmupStation();
    initDummyHitboxInspector();
    initAudioOscilloscope();
    init3DCardTilt();
    initLoadingScreen();
    initHeroCombatVideoCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

