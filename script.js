let score = 0;
let lives = 3;
let gameStarted = false;

const grid = document.getElementById("grid");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const message = document.getElementById("message");
const startButton = document.getElementById("startButton");

startButton.addEventListener("click", startGame);

function startGame() {
    score = 0;
    lives = 3;
    gameStarted = true;

    scoreText.textContent = score;
    livesText.textContent = lives;
    message.textContent = "";

    startButton.textContent = "RESTART";

    createRound();
}

function createRound() {
    grid.innerHTML = "";

    const totalCells = 16;

    // Random position for the odd symbol
    const oddPosition = Math.floor(Math.random() * totalCells);

    for (let i = 0; i < totalCells; i++) {

        const cell = document.createElement("button");

        cell.className = "cell";
        cell.textContent = "●";

        if (i === oddPosition) {
            cell.textContent = "◆";
        }

        cell.addEventListener("click", function () {
            if (!gameStarted) return;

            if (i === oddPosition) {
                score++;
                scoreText.textContent = score;

                message.textContent = "✓ Correct!";

                createRound();
            } else {
                lives--;
                livesText.textContent = lives;

                message.textContent = "✕ Wrong!";

                if (lives <= 0) {
                    endGame();
                }
            }
        });

        grid.appendChild(cell);
    }
}

function endGame() {
    gameStarted = false;

    grid.innerHTML = "";

    message.textContent = "Game Over! Score: " + score;

    startButton.textContent = "PLAY AGAIN";
}