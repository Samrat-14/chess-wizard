import { useEffect, useState } from 'react';

const useRandom = (max: number, min: number = 0): number => {
  const [randomNumber, setRandomNumber] = useState<number>(min);

  useEffect(() => {
    setRandomNumber(Math.floor(Math.random() * (max - min) + min));
  }, []);

  return randomNumber;
};

export default useRandom;
