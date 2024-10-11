export class InvalidFenError extends Error {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', {
      value: new.target.name,
      enumerable: false,
      configurable: true,
    });

    fixProto(this, new.target.prototype);
    fixStack(this);
  }

  static invalidNumberOfFields() {
    return new InvalidFenError('The fen must contain six fields seperated by a single space');
  }

  static invalidMoveNumber() {
    return new InvalidFenError('The move number must be a positive integer');
  }

  static invalidHalfMoveNumber() {
    return new InvalidFenError('The half move number must be a positive integer');
  }

  static invalidEnPassantSquare() {
    return new InvalidFenError('The enpassant square must be a coordinate on the third or sixth rank');
  }

  static invalidCastlingAvailability() {
    return new InvalidFenError('The castling availability is invalid');
  }

  static invalidToMove() {
    return new InvalidFenError('The side to move must be either w or b');
  }
}

function fixProto(target: Error, prototype: {}) {
  const setPrototypeOf: Function = Object.setPrototypeOf;

  setPrototypeOf ? setPrototypeOf(target, prototype) : ((target as any).__proto__ = prototype);
}

function fixStack(target: Error, fn: Function = target.constructor) {
  const captureStackTrace: Function = Error.captureStackTrace;

  captureStackTrace && captureStackTrace(target, fn);
}
