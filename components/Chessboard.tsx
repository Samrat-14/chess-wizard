'use client';

import { forwardRef, Ref, RefObject, useState } from 'react';

import Tile from '@/components/Tile';

import { HORIZONTAL_AXIS, VERTICAL_AXIS } from '@/constants';
import { Move, Piece, Position } from '@/models';
import { TeamType } from '@/types';

import '@/styles/chessboard.css';

type ChessboardProps = {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
  rotate: boolean;
  currentTeam: TeamType;
  lastMovePlayed: Move;
};

export default forwardRef(function Chessboard(
  { playMove, pieces, rotate, currentTeam, lastMovePlayed }: ChessboardProps,
  ref: Ref<HTMLDivElement>
) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(Position.nullPosition);
  const [hoverWithPiecePosition, setHoverWithPiecePosition] = useState<Position>(Position.nullPosition);
  const [activeSelectedPiece, setActiveSelectedPiece] = useState<HTMLElement | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position>(Position.nullPosition);
  const chessboardRef = ref as RefObject<HTMLDivElement>;

  const _getMouseCoordinatesOnBoard = (e: React.MouseEvent, chessboard: HTMLDivElement): Position => {
    // Find (x, y) on board where clicked
    const tileX = Math.floor((e.clientX - chessboard.offsetLeft) / (chessboard.clientWidth / 8));
    const tileY = Math.abs(
      Math.ceil((e.clientY - chessboard.offsetTop - chessboard.clientHeight) / (chessboard.clientHeight / 8))
    );

    // Toggle position coordinates based on turn
    const xPos = rotate && currentTeam === TeamType.BLACK ? 7 - tileX : tileX;
    const yPos = rotate && currentTeam === TeamType.BLACK ? 7 - tileY : tileY;

    return new Position(xPos, yPos);
  };

  const clickPiece = (e: React.MouseEvent) => {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (chessboard) {
      // Find (x, y) on board where clicked
      const clickPosition = _getMouseCoordinatesOnBoard(e, chessboard);

      // Check if click start position is same as click end position
      const isProperClick = grabPosition.isSamePosition(clickPosition);

      // Check if a piece was selected
      if (activeSelectedPiece) {
        // If same piece is clicked again, reset selected piece
        if (activeSelectedPiece === element) {
          setActiveSelectedPiece(null);
          return;
        }

        // Piece was selected, so try to move it
        const selectedPiece = pieces.find((p) => p.isSamePosition(selectedPosition));
        if (selectedPiece) {
          let success = false;
          // Play move only if clickPosition belongs to any possible moves of selectedPosition
          if (selectedPiece.possibleMoves?.some((m) => m.isSamePosition(clickPosition))) {
            // Set success flag true if the move is valid
            success = playMove(selectedPiece.clone(), clickPosition.clone());
          }

          // If move is invalid, but another piece is properly clicked, select it
          if (!success && element.classList.contains('chess-piece') && isProperClick) {
            setSelectedPosition(clickPosition);
            setActiveSelectedPiece(element);

            return;
          }
        }

        // If move is valid or currently clicked on blank tile, set active piece to null
        setActiveSelectedPiece(null);
      } else {
        // No piece was selected, so if there is a piece & proper click, grab it
        if (element.classList.contains('chess-piece') && isProperClick) {
          setSelectedPosition(clickPosition);
          setActiveSelectedPiece(element);
        }
      }
    }
  };

  const grabPiece = (e: React.MouseEvent) => {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (element.classList.contains('chess-piece') && chessboard) {
      // Find (x, y) on board where the piece is grabbed
      const grabbedPosition = _getMouseCoordinatesOnBoard(e, chessboard);

      // If grabbedPiece is not of currentTeam, don't grab
      const grabbedPiece = pieces.find((p) => p.isSamePosition(grabbedPosition));
      if (grabbedPiece && grabbedPiece.team !== currentTeam) return;

      setGrabPosition(grabbedPosition);

      const x = e.clientX;
      const y = e.clientY;
      element.style.position = 'absolute';
      element.style.zIndex = '10';
      element.style.translate = '-50% -50%';
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  };

  const movePiece = (e: React.MouseEvent) => {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      // Find (x, y) on board where the piece is hovered
      const hoverPosition = _getMouseCoordinatesOnBoard(e, chessboard);
      setHoverWithPiecePosition(hoverPosition);

      const minX = chessboard.offsetLeft + 0.05 * chessboard.clientWidth;
      const minY = chessboard.offsetTop + 0.05 * chessboard.clientHeight;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 0.05 * chessboard.clientWidth;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 0.05 * chessboard.clientHeight;
      const x = e.clientX;
      const y = e.clientY;
      activePiece.style.position = 'absolute';
      activePiece.style.zIndex = '10';
      activePiece.style.translate = '-50% -50%';
      activePiece.style.left = x < minX ? `${minX}px` : x > maxX ? `${maxX}px` : `${x}px`;
      activePiece.style.top = y < minY ? `${minY}px` : y > maxY ? `${maxY}px` : `${y}px`;
    } else {
      // Reset (x, y) to (-1, -1)
      setHoverWithPiecePosition(Position.nullPosition);
    }
  };

  const dropPiece = (e: React.MouseEvent) => {
    const chessboard = chessboardRef.current;

    if (activePiece && chessboard) {
      // Find (x, y) on board where the piece is dropped
      const dropPosition = _getMouseCoordinatesOnBoard(e, chessboard);

      const currentPiece = pieces.find((p) => p.isSamePosition(grabPosition));

      if (currentPiece) {
        if (!dropPosition.isSamePosition(grabPosition)) {
          // If grab and drop position are different, try to play the move
          playMove(currentPiece.clone(), dropPosition.clone());
        }

        // Resets the piece position to snap at place
        activePiece.style.position = 'relative';
        activePiece.style.zIndex = '10';
        activePiece.style.removeProperty('left');
        activePiece.style.removeProperty('top');
        activePiece.style.removeProperty('translate');
      }

      setActivePiece(null);
    }
  };

  const board = [];

  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      // Toggle position coordinates based on turn
      const xPos = rotate && currentTeam === TeamType.BLACK ? 7 - i : i;
      const yPos = rotate && currentTeam === TeamType.BLACK ? 7 - j : j;

      // Find piece at the tile and set it's image
      const piece = pieces.find((p) => p.isSamePosition(new Position(xPos, yPos)));
      const image = piece ? piece.image : undefined;

      // Piece which is currently clicked or grabbed
      const currentPiece =
        activeSelectedPiece || activePiece ? pieces.find((p) => p.isSamePosition(grabPosition)) : undefined;

      // If tile is in possible moves array, mark it
      const isTileInPossibleMoves = currentPiece?.possibleMoves
        ? currentPiece.possibleMoves.some((p) => p.isSamePosition(new Position(xPos, yPos)))
        : false;

      // If tile is selected, highlight it
      const isTileSelected = currentPiece ? currentPiece.isSamePosition(new Position(xPos, yPos)) : false;

      // If tile is hovered with piece selected, highlight it
      const isTileHoveredWithPiece =
        currentPiece && hoverWithPiecePosition
          ? hoverWithPiecePosition.isSamePosition(new Position(xPos, yPos))
          : false;

      // If tile is in last move, highlight it
      const isTileInLastMovePlayed = lastMovePlayed ? lastMovePlayed.includesPosition(new Position(xPos, yPos)) : false;

      board.push(
        <Tile
          key={`${i}-${j}`}
          xPos={xPos}
          yPos={yPos}
          turn={rotate ? currentTeam : undefined}
          image={image}
          marked={isTileInPossibleMoves}
          highlighted={isTileSelected || isTileInLastMovePlayed}
          hoveredWithPiece={isTileHoveredWithPiece}
        />
      );
    }
  }

  return (
    <>
      <div
        id="chessboard"
        ref={chessboardRef}
        onMouseDown={grabPiece}
        onMouseMove={movePiece}
        onMouseUp={dropPiece}
        onClick={clickPiece}
      >
        {board}
      </div>
    </>
  );
});
