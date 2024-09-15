import { TeamType } from '@/types';
import { Piece, Position } from '@/models';
import { isTileEmptyOrOccupiedByOpponent, isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const bishopMove = (
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[]
): boolean => {
  // MOVEMENT & ATTACK LOGIC
  for (let i = 1; i < 8; i++) {
    const multiplierX = desiredPosition.x < initialPosition.x ? -1 : 1;
    const multiplierY = desiredPosition.y < initialPosition.y ? -1 : 1;
    const passedPosition = new Position(initialPosition.x + i * multiplierX, initialPosition.y + i * multiplierY);

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

  return false;
};

export const getPossibleBishopMoves = (bishop: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  for (let i = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x + i, bishop.position.y + i);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, bishop.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  for (let i = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x + i, bishop.position.y - i);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, bishop.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  for (let i = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x - i, bishop.position.y - i);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, bishop.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  for (let i = 1; i < 8; i++) {
    const destination = new Position(bishop.position.x - i, bishop.position.y + i);

    if (!isTileOccupied(destination, boardState)) {
      possibleMoves.push(destination);
    } else if (isTileOccupiedByOpponent(destination, boardState, bishop.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  return possibleMoves;
};
