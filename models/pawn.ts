import { PieceType, TeamType } from '@/types';
import { Piece } from './piece';
import { Position } from './position';

export class Pawn extends Piece {
  enPassant: boolean;

  constructor(
    position: Position,
    team: TeamType,
    hasMoved: boolean = false,
    enPassant: boolean = false,
    possibleMoves?: Position[]
  ) {
    super(position, PieceType.PAWN, team, hasMoved, possibleMoves);

    this.enPassant = enPassant;
  }

  clone(): Pawn {
    return new Pawn(
      this.position.clone(),
      this.team,
      this.hasMoved,
      this.enPassant,
      this.possibleMoves?.map((m) => m.clone())
    );
  }
}
