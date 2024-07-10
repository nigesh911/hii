import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];

const initialBoard: Board = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  ...Array(4).fill(Array(8).fill(null)),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ],
];

const ChessGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [gameMode, setGameMode] = useState<'multiplayer' | 'computer' | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [availableMoves, setAvailableMoves] = useState<[number, number][]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  useEffect(() => {
    if (selectedSquare) {
      setAvailableMoves(getAvailableMoves(selectedSquare[0], selectedSquare[1]));
    } else {
      setAvailableMoves([]);
    }
  }, [selectedSquare]);

  const getAvailableMoves = (row: number, col: number): [number, number][] => {
    // This is a simplified version. In a real implementation, you'd need to check
    // for check, checkmate, and special moves like castling and en passant.
    const piece = board[row][col];
    if (!piece) return [];

    const moves: [number, number][] = [];
    
    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        if (!board[row + direction]?.[col]) moves.push([row + direction, col]);
        if ((row === 1 && piece.color === 'black') || (row === 6 && piece.color === 'white')) {
          if (!board[row + 2 * direction]?.[col]) moves.push([row + 2 * direction, col]);
        }
        // Add diagonal captures
        if (board[row + direction]?.[col - 1]?.color !== piece.color) moves.push([row + direction, col - 1]);
        if (board[row + direction]?.[col + 1]?.color !== piece.color) moves.push([row + direction, col + 1]);
        break;
      case 'rook':
        for (let i = 1; i < 8; i++) {
          if (isValidMove([row, col], [row + i, col])) moves.push([row + i, col]);
          if (isValidMove([row, col], [row - i, col])) moves.push([row - i, col]);
          if (isValidMove([row, col], [row, col + i])) moves.push([row, col + i]);
          if (isValidMove([row, col], [row, col - i])) moves.push([row, col - i]);
        }
        break;
      // Implement other piece moves here
    }

    return moves.filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8);
  };

  const isValidMove = (from: [number, number], to: [number, number]): boolean => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    
    if (!piece || piece.color !== currentPlayer) return false;
    if (board[toRow][toCol]?.color === currentPlayer) return false;

    return availableMoves.some(([r, c]) => r === toRow && c === toCol);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (selectedSquare) {
      if (isValidMove(selectedSquare, [row, col])) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = newBoard[selectedSquare[0]][selectedSquare[1]];
        newBoard[selectedSquare[0]][selectedSquare[1]] = null;
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setMoveHistory([...moveHistory, `${selectedSquare[0]},${selectedSquare[1]} to ${row},${col}`]);
        if (gameMode === 'computer' && currentPlayer === 'white') {
          setTimeout(makeComputerMove, 500);
        }
      }
      setSelectedSquare(null);
    } else if (board[row][col] && board[row][col]?.color === currentPlayer) {
      setSelectedSquare([row, col]);
    }
  };

  const makeComputerMove = () => {
    // Implement a simple AI here
    // For now, just make a random valid move
    const possibleMoves: [number, number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j]?.color === 'black') {
          const moves = getAvailableMoves(i, j);
          moves.forEach(([r, c]) => possibleMoves.push([i, j, r, c]));
        }
      }
    }
    if (possibleMoves.length > 0) {
      const [fromRow, fromCol, toRow, toCol] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const newBoard = board.map(row => [...row]);
      newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
      newBoard[fromRow][fromCol] = null;
      setBoard(newBoard);
      setCurrentPlayer('white');
      setMoveHistory([...moveHistory, `${fromRow},${fromCol} to ${toRow},${toCol}`]);
    }
  };

  const startMultiplayerGame = () => {
    setGameMode('multiplayer');
    setGameId(Math.random().toString(36).substr(2, 9));
  };

  const joinGame = (id: string) => {
    setGameMode('multiplayer');
    setGameId(id);
    // In a real implementation, you'd connect to the game here
  };

  const startComputerGame = () => {
    setGameMode('computer');
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage('');
    }
  };

  const saveGame = () => {
    const gameState = {
      board,
      currentPlayer,
      moveHistory
    };
    localStorage.setItem('savedChessGame', JSON.stringify(gameState));
  };

  const loadGame = () => {
    const savedGame = localStorage.getItem('savedChessGame');
    if (savedGame) {
      const { board, currentPlayer, moveHistory } = JSON.parse(savedGame);
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setMoveHistory(moveHistory);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {!gameMode && (
        <div className="mb-4 space-y-2">
          <Button onClick={startMultiplayerGame}>Start Multiplayer Game</Button>
          <Button onClick={startComputerGame}>Play Against Computer</Button>
          <Input
            placeholder="Enter game ID to join"
            onChange={(e) => joinGame(e.target.value)}
          />
        </div>
      )}
      {gameMode && (
        <div className="flex space-x-4">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="grid grid-cols-8 gap-1 w-96 h-96 mb-4">
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-12 h-12 flex items-center justify-center rounded-sm cursor-pointer
                      ${(rowIndex + colIndex) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-800'}
                      ${selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex ? 'ring-4 ring-yellow-400' : ''}
                      ${availableMoves.some(([r, c]) => r === rowIndex && c === colIndex) ? 'bg-green-300' : ''}
                    `}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {piece && (
                      <div className={`text-3xl ${piece.color === 'white' ? 'text-white' : 'text-black'}`}>
                        {piece.type === 'knight' ? '♘' : piece.type === 'rook' ? '♖' : piece.type === 'bishop' ? '♗' : piece.type === 'queen' ? '♕' : piece.type === 'king' ? '♔' : '♙'}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <Alert>
              <AlertDescription>{`${currentPlayer}'s turn`}</AlertDescription>
            </Alert>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-2">Move History</h2>
              <ul className="space-y-1">
                {moveHistory.map((move, index) => (
                  <li key={index}>{move}</li>
                ))}
              </ul>
            </div>
            {gameMode === 'multiplayer' && (
              <div className="bg-white p-4 rounded-lg shadow-xl">
                <h2 className="text-xl font-bold mb-2">Chat</h2>
                <div className="h-40 overflow-y-auto mb-2">
                  {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                  ))}
                </div>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <Button onClick={sendMessage} className="mt-2">Send</Button>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={saveGame}>Save Game</Button>
              <Button onClick={loadGame}>Load Game</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;
