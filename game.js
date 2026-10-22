import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjvRM2SbMuzuGrh2tAlE0eLGS7ib8dLMU",
  authDomain: "mize-game-76264.firebaseapp.com",
  projectId: "mize-game-76264",
  storageBucket: "mize-game-76264.firebasestorage.app",
  messagingSenderId: "717943855328",
  appId: "1:717943855328:web:9ef84f4496ccde62675885"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  // Screens & UI Elements
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

  // Game Variables
  let currentLevel = 1;
  let isPlaying = false;
  let posX = 0, posY = 0;
  let velX = 0, velY = 0;
  let mizeWidth = 55, mizeHeight = 35;
  let animationFrameId = null;
  let startTime = 0;
  let elapsedTime = 0;

  // Firebase Leaderboard Integration Module
  const FirebaseLeaderboard = {
    isFirebaseEnabled: true,

    async saveScore(level, time) {
      if (this.isFirebaseEnabled && db) {
        try {
          const playerName = prompt("Enter your Chad name for the leaderboard:", "Chad") || "Anonymous Chad";
          await addDoc(collection(db, "scores"), {
            name: playerName,
            level: `Level ${level}`,
            time: parseFloat(time.toFixed(2)),
            createdAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Failed to save online score:", err);
        }
      }
    },

    async getScores() {
      if (this.isFirebaseEnabled && db) {
        try {
          const q = query(collection(db, "scores"), orderBy("time", "asc"), limit(10));
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              name: data.name,
              level: data.level,
              time: data.time
            };
          });
        } catch (err) {
          console.error("Failed to fetch online scores:", err);
          return [];
        }
      }
      return [];
    }
  };

  // Audio Control Helper
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

  // Difficulty Configurations (BUMPED UP TO BE HARDER)
  function setupLevel(lvl) {
    currentLevel = lvl;
    levelIndicator.textContent = `LEVEL ${lvl}`;

    if (lvl === 1) { // Easy
      mizeWidth = 60;
      mizeHeight = 40;
    } else if (lvl === 2) { // Medium
      mizeWidth = 40;
      mizeHeight = 28;
    } else { // Hard (Tiny & insanely fast)
      mizeWidth = 24;
      mizeHeight = 16;
    }

    mize.style.width = `${mizeWidth}px`;
    mize.style.height = `${mizeHeight}px`;
    spawnMize();
  }

  // Random Entry From Any Direction (Left, Right, Top, Bottom)
  function spawnMize() {
    const kw = kitchen.clientWidth || 360;
    const kh = kitchen.clientHeight || 600;
    const side = Math.floor(Math.random() * 4);
    
    // Increased speeds across all levels
    const speed = currentLevel === 1 ? 6 : currentLevel === 2 ? 11 : 17;

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

    // Erratic movement shifts for Medium & Hard levels
    if (currentLevel === 2 && Math.random() < 0.05) {
      velX += (Math.random() - 0.5) * 4;
      velY += (Math.random() - 0.5) * 4;
    } else if (currentLevel === 3 && Math.random() < 0.15) {
      velX += (Math.random() - 0.5) * 10;
      velY += (Math.random() - 0.5) * 10;
    }

    posX += velX;
    posY += velY;

    // Respawn if rat exits boundaries
    if (posX < -mizeWidth * 3 || posX > kw + mizeWidth * 3 || posY < -mizeHeight * 3 || posY > kh + mizeHeight * 3) {
      spawnMize();
    }

    const angle = Math.atan2(velY, velX) * (180 / Math.PI);
    mize.style.left = `${posX}px`;
    mize.style.top = `${posY}px`;
    mize.style.transform = `rotate(${angle}deg)`;

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Ultra-Precise Tap/Click Handler
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
      // WIN STATE
      isPlaying = false;
      cancelAnimationFrame(animationFrameId);
      playAudio(winSound);
      bgMusic.pause();

      finalTimeDisplay.textContent = `${elapsedTime.toFixed(2)}s`;
      FirebaseLeaderboard.saveScore(currentLevel, elapsedTime);
      showScreen(winScreen);
    } else {
      // FAIL / MISS STATE
      playAudio(missSound);
    }
  });

  // UI Navigation Event Listeners
  $("start-game-btn").addEventListener("click", () => {
    playAudio(bgMusic);
    showScreen(levelScreen);
  });

  $("settings-btn").addEventListener("click", () => showScreen(settingsScreen));
  
  $("leaderboard-btn").addEventListener("click", async () => {
    leaderboardContent.innerHTML = "<div class='leaderboard-item'><span>Loading...</span></div>";
    showScreen(leaderboardScreen);
    
    const scores = await FirebaseLeaderboard.getScores();
    if (scores.length === 0) {
      leaderboardContent.innerHTML = "<div class='leaderboard-item'><span>No scores yet! Be the first Chad.</span></div>";
    } else {
      leaderboardContent.innerHTML = scores.map((s, index) => `
        <div class="leaderboard-item">
          <span>${index + 1}. ${s.name} (${s.level})</span>
          <strong>${s.time}s</strong>
        </div>
      `).join("");
    }
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

  $("play-again-btn").addEventListener("click", () => {
    playAudio(bgMusic);
    showScreen(levelScreen);
  });

})();
