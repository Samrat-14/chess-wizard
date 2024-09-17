'use client';

import { useEffect, useRef, useState } from 'react';

import Chessboard from '@/components/chessboard/Chessboard';
import Modal from '@/components/modal/Modal';

import { PieceType, TeamType } from '@/types';
import { initialBoard } from '@/constants';
import { Board, Pawn, Piece, Position } from '@/models';
import { Shuffle } from 'lucide-react';

export default function Referee() {
  const [board, setBoard] = useState<Board>(new Board([], 0));
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  const chessboardRef = useRef<HTMLDivElement>(null);
  const promotionModalRef = useRef<HTMLDivElement>(null);
  const gameOverModalRef = useRef<HTMLDivElement>(null);
  const startGameModalRef = useRef<HTMLDivElement>(null);

  // Game settings
  const [switchTeam, setSwitchTeam] = useState(true);
  const [boardRotates, setBoardRotates] = useState(false);

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

      clonedBoard.totalTurns += 1;

      // Playing the move
      playedMoveIsValid = clonedBoard.playMove(enPassantMove, validMove, playedPiece, destination);

      // Check if player won after each played move
      if (clonedBoard.winningTeam) {
        gameOverModalRef.current?.classList.remove('hidden');
      }

      return clonedBoard;
    });

    // For promoting a Pawn
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
            (p as Pawn).enPassant
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
          results.push(new Piece(piece.position.clone(), pieceType, piece.team, true));
        } else {
          results.push(piece);
        }

        return results;
      }, [] as Piece[]);

      clonedBoard.calculateAllMoves();

      // Check if player won just after pawn promotion
      if (clonedBoard.winningTeam) {
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
    setBoard(initialBoard.clone());
  };

  const startGame = () => {
    startGameModalRef.current?.classList.add('hidden');
    setBoard(initialBoard.clone());
  };

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
          <h2 className="uppercase">{board.winningTeam === TeamType.WHITE ? 'white' : 'black'} wins!</h2>
          <button className="btn-primary" onClick={restartGame}>
            Play again
          </button>
        </div>
      </Modal>

      {/* Start Game Modal */}
      <Modal ref={startGameModalRef} type="popup-modal">
        <div className="modal-body">
          <h2>Pass and Play</h2>
          <p>Play with a friend offline</p>
          <h4>
            <span>White</span>
            <span className="font-bold">{switchTeam ? 'You' : 'Opponent'}</span>
          </h4>
          <span id="toggle-team" onClick={() => setSwitchTeam((prev) => !prev)}>
            <Shuffle size={20} color="#ffffff" strokeWidth={2.5} />
          </span>
          <h4>
            <span>Black</span>
            <span className="font-bold">{switchTeam ? 'Opponent' : 'You'}</span>
          </h4>
          <h4>
            <span>Board rotates</span>
            <label className="toggle-checkbox">
              <input type="checkbox" name="board-rotate" onChange={(e) => setBoardRotates(e.target.checked)} />
              <span />
            </label>
          </h4>
          <button className="btn-primary" onClick={startGame}>
            Start game
          </button>
        </div>
      </Modal>

      <Chessboard
        ref={chessboardRef}
        playMove={playMove}
        pieces={board.pieces}
        turn={boardRotates ? board.currentTeam : undefined}
      />
    </>
  );
}
