import { useEffect } from 'react';
import { Position } from './types';

const useEnforceBoundariesOnWindowResize = (
  contentRef: React.RefObject<HTMLDivElement>,
  setPosition: React.Dispatch<React.SetStateAction<Position>>,
) => {
  useEffect(() => {
    const handleResize = () => {
      if (!contentRef.current) return;

      const elemRect = (contentRef.current as HTMLElement).getBoundingClientRect();

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        // Clamp horizontally
        if (newX + elemRect.width > windowWidth) {
          newX = windowWidth - elemRect.width;
        }
        if (newX < 0) newX = 0;

        // Clamp vertically
        if (newY + elemRect.height > windowHeight) {
          newY = windowHeight - elemRect.height;
        }
        if (newY < 0) newY = 0;

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
};

export default useEnforceBoundariesOnWindowResize;
