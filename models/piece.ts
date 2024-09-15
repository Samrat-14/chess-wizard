import { PieceType, TeamType } from '@/types';
import { Position } from './position';

export class Piece {
  image: string;
  position: Position;
  type: PieceType;
  team: TeamType;
  possibleMoves?: Position[];
  hasMoved: boolean;

  constructor(position: Position, type: PieceType, team: TeamType, hasMoved: boolean, possibleMoves: Position[] = []) {
    this.image = `${type}_${team}`;
    this.position = position;
    this.type = type;
    this.team = team;
    this.hasMoved = hasMoved;
    this.possibleMoves = possibleMoves;
  }

  get isPawn(): boolean {
    return this.type === PieceType.PAWN;
  }

  get isKnight(): boolean {
    return this.type === PieceType.KNIGHT;
  }

  get isBishop(): boolean {
    return this.type === PieceType.BISHOP;
  }

  get isRook(): boolean {
    return this.type === PieceType.ROOK;
  }

  get isQueen(): boolean {
    return this.type === PieceType.QUEEN;
  }

  get isKing(): boolean {
    return this.type === PieceType.KING;
  }

  isSamePiecePosition(otherPiece: Piece): boolean {
    return this.position.isSamePosition(otherPiece.position);
  }

  isSamePosition(otherPosition: Position): boolean {
    return this.position.isSamePosition(otherPosition);
  }

  clone(): Piece {
    return new Piece(
      this.position.clone(),
      this.type,
      this.team,
      this.hasMoved,
      this.possibleMoves?.map((m) => m.clone())
    );
  }
}
