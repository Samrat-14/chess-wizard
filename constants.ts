import { PieceType, TeamType } from './types';

export const VERTICAL_AXIS = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const HORIZONTAL_AXIS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Piece map for type and team
export const PIECES_MAP: { [key: string]: { type: PieceType; team: TeamType } } = {
  p: { type: PieceType.PAWN, team: TeamType.BLACK },
  n: { type: PieceType.KNIGHT, team: TeamType.BLACK },
  b: { type: PieceType.BISHOP, team: TeamType.BLACK },
  r: { type: PieceType.ROOK, team: TeamType.BLACK },
  q: { type: PieceType.QUEEN, team: TeamType.BLACK },
  k: { type: PieceType.KING, team: TeamType.BLACK },
  P: { type: PieceType.PAWN, team: TeamType.WHITE },
  N: { type: PieceType.KNIGHT, team: TeamType.WHITE },
  B: { type: PieceType.BISHOP, team: TeamType.WHITE },
  R: { type: PieceType.ROOK, team: TeamType.WHITE },
  Q: { type: PieceType.QUEEN, team: TeamType.WHITE },
  K: { type: PieceType.KING, team: TeamType.WHITE },
};

// People photo list
export const USER_PHOTOS = [
  'f_blue',
  'f_green',
  'f_grey',
  'f_orange',
  'f_orange2',
  'f_pink',
  'f_pink2',
  'f_purple',
  'f_purple2',
  'f_yellow',
  'm_blue',
  'm_cyan',
  'm_cyan2',
  'm_green',
  'm_grey',
  'm_teal',
  'm_teal2',
  'm_yellow',
];
