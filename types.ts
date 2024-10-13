import { Piece } from './models';

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
  enPassantSquare: string;
  halfMoves: number;
  fullMoves: number;
};
