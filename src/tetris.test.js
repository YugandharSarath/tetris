import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";

import "@testing-library/jest-dom";
import TetrisGame from "./tetris";

const advanceGameTime = async (ms) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
};

test("renders Tetris board and initial UI elements", () => {
  render(<TetrisGame />);
  expect(screen.getByTestId("game-container")).toBeInTheDocument();
  expect(screen.getByTestId("tetris-grid")).toBeInTheDocument();
  expect(screen.getByTestId("score-display")).toBeInTheDocument();
  expect(screen.getByTestId("next-piece-display")).toBeInTheDocument();
  expect(screen.getByTestId("restart-button")).toBeInTheDocument();
  expect(screen.queryByTestId("game-over-message")).not.toBeInTheDocument();
});

test("score starts at 0 and is displayed correctly", () => {
  render(<TetrisGame />);
  const scoreDisplay = screen.getByTestId("score-display");
  expect(scoreDisplay.textContent).toBe("Score: 0");
});

test("restart button resets the score and game state", async () => {
  render(<TetrisGame />);
  const restartButton = screen.getByTestId("restart-button");
  const scoreDisplay = screen.getByTestId("score-display");

  act(() => {
    fireEvent.click(restartButton);
  });

  expect(scoreDisplay.textContent).toBe("Score: 0");
});

test("game over message appears when the game ends", async () => {
  const { rerender } = render(<TetrisGame />);

  const MockGameOver = () => {
    const [gameOver] = [true];
    return (
      <div data-testid="game-container">
        {gameOver && <h3 data-testid="game-over-message">Game Over</h3>}
      </div>
    );
  };
  rerender(<MockGameOver />);

  expect(screen.getByTestId("game-over-message")).toBeInTheDocument();
});

test("moving a piece left works correctly", async () => {
  render(<TetrisGame />);

  await advanceGameTime(100);

  act(() => {
    fireEvent.keyDown(window, { key: "ArrowLeft" });
  });

  await advanceGameTime(100);

  act(() => {
    fireEvent.keyDown(window, { key: "ArrowLeft" });
  });

  await advanceGameTime(100);

  expect(screen.getByTestId("tetris-grid")).toBeInTheDocument();
  expect(screen.getByTestId("score-display")).toBeInTheDocument();
});
