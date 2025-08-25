// script.js - Advanced Tic Tac Toe
const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreTieEl = document.getElementById('score-tie');
const pvpBtn = document.getElementById('pvp-btn');
const aiBtn = document.getElementById('ai-btn');
const resetBtn = document.getElementById('reset-btn');
const newGameBtn = document.getElementById('newgame-btn');

let board, currentPlayer, gameActive, mode, scores;

function initGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    createBoard();
    setMessage(`Player ${currentPlayer}'s turn`);
}

function createBoard() {
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.dataset.idx = i;
        cellEl.addEventListener('click', onCellClick);
        boardEl.appendChild(cellEl);
    }
}

function updateCell(idx, player) {
    const cellEl = boardEl.children[idx];
    if (cellEl && player) {
        cellEl.textContent = player;
        if (player === 'X') {
            cellEl.style.color = '#ff3333';
            cellEl.style.textShadow = `
                0 0 10px #ff3333,
                0 0 20px #ff3333,
                0 0 30px #ff3333,
                0 0 40px #ff1111
            `;
        } else if (player === 'O') {
            cellEl.style.color = '#0066ff';
            cellEl.style.textShadow = `
                0 0 10px #0066ff,
                0 0 20px #0066ff,
                0 0 30px #0066ff,
                0 0 40px #0044cc
            `;
        }
        cellEl.style.animation = 'cellAppear 0.3s ease-out';
    }
}

function onCellClick(e) {
    const idx = +e.target.dataset.idx;
    if (!gameActive || board[idx]) return;
    board[idx] = currentPlayer;
    updateCell(idx, currentPlayer);
    const winInfo = checkWinner();
    if (winInfo) {
        winInfo.combo.forEach(i => boardEl.children[i].classList.add('winner'));
        setMessage(`Player ${currentPlayer} wins!`);
        scores[currentPlayer]++;
        updateScores();
        gameActive = false;
    } else if (board.every(cell => cell)) {
        setMessage("It's a tie!");
        scores.tie++;
        updateScores();
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        setMessage(`Player ${currentPlayer}'s turn`);
        if (mode === 'ai' && currentPlayer === 'O') {
            setTimeout(aiMove, 500);
        }
    }
}

function checkWinner() {
    const combos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let combo of combos) {
        const [a,b,c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return {player: board[a], combo};
        }
    }
    return null;
}

function setMessage(msg) {
    messageEl.textContent = msg;
}

function updateScores() {
    scoreXEl.textContent = scores['X'];
    scoreOEl.textContent = scores['O'];
    scoreTieEl.textContent = scores['tie'];
}

function resetBoard() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    createBoard();
    setMessage(`Player ${currentPlayer}'s turn`);
    if (mode === 'ai' && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
    }
}

function newGame() {
    scores = {X: 0, O: 0, tie: 0};
    updateScores();
    resetBoard();
}

function setMode(newMode) {
    mode = newMode;
    pvpBtn.classList.toggle('active', mode === 'pvp');
    aiBtn.classList.toggle('active', mode === 'ai');
    newGame();
}

function aiMove() {
    // Simple AI: win, block, or pick random
    let move = findBestMove('O') || findBestMove('X') || randomMove();
    if (move !== null) {
        board[move] = 'O';
        updateCell(move, 'O');
        const winInfo = checkWinner();
        if (winInfo) {
            winInfo.combo.forEach(i => boardEl.children[i].classList.add('winner'));
            setMessage('AI wins!');
            scores['O']++;
            updateScores();
            gameActive = false;
        } else if (board.every(cell => cell)) {
            setMessage("It's a tie!");
            scores.tie++;
            updateScores();
            gameActive = false;
        } else {
            currentPlayer = 'X';
            setMessage(`Player ${currentPlayer}'s turn`);
        }
    }
}

function findBestMove(player) {
    for (let i = 0; i < 9; i++) {
        if (!board[i]) {
            board[i] = player;
            if (checkWinner()) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    return null;
}

function randomMove() {
    const empty = board.map((cell, i) => cell ? null : i).filter(i => i !== null);
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
}

// Event listeners
pvpBtn.addEventListener('click', () => setMode('pvp'));
aiBtn.addEventListener('click', () => setMode('ai'));
resetBtn.addEventListener('click', resetBoard);
newGameBtn.addEventListener('click', newGame);

// Initialize
scores = {X: 0, O: 0, tie: 0};
mode = 'pvp';
initGame();
updateScores();