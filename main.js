const board = document.getElementById('board');
const difficultySelect = document.getElementById('difficulty');
const playerColorSelect = document.getElementById('playerColor');
const startButton = document.getElementById('startButton');
const undoButton = document.getElementById('undoButton');
const statusMessage = document.getElementById('statusMessage');
const capturedByPlayer = document.getElementById('capturedByPlayer');
const capturedByAI = document.getElementById('capturedByAI');
const initialBoardState = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];
let boardState = initialBoardState.map(row => [...row]);

const pieceImages = {
    'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
    'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    'R': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    'N': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    'B': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    'Q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    'K': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    'P': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
};

let turn = 'white';
let selectedPiece = null;
let validMoves = [];
let history = [];
let currentMoveIndex = -1;
let difficulty = 'easy'; // Default difficulty
let gameStarted = false;
let playerColor = 'white';
let aiColor = 'black';
let recentAIMoves = [];

// Piece values for board evaluation
const pieceValues = {
    'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900,
    'P': 10, 'N': 30, 'B': 30, 'R': 50, 'Q': 90, 'K': 900
};

const displayOrder = ['q', 'r', 'b', 'n', 'p'];

const pieceSquareTables = {
    p: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 5, 5, 5, 5, 5, 5, 5],
        [1, 1, 2, 3, 3, 2, 1, 1],
        [0, 0, 1, 3, 3, 1, 0, 0],
        [0, 0, 0, 2, 2, 0, 0, 0],
        [1, -1, -2, 0, 0, -2, -1, 1],
        [1, 2, 2, -2, -2, 2, 2, 1],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    n: [
        [-5, -4, -3, -3, -3, -3, -4, -5],
        [-4, -2, 0, 0, 0, 0, -2, -4],
        [-3, 0, 1, 2, 2, 1, 0, -3],
        [-3, 1, 2, 3, 3, 2, 1, -3],
        [-3, 0, 2, 3, 3, 2, 0, -3],
        [-3, 1, 1, 2, 2, 1, 1, -3],
        [-4, -2, 0, 1, 1, 0, -2, -4],
        [-5, -4, -3, -3, -3, -3, -4, -5]
    ],
    b: [
        [-2, -1, -1, -1, -1, -1, -1, -2],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 1, 1, 1, 1, 0, -1],
        [-1, 1, 1, 2, 2, 1, 1, -1],
        [-1, 0, 2, 2, 2, 2, 0, -1],
        [-1, 2, 2, 2, 2, 2, 2, -1],
        [-1, 1, 0, 0, 0, 0, 1, -1],
        [-2, -1, -1, -1, -1, -1, -1, -2]
    ],
    r: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [1, 2, 2, 2, 2, 2, 2, 1],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    q: [
        [-2, -1, -1, 0, 0, -1, -1, -2],
        [-1, 0, 0, 0, 0, 0, 0, -1],
        [-1, 0, 1, 1, 1, 1, 0, -1],
        [0, 0, 1, 1, 1, 1, 0, -1],
        [-1, 0, 1, 1, 1, 1, 0, -1],
        [-1, 1, 1, 1, 1, 1, 0, -1],
        [-1, 0, 1, 0, 0, 0, 0, -1],
        [-2, -1, -1, 0, 0, -1, -1, -2]
    ],
    k: [
        [2, 3, 1, 0, 0, 1, 3, 2],
        [2, 2, 0, 0, 0, 0, 2, 2],
        [-1, -2, -2, -2, -2, -2, -2, -1],
        [-2, -3, -3, -4, -4, -3, -3, -2],
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-3, -4, -4, -5, -5, -4, -4, -3],
        [-3, -4, -4, -5, -5, -4, -4, -3]
    ]
};

difficultySelect.addEventListener('change', (event) => {
    difficulty = event.target.value;
    console.log('Difficulty set to:', difficulty);
});

function updateGameStatus(message) {
    statusMessage.textContent = message;
}

function getColorLabel(color) {
    return color === 'white' ? 'White' : 'Black';
}

function updateBoardInteractivity() {
    board.classList.toggle('waiting', !gameStarted || turn !== playerColor);
}

function syncSetupControls() {
    const setupLocked = gameStarted;
    difficultySelect.disabled = setupLocked;
    playerColorSelect.disabled = setupLocked;
    startButton.disabled = setupLocked;
}

function resetGameState() {
    boardState = initialBoardState.map(row => [...row]);
    turn = 'white';
    selectedPiece = null;
    validMoves = [];
    history = [];
    currentMoveIndex = -1;
    recentAIMoves = [];
    pushToHistory();
}

function pushToHistory() {
    // If a new move is made after undoing, remove future history
    if (currentMoveIndex < history.length - 1) {
        history = history.slice(0, currentMoveIndex + 1);
    }
    history.push(JSON.parse(JSON.stringify(boardState)));
    currentMoveIndex = history.length - 1;
}

function undoMove() {
    if (currentMoveIndex > 0) {
        currentMoveIndex--;
        boardState = JSON.parse(JSON.stringify(history[currentMoveIndex])); // Assign directly
        turn = turn === 'white' ? 'black' : 'white'; // Toggle turn back
        selectedPiece = null;
        validMoves = [];
        renderBoard();
    } else {
        alert('Cannot undo further.');
    }
}

// Event listener for the undo button
undoButton.addEventListener('click', () => {
    if (!gameStarted) {
        alert('Start the game first.');
        return;
    }
    undoMove();
    updateGameStatus(turn === playerColor ? 'Your turn.' : `${getColorLabel(aiColor)} is thinking...`);
    updateBoardInteractivity();
});

startButton.addEventListener('click', () => {
    difficulty = difficultySelect.value;
    playerColor = playerColorSelect.value;
    aiColor = playerColor === 'white' ? 'black' : 'white';
    resetGameState();
    gameStarted = true;
    syncSetupControls();
    renderBoard();
    if (turn === playerColor) {
        updateGameStatus('Your turn.');
    } else {
        updateGameStatus(`${getColorLabel(aiColor)} is thinking...`);
        setTimeout(makeAIMove, 500);
    }
    updateBoardInteractivity();
});

function cloneBoard(board) {
    return board.map(row => [...row]);
}

function isWhitePiece(piece) {
    return piece !== '' && piece === piece.toUpperCase();
}

function isBlackPiece(piece) {
    return piece !== '' && piece === piece.toLowerCase();
}

function isOpponentPiece(piece, targetPiece) {
    return targetPiece !== '' && (isWhitePiece(piece) ? isBlackPiece(targetPiece) : isWhitePiece(targetPiece));
}

function evaluateBoard(board) {
    let score = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const pieceType = piece.toLowerCase();
                const materialValue = pieceValues[pieceType];
                const table = pieceSquareTables[pieceType];
                const positionalValue = isWhitePiece(piece) ? table[7 - i][j] : table[i][j];

                if (isBlackPiece(piece)) {
                    score += materialValue + positionalValue;
                } else {
                    score -= materialValue + positionalValue;
                }
            }
        }
    }

    const blackMobility = getPseudoMobility('black', board);
    const whiteMobility = getPseudoMobility('white', board);
    score += (blackMobility - whiteMobility) * 0.15;

    if (isKingInCheck('white', board)) {
        score += 8;
    }
    if (isKingInCheck('black', board)) {
        score -= 8;
    }

    return score;
}

function getPseudoMobility(color, board = boardState) {
    let mobility = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            const isActiveColorPiece = color === 'white' ? isWhitePiece(piece) : isBlackPiece(piece);
            if (!isActiveColorPiece) {
                continue;
            }
            mobility += getValidMoves(piece, i, j, board).length;
        }
    }
    return mobility;
}

function getPawnMoves(piece, row, col, board = boardState) {
    const moves = [];
    const direction = piece === 'P' ? -1 : 1;
    const startRow = piece === 'P' ? 6 : 1;
    const nextRow = row + direction;

    if (nextRow >= 0 && nextRow < 8 && board[nextRow][col] === '') {
        moves.push([nextRow, col]);
    }

    if (
        row === startRow &&
        nextRow >= 0 &&
        nextRow < 8 &&
        row + 2 * direction >= 0 &&
        row + 2 * direction < 8 &&
        board[nextRow][col] === '' &&
        board[row + 2 * direction][col] === ''
    ) {
        moves.push([row + 2 * direction, col]);
    }

    if (nextRow >= 0 && nextRow < 8 && col > 0 && isOpponentPiece(piece, board[nextRow][col - 1])) {
        moves.push([nextRow, col - 1]);
    }
    if (nextRow >= 0 && nextRow < 8 && col < 7 && isOpponentPiece(piece, board[nextRow][col + 1])) {
        moves.push([nextRow, col + 1]);
    }
    return moves;
}

function getKnightMoves(piece, row, col, board = boardState) {
    const moves = [];
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const move of knightMoves) {
        const newRow = row + move[0];
        const newCol = col + move[1];

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (targetPiece === '' || isOpponentPiece(piece, targetPiece)) {
                moves.push([newRow, newCol]);
            }
        }
    }
    return moves;
}

function getSlidingMoves(piece, row, col, directions, board = boardState) {
    const moves = [];
    for (const direction of directions) {
        let newRow = row + direction[0];
        let newCol = col + direction[1];
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (targetPiece === '') {
                moves.push([newRow, newCol]);
            } else {
                if (isOpponentPiece(piece, targetPiece)) {
                    moves.push([newRow, newCol]);
                }
                break;
            }
            newRow += direction[0];
            newCol += direction[1];
        }
    }
    return moves;
}

function getRookMoves(piece, row, col, board = boardState) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return getSlidingMoves(piece, row, col, directions, board);
}

function getBishopMoves(piece, row, col, board = boardState) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return getSlidingMoves(piece, row, col, directions, board);
}

function getQueenMoves(piece, row, col, board = boardState) {
    return getRookMoves(piece, row, col, board).concat(getBishopMoves(piece, row, col, board));
}

function getKingMoves(piece, row, col, board = boardState) {
    const moves = [];
    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const move of kingMoves) {
        const newRow = row + move[0];
        const newCol = col + move[1];

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (targetPiece === '' || isOpponentPiece(piece, targetPiece)) {
                moves.push([newRow, newCol]);
            }
        }
    }
    return moves;
}

function getValidMoves(piece, row, col, board = boardState) {
    const pieceType = piece.toLowerCase();
    switch (pieceType) {
        case 'p':
            return getPawnMoves(piece, row, col, board);
        case 'n':
            return getKnightMoves(piece, row, col, board);
        case 'r':
            return getRookMoves(piece, row, col, board);
        case 'b':
            return getBishopMoves(piece, row, col, board);
        case 'q':
            return getQueenMoves(piece, row, col, board);
        case 'k':
            return getKingMoves(piece, row, col, board);
        default:
            return [];
    }
}

function countPieces(board) {
    const counts = {};
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (!piece) {
                continue;
            }
            counts[piece] = (counts[piece] || 0) + 1;
        }
    }
    return counts;
}

function getCapturedPieces() {
    const initialCounts = countPieces(initialBoardState);
    const currentCounts = countPieces(boardState);
    const captured = {
        byPlayer: [],
        byAI: []
    };

    for (const pieceType of displayOrder) {
        const blackPiece = pieceType;
        const whitePiece = pieceType.toUpperCase();
        const missingBlack = (initialCounts[blackPiece] || 0) - (currentCounts[blackPiece] || 0);
        const missingWhite = (initialCounts[whitePiece] || 0) - (currentCounts[whitePiece] || 0);

        for (let i = 0; i < missingBlack; i++) {
            captured.byPlayer.push(blackPiece);
        }
        for (let i = 0; i < missingWhite; i++) {
            captured.byAI.push(whitePiece);
        }
    }

    return captured;
}

function renderCapturedPieces() {
    const captured = getCapturedPieces();
    const renderList = (container, pieces) => {
        container.innerHTML = '';
        for (const piece of pieces) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('captured-piece');
            const image = document.createElement('img');
            image.src = pieceImages[piece];
            image.alt = piece;
            wrapper.appendChild(image);
            container.appendChild(wrapper);
        }
    };

    renderList(capturedByPlayer, captured.byPlayer);
    renderList(capturedByAI, captured.byAI);
}

function renderBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
            
            if (selectedPiece && selectedPiece.row === i && selectedPiece.col === j) {
                square.classList.add('selected');
            }

            if (validMoves.some(move => move[0] === i && move[1] === j)) {
                square.classList.add('valid-move');
            }

            const piece = boardState[i][j];
            if (piece) {
                const pieceImage = document.createElement('img');
                pieceImage.src = pieceImages[piece];
                square.appendChild(pieceImage);
            }
            board.appendChild(square);
        }
    }
    renderCapturedPieces();
}

function findKing(color, board = boardState) {
    const king = color === 'white' ? 'K' : 'k';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === king) {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

function isKingInCheck(color, board = boardState) {
    const kingPosition = findKing(color, board);
    if (!kingPosition) return false;

    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece && (opponentColor === 'white' ? isWhitePiece(piece) : isBlackPiece(piece))) {
                const moves = getValidMoves(piece, i, j, board);
                if (moves.some(move => move[0] === kingPosition.row && move[1] === kingPosition.col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function applyMove(board, move) {
    const nextBoard = cloneBoard(board);
    nextBoard[move.to[0]][move.to[1]] = move.piece;
    nextBoard[move.from[0]][move.from[1]] = '';
    return nextBoard;
}

function getMovePriority(move) {
    const captureScore = move.capturedPiece ? pieceValues[move.capturedPiece.toLowerCase()] : 0;
    const moverScore = pieceValues[move.piece.toLowerCase()];
    const centralityBonus = 4 - Math.abs(3.5 - move.to[0]) - Math.abs(3.5 - move.to[1]);
    return captureScore * 10 - moverScore + centralityBonus;
}

function getMoveSignature(move) {
    return `${move.piece}:${move.from[0]},${move.from[1]}-${move.to[0]},${move.to[1]}`;
}

function getReverseMoveSignature(move) {
    return `${move.piece}:${move.to[0]},${move.to[1]}-${move.from[0]},${move.from[1]}`;
}

function scoreMoveForAI(move, board, searchScore = null) {
    const nextBoard = applyMove(board, move);
    const baseScore = searchScore === null ? evaluateBoard(nextBoard) : searchScore;
    const scorePerspective = aiColor === 'black' ? baseScore : -baseScore;
    const priorityBonus = getMovePriority(move) * 0.05;
    let repetitionPenalty = 0;
    const moveSignature = getMoveSignature(move);
    const reverseSignature = getReverseMoveSignature(move);

    if (recentAIMoves[recentAIMoves.length - 1] === reverseSignature) {
        repetitionPenalty -= 6;
    }
    if (recentAIMoves.includes(moveSignature)) {
        repetitionPenalty -= 2;
    }
    if (isKingInCheck(playerColor, nextBoard)) {
        repetitionPenalty += 4;
    }

    return scorePerspective + priorityBonus + repetitionPenalty;
}

function getLegalMovesForColor(color, board = boardState) {
    const moves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            const isActiveColorPiece = color === 'white' ? isWhitePiece(piece) : isBlackPiece(piece);
            if (!isActiveColorPiece) {
                continue;
            }

            const pseudoLegalMoves = getValidMoves(piece, i, j, board);
            for (const to of pseudoLegalMoves) {
                const capturedPiece = board[to[0]][to[1]];
                const move = { piece, from: [i, j], to, capturedPiece };
                const nextBoard = applyMove(board, move);
                if (!isKingInCheck(color, nextBoard)) {
                    moves.push(move);
                }
            }
        }
    }

    moves.sort((a, b) => getMovePriority(b) - getMovePriority(a));
    return moves;
}

function minimax(board, depth, alpha, beta, colorToMove) {
    if (depth === 0) {
        return evaluateBoard(board);
    }

    const legalMoves = getLegalMovesForColor(colorToMove, board);
    if (legalMoves.length === 0) {
        if (!isKingInCheck(colorToMove, board)) {
            return 0;
        }
        return colorToMove === 'black' ? -100000 : 100000;
    }

    if (colorToMove === 'black') {
        let bestScore = -Infinity;
        for (const move of legalMoves) {
            const score = minimax(applyMove(board, move), depth - 1, alpha, beta, 'white');
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) {
                break;
            }
        }
        return bestScore;
    }

    let bestScore = Infinity;
    for (const move of legalMoves) {
        const score = minimax(applyMove(board, move), depth - 1, alpha, beta, 'black');
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) {
            break;
        }
    }
    return bestScore;
}

board.addEventListener('click', (e) => {
    if (!gameStarted || turn !== playerColor) return;
    const square = e.target.closest('.square');
    if (!square) return;
    const allSquares = Array.from(board.children);
    const index = allSquares.indexOf(square);
    const row = Math.floor(index / 8);
    const col = index % 8;

    if (selectedPiece) {
        const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
        if (isValidMove) {
            const originalBoardState = JSON.parse(JSON.stringify(boardState));
            boardState[row][col] = selectedPiece.piece;
            boardState[selectedPiece.row][selectedPiece.col] = '';

            if (isKingInCheck(playerColor)) {
                alert("You are in check!");
                boardState = originalBoardState;
                selectedPiece = null;
                validMoves = [];
                renderBoard();
                return;
            }

            selectedPiece = null;
            validMoves = [];
            turn = aiColor;
            pushToHistory(); // Push to history after a valid move
            updateGameStatus(`${getColorLabel(aiColor)} is thinking...`);
            updateBoardInteractivity();
            renderBoard();

            if (isKingInCheck(aiColor)) {
                alert(`${getColorLabel(aiColor)} is in check!`);
            }

            setTimeout(makeAIMove, 500);
        } else {
            selectedPiece = null;
            validMoves = [];
            renderBoard();
        }
    } else {
        const piece = boardState[row][col];
        if (piece && (turn === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase())) {
            selectedPiece = { piece, row, col };
            validMoves = getValidMoves(piece, row, col);
            renderBoard();
        }
    }
});

function makeAIMove() {
    if (!gameStarted) {
        return;
    }

    const allMoves = getLegalMovesForColor(aiColor, boardState);

    if (allMoves.length === 0) {
        if (isKingInCheck(aiColor)) {
            alert('Checkmate! You win!');
            updateGameStatus(`Checkmate. ${getColorLabel(playerColor)} wins.`);
        } else {
            alert('Stalemate!');
            updateGameStatus('Stalemate.');
        }
        gameStarted = false;
        syncSetupControls();
        updateBoardInteractivity();
        return;
    }

    let bestMove = null;
    if (difficulty === 'easy') {
        bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else if (difficulty === 'medium') {
        let bestScore = -Infinity;
        for (const move of allMoves) {
            const currentScore = scoreMoveForAI(move, boardState);
            const tieBreaker = getMovePriority(move);
            if (currentScore > bestScore || (currentScore === bestScore && bestMove && tieBreaker > getMovePriority(bestMove))) {
                bestScore = currentScore;
                bestMove = move;
            }
        }
    } else if (difficulty === 'hard') {
        let bestScore = -Infinity;
        for (const move of allMoves) {
            const nextBoard = applyMove(boardState, move);
            const searchScore = minimax(nextBoard, 3, -Infinity, Infinity, playerColor);
            const currentScore = scoreMoveForAI(move, boardState, searchScore);
            const tieBreaker = getMovePriority(move);
            if (currentScore > bestScore || (currentScore === bestScore && bestMove && tieBreaker > getMovePriority(bestMove))) {
                bestScore = currentScore;
                bestMove = move;
            }
        }
    }
    
    if (bestMove) {
        boardState[bestMove.to[0]][bestMove.to[1]] = bestMove.piece;
        boardState[bestMove.from[0]][bestMove.from[1]] = '';
        recentAIMoves.push(getMoveSignature(bestMove));
        if (recentAIMoves.length > 6) {
            recentAIMoves.shift();
        }
    } else {
        // If AI cannot find a safe move even after evaluation
        if (isKingInCheck(aiColor)) {
            alert('Checkmate! You win!');
            updateGameStatus(`Checkmate. ${getColorLabel(playerColor)} wins.`);
        } else {
            alert('Stalemate!');
            updateGameStatus('Stalemate.');
        }
        gameStarted = false;
        syncSetupControls();
        updateBoardInteractivity();
        return;
    }


    turn = playerColor;
    pushToHistory(); // Push to history after AI move
    updateGameStatus('Your turn.');
    updateBoardInteractivity();
    renderBoard();
    if (isKingInCheck(playerColor)) {
        alert("You are in check!");
        updateGameStatus('You are in check.');
    }
}

resetGameState();
syncSetupControls();
updateBoardInteractivity();
renderBoard();
