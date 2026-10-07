let currentNumber = 50;
let score = 0;
let best = 0;
let playing = false;

const numberDisplay = document.getElementById("number");
const scoreDisplay = document.getElementById("score");
const bestDisplay = document.getElementById("best");
const result = document.getElementById("result");

const higherButton = document.getElementById("higher");
const lowerButton = document.getElementById("lower");
const startButton = document.getElementById("start");


function randomNumber() {
    return Math.floor(Math.random() * 100) + 1;
}


function startGame() {

    score = 0;
    currentNumber = randomNumber();

    playing = true;

    scoreDisplay.textContent = score;
    numberDisplay.textContent = currentNumber;

    result.textContent = "Will the next number be higher or lower?";

    startButton.textContent = "Restart Game";
}


function makeGuess(guess) {

    if (!playing) {
        result.textContent = "Press Start Game first.";
        return;
    }

    const nextNumber = randomNumber();

    let correct = false;

    if (guess === "higher" && nextNumber > currentNumber) {
        correct = true;
    }

    if (guess === "lower" && nextNumber < currentNumber) {
        correct = true;
    }

    numberDisplay.textContent = nextNumber;

    if (correct) {

        score++;

        scoreDisplay.textContent = score;

        result.textContent =
            "Correct! Keep going.";

        currentNumber = nextNumber;

        if (score > best) {
            best = score;
            bestDisplay.textContent = best;
        }

    } else {

        result.innerHTML =
    '<div class="game-over">GAME OVER</div>' +
    '<div class="final-score">Score: ' + score + '</div>';

        playing = false;

        startButton.textContent = "Play Again";
    }
}


higherButton.addEventListener("click", function () {
    makeGuess("higher");
});


lowerButton.addEventListener("click", function () {
    makeGuess("lower");
});


startButton.addEventListener("click", startGame);