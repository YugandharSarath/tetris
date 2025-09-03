import React, { useState, useEffect, useRef, useCallback } from "react";

const ROWS = 20;
const COLS = 10;

const SHAPES = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 1
  },
  O: {
    matrix: [
      [2, 2],
      [2, 2]
    ],
    color: 2
  },
  T: {
    matrix: [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: 3
  },
  S: {
    matrix: [
      [0, 4, 4],
      [4, 4, 0],
      [0, 0, 0]
    ],
    color: 4
  },
  Z: {
    matrix: [
      [5, 5, 0],
      [0, 5, 5],
      [0, 0, 0]
    ],
    color: 5
  },
  J: {
    matrix: [
      [6, 0, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: 6
  },
  L: {
    matrix: [
      [0, 0, 7],
      [7, 7, 7],
      [0, 0, 0]
    ],
    color: 7
  }
};

const COLORS = [
  'transparent',  
  '#00FFFF',     
  '#FFFF00',     
  '#800080',     
  '#00FF00',     
  '#FF0000',     
  '#0000FF',     
  '#FFA500'      
];

const SHAPE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const randomShape = () => {
  const shapeName = SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
  return {
    matrix: SHAPES[shapeName].matrix.map(row => [...row]),
    id: shapeName,
    color: SHAPES[shapeName].color
  };
};

const rotate = (matrix) => {
  const n = matrix.length;
  const rotated = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      rotated[c][n - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};

const checkCollision = (grid, matrix, pos) => {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const x = pos.x + c;
      const y = pos.y + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && grid[y][x]) return true;
    }
  }
  return false;
};

const mergePiece = (grid, matrix, pos) => {
  const newGrid = grid.map(row => [...row]);
  matrix.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val && pos.y + r >= 0 && pos.y + r < ROWS && pos.x + c >= 0 && pos.x + c < COLS) {
        newGrid[pos.y + r][pos.x + c] = val;
      }
    });
  });
  return newGrid;
};

const clearLines = (grid) => {
  let cleared = 0;
  const newGrid = grid.filter(row => {
    if (row.every(cell => cell !== 0)) {
      cleared++;
      return false;
    }
    return true;
  });

  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(0));
  }

  return { newGrid, cleared };
};

const calculateScore = (linesCleared, level) => {
  const basePoints = [0, 40, 100, 300, 1200];
  return basePoints[linesCleared] * (level + 1);
};

const createGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

export default function TetrisGame() {
  const [grid, setGrid] = useState(createGrid);
  const [piece, setPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dropTime, setDropTime] = useState(1000);

  const intervalRef = useRef(null);
  const lastDropTime = useRef(Date.now());

  const resetGame = useCallback(() => {
    setGrid(createGrid());
    const first = randomShape();
    const next = randomShape();
    setPiece({ ...first, pos: { x: Math.floor(COLS / 2) - Math.floor(first.matrix[0].length / 2), y: 0 } });
    setNextPiece(next);
    setScore(0);
    setLines(0);
    setLevel(0);
    setGameOver(false);
    setPaused(false);
    setDropTime(1000);
    lastDropTime.current = Date.now();
  }, []);

  const spawnNewPiece = useCallback(() => {
    if (!nextPiece) return;

    const newPiece = {
      ...nextPiece,
      pos: { x: Math.floor(COLS / 2) - Math.floor(nextPiece.matrix[0].length / 2), y: 0 }
    };

    if (checkCollision(grid, newPiece.matrix, newPiece.pos)) {
      setGameOver(true);
      return;
    }

    setPiece(newPiece);
    setNextPiece(randomShape());
  }, [nextPiece, grid]);

  const drop = useCallback(() => {
    if (!piece || gameOver || paused) return;

    const newPos = { x: piece.pos.x, y: piece.pos.y + 1 };

    if (!checkCollision(grid, piece.matrix, newPos)) {
      setPiece({ ...piece, pos: newPos });
    } else {

      const merged = mergePiece(grid, piece.matrix, piece.pos);
      const { newGrid, cleared } = clearLines(merged);

      setGrid(newGrid);

      if (cleared > 0) {
        const points = calculateScore(cleared, level);
        setScore(prev => prev + points);
        setLines(prev => {
          const newLines = prev + cleared;
          const newLevel = Math.floor(newLines / 10);
          if (newLevel > level) {
            setLevel(newLevel);
            setDropTime(Math.max(50, 1000 - newLevel * 50));
          }
          return newLines;
        });
      }

      spawnNewPiece();
    }
  }, [piece, grid, gameOver, paused, level, spawnNewPiece]);

  const move = useCallback((direction) => {
    if (!piece || gameOver || paused) return;

    const newPos = { x: piece.pos.x + direction, y: piece.pos.y };
    if (!checkCollision(grid, piece.matrix, newPos)) {
      setPiece({ ...piece, pos: newPos });
    }
  }, [piece, grid, gameOver, paused]);

  const rotatePiece = useCallback(() => {
    if (!piece || gameOver || paused) return;

    const rotated = rotate(piece.matrix);

    if (!checkCollision(grid, rotated, piece.pos)) {
      setPiece({ ...piece, matrix: rotated });
      return;
    }

    const kicks = [
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: -2, y: 0 }, { x: 2, y: 0 }
    ];

    for (const kick of kicks) {
      const kickPos = { x: piece.pos.x + kick.x, y: piece.pos.y + kick.y };
      if (!checkCollision(grid, rotated, kickPos)) {
        setPiece({ ...piece, matrix: rotated, pos: kickPos });
        return;
      }
    }
  }, [piece, grid, gameOver, paused]);

  const hardDrop = useCallback(() => {
    if (!piece || gameOver || paused) return;

    let newPos = { ...piece.pos };
    let dropDistance = 0;

    while (!checkCollision(grid, piece.matrix, { x: newPos.x, y: newPos.y + 1 })) {
      newPos.y++;
      dropDistance++;
    }

    if (dropDistance > 0) {
      setScore(prev => prev + dropDistance * 2); 
      setPiece({ ...piece, pos: newPos });
      setTimeout(drop, 50); 
    }
  }, [piece, grid, gameOver, paused, drop]);

  const togglePause = useCallback(() => {
    if (!gameOver) {
      setPaused(prev => !prev);
    }
  }, [gameOver]);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;

      e.preventDefault();

      switch (e.key) {
        case 'ArrowLeft':
          move(-1);
          break;
        case 'ArrowRight':
          move(1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case 'ArrowDown':
          drop();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, rotatePiece, drop, hardDrop, togglePause, gameOver]);

  useEffect(() => {
    if (gameOver || paused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastDropTime.current >= dropTime) {
        drop();
        lastDropTime.current = now;
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [drop, dropTime, gameOver, paused]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const renderGrid = () => {
    const gridWithPiece = grid.map(row => [...row]);

    if (piece) {
      piece.matrix.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            const x = piece.pos.x + c;
            const y = piece.pos.y + r;
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
              gridWithPiece[y][x] = val;
            }
          }
        });
      });
    }

    return gridWithPiece;
  };

  const displayGrid = renderGrid();

  return (
    <div className="tetris-game" data-testid="game-container">
      <div className="game-header">
        <h1>TETRIS</h1>
        <div className="controls-info">
          <small>← → ↑ ↓ SPACE P(ause)</small>
        </div>
      </div>

      <div className="tetris-container">
        <div className="game-board">
          <div className="grid" data-testid="tetris-grid">
            {displayGrid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`cell ${cell ? 'filled' : ''}`}
                  style={{
                    backgroundColor: COLORS[cell] || 'transparent',
                    border: cell ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                  data-testid={`cell-${r}-${c}`}
                />
              ))
            )}
          </div>

          {paused && (
            <div className="pause-overlay">
              <div className="pause-message">PAUSED</div>
            </div>
          )}
        </div>

        <div className="sidebar" data-testid="game-sidebar">
          <div className="score-section">
            <h2 data-testid="score-display">Score: {score.toLocaleString()}</h2>
            <p data-testid="lines-display">Lines: {lines}</p>
            <p data-testid="level-display">Level: {level}</p>
          </div>

          <div className="next-piece-section">
            <h3>Next Piece</h3>
            <div className="next-piece" data-testid="next-piece-display">
              {nextPiece && nextPiece.matrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`next-${r}-${c}`}
                    className={`next-cell ${val ? 'filled' : ''}`}
                    style={{
                      backgroundColor: COLORS[val] || 'transparent',
                      border: val ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    data-testid={`next-piece-cell-${r}-${c}`}
                  />
                ))
              )}
            </div>
          </div>

          <div className="controls">
            <button 
              onClick={resetGame} 
              data-testid="restart-button"
              className="control-btn restart-btn"
            >
              {gameOver ? 'New Game' : 'Restart'}
            </button>

            <button 
              onClick={togglePause} 
              data-testid="pause-button"
              className="control-btn pause-btn"
              disabled={gameOver}
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>

          {gameOver && (
            <div className="game-over" data-testid="game-over-message">
              <h3>Game Over!</h3>
              <p>Final Score: {score.toLocaleString()}</p>
              <p>Lines Cleared: {lines}</p>
              <p>Level Reached: {level}</p>
            </div>
          )}

          <div className="instructions">
            <h4>Controls</h4>
            <ul>
              <li><strong>←/→</strong> Move</li>
              <li><strong>↑</strong> Rotate</li>
              <li><strong>↓</strong> Soft Drop</li>
              <li><strong>Space</strong> Hard Drop</li>
              <li><strong>P</strong> Pause</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}