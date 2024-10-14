import { CastlingRights, FenArgs, TeamType } from '@/types';
import { parseFenString } from '@/utils/parse';
import { Piece } from './piece';
import { Position } from './position';
import { HORIZONTAL_AXIS, PIECES_MAP, VERTICAL_AXIS } from '@/constants';

export class Fen {
  static readonly startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  static readonly emptyPosition = '8/8/8/8/8/8/8/8 w KQkq - 0 1';
  static readonly debugCastling = 'r3k2r/p1pp1ppp/b1nb1q1n/1p2p3/1P2P3/B1NB1Q1N/P1PP1PPP/R3K2R b KQkq - 0 1';
  static readonly debugEnPassant = 'rnbqkbnr/ppp1p1pp/5p2/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 1';

  readonly boardstate: Piece[];
  readonly toMove: TeamType;
  readonly castlingRights: CastlingRights;
  readonly enPassantSquare: Position | null;
  readonly halfMoves: number;
  readonly fullMoves: number;

  constructor(fenOrFenArgs: string | FenArgs) {
    const fenArgs: FenArgs = typeof fenOrFenArgs === 'string' ? parseFenString(fenOrFenArgs) : fenOrFenArgs;

    this.boardstate = fenArgs.boardstate;
    this.toMove = fenArgs.toMove;
    this.castlingRights = fenArgs.castlingRights;
    this.enPassantSquare = fenArgs.enPassantSquare;
    this.halfMoves = fenArgs.halfMoves;
    this.fullMoves = fenArgs.fullMoves;
  }

  update(partialFenArgs?: Partial<FenArgs>): Fen {
    return new Fen({
      boardstate: this.boardstate,
      toMove: this.toMove,
      castlingRights: this.castlingRights,
      enPassantSquare: this.enPassantSquare,
      halfMoves: this.halfMoves,
      fullMoves: this.fullMoves,
      ...partialFenArgs,
    });
  }

  toString(): string {
    return [
      this.unparseBoardState(),
      this.unparseToMove(),
      this.unparseCastlingRights(),
      this.unparseEnPassantSquare(),
      this.unparseHalfMoves(),
      this.unparseFullMoves(),
    ].join(' ');
  }

  private unparseBoardState(): string {
    return Array.from(Array(8))
      .map((_, rank) => {
        let str = '';
        let emptySquare = 0;

        for (let file = 0; file < 8; file++) {
          const piece = this.boardstate.find((p) => p.position.x === file && p.position.y === 7 - rank);

          if (piece) {
            const notation = Object.keys(PIECES_MAP).find(
              (key) => PIECES_MAP[key].type === piece.type && PIECES_MAP[key].team === piece.team
            ) as string;

            if (emptySquare > 0) {
              str += emptySquare;
              emptySquare = 0;
            }

            str += notation;
          } else {
            emptySquare++;
          }
        }

        if (emptySquare > 0) {
          str += emptySquare;
        }

        return str;
      })
      .join('/');
  }

  private unparseToMove(): string {
    return this.toMove === TeamType.WHITE ? 'w' : 'b';
  }

  private unparseCastlingRights(): string {
    const castlingRights = this.castlingRights;
    let fenCastlingRights = castlingRights[TeamType.WHITE].kingside ? 'K' : '';
    fenCastlingRights += castlingRights[TeamType.WHITE].queenside ? 'Q' : '';
    fenCastlingRights += castlingRights[TeamType.BLACK].kingside ? 'k' : '';
    fenCastlingRights += castlingRights[TeamType.BLACK].queenside ? 'q' : '';
    return fenCastlingRights ? fenCastlingRights : '-';
  }

  private unparseEnPassantSquare(): string {
    if (this.enPassantSquare === null) {
      return '-';
    }

    return `${HORIZONTAL_AXIS[this.enPassantSquare.x]}${VERTICAL_AXIS[this.enPassantSquare.y]}`;
  }

  private unparseHalfMoves(): string {
    return this.halfMoves.toString();
  }

  private unparseFullMoves(): string {
    return this.fullMoves.toString();
  }
}
