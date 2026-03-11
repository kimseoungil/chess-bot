const board = document.getElementById('board');
let boardState = [ // Changed to let to allow direct assignment of previous state
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

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

// Piece values for board evaluation
const pieceValues = {
    'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 900,
    'P': 10, 'N': 30, 'B': 30, 'R': 50, 'Q': 90, 'K': 900
};

// Event listener for difficulty change
document.getElementById('difficulty').addEventListener('change', (event) => {
    difficulty = event.target.value;
    console.log('Difficulty set to:', difficulty);
});

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

// Initial push to history
pushToHistory();

// Event listener for the undo button
document.getElementById('undoButton').addEventListener('click', undoMove);

function evaluateBoard(board) {
    let score = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                if (piece === piece.toUpperCase()) { // White piece
                    score += pieceValues[piece];
                } else { // Black piece
                    score -= pieceValues[piece.toUpperCase()];
                }
            }
        }
    }
    return score;
}

function getPawnMoves(piece, row, col) {
    const moves = [];
    const direction = piece === 'P' ? -1 : 1;
    const startRow = piece === 'P' ? 6 : 1;

    // one step forward
    if (boardState[row + direction][col] === '') {
        moves.push([row + direction, col]);
    }

    // two steps forward
    if (row === startRow && boardState[row + direction][col] === '' && boardState[row + 2 * direction][col] === '') {
        moves.push([row + 2 * direction, col]);
    }

    // capture
    const opponentColor = piece === 'P' ? 'black' : 'white';
    if (col > 0 && boardState[row + direction][col - 1] && (opponentColor === 'white' ? boardState[row + direction][col - 1] === boardState[row + direction][col - 1].toUpperCase() : boardState[row + direction][col - 1] === boardState[row + direction][col - 1].toLowerCase())) {
        moves.push([row + direction, col - 1]);
    }
    if (col < 7 && boardState[row + direction][col + 1] && (opponentColor === 'white' ? boardState[row + direction][col + 1] === boardState[row + direction][col + 1].toUpperCase() : boardState[row + direction][col + 1] === boardState[row + direction][col + 1].toLowerCase())) {
        moves.push([row + direction, col + 1]);
    }
    return moves;
}

function getKnightMoves(piece, row, col) {
    const moves = [];
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const move of knightMoves) {
        const newRow = row + move[0];
        const newCol = col + move[1];

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = boardState[newRow][newCol];
            if (targetPiece === '' || (piece.toUpperCase() === piece ? targetPiece.toLowerCase() === targetPiece : targetPiece.toUpperCase() === targetPiece)) {
                moves.push([newRow, newCol]);
            }
        }
    }
    return moves;
}

function getSlidingMoves(piece, row, col, directions) {
    const moves = [];
    for (const direction of directions) {
        let newRow = row + direction[0];
        let newCol = col + direction[1];
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = boardState[newRow][newCol];
            if (targetPiece === '') {
                moves.push([newRow, newCol]);
            } else {
                if (piece.toUpperCase() === piece ? targetPiece.toLowerCase() === targetPiece : targetPiece.toUpperCase() === targetPiece) {
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

function getRookMoves(piece, row, col) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return getSlidingMoves(piece, row, col, directions);
}

function getBishopMoves(piece, row, col) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return getSlidingMoves(piece, row, col, directions);
}

function getQueenMoves(piece, row, col) {
    return getRookMoves(piece, row, col).concat(getBishopMoves(piece, row, col));
}

function getKingMoves(piece, row, col) {
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
            const targetPiece = boardState[newRow][newCol];
            if (targetPiece === '' || (piece.toUpperCase() === piece ? targetPiece.toLowerCase() === targetPiece : targetPiece.toUpperCase() === targetPiece)) {
                moves.push([newRow, newCol]);
            }
        }
    }
    return moves;
}

function getValidMoves(piece, row, col) {
    const pieceType = piece.toLowerCase();
    switch (pieceType) {
        case 'p':
            return getPawnMoves(piece, row, col);
        case 'n':
            return getKnightMoves(piece, row, col);
        case 'r':
            return getRookMoves(piece, row, col);
        case 'b':
            return getBishopMoves(piece, row, col);
        case 'q':
            return getQueenMoves(piece, row, col);
        case 'k':
            return getKingMoves(piece, row, col);
        default:
            return [];
    }
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
}

function findKing(color) {
    const king = color === 'white' ? 'K' : 'k';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (boardState[i][j] === king) {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

function isKingInCheck(color) {
    const kingPosition = findKing(color);
    if (!kingPosition) return false;

    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = boardState[i][j];
            if (piece && (opponentColor === 'white' ? piece === piece.toUpperCase() : piece === piece.toLowerCase())) {
                const moves = getValidMoves(piece, i, j);
                if (moves.some(move => move[0] === kingPosition.row && move[1] === kingPosition.col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

board.addEventListener('click', (e) => {
    if (turn === 'black') return;
    const square = e.target.closest('.square');
    if (!square) return;
    const allSquares = Array.from(board.children);
    const index = allSquares.indexOf(square);
    const row = Math.floor(index / 8);
    const col = index % 8;

    if (selectedPiece) {
        const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
        if (isValidMove) {
            const tempBoardState = JSON.parse(JSON.stringify(boardState));
            tempBoardState[row][col] = selectedPiece.piece;
            tempBoardState[selectedPiece.row][selectedPiece.col] = '';
            
            const originalBoardState = JSON.parse(JSON.stringify(boardState));
            boardState[row][col] = selectedPiece.piece;
            boardState[selectedPiece.row][selectedPiece.col] = '';

            if (isKingInCheck('white')) {
                alert("You are in check!");
                boardState = originalBoardState;
                selectedPiece = null;
                validMoves = [];
                renderBoard();
                return;
            }

            selectedPiece = null;
            validMoves = [];
            turn = 'black';
            pushToHistory(); // Push to history after a valid move
            renderBoard();

            if (isKingInCheck('black')) {
                alert("Black is in check!");
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
    const allMoves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = boardState[i][j];
            if (piece && piece === piece.toLowerCase()) {
                const moves = getValidMoves(piece, i, j);
                if (moves.length > 0) {
                    allMoves.push({ piece, from: [i, j], to: moves });
                }
            }
        }
    }

    if (allMoves.length === 0) {
        if (isKingInCheck('black')) {
            alert('Checkmate! You win!');
        } else {
            alert('Stalemate!');
        }
        return;
    }

    let bestMove = null;
    if (difficulty === 'easy') {
        let selectedMove = null;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop for impossible scenarios
        
        while(allMoves.length > 0 && attempts < maxAttempts) {
            const randomMoveIndex = Math.floor(Math.random() * allMoves.length);
            const randomMove = allMoves[randomMoveIndex];
            const randomToIndex = Math.floor(Math.random() * randomMove.to.length);
            const randomTo = randomMove.to[randomToIndex];

            const originalBoardState = JSON.parse(JSON.stringify(boardState)); // Save current state
            boardState[randomTo[0]][randomTo[1]] = randomMove.piece;
            boardState[randomMove.from[0]][randomMove.from[1]] = '';

            if (!isKingInCheck('black')) {
                selectedMove = {piece: randomMove.piece, from: randomMove.from, to: randomTo};
                // Restore boardState to check next possible move
                for(let i = 0; i < 8; i++) {
                    for(let j = 0; j < 8; j++) {
                        boardState[i][j] = originalBoardState[i][j];
                    }
                }
                break;
            } else {
                // If the move leads to check, remove this specific destination for this piece and try again
                randomMove.to.splice(randomToIndex, 1);
                if (randomMove.to.length === 0) {
                    allMoves.splice(randomMoveIndex, 1);
                }
                // Restore boardState
                for(let i = 0; i < 8; i++) {
                    for(let j = 0; j < 8; j++) {
                        boardState[i][j] = originalBoardState[i][j];
                    }
                }
            }
            attempts++;
        }
        bestMove = selectedMove;

    } else if (difficulty === 'medium' || difficulty === 'hard') { // Medium and Hard will use evaluation for now
        let maxScore = -Infinity;

        for (const move of allMoves) {
            for (const to of move.to) {
                const originalBoardState = JSON.parse(JSON.stringify(boardState));

                // Simulate move
                boardState[to[0]][to[1]] = move.piece;
                boardState[move.from[0]][move.from[1]] = '';

                if (!isKingInCheck('black')) {
                    const currentScore = evaluateBoard(boardState);
                    if (currentScore > maxScore) {
                        maxScore = currentScore;
                        bestMove = { piece: move.piece, from: move.from, to: to };
                    }
                }
                // Restore board state
                for(let i = 0; i < 8; i++) {
                    for(let j = 0; j < 8; j++) {
                        boardState[i][j] = originalBoardState[i][j];
                    }
                }
            }
        }
    }
    
    if (bestMove) {
        boardState[bestMove.to[0]][bestMove.to[1]] = bestMove.piece;
        boardState[bestMove.from[0]][bestMove.from[1]] = '';
    } else {
        // If AI cannot find a safe move even after evaluation
        if (isKingInCheck('black')) {
            alert('Checkmate! You win!');
        } else {
            alert('Stalemate!');
        }
        return;
    }


    turn = 'white';
    pushToHistory(); // Push to history after AI move
    renderBoard();
    if (isKingInCheck('white')) {
        alert("You are in check!");
    }
}

renderBoard();