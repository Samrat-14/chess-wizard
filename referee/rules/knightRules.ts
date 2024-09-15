import { TeamType } from '@/types';
import { Piece, Position } from '@/models';
import { isTileEmptyOrOccupiedByOpponent } from './generalRules';

export const knightMove = (
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[]
): boolean => {
  // MOVEMENT & ATTACK LOGIC
  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      // Top and Bottom
      if (desiredPosition.y - initialPosition.y === 2 * i) {
        if (desiredPosition.x - initialPosition.x === j) {
          if (isTileEmptyOrOccupiedByOpponent(desiredPosition, boardState, team)) {
            return true;
          }
        }
      }
      // Left and Right
      if (desiredPosition.x - initialPosition.x === 2 * i) {
        if (desiredPosition.y - initialPosition.y === j) {
          if (isTileEmptyOrOccupiedByOpponent(desiredPosition, boardState, team)) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

export const getPossibleKnightMoves = (knight: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const verticalMove = new Position(knight.position.x + j, knight.position.y + 2 * i);
      const horizontalMove = new Position(knight.position.x + 2 * i, knight.position.y + j);

      if (isTileEmptyOrOccupiedByOpponent(verticalMove, boardState, knight.team)) {
        possibleMoves.push(verticalMove);
      }

      if (isTileEmptyOrOccupiedByOpponent(horizontalMove, boardState, knight.team)) {
        possibleMoves.push(horizontalMove);
      }
    }
  }

  return possibleMoves;
};
