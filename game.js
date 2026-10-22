(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  // Screens
  const startScreen = $("start-screen");
  const levelScreen = $("level-screen");
  const settingsScreen = $("settings-screen");
  const gameScreen = $("game-screen");
  const winScreen = $("win-screen");

  // Elements
  const mize = $("mize-target");
  const kitchen = $("kitchen-bg");
  const levelIndicator = $("level-indicator");
  const audioInput = $("miss-audio-file");
  const audioPlayer = $("miss-audio-player");
  const audioStatus = $("audio-status");

  // Game State
  let currentLevel = 1;
  let isPlaying = false;
  let posX = 0;
  let posY = 0;
  let velX = 0;
  let velY = 0;
  let mizeWidth = 70;
  let mizeHeight = 45;
  let animationFrameId = null;

  // Sound Effect Fallback (Synthetic beep if no custom audio uploaded)
  function playMissSound() {
    if (audioPlayer.src) {
      audioPlayer.currentTime = 0;
      audioPlayer.play().catch(() => {});
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (_) {}
    }
  }

  function showScreen(screen) {
    [startScreen, levelScreen, settingsScreen, gameScreen, winScreen].forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  // Handle Custom Audio Upload
  audioInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      audioPlayer.src = URL.createObjectURL(file);
      audioStatus.textContent = `Custom Audio Loaded: ${file.name}`;
      audioStatus.style.color = "#4ade80";
    }
  });

  // Level Configurations
  function setupLevel(lvl) {
    currentLevel = lvl;
    levelIndicator.textContent = `LEVEL ${lvl}`;

    if (lvl === 1) {
      // EASY: Larger rat, slower
      mizeWidth = 80;
      mizeHeight = 50;
    } else if (lvl === 2) {
      // MEDIUM: Medium size, faster
      mizeWidth = 55;
      mizeHeight = 35;
    } else {
      // HARD: Tiny rat, extreme speed & random zigzag
      mizeWidth = 35;
      mizeHeight = 22;
    }

    mize.style.width = `${mizeWidth}px`;
    mize.style.height = `${mizeHeight}px`;
    spawnMize();
  }

  // Random Spawn from ANY Direction
  function spawnMize() {
    const kw = kitchen.clientWidth;
    const kh = kitchen.clientHeight;
    const side = Math.floor(Math.random() * 4); // 0: Left, 1: Right, 2: Top, 3: Bottom
    const speed = currentLevel === 1 ? 3 : currentLevel === 2 ? 6 : 10;

    if (side === 0) { // Left
      posX = -mizeWidth;
      posY = Math.random() * (kh - mizeHeight);
      velX = speed;
      velY = (Math.random() - 0.5) * speed;
    } else if (side === 1) { // Right
      posX = kw + mizeWidth;
      posY = Math.random() * (kh - mizeHeight);
      velX = -speed;
      velY = (Math.random() - 0.5) * speed;
    } else if (side === 2) { // Top
      posX = Math.random() * (kw - mizeWidth);
      posY = -mizeHeight;
      velX = (Math.random() - 0.5) * speed;
      velY = speed;
    } else { // Bottom
      posX = Math.random() * (kw - mizeWidth);
      posY = kh + mizeHeight;
      velX = (Math.random() - 0.5) * speed;
      velY = -speed;
    }
  }

  // Movement & Loop Engine
  function gameLoop() {
    if (!isPlaying) return;

    const kw = kitchen.clientWidth;
    const kh = kitchen.clientHeight;

    // Hard Mode Direction Jitter (Zigzag randomly)
    if (currentLevel === 3 && Math.random() < 0.08) {
      velX += (Math.random() - 0.5) * 6;
      velY += (Math.random() - 0.5) * 6;
    }

    posX += velX;
    posY += velY;

    // Respawn if escaped off-screen
    if (posX < -mizeWidth * 2 || posX > kw + mizeWidth * 2 || posY < -mizeHeight * 2 || posY > kh + mizeHeight * 2) {
      spawnMize();
    }

    // Orient rat graphic towards movement direction
    const angle = Math.atan2(velY, velX) * (180 / Math.PI);
    mize.style.left = `${posX}px`;
    mize.style.top = `${posY}px`;
    mize.style.transform = `rotate(${angle}deg)`;

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Ultra-Precise Touch/Click Detection
  kitchen.addEventListener("pointerdown", e => {
    if (!isPlaying) return;

    if (e.target.closest("#game-hud")) return;

    const rect = kitchen.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    const targetRect = mize.getBoundingClientRect();
    const targetX = targetRect.left - rect.left;
    const targetY = targetRect.top - rect.top;

    // Check exact hit inside rat bounding box
    const isHit = (
      tapX >= targetX &&
      tapX <= targetX + targetRect.width &&
      tapY >= targetY &&
      tapY <= targetY + targetRect.height
    );

    if (isHit) {
      // SUCCESSFUL PRECISE HIT -> WIN GAME!
      isPlaying = false;
      cancelAnimationFrame(animationFrameId);
      showScreen(winScreen);
    } else {
      // MISSED -> PLAY AUDIO
      playMissSound();
    }
  });

  // UI Event Listeners
  $("start-game-btn").addEventListener("click", () => showScreen(levelScreen));
  $("settings-btn").addEventListener("click", () => showScreen(settingsScreen));
  $("back-to-menu-btn").addEventListener("click", () => showScreen(startScreen));
  $("back-from-settings-btn").addEventListener("click", () => showScreen(startScreen));

  document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = parseInt(btn.dataset.level, 10);
      setupLevel(lvl);
      showScreen(gameScreen);
      isPlaying = true;
      requestAnimationFrame(gameLoop);
    });
  });

  $("quit-game-btn").addEventListener("click", () => {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    showScreen(startScreen);
  });

  $("play-again-btn").addEventListener("click", () => {
    showScreen(levelScreen);
  });

})();
