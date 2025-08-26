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
const aiDifficultyEl = document.getElementById('ai-difficulty');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const soundBtn = document.getElementById('sound-btn');

// Check if all elements are found
console.log('DOM Elements:', {
    boardEl: !!boardEl,
    messageEl: !!messageEl,
    scoreXEl: !!scoreXEl,
    scoreOEl: !!scoreOEl,
    scoreTieEl: !!scoreTieEl,
    pvpBtn: !!pvpBtn,
    aiBtn: !!aiBtn,
    resetBtn: !!resetBtn,
    newGameBtn: !!newGameBtn,
    aiDifficultyEl: !!aiDifficultyEl,
    easyBtn: !!easyBtn,
    mediumBtn: !!mediumBtn,
    hardBtn: !!hardBtn,
    soundBtn: !!soundBtn
});

let board, currentPlayer, gameActive, mode, scores, aiDifficulty;

// Sound Effects System
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio not supported');
            this.enabled = false;
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log('Audio error:', error);
            this.enabled = false;
        }
    }

    // Game-specific sound effects
    playMoveSound(player) {
        if (player === 'X') {
            // Higher pitch for X
            this.playTone(800, 0.15, 'square', 0.2);
        } else {
            // Lower pitch for O
            this.playTone(400, 0.15, 'sine', 0.2);
        }
    }

    playWinSound() {
        // Victory fanfare
        setTimeout(() => this.playTone(523, 0.2, 'sine', 0.3), 0);
        setTimeout(() => this.playTone(659, 0.2, 'sine', 0.3), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200);
        setTimeout(() => this.playTone(1047, 0.4, 'sine', 0.3), 300);
    }

    playTieSound() {
        // Neutral ending sound
        this.playTone(300, 0.3, 'triangle', 0.2);
        setTimeout(() => this.playTone(250, 0.3, 'triangle', 0.2), 150);
    }

    playButtonSound() {
        // UI button click
        this.playTone(600, 0.1, 'square', 0.15);
    }

    playResetSound() {
        // Reset/New game sound
        this.playTone(440, 0.1, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(330, 0.1, 'sawtooth', 0.2), 50);
    }

    playModeChangeSound() {
        // Mode switch sound
        this.playTone(880, 0.08, 'sine', 0.2);
        setTimeout(() => this.playTone(1100, 0.08, 'sine', 0.2), 80);
    }

    playAIMoveSound() {
        // AI move - distinctive robotic sound
        this.playTone(350, 0.1, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(420, 0.1, 'sawtooth', 0.2), 50);
    }

    playHoverSound() {
        // Subtle hover sound
        this.playTone(1200, 0.05, 'sine', 0.1);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Initialize sound system
const soundFX = new SoundEffects();

function initGame() {
    console.log('Initializing game...');
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    createBoard();
    setMessage(`Player ${currentPlayer}'s turn`);
    console.log('Game initialized:', { board, currentPlayer, gameActive });
}

function createBoard() {
    if (!boardEl) {
        console.error('Board element not found!');
        return;
    }
    
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        cellEl.dataset.idx = i;
        cellEl.addEventListener('click', onCellClick);
        
        // Add hover sound effect
        cellEl.addEventListener('mouseenter', () => {
            if (!board[i] && gameActive) {
                soundFX.playHoverSound();
            }
        });
        
        boardEl.appendChild(cellEl);
    }
    
    console.log('Board created with', boardEl.children.length, 'cells');
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
    console.log('Cell clicked:', e.target.dataset.idx);
    const idx = +e.target.dataset.idx;
    
    console.log('Game state:', {
        gameActive: gameActive,
        boardCell: board[idx],
        currentPlayer: currentPlayer
    });
    
    if (!gameActive || board[idx]) {
        console.log('Click ignored - game not active or cell occupied');
        return;
    }
    
    // Play move sound (with error handling)
    try {
        soundFX.playMoveSound(currentPlayer);
    } catch (error) {
        console.log('Sound error:', error);
    }
    
    board[idx] = currentPlayer;
    updateCell(idx, currentPlayer);
    const winInfo = checkWinner();
    if (winInfo) {
        winInfo.combo.forEach(i => boardEl.children[i].classList.add('winner'));
        setMessage(`Player ${currentPlayer} wins!`);
        try { soundFX.playWinSound(); } catch (e) {}
        scores[currentPlayer]++;
        updateScores();
        gameActive = false;
    } else if (board.every(cell => cell)) {
        setMessage("It's a tie!");
        try { soundFX.playTieSound(); } catch (e) {}
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
    soundFX.playResetSound();
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
    soundFX.playResetSound();
    scores = {X: 0, O: 0, tie: 0};
    updateScores();
    // Reset board without calling newGame again
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    createBoard();
    setMessage(`Player ${currentPlayer}'s turn`);
    if (mode === 'ai' && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
    }
}

function setMode(newMode) {
    soundFX.playModeChangeSound();
    mode = newMode;
    pvpBtn.classList.toggle('active', mode === 'pvp');
    aiBtn.classList.toggle('active', mode === 'ai');
    
    // Show/hide difficulty selector based on mode
    aiDifficultyEl.style.display = mode === 'ai' ? 'flex' : 'none';
    
    // Only reset game if it's already initialized
    if (scores) {
        newGame();
    }
}

function setDifficulty(difficulty) {
    soundFX.playButtonSound();
    aiDifficulty = difficulty;
    easyBtn.classList.toggle('active', difficulty === 'easy');
    mediumBtn.classList.toggle('active', difficulty === 'medium');
    hardBtn.classList.toggle('active', difficulty === 'hard');
}

function toggleSound() {
    const isEnabled = soundFX.toggle();
    soundBtn.textContent = isEnabled ? '🔊' : '🔇';
    soundBtn.title = isEnabled ? 'Mute sounds' : 'Enable sounds';
    
    if (isEnabled) {
        soundFX.playButtonSound();
    }
}

function aiMove() {
    let move;
    
    switch (aiDifficulty) {
        case 'easy':
            move = easyAI();
            break;
        case 'medium':
            move = mediumAI();
            break;
        case 'hard':
            move = hardAI();
            break;
        default:
            move = mediumAI();
    }
    
    if (move !== null) {
        // Play AI move sound
        soundFX.playAIMoveSound();
        
        board[move] = 'O';
        updateCell(move, 'O');
        const winInfo = checkWinner();
        if (winInfo) {
            winInfo.combo.forEach(i => boardEl.children[i].classList.add('winner'));
            setMessage('AI wins!');
            soundFX.playWinSound();
            scores['O']++;
            updateScores();
            gameActive = false;
        } else if (board.every(cell => cell)) {
            setMessage("It's a tie!");
            soundFX.playTieSound();
            scores.tie++;
            updateScores();
            gameActive = false;
        } else {
            currentPlayer = 'X';
            setMessage(`Player ${currentPlayer}'s turn`);
        }
    }
}

// Easy AI: 70% random moves, 30% strategic
function easyAI() {
    if (Math.random() < 0.7) {
        return randomMove();
    }
    return findBestMove('O') || findBestMove('X') || randomMove();
}

// Medium AI: Win, block, center, corner, random
function mediumAI() {
    // Try to win
    let move = findBestMove('O');
    if (move !== null) return move;
    
    // Try to block player from winning
    move = findBestMove('X');
    if (move !== null) return move;
    
    // Take center if available
    if (board[4] === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Random move
    return randomMove();
}

// Hard AI: Minimax algorithm (unbeatable)
function hardAI() {
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm for hard AI
function minimax(board, depth, isMaximizing) {
    const winner = checkWinner();
    
    if (winner) {
        if (winner.player === 'O') return 10 - depth;
        if (winner.player === 'X') return depth - 10;
    }
    
    if (board.every(cell => cell)) return 0;
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let eval = minimax(board, depth + 1, false);
                board[i] = '';
                maxEval = Math.max(maxEval, eval);
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let eval = minimax(board, depth + 1, true);
                board[i] = '';
                minEval = Math.min(minEval, eval);
            }
        }
        return minEval;
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
easyBtn.addEventListener('click', () => setDifficulty('easy'));
mediumBtn.addEventListener('click', () => setDifficulty('medium'));
hardBtn.addEventListener('click', () => setDifficulty('hard'));
soundBtn.addEventListener('click', toggleSound);

// Add hover sounds to buttons
[pvpBtn, aiBtn, resetBtn, newGameBtn, easyBtn, mediumBtn, hardBtn, soundBtn].forEach(btn => {
    btn.addEventListener('mouseenter', () => soundFX.playHoverSound());
});

// Initialize audio context on first user interaction
document.addEventListener('click', () => {
    if (soundFX.audioContext && soundFX.audioContext.state === 'suspended') {
        soundFX.audioContext.resume();
    }
}, { once: true });

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    scores = {X: 0, O: 0, tie: 0};
    mode = 'pvp';
    aiDifficulty = 'medium';

    // Set initial UI state
    pvpBtn.classList.add('active');
    aiBtn.classList.remove('active');
    aiDifficultyEl.style.display = 'none';
    mediumBtn.classList.add('active');
    easyBtn.classList.remove('active');
    hardBtn.classList.remove('active');

    // Initialize game
    initGame();
    updateScores();
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM is still loading
} else {
    // DOM is already loaded
    scores = {X: 0, O: 0, tie: 0};
    mode = 'pvp';
    aiDifficulty = 'medium';

    // Set initial UI state
    if (pvpBtn) {
        pvpBtn.classList.add('active');
        aiBtn.classList.remove('active');
        aiDifficultyEl.style.display = 'none';
        mediumBtn.classList.add('active');
        easyBtn.classList.remove('active');
        hardBtn.classList.remove('active');
    }

    // Initialize game
    initGame();
    updateScores();
}