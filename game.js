(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  // Screens & Elements
  const startScreen = $("start-screen");
  const levelScreen = $("level-screen");
  const settingsScreen = $("settings-screen");
  const leaderboardScreen = $("leaderboard-screen");
  const gameScreen = $("game-screen");
  const winScreen = $("win-screen");

  const mize = $("mize-target");
  const kitchen = $("kitchen-bg");
  const levelIndicator = $("level-indicator");
  const timerDisplay = $("timer-display");
  const finalTimeDisplay = $("final-time");
  const leaderboardContent = $("leaderboard-content");

  // Audio Elements
  const bgMusic = $("bg-music");
  const missSound = $("miss-sound");
  const winSound = $("win-sound");

  const musicToggle = $("music-toggle");
  const sfxToggle = $("sfx-toggle");

  // Game Engine Variables
  let currentLevel = 1;
  let isPlaying = false;
  let posX = 0, posY = 0;
  let velX = 0, velY = 0;
  let mizeWidth = 60, mizeHeight = 40;
  let animationFrameId = null;
  let startTime = 0;
  let elapsedTime = 0;

  // ==========================================
  // 🔮 FIREBASE / LEADERBOARD MODULE
  // ==========================================
  const FirebaseLeaderboard = {
    // Set to true once you connect Firebase!
    isFirebaseEnabled: false,

    // PLACEHOLDER: Paste your Firebase Config here later
    config: {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    },

    init() {
      if (this.isFirebaseEnabled) {
        console.log("Firebase initialized!");
      }
    },

    saveScore(level, time) {
      if (this.isFirebaseEnabled) {
        // Firebase database push logic will go here
      } else {
        // Fallback: LocalStorage
        const key = `mize_best_level_${level}`;
        const prev = localStorage.getItem(key);
        if (!prev || time < parseFloat(prev)) {
          localStorage.setItem(key, time.toFixed(2));
        }
      }
    },

    getScores() {
      if (this.isFirebaseEnabled) {
        // Firebase fetch logic
        return [];
      } else {
        // LocalStorage fallback
        return [
          { level: "Level 1 (Easy)", time: localStorage.getItem("mize_best_level_1") || "N/A" },
          { level: "Level 2 (Medium)", time: localStorage.getItem("mize_best_level_2") || "N/A" },
          { level: "Level 3 (Hard)", time: localStorage.getItem("mize_best_level_3") || "N/A" }
        ];
      }
    }
  };

  FirebaseLeaderboard.init();

  // Audio Control Helpers
  function playAudio(audio) {
    if (audio === bgMusic && !musicToggle.checked) return;
    if (audio !== bgMusic && !sfxToggle.checked) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (_) {}
  }

  function showScreen(screen) {
    [startScreen, levelScreen, settingsScreen, leaderboardScreen, gameScreen, winScreen].forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  // Difficulty Configurations (BUMPED UP!)
  function setupLevel(lvl) {
    currentLevel = lvl;
    levelIndicator.textContent = `LEVEL ${lvl}`;

    if (lvl === 1) { // Easy (Slightly faster now)
      mizeWidth = 65;
      mizeHeight = 45;
    } else if (lvl === 2) { // Medium (Small & fast)
      mizeWidth = 45;
      mizeHeight = 30;
    } else { // Hard (Ultra-small, erratic speed)
      mizeWidth = 28;
      mizeHeight = 18;
    }

    mize.style.width = `${mizeWidth}px`;
    mize.style.height = `${mizeHeight}px`;
    spawnMize();
  }

  function spawnMize() {
    const kw = kitchen.clientWidth || 360;
    const kh = kitchen.clientHeight || 600;
    const side = Math.floor(Math.random() * 4);
    
    // Bumped up speeds per level
    const speed = currentLevel === 1 ? 5 : currentLevel === 2 ? 9 : 14;

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

  function gameLoop() {
    if (!isPlaying) return;

    const kw = kitchen.clientWidth;
    const kh = kitchen.clientHeight;

    // Timer Update
    elapsedTime = (performance.now() - startTime) / 1000;
    timerDisplay.textContent = `${elapsedTime.toFixed(2)}s`;

    // Medium & Hard erratic shifts
    if (currentLevel === 2 && Math.random() < 0.04) {
      velX += (Math.random() - 0.5) * 3;
      velY += (Math.random() - 0.5) * 3;
    } else if (currentLevel === 3 && Math.random() < 0.12) {
      velX += (Math.random() - 0.5) * 8;
      velY += (Math.random() - 0.5) * 8;
    }

    posX += velX;
    posY += velY;

    // Respawn if ran completely off-screen
    if (posX < -mizeWidth * 3 || posX > kw + mizeWidth * 3 || posY < -mizeHeight * 3 || posY > kh + mizeHeight * 3) {
      spawnMize();
    }

    const angle = Math.atan2(velY, velX) * (180 / Math.PI);
    mize.style.left = `${posX}px`;
    mize.style.top = `${posY}px`;
    mize.style.transform = `rotate(${angle}deg)`;

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Ultra-Precise Tap Check
  kitchen.addEventListener("pointerdown", e => {
    if (!isPlaying) return;
    if (e.target.closest("#game-hud")) return;

    const rect = kitchen.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    const targetRect = mize.getBoundingClientRect();
    const targetX = targetRect.left - rect.left;
    const targetY = targetRect.top - rect.top;

    const isHit = (
      tapX >= targetX &&
      tapX <= targetX + targetRect.width &&
      tapY >= targetY &&
      tapY <= targetY + targetRect.height
    );

    if (isHit) {
      // SUCCESSFUL HIT -> WIN!
      isPlaying = false;
      cancelAnimationFrame(animationFrameId);
      playAudio(winSound);

      finalTimeDisplay.textContent = `${elapsedTime.toFixed(2)}s`;
      FirebaseLeaderboard.saveScore(currentLevel, elapsedTime);
      showScreen(winScreen);
    } else {
      // MISSED -> FAIL SOUND
      playAudio(missSound);
    }
  });

  // Navigation Event Listeners
  $("start-game-btn").addEventListener("click", () => {
    playAudio(bgMusic);
    showScreen(levelScreen);
  });

  $("settings-btn").addEventListener("click", () => showScreen(settingsScreen));
  
  $("leaderboard-btn").addEventListener("click", () => {
    const scores = FirebaseLeaderboard.getScores();
    leaderboardContent.innerHTML = scores.map(s => `
      <div class="leaderboard-item">
        <span>${s.level}</span>
        <strong>${s.time !== "N/A" ? s.time + "s" : "N/A"}</strong>
      </div>
    `).join("");
    showScreen(leaderboardScreen);
  });

  $("back-to-menu-btn").addEventListener("click", () => showScreen(startScreen));
  $("back-from-settings-btn").addEventListener("click", () => showScreen(startScreen));
  $("back-from-leaderboard-btn").addEventListener("click", () => showScreen(startScreen));

  document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = parseInt(btn.dataset.level, 10);
      setupLevel(lvl);
      showScreen(gameScreen);
      isPlaying = true;
      startTime = performance.now();
      requestAnimationFrame(gameLoop);
    });
  });

  $("quit-game-btn").addEventListener("click", () => {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    showScreen(startScreen);
  });

  $("play-again-btn").addEventListener("click", () => showScreen(levelScreen));

})();
