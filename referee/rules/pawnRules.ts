import { TeamType } from '@/types';
import { Fen, Piece, Position } from '@/models';
import { isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const getPossiblePawnMoves = (
  pawn: Piece,
  boardState: Piece[],
  fenEnPassantSquare: Position | null
): Position[] => {
  const possibleMoves: Position[] = [];

  const specialRow = pawn.team === TeamType.WHITE ? 1 : 6;
  const pawnDirection = pawn.team === TeamType.WHITE ? 1 : -1;

  const normalMove = new Position(pawn.position.x, pawn.position.y + pawnDirection);
  const specialMove = new Position(normalMove.x, normalMove.y + pawnDirection);
  const upperLeftAttack = new Position(pawn.position.x - 1, pawn.position.y + pawnDirection);
  const upperRightAttack = new Position(pawn.position.x + 1, pawn.position.y + pawnDirection);

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
  }
  // Check if upper left position is enPassantSquare
  else if (fenEnPassantSquare?.isSamePosition(upperLeftAttack)) {
    possibleMoves.push(upperLeftAttack);
  }

  // Upper right position for attack
  if (isTileOccupiedByOpponent(upperRightAttack, boardState, pawn.team)) {
    possibleMoves.push(upperRightAttack);
  }
  // Check if upper right position is enPassantSquare
  else if (fenEnPassantSquare?.isSamePosition(upperRightAttack)) {
    possibleMoves.push(upperRightAttack);
  }

  return possibleMoves;
};
