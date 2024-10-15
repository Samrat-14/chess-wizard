'use client';

import { useEffect, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';

import Chessboard from '@/components/Chessboard';
import Playertag from '@/components/Playertag';
import Modal from '@/components/ui/Modal';

import { PieceType, TeamType } from '@/types';
import { Board, Fen, Piece, Position } from '@/models';

import '@/styles/referee.css';

export default function Referee() {
  const [board, setBoard] = useState<Board>(new Board());
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  const chessboardRef = useRef<HTMLDivElement>(null);
  const promotionModalRef = useRef<HTMLDivElement>(null);
  const gameOverModalRef = useRef<HTMLDivElement>(null);
  const startGameModalRef = useRef<HTMLDivElement>(null);

  // Game settings
  const [boardRotates, setBoardRotates] = useState(false);

  const [playerWhite, setPlayerWhite] = useState('You');
  const [playerBlack, setPlayerBlack] = useState('Opponent');

  const switchPlayers = () => {
    setPlayerWhite((prev) => (prev === 'You' ? 'Opponent' : 'You'));
    setPlayerBlack((prev) => (prev === 'Opponent' ? 'You' : 'Opponent'));
  };

  const playMove = (playedPiece: Piece, destination: Position): boolean => {
    if (!playedPiece.possibleMoves) return false;

    // Prevent inactive player from playing
    if (playedPiece.team !== board.currentTeam) return false;

    let playedMoveIsValid = false;

    // If move is not present in possible moves, return false
    const validMove = playedPiece.possibleMoves?.some((m) => m.isSamePosition(destination));
    if (!validMove) return false;

    const enPassantMove = isEnPassantMove(playedPiece.position, destination, playedPiece.type, playedPiece.team);

    setBoard(() => {
      const clonedBoard = board.clone();

      // Move is valid, so play the move
      playedMoveIsValid = clonedBoard.playMove(enPassantMove, playedPiece, destination);

      // Check if player won after each played move
      if (clonedBoard.winCondition) {
        gameOverModalRef.current?.classList.remove('hidden');
      }

      return clonedBoard;
    });

    // Row for promoting a pawn
    const promotionRow = playedPiece.team === TeamType.WHITE ? 7 : 0;

    if (destination.y === promotionRow && playedPiece.isPawn) {
      promotionModalRef.current?.classList.remove('hidden');

      const chessboard = chessboardRef.current;
      if (chessboard) {
        const xPos = chessboard.offsetTop;
        const yPos = chessboard.offsetLeft + destination.x * (chessboard.clientWidth / 8);

        const promotionModalBody = promotionModalRef.current?.children[0] as HTMLElement;
        promotionModalBody.style.top = `${xPos}px`;
        promotionModalBody.style.left = `${yPos}px`;
      }

      setPromotionPawn(() => {
        const clonedPlayedPiece = playedPiece.clone();
        clonedPlayedPiece.position = destination.clone();

        return clonedPlayedPiece;
      });
    }

    return playedMoveIsValid;
  };

  const isEnPassantMove = (
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType
  ): boolean => {
    const pawnDirection = team === TeamType.WHITE ? 1 : -1;

    if (type === PieceType.PAWN) {
      if (
        (desiredPosition.x - initialPosition.x === -1 || desiredPosition.x - initialPosition.x === 1) &&
        desiredPosition.y - initialPosition.y === pawnDirection
      ) {
        const piece = board.pieces.find(
          (p) =>
            p.position.x === desiredPosition.x &&
            p.position.y === desiredPosition.y - pawnDirection &&
            p.isPawn &&
            board.fen.enPassantSquare?.isSamePosition(new Position(desiredPosition.x, desiredPosition.y))
        );
        if (piece) {
          return true;
        }
      }
    }

    return false;
  };

  const promotePawn = (pieceType: PieceType) => {
    if (!promotionPawn) return;

    setBoard(() => {
      const clonedBoard = board.clone();

      clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
        if (piece.isSamePiecePosition(promotionPawn)) {
          results.push(new Piece(piece.position.clone(), pieceType, piece.team));
        } else {
          results.push(piece);
        }

        return results;
      }, [] as Piece[]);

      // Update the FEN after pawn promotion
      clonedBoard.fen = clonedBoard.fen.update({ boardstate: clonedBoard.pieces });

      clonedBoard.calculateAllMoves();

      // Check if player won just after pawn promotion
      if (clonedBoard.winCondition) {
        gameOverModalRef.current?.classList.remove('hidden');
      }

      return clonedBoard;
    });

    promotionModalRef.current?.classList.add('hidden');
  };

  const promotionPieceImage = (promotionPieceType: PieceType) => {
    const promotionTeamType = promotionPawn?.team === TeamType.WHITE ? 'w' : 'b';

    return `assets/images/${promotionPieceType}_${promotionTeamType}.png`;
  };

  const restartGame = () => {
    gameOverModalRef.current?.classList.add('hidden');
    setBoard(new Board());
    startGameModalRef.current?.classList.remove('hidden');
  };

  const startGame = () => {
    gameOverModalRef.current?.classList.add('hidden');
    startGameModalRef.current?.classList.add('hidden');
    setBoard(() => {
      const initialBoard = new Board(Fen.startingPosition);
      initialBoard.calculateAllMoves();

      return initialBoard;
    });
  };

  const resignGame = () => {
    setBoard(() => {
      const clonedBoard = board.clone();
      clonedBoard.winningTeam = clonedBoard.currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
      clonedBoard.winCondition = 'Resignation';

      return clonedBoard;
    });
    gameOverModalRef.current?.classList.remove('hidden');
  };

  useEffect(() => {
    console.log(board.fen.toString());
  }, [board]);

  return (
    <>
      {/* Pawn Promotion Modal */}
      <Modal ref={promotionModalRef} type="promotion-modal" hidden>
        <img src={promotionPieceImage(PieceType.KNIGHT)} alt="knight" onClick={() => promotePawn(PieceType.KNIGHT)} />
        <img src={promotionPieceImage(PieceType.BISHOP)} alt="bishop" onClick={() => promotePawn(PieceType.BISHOP)} />
        <img src={promotionPieceImage(PieceType.ROOK)} alt="rook" onClick={() => promotePawn(PieceType.ROOK)} />
        <img src={promotionPieceImage(PieceType.QUEEN)} alt="queen" onClick={() => promotePawn(PieceType.QUEEN)} />
      </Modal>

      {/* Game Over Modal */}
      <Modal ref={gameOverModalRef} type="popup-modal" hidden>
        <div className="modal-body">
          <h2 className="uppercase">
            {board.winningTeam ? (board.winningTeam === TeamType.WHITE ? 'white wins!' : 'black wins!') : 'draw'}
          </h2>
          <p>by {board.winCondition}</p>
          <div className="grid grid-cols-2 gap-4 m-4">
            <button className="btn-primary" onClick={startGame}>
              Rematch
            </button>
            <button className="btn-primary" onClick={restartGame}>
              New Game
            </button>
          </div>
        </div>
      </Modal>

      {/* Start Game Modal */}
      <Modal ref={startGameModalRef} type="popup-modal">
        <div className="modal-body">
          <h2>Pass and Play</h2>
          <p>Play with a friend offline</p>
          <div className="mt-10">
            <h4>
              <span>White</span>
              <span className="font-bold">{playerWhite}</span>
            </h4>
            <span id="toggle-team" onClick={switchPlayers}>
              <Shuffle size={20} color="#ffffff" strokeWidth={2.5} />
            </span>
            <h4>
              <span>Black</span>
              <span className="font-bold">{playerBlack}</span>
            </h4>
            <h4>
              <span>Board rotates</span>
              <label className="toggle-checkbox">
                <input type="checkbox" name="board-rotate" onChange={(e) => setBoardRotates(e.target.checked)} />
                <span />
              </label>
            </h4>
          </div>
          <div className="m-4">
            <button className="btn-primary" onClick={startGame}>
              Start game
            </button>
          </div>
        </div>
      </Modal>

      <main id="playground">
        <Playertag playerName={boardRotates && board.currentTeam === TeamType.BLACK ? playerWhite : playerBlack} />
        <Chessboard
          ref={chessboardRef}
          playMove={playMove}
          pieces={board.pieces}
          turn={boardRotates ? board.currentTeam : undefined}
          lastMovePlayed={board.getLastMove}
        />
        <Playertag playerName={boardRotates && board.currentTeam === TeamType.BLACK ? playerBlack : playerWhite} />
      </main>

      {board.pieces.length > 0 && (
        <button className="btn-primary absolute top-1 right-1" onClick={resignGame}>
          Resign
        </button>
      )}
    </>
  );
}
