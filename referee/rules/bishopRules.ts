import { Piece, Position } from '@/models';
import { isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const getPossibleBishopMoves = (bishop: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  const possibleDirections = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  for (const direction of possibleDirections) {
    // Check for at least 8 tiles in all possible directions
    for (let i = 1; i < 8; i++) {
      // Get possible destination from possible directions
      const destination = new Position(bishop.position.x + direction[0] * i, bishop.position.y + direction[1] * i);

      // If move is outside board, don't add it
      if (destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) break;

      if (!isTileOccupied(destination, boardState)) {
        possibleMoves.push(destination);
      } else if (isTileOccupiedByOpponent(destination, boardState, bishop.team)) {
        possibleMoves.push(destination);
        break;
      } else {
        break;
      }
    }
  }

  return possibleMoves;
};
