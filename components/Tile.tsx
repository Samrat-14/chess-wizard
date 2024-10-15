import { HORIZONTAL_AXIS, VERTICAL_AXIS } from '@/constants';

import { TeamType } from '@/types';

import '@/styles/tile.css';

type TileProps = {
  xPos: number;
  yPos: number;
  turn?: TeamType;
  image?: string;
  marked: boolean;
  highlighted: boolean;
  hoveredWithPiece: boolean;
};

export default function Tile({ xPos, yPos, turn, image, marked, highlighted, hoveredWithPiece }: TileProps) {
  const className: string = [
    'tile',
    (xPos + yPos) % 2 === 0 && 'black-tile',
    (xPos + yPos) % 2 !== 0 && 'white-tile',
    marked && 'tile-mark',
    highlighted && 'tile-highlight',
    hoveredWithPiece && 'tile-hover',
    image && 'chess-piece-tile',
  ]
    .filter(Boolean)
    .join(' ');

  const rankLabel = VERTICAL_AXIS[yPos];
  const fileLabel = HORIZONTAL_AXIS[xPos];
  const firstRowCol = turn && turn === TeamType.BLACK ? 7 : 0;

  return (
    <div className={className}>
      {xPos === firstRowCol && <span className="rank">{rankLabel}</span>}
      {yPos === firstRowCol && <span className="file">{fileLabel}</span>}
      {image && <div style={{ backgroundImage: `url(/assets/images/${image}.png)` }} className="chess-piece" />}
    </div>
  );
}
