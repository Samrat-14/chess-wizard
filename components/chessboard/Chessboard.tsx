'use client';

import { useRef, useState } from 'react';

import Tile from '@/components/tile/Tile';

import { HORIZONTAL_AXIS, VERTICAL_AXIS } from '@/constants';
import { Piece, Position } from '@/models';
import './chessboard.css';

type ChessboardProps = {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
};

export default function Chessboard({ playMove, pieces }: ChessboardProps) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [activeSelectedPiece, setActiveSelectedPiece] = useState<HTMLElement | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position>(new Position(-1, -1));
  const chessboardRef = useRef<HTMLDivElement>(null);

  const clickPiece = (e: React.MouseEvent) => {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (chessboard) {
      const clickX = Math.floor((e.clientX - chessboard.offsetLeft) / (chessboard.clientWidth / 8));
      const clickY = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - chessboard.clientHeight) / (chessboard.clientHeight / 8))
      );

      // Check if click start position is same as click end position
      const isProperClick = grabPosition.isSamePosition(new Position(clickX, clickY));

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
          // Check if the played move is valid
          const success = playMove(selectedPiece.clone(), new Position(clickX, clickY));

          // If move is invalid, but another piece is properly clicked, select it
          if (!success && element.classList.contains('chess-piece') && isProperClick) {
            setSelectedPosition(new Position(clickX, clickY));
            setActiveSelectedPiece(element);

            return;
          }
        }

        // If move is valid or currently clicked on blank tile, set active piece to null
        setActiveSelectedPiece(null);
      } else {
        // No piece was selected, so if there is a piece & proper click, grab it
        if (element.classList.contains('chess-piece') && isProperClick) {
          setSelectedPosition(new Position(clickX, clickY));
          setActiveSelectedPiece(element);
        }
      }
    }
  };

  const grabPiece = (e: React.MouseEvent) => {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (element.classList.contains('chess-piece') && chessboard) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / (chessboard.clientWidth / 8));
      const grabY = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - chessboard.clientHeight) / (chessboard.clientHeight / 8))
      );

      setGrabPosition(new Position(grabX, grabY));

      const x = e.clientX;
      const y = e.clientY;
      element.style.position = 'absolute';
      element.style.translate = '-50% -50%';
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  };

  const movePiece = (e: React.MouseEvent) => {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft + 0.05 * chessboard.clientWidth;
      const minY = chessboard.offsetTop + 0.05 * chessboard.clientHeight;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 0.05 * chessboard.clientWidth;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 0.05 * chessboard.clientHeight;
      const x = e.clientX;
      const y = e.clientY;
      activePiece.style.position = 'absolute';
      activePiece.style.translate = '-50% -50%';
      activePiece.style.left = x < minX ? `${minX}px` : x > maxX ? `${maxX}px` : `${x}px`;
      activePiece.style.top = y < minY ? `${minY}px` : y > maxY ? `${maxY}px` : `${y}px`;
    }
  };

  const dropPiece = (e: React.MouseEvent) => {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      // Find (x, y) where the piece is dropped
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / (chessboard.clientWidth / 8));
      const y = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - chessboard.clientHeight) / (chessboard.clientHeight / 8))
      );

      const currentPiece = pieces.find((p) => p.isSamePosition(grabPosition));

      if (currentPiece) {
        // Check if the played move is valid
        const success = playMove(currentPiece.clone(), new Position(x, y));

        // If not success, snap back to place
        if (!success) {
          // Resets the piece position
          activePiece.style.position = 'relative';
          activePiece.style.removeProperty('left');
          activePiece.style.removeProperty('top');
          activePiece.style.removeProperty('translate');
        }
      }

      setActivePiece(null);
    }
  };

  let board = [];

  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const piece = pieces.find((p) => p.isSamePosition(new Position(i, j)));
      const image = piece ? piece.image : undefined;

      // Piece which is currently clicked or grabbed
      const currentPiece =
        activeSelectedPiece || activePiece ? pieces.find((p) => p.isSamePosition(grabPosition)) : undefined;

      // If tile's position is in possible moves array
      const highlight = currentPiece?.possibleMoves
        ? currentPiece.possibleMoves.some((p) => p.isSamePosition(new Position(i, j)))
        : false;

      // If tile's piece is selected
      const isTileSelected = currentPiece ? currentPiece.isSamePosition(new Position(i, j)) : false;

      board.push(
        <Tile key={`${i}-${j}`} number={i + j} image={image} highlight={highlight} selected={isTileSelected} />
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
}
