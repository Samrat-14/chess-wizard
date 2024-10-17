import { Piece, Position } from './models';

export enum PieceType {
  PAWN = 'pawn',
  BISHOP = 'bishop',
  KNIGHT = 'knight',
  ROOK = 'rook',
  QUEEN = 'queen',
  KING = 'king',
}

export enum TeamType {
  BLACK = 'b',
  WHITE = 'w',
}

export type CastlingRight = {
  queenside: boolean;
  kingside: boolean;
};

export type CastlingRights = Record<TeamType, CastlingRight>;

export type FenArgs = {
  boardstate: Piece[];
  toMove: TeamType;
  castlingRights: CastlingRights;
  enPassantSquare: Position | null;
  halfMoves: number;
  fullMoves: number;
};

export type PositionType = {
  x: number;
  y: number;
};

export type MoveType = {
  initialPosition: PositionType;
  finalPosition: PositionType;
};

export type SoundType =
  | 'capture'
  | 'castle'
  | 'game-end'
  | 'game-start'
  | 'illegal'
  | 'move-opponent'
  | 'move-self'
  | 'promote';
