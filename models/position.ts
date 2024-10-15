import { PositionType } from '@/types';

export class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static nullPosition(): Position {
    return new Position(-1, -1);
  }

  static parse(positionObj: PositionType): Position {
    return new Position(positionObj.x, positionObj.y);
  }

  isSamePosition(otherPosition: Position): boolean {
    return this.x === otherPosition.x && this.y === otherPosition.y;
  }

  clone(): Position {
    return new Position(this.x, this.y);
  }
}
