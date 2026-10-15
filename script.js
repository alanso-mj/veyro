"use strict";

const $ = id => document.getElementById(id);

const screens = [
  "homeScreen",
  "gameScreen",
  "rulesScreen",
  "pauseScreen",
  "overScreen"
];

let currentNumber = 50;
let score = 0;
let streak = 0;
let lives = 5;
let best = 0;
let gameOver = false;
let soundEnabled = true;
let audioContext = null;

try {
  best = Number(localStorage.getItem("veyroBest")) || 0;
} catch {
  best = 0;
}

function showScreen(id) {
  screens.forEach(screenId => {
    $(screenId).classList.toggle("hidden", screenId !== id);
  });
}

function playTone(frequency, duration = 0.12, type = "sine") {
  if (!soundEnabled) return;

  try {
    audioContext ??= new (
      window.AudioContext || window.webkitAudioContext
    )();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch (error) {
    console.warn("Audio unavailable:", error);
  }
}

function playCorrectSound() {
  playTone(660, 0.09, "sine");

  setTimeout(() => {
    playTone(880, 0.12, "sine");
  }, 70);
}

function playWrongSound() {
  playTone(190, 0.22, "triangle");
}

function playGameOverSound() {
  playTone(260, 0.18, "triangle");

  setTimeout(() => {
    playTone(180, 0.32, "triangle");
  }, 180);
}

function updateBest() {
  $("best").textContent = best;
  $("homeBest").textContent = best;

  try {
    localStorage.setItem("veyroBest", String(best));
  } catch {
    // The game still works if browser storage is unavailable.
  }
}

function updateLives() {
  $("lives").textContent =
    "🌙 ".repeat(lives) + "· ".repeat(5 - lives);
}

function feedback(message, type = "") {
  $("feedback").textContent = message;
  $("feedback").className = "feedback";

  if (type) {
    $("feedback").classList.add(type);
  }
}

function newGame() {
  currentNumber = Math.floor(Math.random() * 100) + 1;
  score = 0;
  streak = 0;
  lives = 5;
  gameOver = false;

  $("number").textContent = currentNumber;
  $("score").textContent = score;
  $("streak").textContent = streak;

  updateLives();
  updateBest();
  feedback("MAKE YOUR MOVE");

  $("lowerBtn").disabled = false;
  $("higherBtn").disabled = false;

  showScreen("gameScreen");
}

function startGame() {
  playTone(520, 0.09);
  newGame();
}

function finishGame() {
  gameOver = true;

  $("lowerBtn").disabled = true;
  $("higherBtn").disabled = true;

  $("finalScore").textContent = score;

  if (score > best) {
    best = score;
    updateBest();
    $("recordMessage").textContent = "NEW PERSONAL BEST! ✦";
  } else {
    $("recordMessage").textContent = "Can you beat your best next time?";
  }

  showScreen("overScreen");
  playGameOverSound();
}

function guess(direction) {
  if (gameOver) return;

  const previous = currentNumber;

  // Generate a different number between 1 and 100.
  let next;

  do {
    next = Math.floor(Math.random() * 100) + 1;
  } while (next === previous);

  const correct =
    direction === "higher"
      ? next > previous
      : next < previous;

  currentNumber = next;
  $("number").textContent = next;

  $("number").classList.remove("pop");
  void $("number").offsetWidth;
  $("number").classList.add("pop");

  if (correct) {
    score++;
    streak++;

    $("score").textContent = score;
    $("streak").textContent = streak;

    feedback("CORRECT! KEEP GOING!", "good");
    playCorrectSound();
  } else {
    streak = 0;
    lives--;

    $("streak").textContent = streak;
    updateLives();

    feedback("WRONG! MOON LOST", "bad");
    playWrongSound();
  }

  if (lives <= 0) {
    finishGame();
  }
}

// Main navigation
$("startBtn").addEventListener("click", startGame);
$("rulesStartBtn").addEventListener("click", startGame);

$("rulesBtn").addEventListener("click", () => {
  playTone(420, 0.07);
  showScreen("rulesScreen");
});

$("rulesBackBtn").addEventListener("click", () => {
  showScreen("homeScreen");
});

$("homeLogo").addEventListener("click", event => {
  event.preventDefault();
  showScreen("homeScreen");
});

// Gameplay
$("lowerBtn").addEventListener("click", () => guess("lower"));
$("higherBtn").addEventListener("click", () => guess("higher"));

// Pause and resume
$("pauseBtn").addEventListener("click", () => {
  playTone(380, 0.08);
  showScreen("pauseScreen");
});

$("resumeBtn").addEventListener("click", () => {
  playTone(520, 0.08);
  showScreen("gameScreen");
});

$("restartBtn").addEventListener("click", startGame);

$("pauseHomeBtn").addEventListener("click", () => {
  showScreen("homeScreen");
});

// Game over
$("againBtn").addEventListener("click", startGame);

$("overHomeBtn").addEventListener("click", () => {
  showScreen("homeScreen");
});

// Sound control
$("soundBtn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  $("soundBtn").textContent = soundEnabled ? "🔊" : "🔇";

  $("soundBtn").setAttribute(
    "aria-label",
    soundEnabled ? "Turn sound off" : "Turn sound on"
  );

  if (soundEnabled) {
    playTone(500, 0.1);
  }
});

// Initialize
updateBest();
showScreen("homeScreen");