import {
  getCastlingMoves,
  getPossibleBishopMoves,
  getPossibleKingMoves,
  getPossibleKnightMoves,
  getPossiblePawnMoves,
  getPossibleQueenMoves,
  getPossibleRookMoves,
} from '@/referee/rules';
import { CastlingRight, PieceType, TeamType } from '@/types';
import { Piece, Position, Move, Fen } from '@/models';

export class Board {
  fen: Fen;
  pieces: Piece[];
  private totalTurns: number;
  winningTeam?: TeamType;
  lastMove?: Move;

  constructor(fenStr: string = Fen.emptyPosition, totalTurns: number = 0, lastMove?: Move) {
    this.fen = new Fen(fenStr);
    this.pieces = this.fen.boardstate.map((p) => p.clone());
    this.totalTurns = totalTurns;
    this.lastMove = lastMove;
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

      const castlingRight: CastlingRight = { ...this.fen.castlingRights[king.team] };

      // Get possible castling moves
      king.possibleMoves = [...king.possibleMoves, ...getCastlingMoves(king, this.pieces, castlingRight)];
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

  private checkCurrentTeamMoves() {
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

  private getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPossiblePawnMoves(piece, boardState, this.fen.enPassantSquare);
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

  playMove(enPassantMove: boolean, playedPiece: Piece, destination: Position): boolean {
    const pawnDirection = playedPiece.team === TeamType.WHITE ? 1 : -1;

    // Move is Castling, so played piece has to be king
    if (playedPiece.isKing && Math.abs(destination.x - playedPiece.position.x) === 2) {
      // Direction of castling
      const direction = destination.x - playedPiece.position.x > 0 ? 1 : -1;
      // Position of King after castling
      const newKingXPosition = playedPiece.position.x + direction * 2;

      // Position of Rook which will be castled with King
      const rookDirectionMultiplier = destination.x - playedPiece.position.x > 0 ? 1 : -2;
      const rookPosition = new Position(destination.x + rookDirectionMultiplier, destination.y);

      this.pieces = this.pieces.map((p) => {
        // Update position of King after castling
        if (p.isSamePiecePosition(playedPiece)) {
          p.position.x = newKingXPosition;
        }
        // Update position of Rook which will be castled with
        else if (p.isSamePosition(rookPosition)) {
          p.position.x = newKingXPosition - direction;
        }

        return p;
      });

      const noCastlingRight: CastlingRight = { queenside: false, kingside: false };
      // Castling is done, so there should be no castling rights
      this.fen = this.fen.update({
        castlingRights: { ...this.fen.castlingRights, [playedPiece.team]: noCastlingRight },
      });
    }

    // Move is enPassant, so played piece is pawn
    else if (enPassantMove) {
      this.pieces = this.pieces.reduce((results, piece) => {
        // Update position for the played pawn piece
        if (piece.isSamePiecePosition(playedPiece)) {
          // Update FEN to clear enPassantSquare
          this.fen = this.fen.update({ enPassantSquare: null });

          piece.position.x = destination.x;
          piece.position.y = destination.y;

          results.push(piece);
        }
        // Push remaining pieces except enPassanted pawn piece
        else if (!piece.isSamePosition(new Position(destination.x, destination.y - pawnDirection))) {
          results.push(piece);
        }

        return results;
      }, [] as Piece[]);
    }

    // Move other than Castling & EnPassant, so update the piece & if the piece is attacked, remove it
    else {
      this.pieces = this.pieces.reduce((results, piece) => {
        // Update position for the played piece
        if (piece.isSamePiecePosition(playedPiece)) {
          // Special move for pawn
          if (piece.isPawn && Math.abs(playedPiece.position.y - destination.y) === 2) {
            // Update FEN for enPassantSquare
            this.fen = this.fen.update({
              enPassantSquare: new Position(piece.position.x, piece.position.y + pawnDirection),
            });
          } else {
            // Update FEN to clear enPassantSquare
            this.fen = this.fen.update({ enPassantSquare: null });
          }

          piece.position.x = destination.x;
          piece.position.y = destination.y;

          // King is moved
          if (piece.isKing) {
            const noCastlingRight: CastlingRight = { queenside: false, kingside: false };
            // Update FEN to no castling rights
            this.fen = this.fen.update({
              castlingRights: { ...this.fen.castlingRights, [playedPiece.team]: noCastlingRight },
            });
          }

          // Rook is moved
          if (piece.isRook) {
            const king = this.pieces.find((p) => p.isKing && p.team === piece.team);
            if (king) {
              const rookSide = playedPiece.position.x - king.position.x > 0 ? 'kingside' : 'queenside';

              // Current castling right
              let castlingRight: CastlingRight = { ...this.fen.castlingRights[playedPiece.team] };

              if (rookSide === 'kingside') castlingRight.kingside = false;
              if (rookSide === 'queenside') castlingRight.queenside = false;
              // Update FEN to no castling right for the rook side
              this.fen = this.fen.update({
                castlingRights: { ...this.fen.castlingRights, [playedPiece.team]: castlingRight },
              });
            }
          }

          results.push(piece);
        }
        // Push remaining pieces except attacked piece
        else if (!piece.isSamePosition(destination)) {
          results.push(piece);
        }

        // Piece at destination won't be pushed in results as it has been attacked
        return results;
      }, [] as Piece[]);
    }

    // Update total turns, last move played and calculate next possible moves
    this.totalTurns += 1;
    this.fen = this.fen.update({ boardstate: this.pieces, toMove: this.currentTeam });
    this.lastMove = new Move(playedPiece.position, destination);
    this.calculateAllMoves();

    return true;
  }

  clone(): Board {
    return new Board(this.fen.toString(), this.totalTurns, this.lastMove?.clone());
  }
}
