'use client';

import { useRef, useState } from 'react';

import Chessboard from '@/components/chessboard/Chessboard';
import Modal from '@/components/modal/Modal';

import { PieceType, TeamType } from '@/types';
import { initialBoard } from '@/constants';
import { Board, Pawn, Piece, Position } from '@/models';

export default function Referee() {
  const [board, setBoard] = useState<Board>(initialBoard.clone());
  const [promotionPawn, setPromotionPawn] = useState<Piece>();
  const chessboardRef = useRef<HTMLDivElement>(null);
  const promotionModalRef = useRef<HTMLDivElement>(null);
  const gameOverModalRef = useRef<HTMLDivElement>(null);

  const playMove = (playedPiece: Piece, destination: Position): boolean => {
    if (!playedPiece.possibleMoves) return false;

    // Prevent inactive player from playing
    if (playedPiece.team === TeamType.OUR && board.totalTurns % 2 !== 1) return false;
    if (playedPiece.team === TeamType.OPPONENT && board.totalTurns % 2 !== 0) return false;

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
    const promotionRow = playedPiece.team === TeamType.OUR ? 7 : 0;

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
    const pawnDirection = team === TeamType.OUR ? 1 : -1;

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
    const promotionTeamType = promotionPawn?.team === TeamType.OUR ? 'w' : 'b';

    return `assets/images/${promotionPieceType}_${promotionTeamType}.png`;
  };

  const restartGame = () => {
    gameOverModalRef.current?.classList.add('hidden');
    setBoard(initialBoard.clone());
  };

  return (
    <>
      <p>{board.currentTeam === 'w' ? "WHITE'S TURN" : "BLACK'S TURN"}</p>

      {/* Pawn Promotion Modal */}
      <Modal ref={promotionModalRef} type="promotion-modal" hidden>
        <img src={promotionPieceImage(PieceType.KNIGHT)} alt="knight" onClick={() => promotePawn(PieceType.KNIGHT)} />
        <img src={promotionPieceImage(PieceType.BISHOP)} alt="bishop" onClick={() => promotePawn(PieceType.BISHOP)} />
        <img src={promotionPieceImage(PieceType.ROOK)} alt="rook" onClick={() => promotePawn(PieceType.ROOK)} />
        <img src={promotionPieceImage(PieceType.QUEEN)} alt="queen" onClick={() => promotePawn(PieceType.QUEEN)} />
      </Modal>

      {/* Game Over Modal */}
      <Modal ref={gameOverModalRef} type="popup-modal">
        <div className="flex flex-col items-center gap-[2.5vmin]">
          <h2 className="text-[5vmin] uppercase font-bold">
            {board.winningTeam === TeamType.OUR ? 'white' : 'black'} wins!
          </h2>
          <button className="btn-primary" onClick={restartGame}>
            Play again
          </button>
        </div>
      </Modal>

      <Chessboard ref={chessboardRef} playMove={playMove} pieces={board.pieces} />
    </>
  );
}
