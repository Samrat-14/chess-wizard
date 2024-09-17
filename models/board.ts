import {
  getCastlingMoves,
  getPossibleBishopMoves,
  getPossibleKingMoves,
  getPossibleKnightMoves,
  getPossiblePawnMoves,
  getPossibleQueenMoves,
  getPossibleRookMoves,
} from '@/referee/rules';
import { PieceType, TeamType } from '@/types';
import { Pawn } from './pawn';
import { Piece } from './piece';
import { Position } from './position';

export class Board {
  pieces: Piece[];
  totalTurns: number;
  winningTeam?: TeamType;

  constructor(pieces: Piece[], totalTurns: number) {
    this.pieces = pieces;
    this.totalTurns = totalTurns;
  }

  get currentTeam(): TeamType {
    return this.totalTurns % 2 === 0 ? TeamType.WHITE : TeamType.BLACK;
  }

  calculateAllMoves() {
    // Set possible valid moves
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMoves(piece, this.pieces);
    }

    // Calculate castling moves
    for (const king of this.pieces.filter((p) => p.isKing)) {
      if (king.possibleMoves === undefined) continue;

      king.possibleMoves = [...king.possibleMoves, ...getCastlingMoves(king, this.pieces)];
    }

    // Check if the current team moves are valid
    this.checkCurrentTeamMoves();

    // Remove possible moves for team who is not playing
    for (const piece of this.pieces.filter((p) => p.team !== this.currentTeam)) {
      piece.possibleMoves = [];
    }

    // Check if current team still have valid moves left, otherwise Checkmate
    if (
      this.pieces.filter((p) => p.team === this.currentTeam).some((p) => p.possibleMoves && p.possibleMoves.length > 0)
    )
      return;

    // Checkmated! Set the winning team
    this.winningTeam = this.currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
  }

  checkCurrentTeamMoves() {
    // Loop through all the current team's pieces
    for (const piece of this.pieces.filter((p) => p.team === this.currentTeam)) {
      if (!piece.possibleMoves) continue;

      // Simulate all the piece moves
      for (const move of piece.possibleMoves) {
        const simulatedBoard = this.clone();

        // Remove any piece at destination position
        simulatedBoard.pieces = simulatedBoard.pieces.filter((p) => !p.isSamePosition(move));

        //  Get the piece of the clone board
        const clonedPiece = simulatedBoard.pieces.find((p) => p.isSamePiecePosition(piece))!;
        clonedPiece.position = move.clone();

        //  Get the King of the clone board
        const clonedKing = simulatedBoard.pieces.find((p) => p.isKing && p.team === simulatedBoard.currentTeam)!;

        // Loop through all enemy pieces, update their possible moves
        // And check if the current team's King will be in danger
        for (const enemy of simulatedBoard.pieces.filter((p) => p.team !== simulatedBoard.currentTeam)) {
          enemy.possibleMoves = simulatedBoard.getValidMoves(enemy, simulatedBoard.pieces);

          if (enemy.isPawn) {
            if (enemy.possibleMoves.some((m) => m.x !== enemy.position.x && m.isSamePosition(clonedKing.position))) {
              piece.possibleMoves = piece.possibleMoves.filter((m) => !m.isSamePosition(move));
            }
          } else {
            if (enemy.possibleMoves.some((m) => m.isSamePosition(clonedKing.position))) {
              piece.possibleMoves = piece.possibleMoves.filter((m) => !m.isSamePosition(move));
            }
          }
        }
      }
    }
  }

  getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPossiblePawnMoves(piece, boardState);
      case PieceType.KNIGHT:
        return getPossibleKnightMoves(piece, boardState);
      case PieceType.BISHOP:
        return getPossibleBishopMoves(piece, boardState);
      case PieceType.ROOK:
        return getPossibleRookMoves(piece, boardState);
      case PieceType.QUEEN:
        return getPossibleQueenMoves(piece, boardState);
      case PieceType.KING:
        return getPossibleKingMoves(piece, boardState);
      default:
        return [];
    }
  }

  playMove(enPassantMove: boolean, validMove: boolean, playedPiece: Piece, destination: Position): boolean {
    const pawnDirection = playedPiece.team === TeamType.WHITE ? 1 : -1;

    // If the move is Castling, we do this
    if (playedPiece.isKing && Math.abs(destination.x - playedPiece.position.x) === 2) {
      // Direction of castling
      const direction = destination.x - playedPiece.position.x > 0 ? 1 : -1;
      // Position of King after castling
      const newKingXPosition = playedPiece.position.x + direction * 2;

      // Position of Rook which will be castled with King
      const rookDirectionMultiplier = destination.x - playedPiece.position.x > 0 ? 1 : -2;
      const rookPosition = new Position(destination.x + rookDirectionMultiplier, destination.y);

      this.pieces = this.pieces.map((p) => {
        if (p.isSamePiecePosition(playedPiece)) {
          p.position.x = newKingXPosition;
        } else if (p.isSamePosition(rookPosition)) {
          p.position.x = newKingXPosition - direction;
        }

        return p;
      });

      this.calculateAllMoves();
      return true;
    }

    // If the move is enPassant, we do this
    if (enPassantMove) {
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.isSamePiecePosition(playedPiece)) {
          if (piece.isPawn) {
            (piece as Pawn).enPassant = false;
          }

          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;

          results.push(piece);
        } else if (!piece.isSamePosition(new Position(destination.x, destination.y - pawnDirection))) {
          if (piece.isPawn) {
            (piece as Pawn).enPassant = false;
          }

          results.push(piece);
        }

        return results;
      }, [] as Piece[]);

      this.calculateAllMoves();
      return true;
    }

    if (validMove) {
      // Updates the piece position & if the piece is attacked, removes it
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.isSamePiecePosition(playedPiece)) {
          // Special move for Pawn
          if (piece.isPawn) {
            (piece as Pawn).enPassant =
              Math.abs(playedPiece.position.y - destination.y) === 2 && piece.type === PieceType.PAWN;
          }

          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;

          results.push(piece);
        } else if (!piece.isSamePosition(destination)) {
          if (piece.isPawn) {
            (piece as Pawn).enPassant = false;
          }

          results.push(piece);
        }

        // Piece at destination won't be pushed in results
        return results;
      }, [] as Piece[]);

      this.calculateAllMoves();
      return true;
    }

    return false;
  }

  clone(): Board {
    return new Board(
      this.pieces.map((p) => p.clone()),
      this.totalTurns
    );
  }
}
