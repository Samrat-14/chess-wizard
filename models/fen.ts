import { CastlingRights, FenArgs, TeamType } from '@/types';
import { parseFenString } from '@/utils/parse';
import { Board } from './board';

export class Fen {
  static readonly startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  static readonly emptyPosition = '8/8/8/8/8/8/8/8 w KQkq - 0 1';

  readonly board: Board;
  readonly toMove: TeamType;
  readonly castlingRights: CastlingRights;
  readonly enPassantSquare: string;
  readonly halfMoves: number;
  readonly fullMoves: number;

  constructor(fenString: string = Fen.startingPosition) {
    const fenArgs: FenArgs = parseFenString(fenString);

    this.board = fenArgs.board;
    this.toMove = fenArgs.toMove;
    this.castlingRights = fenArgs.castlingRights;
    this.enPassantSquare = fenArgs.enPassantSquare;
    this.halfMoves = fenArgs.halfMoves;
    this.fullMoves = fenArgs.fullMoves;
  }
}
