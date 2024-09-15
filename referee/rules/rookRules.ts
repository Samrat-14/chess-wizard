import { TeamType } from '@/types';
import { Piece, Position } from '@/models';
import { isTileEmptyOrOccupiedByOpponent, isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const rookMove = (
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[]
): boolean => {
  // MOVEMENT & ATTACK LOGIC
  for (let i = 1; i < 8; i++) {
    // Vertical
    if (desiredPosition.x === initialPosition.x) {
      const multiplier = desiredPosition.y < initialPosition.y ? -1 : 1;
      const passedPosition = new Position(initialPosition.x, initialPosition.y + i * multiplier);
      if (passedPosition.isSamePosition(desiredPosition)) {
        if (isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)) {
          return true;
        }
      } else {
        if (isTileOccupied(passedPosition, boardState)) {
          break;
        }
      }
    }
    // Horizontal
    if (desiredPosition.y === initialPosition.y) {
      const multiplier = desiredPosition.x < initialPosition.x ? -1 : 1;
      const passedPosition = new Position(initialPosition.x + i * multiplier, initialPosition.y);
      if (passedPosition.isSamePosition(desiredPosition)) {
        if (isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)) {
          return true;
        }
      } else {
        if (isTileOccupied(passedPosition, boardState)) {
          break;
        }
      }
    }
  }

  return false;
};

export const getPossibleRookMoves = (rook: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  // Top movement
  for (let i = 1; i < 8; i++) {
    if (rook.position.y - i < 0) break;

    const destination = new Position(rook.position.x, rook.position.y - i);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Bottom movement
  for (let i = 1; i < 8; i++) {
    if (rook.position.y + i > 7) break;

    const destination = new Position(rook.position.x, rook.position.y + i);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Left movement
  for (let i = 1; i < 8; i++) {
    if (rook.position.x - i < 0) break;

    const destination = new Position(rook.position.x - i, rook.position.y);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Right movement
  for (let i = 1; i < 8; i++) {
    if (rook.position.x + i > 7) break;

    const destination = new Position(rook.position.x + i, rook.position.y);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, rook.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  return possibleMoves;
};
