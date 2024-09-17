import { TeamType } from '@/types';
import { Pawn, Piece, Position } from '@/models';
import { isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const getPossiblePawnMoves = (pawn: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  const specialRow = pawn.team === TeamType.WHITE ? 1 : 6;
  const pawnDirection = pawn.team === TeamType.WHITE ? 1 : -1;

  const normalMove = new Position(pawn.position.x, pawn.position.y + pawnDirection);
  const specialMove = new Position(normalMove.x, normalMove.y + pawnDirection);
  const upperLeftAttack = new Position(pawn.position.x - 1, pawn.position.y + pawnDirection);
  const upperRightAttack = new Position(pawn.position.x + 1, pawn.position.y + pawnDirection);
  const leftPosition = new Position(pawn.position.x - 1, pawn.position.y);
  const rightPosition = new Position(pawn.position.x + 1, pawn.position.y);

  // Movement
  if (!isTileOccupied(normalMove, boardState)) {
    possibleMoves.push(normalMove);

    if (pawn.position.y === specialRow && !isTileOccupied(specialMove, boardState)) {
      possibleMoves.push(specialMove);
    }
  }

  // Upper left position for attack
  if (isTileOccupiedByOpponent(upperLeftAttack, boardState, pawn.team)) {
    possibleMoves.push(upperLeftAttack);
  } else if (!isTileOccupied(upperLeftAttack, boardState)) {
    const leftPiece = boardState.find((p) => p.isSamePosition(leftPosition));

    if (leftPiece && (leftPiece as Pawn).enPassant) {
      possibleMoves.push(upperLeftAttack);
    }
  }

  // Upper right position for attack
  if (isTileOccupiedByOpponent(upperRightAttack, boardState, pawn.team)) {
    possibleMoves.push(upperRightAttack);
  } else if (!isTileOccupied(upperRightAttack, boardState)) {
    const rightPiece = boardState.find((p) => p.isSamePosition(rightPosition));

    if (rightPiece && (rightPiece as Pawn).enPassant) {
      possibleMoves.push(upperRightAttack);
    }
  }

  return possibleMoves;
};
