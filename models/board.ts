import {
  getCastlingMoves,
  getPossibleBishopMoves,
  getPossibleKingMoves,
  getPossibleKnightMoves,
  getPossiblePawnMoves,
  getPossibleQueenMoves,
  getPossibleRookMoves,
  isTileOccupiedByOpponent,
} from '@/referee/rules';
import { CastlingRight, PieceType, TeamType } from '@/types';
import { Piece, Position, Move, Fen } from '@/models';

export class Board {
  private _totalTurns: number;
  private _lastMove: Move | undefined;
  fen: Fen;
  pieces: Piece[];
  winningTeam?: TeamType;

  constructor(fenStr: string = Fen.emptyPosition, totalTurns: number = 0, lastMove?: Move) {
    this.fen = new Fen(fenStr);
    this.pieces = this.fen.boardstate.map((p) => p.clone());
    this._totalTurns = totalTurns;
    this._lastMove = lastMove;
  }

  get currentTeam(): TeamType {
    return this._totalTurns % 2 === 0 ? TeamType.WHITE : TeamType.BLACK;
  }

  get getLastMove(): Move | undefined {
    return this._lastMove;
  }

  calculateAllMoves() {
    // Set possible valid moves
    for (const piece of this.pieces) {
      piece.possibleMoves = this._getValidMoves(piece, this.pieces);
    }

    // Calculate castling moves
    for (const king of this.pieces.filter((p) => p.isKing)) {
      if (king.possibleMoves === undefined) continue;

      const castlingRight: CastlingRight = { ...this.fen.castlingRights[king.team] };

      // Get possible castling moves
      king.possibleMoves = [...king.possibleMoves, ...getCastlingMoves(king, this.pieces, castlingRight)];
    }

    // Check if the current team moves are valid
    this._checkCurrentTeamMoves();

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

  private _checkCurrentTeamMoves() {
    // Loop through all the current team's pieces
    for (const piece of this.pieces.filter((p) => p.team === this.currentTeam)) {
      if (!piece.possibleMoves) continue;

      // Simulate all the piece moves
      for (const possibleMove of piece.possibleMoves) {
        const simulatedBoard = this.clone();

        // Remove any piece at destination position
        simulatedBoard.pieces = simulatedBoard.pieces.filter((p) => !p.isSamePosition(possibleMove));

        //  Get the piece of the clone board
        const clonedPiece = simulatedBoard.pieces.find((p) => p.isSamePiecePosition(piece))!;
        clonedPiece.position = possibleMove.clone();

        //  Get the King of the clone board
        const clonedKing = simulatedBoard.pieces.find((p) => p.isKing && p.team === simulatedBoard.currentTeam)!;

        // Loop through all enemy pieces, update their possible moves
        // And check if the current team's King will be in danger
        for (const enemy of simulatedBoard.pieces.filter((p) => p.team !== simulatedBoard.currentTeam)) {
          enemy.possibleMoves = simulatedBoard._getValidMoves(enemy, simulatedBoard.pieces);

          if (enemy.isPawn) {
            if (enemy.possibleMoves.some((m) => m.x !== enemy.position.x && m.isSamePosition(clonedKing.position))) {
              piece.possibleMoves = piece.possibleMoves.filter((m) => !m.isSamePosition(possibleMove));
            }
          } else {
            if (enemy.possibleMoves.some((m) => m.isSamePosition(clonedKing.position))) {
              piece.possibleMoves = piece.possibleMoves.filter((m) => !m.isSamePosition(possibleMove));
            }
          }
        }
      }
    }
  }

  private _getValidMoves(piece: Piece, boardState: Piece[]): Position[] {
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
      // Also increment half moves after castling
      this.fen = this.fen.update({
        castlingRights: { ...this.fen.castlingRights, [playedPiece.team]: noCastlingRight },
        halfMoves: this.fen.halfMoves + 1,
      });
    }

    // Move is enPassant, so played piece is pawn
    else if (enPassantMove) {
      this.pieces = this.pieces.reduce((results, piece) => {
        // For the played piece
        if (piece.isSamePiecePosition(playedPiece)) {
          // Update position for the played pawn piece
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

      // Update FEN to clear enPassantSquare
      this.fen = this.fen.update({ enPassantSquare: null });
    }

    // Move other than Castling & EnPassant, so update the piece & if the piece is captured, remove it
    else {
      this.pieces = this.pieces.reduce((results, piece) => {
        // For the played piece
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

          // Reset halfmoves due to pawn advance or piece capture, increment otherwise
          // NOTE: halfmoves should be updated before playedpiece position is updated
          if (piece.isPawn || isTileOccupiedByOpponent(destination, this.pieces, piece.team)) {
            this.fen = this.fen.update({ halfMoves: 0 });
          } else {
            this.fen = this.fen.update({ halfMoves: this.fen.halfMoves + 1 });
          }

          // Update position for the played piece
          piece.position.x = destination.x;
          piece.position.y = destination.y;

          // King is moved
          if (piece.isKing) {
            const noCastlingRight: CastlingRight = { queenside: false, kingside: false };
            // Update FEN to no castling rights
            this.fen = this.fen.update({
              castlingRights: { ...this.fen.castlingRights, [piece.team]: noCastlingRight },
            });
          }

          // Rook is moved
          if (piece.isRook) {
            const king = this.pieces.find((p) => p.isKing && p.team === piece.team);
            if (king) {
              const rookSide = piece.position.x - king.position.x > 0 ? 'kingside' : 'queenside';

              // Current castling right
              let castlingRight: CastlingRight = { ...this.fen.castlingRights[piece.team] };

              if (rookSide === 'kingside') castlingRight.kingside = false;
              if (rookSide === 'queenside') castlingRight.queenside = false;
              // Update FEN to no castling right for the rook side
              this.fen = this.fen.update({
                castlingRights: { ...this.fen.castlingRights, [piece.team]: castlingRight },
              });
            }
          }

          results.push(piece);
        }
        // Push remaining pieces except captured piece
        else if (!piece.isSamePosition(destination)) {
          results.push(piece);
        }

        // Piece at destination won't be pushed in results as it has been captured
        return results;
      }, [] as Piece[]);
    }

    // Update fullmoves after every black move
    // NOTE: fullmoves should be updated before totalturns
    if (this.currentTeam === TeamType.BLACK) {
      this.fen = this.fen.update({ fullMoves: this.fen.fullMoves + 1 });
    }

    // Update total turns
    this._totalTurns += 1;
    // Update last move played
    this._lastMove = new Move(playedPiece.position, destination);
    // Update the FEN
    this.fen = this.fen.update({ boardstate: this.pieces, toMove: this.currentTeam });

    // Calculate next possible moves
    this.calculateAllMoves();

    return true;
  }

  clone(): Board {
    return new Board(this.fen.toString(), this._totalTurns, this._lastMove?.clone());
  }
}
