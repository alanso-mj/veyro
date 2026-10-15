"use strict";

const $ = (id) => document.getElementById(id);

const numberEl = $("number");
const scoreEl = $("score");
const bestEl = $("best");
const streakEl = $("streak");
const livesEl = $("lives");
const feedbackEl = $("feedback");
const lowerBtn = $("lowerBtn");
const higherBtn = $("higherBtn");
const overlay = $("overlay");
const finalScoreEl = $("finalScore");
const restartBtn = $("restartBtn");
const soundBtn = $("soundBtn");

let currentNumber;
let score;
let streak;
let lives;
let gameOver = false;
let soundEnabled = true;
let audioContext = null;

function getBest() {
  try {
    return Number(localStorage.getItem("veyroBest")) || 0;
  } catch {
    return 0;
  }
}

let best = getBest();
bestEl.textContent = best;

function playTone(frequency, duration = 0.1) {
  if (!soundEnabled) return;

  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Sound unavailable:", error);
  }
}

function updateLives() {
  livesEl.textContent =
    "🌙 ".repeat(lives) + "· ".repeat(5 - lives);

  livesEl.setAttribute(
    "aria-label",
    `${lives} lives remaining`
  );
}

function setFeedback(message, type = "") {
  feedbackEl.textContent = message;
  feedbackEl.className = "feedback";

  if (type) {
    feedbackEl.classList.add(type);
  }
}

function setButtonsDisabled(disabled) {
  lowerBtn.disabled = disabled;
  higherBtn.disabled = disabled;
}

function randomDifferentNumber(previous) {
  let next;

  do {
    next = Math.floor(Math.random() * 100) + 1;
  } while (next === previous);

  return next;
}

function startGame() {
  currentNumber = Math.floor(Math.random() * 100) + 1;
  score = 0;
  streak = 0;
  lives = 5;
  gameOver = false;

  scoreEl.textContent = score;
  streakEl.textContent = streak;
  numberEl.textContent = currentNumber;

  updateLives();
  setFeedback("MAKE YOUR MOVE");

  overlay.classList.add("hidden");
  setButtonsDisabled(false);
}

function finishGame() {
  gameOver = true;
  setButtonsDisabled(true);

  finalScoreEl.textContent = score;

  if (score > best) {
    best = score;

    try {
      localStorage.setItem("veyroBest", String(best));
    } catch (error) {
      console.warn("Could not save best score:", error);
    }

    bestEl.textContent = best;
  }

  overlay.classList.remove("hidden");
  playTone(180, 0.3);
}

function guess(direction) {
  if (gameOver) return;

  const previous = currentNumber;
  const next = randomDifferentNumber(previous);

  const correct =
    direction === "higher"
      ? next > previous
      : next < previous;

  currentNumber = next;
  numberEl.textContent = next;

  numberEl.classList.remove("pop");
  void numberEl.offsetWidth;
  numberEl.classList.add("pop");

  if (correct) {
    score++;
    streak++;

    scoreEl.textContent = score;
    streakEl.textContent = streak;

    setFeedback("CORRECT! KEEP GOING!", "good");
    playTone(620 + Math.min(streak * 25, 300));
  } else {
    streak = 0;
    lives--;

    streakEl.textContent = streak;
    updateLives();

    setFeedback("WRONG! MOON LOST", "bad");
    playTone(220, 0.18);
  }

  if (lives <= 0) {
    finishGame();
  }
}

lowerBtn.addEventListener("click", () => {
  guess("lower");
});

higherBtn.addEventListener("click", () => {
  guess("higher");
});

restartBtn.addEventListener("click", startGame);

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";

  soundBtn.setAttribute(
    "aria-label",
    soundEnabled ? "Turn sound off" : "Turn sound on"
  );

  if (soundEnabled) {
    playTone(500);
  }
});

startGame();
