/* =====================================
   HIGHER OR LOWER
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
let bestScore = Number(localStorage.getItem("higherLowerBest")) || 0;
let gameActive = false;


/* ---------- ELEMENTS ---------- */

const homeBest = document.getElementById("homeBest");
const bestDisplay = document.getElementById("bestDisplay");
const scoreDisplay = document.getElementById("score");
const currentNumberDisplay = document.getElementById("currentNumber");
const gameMessage = document.getElementById("gameMessage");

const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");


/* ---------- UPDATE PERSONAL BEST ---------- */

function updateBestDisplay() {
  homeBest.textContent = bestScore;
  bestDisplay.textContent = `BEST: ${bestScore}`;
  finalBest.textContent = bestScore;
}

updateBestDisplay();


/* ---------- START GAME ---------- */

function startGame() {
  score = 0;

  currentNumber = Math.floor(Math.random() * 99) + 1;

  gameActive = true;

  scoreDisplay.textContent = score;
  currentNumberDisplay.textContent = currentNumber;
  gameMessage.textContent = "Make your guess.";

  document.getElementById("higherButton").disabled = false;
  document.getElementById("lowerButton").disabled = false;

  showScreen("gameScreen");
}


/* ---------- GENERATE NEXT NUMBER ---------- */

function generateNextNumber() {
  return Math.floor(Math.random() * 100) + 1;
}


/* ---------- MAKE A GUESS ---------- */

function makeGuess(direction) {
  if (!gameActive) {
    return;
  }

  const nextNumber = generateNextNumber();

  let correct = false;

  if (direction === "higher" && nextNumber > currentNumber) {
    correct = true;
  }

  if (direction === "lower" && nextNumber < currentNumber) {
    correct = true;
  }

  /* Show the new number */

  currentNumber = nextNumber;
  currentNumberDisplay.textContent = currentNumber;

  /* Check the result */

  if (correct) {
    score++;

    scoreDisplay.textContent = score;
    gameMessage.textContent = "CORRECT! Keep going!";

    if (score > bestScore) {
      bestScore = score;

      localStorage.setItem(
        "higherLowerBest",
        bestScore
      );

      updateBestDisplay();
    }

  } else {
    gameMessage.textContent = "Wrong guess!";
    endGame();
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

document.getElementById("startButton").addEventListener(
  "click",
  startGame
);

document.getElementById("higherButton").addEventListener(
  "click",
  () => makeGuess("higher")
);

document.getElementById("lowerButton").addEventListener(
  "click",
  () => makeGuess("lower")
);

document.getElementById("playAgainButton").addEventListener(
  "click",
  startGame
);

document.getElementById("exitButton").addEventListener(
  "click",
  () => {
    gameActive = false;
    showScreen("homeScreen");
    updateBestDisplay();
  }
);

document.getElementById("gameHomeButton").addEventListener(
  "click",
  () => {
    gameActive = false;
    showScreen("homeScreen");
    updateBestDisplay();
  }
);


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