import './tile.css';

type TileProps = {
  number: number;
  image?: string;
  highlight: boolean;
  selected: boolean;
};

export default function Tile({ number, image, highlight, selected }: TileProps) {
  const className: string = [
    'tile',
    number % 2 === 0 && 'black-tile',
    number % 2 !== 0 && 'white-tile',
    highlight && 'tile-highlight',
    selected && 'tile-selected',
    image && 'chess-piece-tile',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={className}>
      {image && <div style={{ backgroundImage: `url(/assets/images/${image}.png)` }} className="chess-piece" />}
    </span>
  );
}
