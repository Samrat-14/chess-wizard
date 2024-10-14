import { validateFen } from './validate';
import { InvalidFenError } from './InvalidFenError';
import { CastlingRights, FenArgs, PieceType, TeamType } from '@/types';
import { Piece, Position } from '@/models';
import { HORIZONTAL_AXIS, PIECES_MAP, VERTICAL_AXIS } from '@/constants';

export function parseFenString(fen: string): FenArgs {
  const fenTokens = fen.split(' ');
  validateFen(fenTokens);

  return {
    boardstate: parseBoard(fenTokens),
    toMove: parseToMove(fenTokens),
    castlingRights: parseCastlingRights(fenTokens),
    enPassantSquare: parseEnPassantSquare(fenTokens),
    halfMoves: parseHalfMoves(fenTokens),
    fullMoves: parseFullMoves(fenTokens),
  };
}

function parseBoard(fenTokens: string[]): Piece[] {
  return fenTokens[0].split('/').reduce((piecePlacements, currentFile, rank) => {
    let file = 0;

    for (const token of currentFile) {
      const piece = parseBoardChar(fenTokens, token, rank, file);

      if (typeof piece === 'number') {
        file += piece;
      } else {
        piecePlacements.push(piece);
        file++;
      }
    }

    return piecePlacements;
  }, [] as Piece[]);
}

function parseBoardChar(fenTokens: string[], notation: string, rank: number, file: number): Piece | number {
  if (notation.match(/\d/)) {
    return parseInt(notation);
  } else if (notation in PIECES_MAP) {
    // FIX: new Piece is unaware of hasMoved property
    return new Piece(new Position(file, 7 - rank), PIECES_MAP[notation].type, PIECES_MAP[notation].team);
  }

  throw new InvalidFenError(fenTokens.join(' '));
}

function parseToMove(fenTokens: string[]): TeamType {
  return fenTokens[1] === 'w' ? TeamType.WHITE : TeamType.BLACK;
}

function parseCastlingRights(fenTokens: string[]): CastlingRights {
  return {
    [TeamType.WHITE]: {
      queenside: fenTokens[2].includes('Q'),
      kingside: fenTokens[2].includes('K'),
    },
    [TeamType.BLACK]: {
      queenside: fenTokens[2].includes('q'),
      kingside: fenTokens[2].includes('k'),
    },
  };
}

function parseEnPassantSquare(fenTokens: string[]): Position | null {
  if (fenTokens[3] === '-') return null;

  return new Position(HORIZONTAL_AXIS.indexOf(fenTokens[3][0]), VERTICAL_AXIS.indexOf(fenTokens[3][1]));
}

function parseHalfMoves(fenTokens: string[]): number {
  return parseInt(fenTokens[4], 10);
}

function parseFullMoves(fenTokens: string[]): number {
  return parseInt(fenTokens[5], 10);
}
