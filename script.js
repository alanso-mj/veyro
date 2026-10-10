/* ========================================
   VEYRO — FOOTBALL QUIZ
   STEP 3: BASIC INTERFACE INTERACTIONS
======================================== */


/* ---------- SCREEN NAVIGATION ---------- */

const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  const targetScreen = document.getElementById(screenId);

  if (targetScreen) {
    targetScreen.classList.add("active");
    window.scrollTo(0, 0);
  }
}


/* ---------- HOME BUTTONS ---------- */

const playButton = document.getElementById("playButton");
const homeLogo = document.getElementById("homeLogo");
const homeButton = document.getElementById("homeButton");

playButton.addEventListener("click", () => {
  showScreen("quizScreen");
});

homeLogo.addEventListener("click", (event) => {
  event.preventDefault();
  showScreen("homeScreen");
});

homeButton.addEventListener("click", () => {
  showScreen("homeScreen");
});


/* ---------- ANSWER SELECTION ---------- */

const answerButtons = document.querySelectorAll(".answer-button");

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {

    answerButtons.forEach((answer) => {
      answer.classList.remove("selected");

      const mark = answer.querySelector(".answer-mark");

      if (mark) {
        mark.textContent = "＋";
      }
    });

    button.classList.add("selected");

    const selectedMark = button.querySelector(".answer-mark");

    if (selectedMark) {
      selectedMark.textContent = "✓";
    }

  });
});


/* ---------- CONTINUE BUTTON ---------- */

const continueButton = document.getElementById("continueButton");

continueButton.addEventListener("click", () => {
  showScreen("transitionScreen");
});


/* ---------- RISK IT BUTTON ---------- */

const riskButton = document.getElementById("riskButton");

riskButton.addEventListener("click", () => {
  showScreen("quizScreen");
});


/* ---------- KEEP MY SCORE BUTTON ---------- */

const keepButton = document.getElementById("keepButton");

keepButton.addEventListener("click", () => {
  showScreen("resultsScreen");
});/* ---------- SHARE VEYRO ---------- */

const shareButton = document.getElementById("shareButton");

shareButton.addEventListener("click", async () => {
  const shareData = {
    title: "VEYRO — Football Quiz",
    text: "Think you know football? Challenge yourself with VEYRO! ⚽",
    url: "https://alanso-mj.github.io/veyro/"
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert("VEYRO link copied! Share it with your friends ⚽");
    } else {
      prompt("Copy your VEYRO link:", shareData.url);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      alert("Couldn't open sharing. Try copying the website link instead.");
    }
  }
});
