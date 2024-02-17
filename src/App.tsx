import { useState } from "react";

type Value = "X" | "O" | null;

function Square({
  value,
  winning,
  onSquareClick,
}: {
  value: Value;
  winning: boolean;
  onSquareClick: () => void;
}) {
  return (
    <button className="square" data-winning={winning} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
}: {
  xIsNext: boolean;
  squares: Value[];
  onPlay: (nextSquares: Value[]) => void;
}) {
  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)[0]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const [winner, winningSquares] = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {Array(3)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="board-row">
            {Array(3)
              .fill(null)
              .map((_, j) => (
                <Square
                  key={j}
                  value={squares[3 * i + j] ?? null}
                  onSquareClick={() => handleClick(3 * i + j)}
                  winning={winningSquares?.includes(3 * i + j) ?? false}
                />
              ))}
          </div>
        ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState<Value[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isSortAscending, setIsSortAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove] ?? [];

  function handlePlay(nextSquares: Value[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  function handleSortClick() {
    setIsSortAscending(!isSortAscending);
  }

  const moves = history
    .map((_squares, move) => {
      let description;
      if (move > 0) {
        const [row, col] = getMoveLocation(history, move);
        description = "Go to move #" + move + " (" + row + ", " + col + ")";
      } else {
        description = "Go to game start";
      }

      return (
        <li key={move}>
          {move === currentMove ? (
            <div>You are at move #{move}</div>
          ) : (
            <button onClick={() => jumpTo(move)}>{description}</button>
          )}
        </li>
      );
    })
    .sort((a, b) => {
      if (a.key == null || b.key == null) {
        return 0;
      }
      const aKey = parseInt(a.key);
      const bKey = parseInt(b.key);
      return isSortAscending ? aKey - bKey : bKey - aKey;
    });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={handleSortClick}>
          {isSortAscending ? "Sort descending" : "Sort ascending"}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function getMoveLocation(
  history: Value[][],
  move: number
): [number, number] | [null, null] {
  if (move === 0) {
    return [null, null];
  }
  const current = history[move];
  const prev = history[move - 1];
  if (!current || !prev) {
    return [null, null];
  }
  for (let i = 0; i < 9; i++) {
    if (current[i] !== prev[i]) {
      return [Math.floor(i / 3) + 1, (i % 3) + 1];
    }
  }
  return [null, null];
}

function calculateWinner(squares: Value[]): [Value, number[]] | [null, null] {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i] ?? [];
    if (a == null || b == null || c == null) {
      return [null, null];
    }
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a] ?? null, lines[i] ?? []];
    }
  }
  return [null, null];
}
