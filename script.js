(() => {
  "use strict";

  const arena = document.getElementById("game-arena");
  const rat = document.getElementById("rat-target");
  const scoreVal = document.getElementById("score-val");
  const missVal = document.getElementById("miss-val");
  const missAudioInput = document.getElementById("miss-audio-input");
  const funnyAudio = document.getElementById("funny-miss-audio");
  const restartBtn = document.getElementById("restart-btn");

  let score = 0;
  let misses = 0;
  let ratX = -80;
  let ratSpeed = 3.5;
  let isRunning = true;

  // Handle Custom Audio Upload
  missAudioInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      funnyAudio.src = fileURL;
    }
  });

  // Play funny sound on miss
  function playMissSound() {
    if (funnyAudio.src) {
      funnyAudio.currentTime = 0;
      funnyAudio.play().catch(() => {});
    }
  }

  // Animate the running rat across the bottom
  function updateRat() {
    if (!isRunning) return;
    
    ratX += ratSpeed;
    if (ratX > arena.clientWidth + 50) {
      // Rat escaped without being tapped! Counts as a miss
      misses++;
      missVal.textContent = misses;
      playMissSound();
      resetRatPosition();
    }

    rat.style.transform = `translateX(${ratX}px)`;
    requestAnimationFrame(updateRat);
  }

  function resetRatPosition() {
    ratX = -90;
    // Randomize speed slightly each pass
    ratSpeed = 2.5 + Math.random() * 3.5;
  }

  // Precise Tap/Click Detection Engine
  arena.addEventListener("pointerdown", (e) => {
    if (!isRunning) return;

    // Ignore clicks on control buttons below
    if (e.target.closest(".game-controls") || e.target.closest(".game-header")) return;

    const arenaRect = arena.getBoundingClientRect();
    const tapX = e.clientX - arenaRect.left;
    const tapY = e.clientY - arenaRect.top;

    const ratRect = rat.getBoundingClientRect();
    const ratBoxX = ratRect.left - arenaRect.left;
    const ratBoxY = ratRect.top - arenaRect.top;

    // Precise bounding check inside the rat image
    const isPreciseHit = (
      tapX >= ratBoxX &&
      tapX <= ratBoxX + ratRect.width &&
      tapY >= ratBoxY &&
      tapY <= ratBoxY + ratRect.height
    );

    if (isPreciseHit) {
      // SUCCESSFUL HIT
      score += 10;
      scoreVal.textContent = score;
      
      // Flash rat green on hit
      rat.style.filter = "drop-shadow(0 0 10px #00ffcc)";
      setTimeout(() => { rat.style.filter = "drop-shadow(0 5px 5px rgba(0,0,0,0.5))"; }, 200);

      resetRatPosition();
    } else {
      // MISSED -> PLAY FUNNY AUDIO
      misses++;
      missVal.textContent = misses;
      playMissSound();
    }
  });

  restartBtn.addEventListener("click", () => {
    score = 0;
    misses = 0;
    scoreVal.textContent = score;
    missVal.textContent = misses;
    resetRatPosition();
    isRunning = true;
  });

  // Start loop
  requestAnimationFrame(updateRat);
})();
