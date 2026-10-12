/* =====================================
   VEYRO — HIGHER OR LOWER
   GAME LOGIC
===================================== */


/* ---------- SCREEN NAVIGATION ---------- */

const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ---------- GAME VARIABLES ---------- */

let currentNumber = 0;
let score = 0;
let streak = 0;
let moons = 5;
let shield = false;
let gameActive = false;

const MAX_MOONS = 5;
const MOON_REWARD_STREAK = 5;
const SHIELD_REWARD_STREAK = 8;

let bestScore = Number(localStorage.getItem("higherLowerBest")) || 0;


/* ---------- ELEMENTS ---------- */

const homeBest = document.getElementById("homeBest");
const bestDisplay = document.getElementById("bestDisplay");
const scoreDisplay = document.getElementById("score");
const currentNumberDisplay = document.getElementById("currentNumber");
const gameMessage = document.getElementById("gameMessage");

const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");

const livesDisplay = document.getElementById("livesDisplay");
const streakDisplay = document.getElementById("streakDisplay");


/* ---------- PERSONAL BEST ---------- */

function updateBestDisplay() {
  homeBest.textContent = bestScore;
  bestDisplay.textContent = `BEST: ${bestScore}`;
  finalBest.textContent = bestScore;
}

updateBestDisplay();


/* ---------- UPDATE GAME STATUS ---------- */

function updateGameStatus() {
  livesDisplay.textContent = "🌚 ".repeat(moons).trim() || "None";
  streakDisplay.textContent = `🔥 ${streak}`;

  const shieldDisplay = document.getElementById("shieldDisplay");

  if (shieldDisplay) {
    shieldDisplay.textContent = shield ? "🛡️ SHIELD READY" : "NO SHIELD";
  }
}


/* ---------- START GAME ---------- */

function startGame() {
  score = 0;
  streak = 0;
  moons = 5;
  shield = false;

  currentNumber = Math.floor(Math.random() * 99) + 1;
  gameActive = true;

  scoreDisplay.textContent = score;
  currentNumberDisplay.textContent = currentNumber;
  gameMessage.textContent = "Make your guess.";

  document.getElementById("higherButton").disabled = false;
  document.getElementById("lowerButton").disabled = false;

  updateGameStatus();
  showScreen("gameScreen");
}


/* ---------- GENERATE NEXT NUMBER ---------- */

function generateNextNumber() {
  return Math.floor(Math.random() * 100) + 1;
}


/* ---------- NOTIFICATIONS ---------- */

function notify(message) {
  gameMessage.textContent = message;
}


/* ---------- MAKE A GUESS ---------- */

function makeGuess(direction) {
  if (!gameActive) return;

  const nextNumber = generateNextNumber();

  // Equal numbers count as correct.
  const correct =
    nextNumber === currentNumber ||
    (direction === "higher" && nextNumber > currentNumber) ||
    (direction === "lower" && nextNumber < currentNumber);

  currentNumber = nextNumber;
  currentNumberDisplay.textContent = currentNumber;

  if (correct) {
    score++;
    streak++;

    scoreDisplay.textContent = score;

    // Update personal best.
    if (score > bestScore) {
      bestScore = score;

      try {
        localStorage.setItem("higherLowerBest", bestScore);
      } catch (_) {}

      updateBestDisplay();
    }

    let message = "CORRECT! Keep going!";

    // Reward at 5 consecutive wins.
    if (streak === MOON_REWARD_STREAK) {
      if (moons < MAX_MOONS) {
        moons++;
        message = "+1 🌚 MOON!";
      } else {
        message = "🌚 MOONS FULL!";
      }
    }

    // Reward at 8 consecutive wins.
    if (streak === SHIELD_REWARD_STREAK) {
      if (!shield) {
        shield = true;
        message = "🛡️ SHIELD ACQUIRED!";
      } else {
        message = "🛡️ YOU ALREADY HAVE A SHIELD!";
      }
    }

    notify(message);
    updateGameStatus();

  } else {
    streak = 0;

    if (shield) {
      shield = false;
      notify("🛡️ SHIELD SAVED YOU!");
    } else {
      moons--;
      notify("WRONG GUESS! −1 🌚 MOON");
    }

    updateGameStatus();

    if (moons <= 0) {
      endGame();
      return;
    }
  }
}


/* ---------- GAME OVER ---------- */

function endGame() {
  gameActive = false;

  document.getElementById("higherButton").disabled = true;
  document.getElementById("lowerButton").disabled = true;

  finalScore.textContent = score;

  updateBestDisplay();
  showScreen("gameOverScreen");
}


/* ---------- BUTTON EVENTS ---------- */

document.getElementById("startButton").addEventListener("click", startGame);

document.getElementById("higherButton").addEventListener(
  "click",
  () => makeGuess("higher")
);

document.getElementById("lowerButton").addEventListener(
  "click",
  () => makeGuess("lower")
);

document.getElementById("playAgainButton").addEventListener("click", startGame);

document.getElementById("exitButton").addEventListener("click", () => {
  gameActive = false;
  showScreen("homeScreen");
  updateBestDisplay();
});

document.getElementById("gameHomeButton").addEventListener("click", () => {
  gameActive = false;
  showScreen("homeScreen");
  updateBestDisplay();
});


/* ---------- HOW TO PLAY ---------- */

document.getElementById("howToPlayButton").addEventListener(
  "click",
  () => showScreen("rulesScreen")
);

document.getElementById("rulesBackButton").addEventListener(
  "click",
  () => showScreen("homeScreen")
);

document.getElementById("rulesStartButton").addEventListener(
  "click",
  startGame
);