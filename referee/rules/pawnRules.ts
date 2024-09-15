import { TeamType } from '@/types';
import { Pawn, Piece, Position } from '@/models';
import { isTileOccupied, isTileOccupiedByOpponent } from './generalRules';

export const pawnMove = (
  initialPosition: Position,
  desiredPosition: Position,
  team: TeamType,
  boardState: Piece[]
): boolean => {
  const specialRow = team === TeamType.OUR ? 1 : 6;
  const pawnDirection = team === TeamType.OUR ? 1 : -1;

  // MOVEMENT LOGIC
  if (
    initialPosition.x === desiredPosition.x &&
    initialPosition.y === specialRow &&
    desiredPosition.y - initialPosition.y === 2 * pawnDirection
  ) {
    if (
      !isTileOccupied(desiredPosition, boardState) &&
      !isTileOccupied(new Position(desiredPosition.x, desiredPosition.y - pawnDirection), boardState)
    ) {
      return true;
    }
  } else if (initialPosition.x === desiredPosition.x && desiredPosition.y - initialPosition.y === pawnDirection) {
    if (!isTileOccupied(desiredPosition, boardState)) {
      return true;
    }
  }

  // ATTACK LOGIC
  else if (desiredPosition.x - initialPosition.x === -1 && desiredPosition.y - initialPosition.y === pawnDirection) {
    if (isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
      return true;
    }
  } else if (desiredPosition.x - initialPosition.x === 1 && desiredPosition.y - initialPosition.y === pawnDirection) {
    if (isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
      return true;
    }
  }

  return false;
};

export const getPossiblePawnMoves = (pawn: Piece, boardState: Piece[]): Position[] => {
  const possibleMoves: Position[] = [];

  const specialRow = pawn.team === TeamType.OUR ? 1 : 6;
  const pawnDirection = pawn.team === TeamType.OUR ? 1 : -1;

  const normalMove = new Position(pawn.position.x, pawn.position.y + pawnDirection);
  const specialMove = new Position(normalMove.x, normalMove.y + pawnDirection);
  const upperLeftAttack = new Position(pawn.position.x - 1, pawn.position.y + pawnDirection);
  const upperRightAttack = new Position(pawn.position.x + 1, pawn.position.y + pawnDirection);
  const leftPosition = new Position(pawn.position.x - 1, pawn.position.y);
  const rightPosition = new Position(pawn.position.x + 1, pawn.position.y);

  if (!isTileOccupied(normalMove, boardState)) {
    possibleMoves.push(normalMove);

    if (pawn.position.y === specialRow && !isTileOccupied(specialMove, boardState)) {
      possibleMoves.push(specialMove);
    }
  }

  if (isTileOccupiedByOpponent(upperLeftAttack, boardState, pawn.team)) {
    possibleMoves.push(upperLeftAttack);
  } else if (!isTileOccupied(upperLeftAttack, boardState)) {
    const leftPiece = boardState.find((p) => p.isSamePosition(leftPosition));

    if (leftPiece && (leftPiece as Pawn).enPassant) {
      possibleMoves.push(upperLeftAttack);
    }
  }

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
