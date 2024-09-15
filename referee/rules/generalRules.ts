import { TeamType } from '@/types';
import { Piece, Position } from '@/models';

export const isTileOccupied = (position: Position, boardState: Piece[]): boolean => {
  const piece = boardState.find((p) => p.isSamePosition(position));
  if (piece) {
    return true;
  }
  return false;
};

export const isTileOccupiedByOpponent = (position: Position, boardState: Piece[], team: TeamType): boolean => {
  const piece = boardState.find((p) => p.isSamePosition(position) && p.team !== team);
  if (piece) {
    return true;
  }
  return false;
};

export const isTileEmptyOrOccupiedByOpponent = (position: Position, boardState: Piece[], team: TeamType): boolean => {
  return !isTileOccupied(position, boardState) || isTileOccupiedByOpponent(position, boardState, team);
};
