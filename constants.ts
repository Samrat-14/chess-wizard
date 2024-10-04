import { Board, Pawn, Piece, Position } from './models';
import { PieceType, TeamType } from './types';

export const VERTICAL_AXIS = ['1', '2', '3', '4', '5', '6', '7', '8'];
export const HORIZONTAL_AXIS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Initial BoardState
export const initialBoard = new Board(
  [
    // RANK - 8
    new Piece(new Position(0, 7), PieceType.ROOK, TeamType.BLACK, false),
    new Piece(new Position(1, 7), PieceType.KNIGHT, TeamType.BLACK, false),
    new Piece(new Position(2, 7), PieceType.BISHOP, TeamType.BLACK, false),
    new Piece(new Position(3, 7), PieceType.QUEEN, TeamType.BLACK, false),
    new Piece(new Position(4, 7), PieceType.KING, TeamType.BLACK, false),
    new Piece(new Position(5, 7), PieceType.BISHOP, TeamType.BLACK, false),
    new Piece(new Position(6, 7), PieceType.KNIGHT, TeamType.BLACK, false),
    new Piece(new Position(7, 7), PieceType.ROOK, TeamType.BLACK, false),

    // RANK - 7
    new Pawn(new Position(0, 6), TeamType.BLACK, false),
    new Pawn(new Position(1, 6), TeamType.BLACK, false),
    new Pawn(new Position(2, 6), TeamType.BLACK, false),
    new Pawn(new Position(3, 6), TeamType.BLACK, false),
    new Pawn(new Position(4, 6), TeamType.BLACK, false),
    new Pawn(new Position(5, 6), TeamType.BLACK, false),
    new Pawn(new Position(6, 6), TeamType.BLACK, false),
    new Pawn(new Position(7, 6), TeamType.BLACK, false),

    // RANK - 2
    new Pawn(new Position(0, 1), TeamType.WHITE, false),
    new Pawn(new Position(1, 1), TeamType.WHITE, false),
    new Pawn(new Position(2, 1), TeamType.WHITE, false),
    new Pawn(new Position(3, 1), TeamType.WHITE, false),
    new Pawn(new Position(4, 1), TeamType.WHITE, false),
    new Pawn(new Position(5, 1), TeamType.WHITE, false),
    new Pawn(new Position(6, 1), TeamType.WHITE, false),
    new Pawn(new Position(7, 1), TeamType.WHITE, false),

    // RANK - 1
    new Piece(new Position(0, 0), PieceType.ROOK, TeamType.WHITE, false),
    new Piece(new Position(1, 0), PieceType.KNIGHT, TeamType.WHITE, false),
    new Piece(new Position(2, 0), PieceType.BISHOP, TeamType.WHITE, false),
    new Piece(new Position(3, 0), PieceType.QUEEN, TeamType.WHITE, false),
    new Piece(new Position(4, 0), PieceType.KING, TeamType.WHITE, false),
    new Piece(new Position(5, 0), PieceType.BISHOP, TeamType.WHITE, false),
    new Piece(new Position(6, 0), PieceType.KNIGHT, TeamType.WHITE, false),
    new Piece(new Position(7, 0), PieceType.ROOK, TeamType.WHITE, false),
  ],
  0
);
initialBoard.calculateAllMoves();

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
