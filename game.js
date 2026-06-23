(() => {
  'use strict';

  const PRIZES = [
    { value: 'ZONK', weight: 35 },
    { value: 500, weight: 30 },
    { value: 5000, weight: 15 },
    { value: 10000, weight: 8 },
    { value: 20000, weight: 6 },
    { value: 30000, weight: 4 },
    { value: 50000, weight: 2 }
  ];

  const ASSETS = [
    'start-screen.png',
    'gameplay-screen.png',
    'win-screen.png',
    'zonk-screen.png',
    'piggy-gold-logo.png',
    'cannon-sprite.png'
  ];

  const $ = (selector) => document.querySelector(selector);
  const els = {
    loadingScreen: $('#loadingScreen'),
    loadingProgress: $('#loadingProgress'),
    loadingText: $('#loadingText'),
    stage: $('#stage'),
    startScene: $('#startScene'),
    playScene: $('#playScene'),
    startButton: $('#startButton'),
    profileChip: $('#profileChip'),
    soundButton: $('#soundButton'),
    resetButton: $('#resetButton'),
    exitButton: $('#exitButton'),
    statusBanner: $('#statusBanner'),
    targets: [...document.querySelectorAll('.pig-target')],
    crosshair: $('#crosshair'),
    aimBeam: $('#aimBeam'),
    cannonRig: $('#cannonRig'),
    cannonRecoil: $('#cannonRecoil'),
    floatingCoins: $('#floatingCoins'),
    muzzleGlow: $('#muzzleGlow'),
    projectile: $('#projectile'),
    impactFlash: $('#impactFlash'),
    impactRing: $('#impactRing'),
    crackOverlay: $('#crackOverlay'),
    brokenPig: $('#brokenPig'),
    particleLayer: $('#particleLayer'),
    floatingResult: $('#floatingResult'),
    shootButton: $('#shootButton'),
    shootHint: $('#shootHint'),
    resultOverlay: $('#resultOverlay'),
    winResult: $('#winResult'),
    zonkResult: $('#zonkResult'),
    prizeCover: $('#prizeCover'),
    winClaimButton: $('#winClaimButton'),
    zonkClaimButton: $('#zonkClaimButton'),
    playAgainButton: $('#playAgainButton'),
    backButton: $('#backButton'),
    resultText: $('#resultText'),
    toast: $('#toast')
  };

  const state = {
    profile: null,
    selectedTarget: null,
    selectedPig: null,
    playing: false,
    finished: false,
    result: null,
    soundEnabled: true,
    audioContext: null,
    cannonAngle: 0,
    cannonShiftX: 0,
    cannonShiftY: 0
  };

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const formatPrize = (value) => typeof value === 'number'
    ? new Intl.NumberFormat('id-ID').format(value)
    : value;

  function getProfile() {
    try {
      const raw = localStorage.getItem('piggyGoldProfile') || sessionStorage.getItem('piggyGoldProfile');
      const saved = JSON.parse(raw || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch {
      // Abaikan data profil yang rusak.
    }
    return {
      uid: `guest-${Date.now()}`,
      email: null,
      displayName: 'Pemain Tamu',
      demo: true
    };
  }

  function preloadAssets() {
    let loaded = 0;
    const update = () => {
      loaded += 1;
      const progress = Math.round((loaded / ASSETS.length) * 100);
      els.loadingProgress.style.width = `${progress}%`;
      els.loadingText.textContent = `Memuat permainan... ${progress}%`;
    };

    return Promise.all(ASSETS.map((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { update(); resolve(); };
      img.onerror = () => { update(); resolve(); };
      img.src = src;
    })));
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('is-visible'), 2200);
  }

  function playTone(frequency, duration = 0.1, type = 'sine', volume = 0.05) {
    if (!state.soundEnabled) return;
    try {
      state.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const context = state.audioContext;
      if (context.state === 'suspended') context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      gain.gain.setValueAtTime(volume, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
    } catch {
      // Suara opsional dan tidak boleh menghentikan game.
    }
  }

  function pickPrize() {
    const total = PRIZES.reduce((sum, item) => sum + item.weight, 0);
    let ticket = Math.random() * total;
    for (const item of PRIZES) {
      ticket -= item.weight;
      if (ticket < 0) return item.value;
    }
    return 'ZONK';
  }

  function stagePoint(element) {
    const rect = element.getBoundingClientRect();
    const stageRect = els.stage.getBoundingClientRect();
    return {
      x: rect.left - stageRect.left + rect.width / 2,
      y: rect.top - stageRect.top + rect.height / 2
    };
  }

  function cannonPivotPoint() {
    return {
      x: els.stage.clientWidth * 0.5 + state.cannonShiftX,
      y: els.stage.clientHeight * 0.955 + state.cannonShiftY
    };
  }

  function muzzlePoint() {
    const pivot = cannonPivotPoint();
    const angle = state.cannonAngle * Math.PI / 180;
    const barrelLength = els.stage.clientHeight * 0.305;
    return {
      x: pivot.x + Math.sin(angle) * barrelLength,
      y: pivot.y - Math.cos(angle) * barrelLength
    };
  }

  function cannonAngleForTarget(target) {
    const pivot = cannonPivotPoint();
    const dx = target.x - pivot.x;
    const dy = pivot.y - target.y;
    const raw = Math.atan2(dx, dy) * 180 / Math.PI;
    return Math.max(-9.5, Math.min(9.5, raw));
  }


  function cannonShiftForTarget(target) {
    const stageWidth = els.stage.clientWidth;
    const stageHeight = els.stage.clientHeight;
    const nx = (target.x - stageWidth * 0.5) / (stageWidth * 0.5);
    const ny = 1 - (target.y / stageHeight);

    const shiftX = Math.max(-stageWidth * 0.065, Math.min(stageWidth * 0.065, nx * stageWidth * 0.055));
    const liftBase = stageHeight * 0.012;
    const liftExtra = Math.max(0, ny) * stageHeight * 0.028;
    const shiftY = -(liftBase + liftExtra);

    return { shiftX, shiftY };
  }

  function moveCannonTo(angle, shiftX = 0, shiftY = 0, immediate = false) {
    if (immediate) els.cannonRig.classList.add('is-instant');
    state.cannonAngle = angle;
    state.cannonShiftX = shiftX;
    state.cannonShiftY = shiftY;
    els.playScene.style.setProperty('--cannon-angle', `${angle}deg`);
    els.playScene.style.setProperty('--cannon-shift-x', `${shiftX}px`);
    els.playScene.style.setProperty('--cannon-shift-y', `${shiftY}px`);
    els.cannonRig.classList.add('is-aiming', 'is-syncing');
    if (immediate) {
      void els.cannonRig.offsetWidth;
      requestAnimationFrame(() => els.cannonRig.classList.remove('is-instant'));
    }
    clearTimeout(moveCannonTo.timer);
    moveCannonTo.timer = setTimeout(() => els.cannonRig.classList.remove('is-aiming', 'is-syncing'), 650);
  }

  function toPercent(point) {
    return {
      x: point.x / els.stage.clientWidth * 100,
      y: point.y / els.stage.clientHeight * 100
    };
  }

  function positionAt(element, point) {
    const percent = toPercent(point);
    element.style.left = `${percent.x}%`;
    element.style.top = `${percent.y}%`;
  }

  function setScene(scene) {
    [els.startScene, els.playScene].forEach((item) => item.classList.remove('is-active'));
    scene.classList.add('is-active');
  }

  function startGame() {
    if (state.playing) return;
    setScene(els.playScene);
    moveCannonTo(0, 0, 0, true);
    els.playScene.classList.remove('is-entering');
    void els.playScene.offsetWidth;
    els.playScene.classList.add('is-entering');
    setTimeout(() => els.playScene.classList.remove('is-entering'), 1100);
    els.statusBanner.textContent = 'PILIH 1 DARI 6 PIGGIES';
    els.shootHint.textContent = 'PILIH TARGET DAHULU';
    els.shootHint.classList.remove('is-ready');
    playTone(520, 0.12, 'sine', 0.05);
    setTimeout(() => playTone(720, 0.16, 'sine', 0.045), 90);
  }

  function updateAim() {
    if (!state.selectedTarget || state.playing || state.finished) return;
    const target = stagePoint(state.selectedTarget);
    const pose = cannonShiftForTarget(target);
    moveCannonTo(cannonAngleForTarget(target), pose.shiftX, pose.shiftY);

    window.requestAnimationFrame(() => {
      const muzzle = muzzlePoint();
      positionAt(els.crosshair, target);
      els.crosshair.classList.add('is-visible');

      const dx = target.x - muzzle.x;
      const dy = target.y - muzzle.y;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;

      positionAt(els.aimBeam, muzzle);
      els.aimBeam.style.width = `${distance}px`;
      els.aimBeam.style.transform = `rotate(${angle}deg)`;
      els.aimBeam.classList.add('is-visible');
    });
  }

  function selectTarget(target) {
    if (state.playing || state.finished) return;
    state.selectedTarget = target;
    state.selectedPig = Number(target.dataset.pig);
    els.targets.forEach((item) => item.classList.toggle('is-selected', item === target));
    updateAim();
    els.shootButton.disabled = false;
    els.statusBanner.textContent = `TARGET ${state.selectedPig} TERKUNCI`;
    els.shootHint.textContent = 'TEKAN TOMBOL SHOOT';
    els.shootHint.classList.add('is-ready');
    playTone(560, 0.08, 'sine', 0.04);
  }

  function resetEffects() {
    [els.impactFlash, els.impactRing, els.brokenPig, els.floatingResult]
      .forEach((element) => element.classList.remove('is-active'));
    els.projectile.style.opacity = '0';
    els.muzzleGlow.classList.remove('is-active');
    els.playScene.classList.remove('is-shaking', 'is-dimmed', 'is-entering');
    els.cannonRig.classList.remove('is-aiming', 'is-charging', 'is-firing');
    els.particleLayer.replaceChildren();
  }

  function resetRound(showStart = false) {
    state.selectedTarget = null;
    state.selectedPig = null;
    state.playing = false;
    state.finished = false;
    state.result = null;

    resetEffects();
    els.targets.forEach((target) => {
      target.disabled = false;
      target.classList.remove('is-selected', 'is-locked', 'is-hit');
    });
    els.shootButton.disabled = true;
    els.crosshair.classList.remove('is-visible');
    els.aimBeam.classList.remove('is-visible', 'is-blasting');
    els.statusBanner.textContent = 'PILIH 1 DARI 6 PIGGIES';
    els.shootHint.textContent = 'PILIH TARGET DAHULU';
    els.shootHint.classList.remove('is-ready');
    moveCannonTo(0, 0, 0, true);
    els.resultOverlay.classList.add('is-hidden');
    els.winResult.classList.add('is-hidden');
    els.zonkResult.classList.add('is-hidden');
    setScene(showStart ? els.startScene : els.playScene);
  }

  function createParticles(point, isWin) {
    const count = isWin ? 110 : 86;
    const percent = toPercent(point);

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement('span');
      particle.className = `particle${index % 3 === 0 ? ' shard' : ''}`;
      particle.style.left = `${percent.x}%`;
      particle.style.top = `${percent.y}%`;
      els.particleLayer.append(particle);

      const angle = Math.random() * Math.PI * 2;
      const distance = els.stage.clientWidth * (0.16 + Math.random() * 0.34);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance + els.stage.clientHeight * (0.02 + Math.random() * 0.06);
      const duration = 1100 + Math.random() * 900;

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: 0.1 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${0.5 + Math.random()}) rotate(${Math.random() * 720 - 360}deg)`,
          opacity: 0
        }
      ], { duration, easing: 'cubic-bezier(.12,.75,.25,1)' })
        .finished.finally(() => particle.remove());
    }
  }

  async function fireProjectile(target) {
    els.cannonRig.classList.add('is-charging');
    await wait(130);
    els.cannonRig.classList.remove('is-charging');
    els.cannonRig.classList.add('is-firing');

    const muzzle = muzzlePoint();
    const dx = target.x - muzzle.x;
    const dy = target.y - muzzle.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    positionAt(els.projectile, muzzle);
    positionAt(els.muzzleGlow, muzzle);
    els.projectile.style.opacity = '1';
    els.muzzleGlow.classList.remove('is-active');
    void els.muzzleGlow.offsetWidth;
    els.muzzleGlow.classList.add('is-active');
    els.aimBeam.classList.add('is-blasting');

    const animation = els.projectile.animate([
      { transform: `translate(-50%, -50%) rotate(${angle}deg) scale(.58)`, opacity: 0 },
      { opacity: 1, offset: 0.045 },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angle}deg) scale(1.34)`,
        opacity: 1
      }
    ], { duration: 335, easing: 'cubic-bezier(.08,.88,.18,1)' });

    await animation.finished;
    els.projectile.style.opacity = '0';
    els.aimBeam.classList.remove('is-blasting');
    setTimeout(() => els.cannonRig.classList.remove('is-firing'), 150);
  }

  function impact(target, prize) {
    const isWin = prize !== 'ZONK';
    [els.impactFlash, els.impactRing, els.brokenPig, els.floatingResult]
      .forEach((element) => positionAt(element, target));

    els.impactFlash.classList.remove('is-active');
    els.impactRing.classList.remove('is-active');
    void els.impactFlash.offsetWidth;
    els.impactFlash.classList.add('is-active');
    els.impactRing.classList.add('is-active');
    els.playScene.classList.add('is-shaking');

    els.brokenPig.classList.remove('is-active');
    void els.brokenPig.offsetWidth;
    els.brokenPig.classList.add('is-active');
    createParticles(target, isWin);
    els.floatingResult.textContent = isWin ? `+${formatPrize(prize)}` : 'ZONK';
    els.floatingResult.classList.remove('is-active');
    void els.floatingResult.offsetWidth;
    els.floatingResult.classList.add('is-active');

    [620, 440, 310].forEach((frequency, index) => {
      setTimeout(() => playTone(frequency, 0.14, 'triangle', 0.06), index * 45);
    });
  }

  function animatePrize(finalValue) {
    const start = performance.now();
    const duration = 1050;
    els.prizeCover.textContent = '0';

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      els.prizeCover.textContent = formatPrize(Math.round(finalValue * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function showResult(result) {
    state.result = result;
    state.finished = true;
    const isZonk = result.prize === 'ZONK';

    els.winResult.classList.toggle('is-hidden', isZonk);
    els.zonkResult.classList.toggle('is-hidden', !isZonk);
    els.resultText.textContent = isZonk
      ? 'Anda kurang beruntung. Hasil ZONK.'
      : `Selamat, Anda mendapatkan ${formatPrize(result.prize)}.`;
    els.resultOverlay.classList.remove('is-hidden');

    if (!isZonk) {
      animatePrize(Number(result.prize));
      playTone(660, 0.28, 'sine', 0.07);
      setTimeout(() => playTone(820, 0.28, 'sine', 0.06), 110);
      setTimeout(() => playTone(980, 0.34, 'sine', 0.05), 220);
    } else {
      playTone(160, 0.3, 'sawtooth', 0.07);
    }
  }

  async function shoot() {
    if (!state.selectedTarget || state.playing || state.finished) return;
    state.playing = true;
    els.shootButton.disabled = true;
    els.targets.forEach((target) => {
      target.disabled = true;
      target.classList.add('is-locked');
    });
    els.statusBanner.textContent = 'MENGUNCI TARGET...';
    els.shootHint.textContent = 'BERSIAP MENEMBAK';
    els.shootHint.classList.remove('is-ready');
    playTone(150, 0.18, 'sawtooth', 0.08);
    await wait(180);

    const target = stagePoint(state.selectedTarget);
    const prize = pickPrize();
    els.statusBanner.textContent = 'MENEMBAK!';
    els.shootHint.textContent = 'BOOM!';
    els.playScene.classList.add('is-shaking');
    playTone(75, 0.34, 'square', 0.1);

    await fireProjectile(target);
    state.selectedTarget.classList.add('is-hit');
    impact(target, prize);

    await wait(760);
    els.playScene.classList.remove('is-shaking');
    els.playScene.classList.add('is-dimmed');
    els.statusBanner.textContent = prize === 'ZONK' ? 'HASIL: ZONK' : `HADIAH: ${formatPrize(prize)}`;
    els.shootHint.textContent = 'MENAMPILKAN HASIL...';

    const result = {
      pigId: state.selectedPig,
      prize,
      createdAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('piggyGoldLatestResult', JSON.stringify(result));
    } catch {
      // Penyimpanan hasil opsional; gameplay tetap dilanjutkan.
    }

    await wait(1350);
    showResult(result);
    state.playing = false;
  }

  function resultMessage() {
    if (!state.result) return '';
    return state.result.prize === 'ZONK'
      ? `PIGGY GOLD — Target ${state.result.pigId}: ANDA KURANG BERUNTUNG (ZONK)`
      : `PIGGY GOLD — Target ${state.result.pigId}: hadiah ${formatPrize(state.result.prize)}`;
  }

  async function claimResult() {
    const message = resultMessage();
    if (!message) return;

    try {
      await navigator.clipboard.writeText(message);
      showToast('Hasil berhasil disalin.');
    } catch {
      const area = document.createElement('textarea');
      area.value = message;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      try {
        document.execCommand('copy');
        showToast('Hasil berhasil disalin.');
      } catch {
        showToast(message);
      }
      area.remove();
    }
  }

  function exitGame() {
    window.location.href = 'index.html';
  }

  function seedAmbientCoins() {
    if (!els.floatingCoins || els.floatingCoins.childElementCount) return;
    const count = window.matchMedia('(max-width: 520px)').matches ? 10 : 15;
    for (let index = 0; index < count; index += 1) {
      const coin = document.createElement('span');
      coin.className = 'ambient-coin';
      coin.style.left = `${3 + Math.random() * 94}%`;
      coin.style.animationDuration = `${5.8 + Math.random() * 6.5}s`;
      coin.style.animationDelay = `${-Math.random() * 11}s`;
      coin.style.setProperty('--drift', `${-28 + Math.random() * 56}px`);
      coin.style.transform = `scale(${0.65 + Math.random() * 0.8})`;
      els.floatingCoins.append(coin);
    }
  }

  function bindEvents() {
    els.startButton.addEventListener('click', startGame);
    els.targets.forEach((target) => target.addEventListener('click', () => selectTarget(target)));
    els.shootButton.addEventListener('click', shoot);
    els.soundButton.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      els.soundButton.textContent = state.soundEnabled ? '🔊' : '🔇';
      els.soundButton.setAttribute('aria-label', state.soundEnabled ? 'Matikan suara' : 'Nyalakan suara');
    });
    els.resetButton.addEventListener('click', () => resetRound(false));
    els.exitButton.addEventListener('click', exitGame);
    els.winClaimButton.addEventListener('click', claimResult);
    els.zonkClaimButton.addEventListener('click', claimResult);
    els.playAgainButton.addEventListener('click', () => resetRound(false));
    els.backButton.addEventListener('click', exitGame);
    window.addEventListener('resize', updateAim);
    window.addEventListener('orientationchange', () => setTimeout(updateAim, 180));
  }

  async function initialize() {
    state.profile = getProfile();
    els.profileChip.textContent = state.profile.displayName || state.profile.email || 'PEMAIN TAMU';
    bindEvents();
    seedAmbientCoins();
    moveCannonTo(0, 0, 0, true);
    await preloadAssets();
    els.loadingText.textContent = 'Siap dimainkan!';
    await wait(240);
    els.loadingScreen.classList.add('is-hidden');
  }

  initialize().catch((error) => {
    console.error(error);
    els.loadingText.textContent = 'Gagal memuat. Muat ulang halaman.';
  });
})();
