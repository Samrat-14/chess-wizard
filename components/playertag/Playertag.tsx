import './playertag.css';

type PlayertagProps = {
  playerName: string;
};

export default function Playertag({ playerName }: PlayertagProps) {
  return (
    <div className="player-tag">
      <img src="/favicon.png" alt="player_icon" />
      <span>{playerName}</span>
    </div>
  );
}
