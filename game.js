import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

  // Handle Player Name (Ask only once and save locally)
  function getPlayerName() {
    let playerName = localStorage.getItem("mize_player_name");
    if (!playerName) {
      playerName = prompt("Enter your Chad name (asked only once):", "Chad") || "Anonymous Chad";
      playerName = playerName.trim().slice(0, 15);
      localStorage.setItem("mize_player_name", playerName);
    }
    return playerName;
  }

  // Firebase Leaderboard Integration Module (No Duplicates, Best Score Only per Level)
  const FirebaseLeaderboard = {
    isFirebaseEnabled: true,

    async saveScore(level, time) {
      if (!this.isFirebaseEnabled || !db) return;
      
      const playerName = getPlayerName();
      // Unique document ID per player and level to prevent duplicates
      const docId = `${playerName}_level_${level}`.replace(/\s+/g, '_').toLowerCase();
      const scoreRef = doc(db, "scores_v2", docId);

      try {
        const docSnap = await getDoc(scoreRef);
        const newTime = parseFloat(time.toFixed(2));

        // Save only if it's their first time on this level or if their new time is faster
        if (!docSnap.exists() || newTime < docSnap.data().time) {
          await setDoc(scoreRef, {
            name: playerName,
            level: level,
            time: newTime,
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Failed to update score:", err);
      }
    },

    async getScores(level) {
      if (!this.isFirebaseEnabled || !db) return [];
      try {
        const q = query(
          collection(db, "scores_v2"),
          orderBy("level", "asc"),
          orderBy("time", "asc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        let scores = snapshot.docs.map(doc => doc.data());

        // Filter scores specifically for the requested level
        return scores.filter(s => Number(s.level) === Number(level));
      } catch (err) {
        console.error("Failed to fetch scores:", err);
        return [];
      }
    }
  };

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

  function setupLevel(lvl) {
    currentLevel = lvl;
    levelIndicator.textContent = `LEVEL ${lvl}`;

    if (lvl === 1) { mizeWidth = 60; mizeHeight = 40; }
    else if (lvl === 2) { mizeWidth = 40; mizeHeight = 28; }
    else { mizeWidth = 24; mizeHeight = 16; }

    mize.style.width = `${mizeWidth}px`;
    mize.style.height = `${mizeHeight}px`;
    spawnMize();
  }

  function spawnMize() {
    const kw = kitchen.clientWidth || 360;
    const kh = kitchen.clientHeight || 600;
    const side = Math.floor(Math.random() * 4);
    const speed = currentLevel === 1 ? 6 : currentLevel === 2 ? 11 : 17;

    if (side === 0) { posX = -mizeWidth; posY = Math.random() * (kh - mizeHeight); velX = speed; velY = (Math.random() - 0.5) * speed; }
    else if (side === 1) { posX = kw + mizeWidth; posY = Math.random() * (kh - mizeHeight); velX = -speed; velY = (Math.random() - 0.5) * speed; }
    else if (side === 2) { posX = Math.random() * (kw - mizeWidth); posY = -mizeHeight; velX = (Math.random() - 0.5) * speed; velY = speed; }
    else { posX = Math.random() * (kw - mizeWidth); posY = kh + mizeHeight; velX = (Math.random() - 0.5) * speed; velY = -speed; }
  }

  function gameLoop() {
    if (!isPlaying) return;

    const kw = kitchen.clientWidth;
    const kh = kitchen.clientHeight;

    elapsedTime = (performance.now() - startTime) / 1000;
    timerDisplay.textContent = `${elapsedTime.toFixed(2)}s`;

    if (currentLevel === 2 && Math.random() < 0.05) {
      velX += (Math.random() - 0.5) * 4;
      velY += (Math.random() - 0.5) * 4;
    } else if (currentLevel === 3 && Math.random() < 0.15) {
      velX += (Math.random() - 0.5) * 10;
      velY += (Math.random() - 0.5) * 10;
    }

    posX += velX;
    posY += velY;

    if (posX < -mizeWidth * 3 || posX > kw + mizeWidth * 3 || posY < -mizeHeight * 3 || posY > kh + mizeHeight * 3) {
      spawnMize();
    }

    const angle = Math.atan2(velY, velX) * (180 / Math.PI);
    mize.style.left = `${posX}px`;
    mize.style.top = `${posY}px`;
    mize.style.transform = `rotate(${angle}deg)`;

    animationFrameId = requestAnimationFrame(gameLoop);
  }

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
      tapX >= targetX && tapX <= targetX + targetRect.width &&
      tapY >= targetY && tapY <= targetY + targetRect.height
    );

    if (isHit) {
      isPlaying = false;
      cancelAnimationFrame(animationFrameId);
      playAudio(winSound);
      bgMusic.pause();

      finalTimeDisplay.textContent = `${elapsedTime.toFixed(2)}s`;
      FirebaseLeaderboard.saveScore(currentLevel, elapsedTime);
      showScreen(winScreen);
    } else {
      playAudio(missSound);
    }
  });

  $("start-game-btn").addEventListener("click", () => {
    playAudio(bgMusic);
    showScreen(levelScreen);
  });

  $("settings-btn").addEventListener("click", () => showScreen(settingsScreen));
  
  // LEADERBOARD SCREEN WITH 3 LEVEL TABS/SECTIONS
  $("leaderboard-btn").addEventListener("click", async () => {
    showScreen(leaderboardScreen);
    leaderboardContent.innerHTML = "<div class='leaderboard-item'><span>Loading leaderboards...</span></div>";

    const scores1 = await FirebaseLeaderboard.getScores(1);
    const scores2 = await FirebaseLeaderboard.getScores(2);
    const scores3 = await FirebaseLeaderboard.getScores(3);

    const renderList = (title, scores) => `
      <div style="margin-bottom: 12px; font-size: 0.8rem; color: #f59e0b; font-weight: bold;">${title}</div>
      ${scores.length === 0 ? "<div class='leaderboard-item'><span>No scores yet</span></div>" : 
        scores.map((s, idx) => `
          <div class="leaderboard-item">
            <span>${idx + 1}. ${s.name}</span>
            <strong>${s.time}s</strong>
          </div>
        `).join("")}
    `;

    leaderboardContent.innerHTML = `
      <div style="max-height: 280px; overflow-y: auto;">
        ${renderList("--- LEVEL 1 (EASY) ---", scores1)}
        ${renderList("--- LEVEL 2 (MEDIUM) ---", scores2)}
        ${renderList("--- LEVEL 3 (HARD) ---", scores3)}
      </div>
    `;
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
