import { Piece, Position } from '@/models';
import { isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const getPossibleKingMoves = (king: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  const possibleDirections = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  for (const direction of possibleDirections) {
    // Get possible destination from possible directions
    const destination = new Position(king.position.x + direction[0], king.position.y + direction[1]);

    // If move is outside board, don't add it
    if (destination.x < 0 || destination.x > 7 || destination.y < 0 || destination.y > 7) continue;

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, king.team)) {
      possibleMoves.push(destination);
      continue;
    } else {
      continue;
    }
  }

  return possibleMoves;
};

// In this method, the enemy moves have already been calculated
export const getCastlingMoves = (king: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  // Check if the King has moved yet
  if (king.hasMoved) return possibleMoves;

  // Get Rooks from King's team that haven't moved yet
  const rooks = boardState.filter((p) => p.isRook && p.team === king.team && !p.hasMoved);

  for (const rook of rooks) {
    // Determine if we need to go to the right or left of the King
    const direction = rook.position.x - king.position.x > 0 ? 1 : -1;

    const adjacentPosition = king.position.clone();
    adjacentPosition.x += direction;

    if (!rook.possibleMoves?.some((m) => m.isSamePosition(adjacentPosition))) continue;

    // Now we know the Rook can move to the adjacent side of the King

    // Get the tiles between the Rook and King
    const concerningTiles = rook.possibleMoves.filter((m) => m.y === king.position.y);

    const enemyPieces = boardState.filter((p) => p.team !== king.team);

    // Check if any enemy in has possible moves to the concerning tiles
    let valid = true;
    for (const enemy of enemyPieces) {
      if (enemy.possibleMoves === undefined) continue;

      for (const move of enemy.possibleMoves) {
        if (concerningTiles.some((t) => t.isSamePosition(move))) {
          valid = false;
        }

        if (!valid) break;
      }
      if (!valid) break;
    }

    if (!valid) continue;

    // Now add it as a possible move
    possibleMoves.push(rook.position.clone());
  }

  return possibleMoves;
};
