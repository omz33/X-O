// x-o js
const board = document.getElementById('board');
const message = document.getElementById('message');
let currentPlayer = 'X';
let player1Name = "Player X";
let player2Name = "Player O";
let isAI = false;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameMode = 'friend';
let scoreX = localStorage.getItem('scoreX') || 0;
let scoreO = localStorage.getItem('scoreO') || 0;
let aiDifficulty = 'easy';

document.getElementById('scoreX').innerText = scoreX;
document.getElementById('scoreO').innerText = scoreO;

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Vertical
        [0, 4, 8], [2, 4, 6]              // Diagonal
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            document.getElementById(`cell-${a}`).classList.add('winner');
            document.getElementById(`cell-${b}`).classList.add('winner');
            document.getElementById(`cell-${c}`).classList.add('winner');

            drawWinLine(pattern);

            const winner = gameBoard[a] === 'X' ? player1Name : player2Name;
            message.innerText = `${winner} Wins!`;
            celebrateWin();
            updateScore(gameBoard[a]);
            return true;
        }
    }

    if (!gameBoard.includes('')) {
        message.innerText = "It's a draw!";
        return true;
    }
    return false;
}
function openAIDifficultyModal() {
    const modal = document.getElementById('aiLevelModal');
    modal.style.display = 'flex';
}
function closeAIDifficultyModal() {
    const modal = document.getElementById('aiLevelModal');
    modal.style.display = 'none';
}
function setAIDifficulty(level) {
    aiDifficulty = level;
    closeAIDifficultyModal();
    restartGame();
}



function drawWinLine(pattern) {
    const positions = [
        { x: 16.5, y: 16.5 }, { x: 50, y: 16.5 }, { x: 83.5, y: 16.5 },
        { x: 16.5, y: 50 }, { x: 50, y: 50 }, { x: 83.5, y: 50 },
        { x: 16.5, y: 83.5 }, { x: 50, y: 83.5 }, { x: 83.5, y: 83.5 }
    ];

    const start = positions[pattern[0]];
    const end = positions[pattern[2]];

    const line = document.createElement('div');
    line.classList.add('win-line');

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    line.style.width = `${distance}%`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = "0% 50%";
    line.style.left = `${start.x}%`;
    line.style.top = `${start.y}%`;

    board.appendChild(line);
}

function makeMove(index) {
    if (gameBoard[index] === '') {
        gameBoard[index] = currentPlayer;
        document.getElementById(`cell-${index}`).innerText = currentPlayer;
        document.getElementById('click-sound').play();

        if (!checkWinner()) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateTurnMessage();

            if (gameMode === 'ai' && currentPlayer === 'O') {
                setTimeout(aiMove, 500);
            }
        }
    }
}
function updateTurnMessage() {
    const currentPlayerName = currentPlayer === 'X' ? player1Name : player2Name;
    message.innerText = `${currentPlayerName}'s turn`;
}
function getRandomMove() {
    const emptyCells = gameBoard.map((val, index) => val === '' ? index : null).filter(v => v !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
// Improved AI using Minimax algorithm
function aiMove() {
    let move;
    if (aiDifficulty === 'easy') {
        move = getRandomMove();
    } else if (aiDifficulty === 'medium') {
        // 50% chance of using Minimax, 50% random move
        move = Math.random() > 0.5 ? minimax(gameBoard, 'O').index : getRandomMove();
    } else {
        move = minimax(gameBoard, 'O').index;  // Hard mode always makes the best move
    }
    makeMove(move);
}

function minimax(board, player) {
    const emptyCells = board.map((val, index) => val === '' ? index : null).filter(v => v !== null);

    if (checkWinCondition(board, 'X')) {
        return { score: -10 };
    } else if (checkWinCondition(board, 'O')) {
        return { score: 10 };
    } else if (emptyCells.length === 0) {
        return { score: 0 };
    }

    let moves = [];

    for (let i = 0; i < emptyCells.length; i++) {
        let move = {};
        move.index = emptyCells[i];
        board[emptyCells[i]] = player;

        if (player === 'O') {
            let result = minimax(board, 'X');
            move.score = result.score;
        } else {
            let result = minimax(board, 'O');
            move.score = result.score;
        }

        board[emptyCells[i]] = ''; // Undo move
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWinCondition(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    return winPatterns.some(pattern =>
        board[pattern[0]] === player &&
        board[pattern[1]] === player &&
        board[pattern[2]] === player
    );
}

function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    updateTurnMessage();
    board.innerHTML = '';
    renderBoard();
}

function resetScore() {
    scoreX = 0;
    scoreO = 0;
    localStorage.setItem('scoreX', scoreX);
    localStorage.setItem('scoreO', scoreO);
    document.getElementById('scoreX').innerText = scoreX;
    document.getElementById('scoreO').innerText = scoreO;
    restartGame();
}

function updateScore(winner) {
    if (winner === 'X') scoreX++;
    if (winner === 'O') scoreO++;
    
    localStorage.setItem('scoreX', scoreX);
    localStorage.setItem('scoreO', scoreO);

    document.getElementById('scoreX').innerText = scoreX;
    document.getElementById('scoreO').innerText = scoreO;
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function celebrateWin() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    document.getElementById('win-sound').play();
}

function renderBoard() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = `cell-${i}`;
        cell.addEventListener('click', () => makeMove(i));
        board.appendChild(cell);
    }
}

function startGame(mode) {
    gameMode = mode;
    resetScore();

    if (mode === 'friend') {
        openPlayerNamesModal(false);
    } else if (mode === 'ai') {
        openPlayerNamesModal(true);
        document.getElementById('playerNamesForm').addEventListener('submit', (event) => {
            event.preventDefault();
            closePlayerNamesModal();
            openAIDifficultyModal();
        });
    }
}
function openPlayerNamesModal(aiMode) {
    const modal = document.getElementById('playerNamesModal');
    const modalTitle = document.getElementById('modal-title');
    const player2Input = document.getElementById('player2Input');

    if (aiMode) {
        modalTitle.innerText = "Enter Your Name";
        player2Input.style.display = 'none';  // Hide player 2 input field
        document.getElementById('player2').value = 'AI'; // Default AI name
        isAI = true;
    } else {
        modalTitle.innerText = "Enter Player Names";
        player2Input.style.display = 'block';  // Show player 2 input field
        isAI = false;
    }

    modal.style.display = 'flex';
}

function closePlayerNamesModal() {
    const modal = document.getElementById('playerNamesModal');
    modal.style.display = 'none';
}

document.getElementById('playerNamesForm').addEventListener('submit', (event) => {
    event.preventDefault();

    player1Name = document.getElementById('player1').value || "Player X";
    player2Name = isAI ? "AI" : (document.getElementById('player2').value || "Player O");

    document.getElementById('player1Name').innerText = player1Name;
    document.getElementById('player2Name').innerText = player2Name;

    closePlayerNamesModal();
    restartGame();
});

restartGame();
