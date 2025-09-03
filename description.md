
---

## 🎯 Tetris Game Challenge – Improved Specification

### ✅ Core Requirements

#### **1. Game Initialization**

* The game board must be a **20 rows × 10 columns grid** rendered inside `data-testid="game-container"`.
* On game start:

  * Spawn a random Tetromino at the **top-center** of the grid (`data-testid="tetris-grid"`, cells use `data-testid="cell-${r}-${c}"`).
  * Display the **next piece preview** inside `data-testid="next-piece-display"`, with cells labeled `data-testid="next-piece-cell-${r}-${c}"`.
  * Set the score in `data-testid="score-display"` to **0**.

#### **2. Gameplay Mechanics**

* The active Tetromino:

  * Falls down automatically at a fixed time interval.
  * Moves **left** or **right** via arrow keys.
  * Rotates clockwise with the up arrow key, respecting wall-kick rules.
* Pressing **Spacebar** performs a Hard Drop, instantly placing the piece in its lowest valid position.
* A piece locks into place when:

  * It lands on the bottom row, or
  * It rests on top of another block.

#### **3. Scoring & Line Clearing**

* Clearing one or more complete horizontal lines increases the score shown in `data-testid="score-display"`.
* Multiple lines cleared in a single move yield bonus points.
* After clearing, remove the full rows and shift remaining rows downward.

#### **4. Game Over**

* The game ends when a new Tetromino **cannot spawn** without overlapping existing blocks.
* On game over:

  * Show `data-testid="game-over-message"`.
  * Provide a `data-testid="restart-button"` to reset the game.

#### **5. User Interface**

* Must show:

  * The main grid (`data-testid="tetris-grid"`).
  * Current score (`data-testid="score-display"`).
  * The next piece preview (`data-testid="next-piece-display"`).
  * A Game Over message (`data-testid="game-over-message"`).
  * Restart button (`data-testid="restart-button"`).

---

### ⚠️ Edge Cases & Constraints

* **Collision detection** must prevent pieces from moving outside the grid or through other blocks.
* **Rotation logic** must adjust for walls (wall-kick handling).
* **Restart** must fully clear the grid, reset score, and reset the next piece queue.
* **Line clearing** must always shift blocks above downward without leaving gaps.
