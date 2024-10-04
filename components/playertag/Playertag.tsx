import useRandom from '@/hooks/useRandom';
import { USER_PHOTOS } from '@/constants';

import './playertag.css';

type PlayertagProps = {
  playerName: string;
};

export default function Playertag({ playerName }: PlayertagProps) {
  const randomUserImageIndex = useRandom(USER_PHOTOS.length - 1);

  const userImageSrc = USER_PHOTOS[randomUserImageIndex]
    ? `/assets/people/user/${USER_PHOTOS[randomUserImageIndex]}.png`
    : '/assets/people/default_user.png';

  return (
    <div className="player-tag">
      <img src={userImageSrc} alt="player_icon" />
      <span>{playerName}</span>
    </div>
  );
}
