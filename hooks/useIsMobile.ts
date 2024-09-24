import { useEffect, useState } from 'react';

export const useIsMobile = () => {
  const [width, setWidth] = useState(1080);

  useEffect(() => {
    const handleWindowResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const isMobile = width <= 480;

  return isMobile;
};
