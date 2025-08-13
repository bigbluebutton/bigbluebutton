import { useEffect } from 'react';
import { Position } from './types';

const useEnforceBoundariesOnWindowResize = (
  containerRef: React.RefObject<HTMLDivElement>,
  contentRef: React.RefObject<HTMLDivElement>,
  setPosition: React.Dispatch<React.SetStateAction<Position>>,
) => {
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !contentRef.current) return;

      const parentRect = containerRef.current.getBoundingClientRect();
      const elemRect = (contentRef.current as HTMLElement).getBoundingClientRect();

      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        // Clamp horizontally
        if (newX + elemRect.width > parentRect.width) {
          newX = parentRect.width - elemRect.width;
        }
        if (newX < 0) newX = 0;

        // Clamp vertically
        if (newY + elemRect.height > parentRect.height) {
          newY = parentRect.height - elemRect.height;
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
