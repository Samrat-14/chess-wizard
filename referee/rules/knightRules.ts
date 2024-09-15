import { Piece, Position } from '@/models';
import { isTileEmptyOrOccupiedByOpponent } from './generalRules';

export const getPossibleKnightMoves = (knight: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const verticalMove = new Position(knight.position.x + j, knight.position.y + 2 * i);
      const horizontalMove = new Position(knight.position.x + 2 * i, knight.position.y + j);

      // If move is not outside board, then add it
      if (!(verticalMove.x < 0 || verticalMove.x > 7 || verticalMove.y < 0 || verticalMove.y > 7)) {
        if (isTileEmptyOrOccupiedByOpponent(verticalMove, boardState, knight.team)) {
          possibleMoves.push(verticalMove);
        }
      }

      // If move is not outside board, then add it
      if (!(horizontalMove.x < 0 || horizontalMove.x > 7 || horizontalMove.y < 0 || horizontalMove.y > 7)) {
        if (isTileEmptyOrOccupiedByOpponent(horizontalMove, boardState, knight.team)) {
          possibleMoves.push(horizontalMove);
        }
      }
    }
  }

  return possibleMoves;
};
