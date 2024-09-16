import { HORIZONTAL_AXIS, VERTICAL_AXIS } from '@/constants';

import './tile.css';

type TileProps = {
  xPos: number;
  yPos: number;
  image?: string;
  highlight: boolean;
  selected: boolean;
};

export default function Tile({ xPos, yPos, image, highlight, selected }: TileProps) {
  const className: string = [
    'tile',
    (xPos + yPos) % 2 === 0 && 'black-tile',
    (xPos + yPos) % 2 !== 0 && 'white-tile',
    highlight && 'tile-highlight',
    selected && 'tile-selected',
    image && 'chess-piece-tile',
  ]
    .filter(Boolean)
    .join(' ');

  const rankLabel = VERTICAL_AXIS[yPos];
  const fileLabel = HORIZONTAL_AXIS[xPos];

  return (
    <div className={className}>
      {xPos === 0 && <span className="rank">{rankLabel}</span>}
      {yPos === 0 && <span className="file">{fileLabel}</span>}
      {image && <div style={{ backgroundImage: `url(/assets/images/${image}.png)` }} className="chess-piece" />}
    </div>
  );
}
