'use client';

import { useEffect, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';

import Chessboard from '@/components/Chessboard';
import Playertag from '@/components/Playertag';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

import useLocalStorage from '@/hooks/useLocalStorage';
import { PieceType, TeamType } from '@/types';
import { Board, Fen, Move, Piece, Position } from '@/models';
import { hideModal, playSound, unHideModal } from '@/utils/helper';

import '@/styles/referee.css';

export default function Referee() {
  // Custom hook to manage FEN in local storage
  const [storedFen, setStoredFen] = useLocalStorage<string>('fen', Fen.emptyPosition);
  const [storedLastMoveObj, setStoredLastMoveObj] = useLocalStorage<Move>('last-move', Move.nullMove());

  // States to store boardstate & promotion pawn during the game
  const [board, setBoard] = useState<Board>(new Board());
  const [promotionPawn, setPromotionPawn] = useState<Piece>();

  // Refs for boardstate & different modals
  const chessboardRef = useRef<HTMLDivElement>(null);
  const promotionModalRef = useRef<HTMLDivElement>(null);
  const gameOverModalRef = useRef<HTMLDivElement>(null);
  const startGameModalRef = useRef<HTMLDivElement>(null);

  // States for other game settings
  const [boardRotates, setBoardRotates] = useState(false);
  const [playerWhite, setPlayerWhite] = useState('You');
  const [playerBlack, setPlayerBlack] = useState('Opponent');

  // Flag to check if it's an active game
  const isActiveGame = board.fen.toString() !== Fen.emptyPosition;

  // Initially, set the board from the stored value of FEN from local storage
  useEffect(() => {
    const parsedStoredLastMove = Move.parse(storedLastMoveObj);

    setBoard(new Board(storedFen, parsedStoredLastMove));
  }, []);

  // Whenever boardstate changes, update the FEN in the local storage
  useEffect(() => {
    // console.log(board.fen.toString());
    setStoredFen(board.fen.toString());
    setStoredLastMoveObj(board.getLastMove);
  }, [board]);

  const switchPlayers = () => {
    setPlayerWhite((prev) => (prev === 'You' ? 'Opponent' : 'You'));
    setPlayerBlack((prev) => (prev === 'Opponent' ? 'You' : 'Opponent'));
  };

  const playMove = (playedPiece: Piece, destination: Position): boolean => {
    if (!playedPiece.possibleMoves) return false;

    // Prevent inactive player from playing
    if (playedPiece.team !== board.currentTeam) return false;

    // If move is not present in possible moves, return false
    const validMove = playedPiece.possibleMoves?.some((m) => m.isSamePosition(destination));
    if (!validMove) {
      // Play sound for illegal move
      playSound('illegal');

      return false;
    }

    const enPassantMove = isEnPassantMove(playedPiece.position, destination, playedPiece.type, playedPiece.team);

    setBoard(() => {
      const clonedBoard = board.clone();

      // Move is valid, so play the move
      clonedBoard.playMove(enPassantMove, playedPiece, destination);

      // Check if player won after each played move
      if (clonedBoard.winCondition) {
        unHideModal(gameOverModalRef);
      }

      return clonedBoard;
    });

    // Row for promoting a pawn
    const promotionRow = playedPiece.team === TeamType.WHITE ? 7 : 0;

    if (destination.y === promotionRow && playedPiece.isPawn) {
      unHideModal(promotionModalRef);

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

    // Move is valid
    return true;
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
        unHideModal(gameOverModalRef);
      } else {
        // Play sound for promotion
        playSound('promote');
      }

      return clonedBoard;
    });

    hideModal(promotionModalRef);
  };

  const promotionPieceImage = (promotionPieceType: PieceType) => {
    const promotionTeamType = promotionPawn?.team === TeamType.WHITE ? 'w' : 'b';

    return `assets/images/${promotionPieceType}_${promotionTeamType}.png`;
  };

  const startNewGame = () => {
    hideModal(gameOverModalRef);
    setBoard(new Board());
    unHideModal(startGameModalRef);
  };

  const continueGame = () => {
    hideModal(startGameModalRef);
    setBoard(() => {
      const clonedBoard = board.clone();
      clonedBoard.calculateAllMoves();

      // Check if game was already over
      if (clonedBoard.winCondition) {
        unHideModal(gameOverModalRef);
      }

      return clonedBoard;
    });
  };

  const startGame = () => {
    hideModal(gameOverModalRef);
    hideModal(startGameModalRef);
    setBoard(() => {
      const initialBoard = new Board(Fen.startingPosition);

      // Play sound for game start
      playSound('game-start');

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
    unHideModal(gameOverModalRef);
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
          <h2 className="uppercase">
            {board.winningTeam ? (board.winningTeam === TeamType.WHITE ? 'white wins!' : 'black wins!') : 'draw'}
          </h2>
          <p>by {board.winCondition}</p>
          <div className="grid grid-cols-2 gap-4 m-4">
            <Button variant="clashofclans" onClick={startGame}>
              Rematch
            </Button>
            <Button variant="clashofclans" onClick={startNewGame}>
              New Game
            </Button>
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
          <div className="grid grid-cols-2 gap-4 m-4">
            <Button variant="clashofclans" disabled={!isActiveGame} onClick={continueGame}>
              Continue
            </Button>
            <Button variant="clashofclans" onClick={startGame}>
              New Game
            </Button>
          </div>
        </div>
      </Modal>

      <main id="playground">
        <Playertag playerName={boardRotates && board.currentTeam === TeamType.BLACK ? playerWhite : playerBlack} />
        <Chessboard
          ref={chessboardRef}
          playMove={playMove}
          pieces={board.pieces}
          rotate={boardRotates}
          currentTeam={board.currentTeam}
          lastMovePlayed={board.getLastMove}
        />
        <Playertag playerName={boardRotates && board.currentTeam === TeamType.BLACK ? playerBlack : playerWhite} />
      </main>

      {isActiveGame && (
        <div className="absolute top-1 right-1">
          <Button variant="clashofclans" onClick={resignGame}>
            Resign
          </Button>
        </div>
      )}
    </>
  );
}
