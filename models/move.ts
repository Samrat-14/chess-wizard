import { Position } from './position';

export class Move {
  initialPosition: Position;
  finalPosition: Position;

  constructor(initialPosition: Position, finalPosition: Position) {
    this.initialPosition = initialPosition;
    this.finalPosition = finalPosition;
  }

  static nullMove(): Move {
    return new Move(new Position(-1, -1), new Position(-1, -1));
  }

  includesPosition(position: Position): boolean {
    return this.initialPosition.isSamePosition(position) || this.finalPosition.isSamePosition(position);
  }

  clone(): Move {
    return new Move(this.initialPosition.clone(), this.finalPosition.clone());
  }
}
