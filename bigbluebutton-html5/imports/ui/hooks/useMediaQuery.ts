import { useEffect, useState } from 'react';

const matches = (query: string) => (
  typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false
);

/**
 * Tracks a CSS media query from React. For a layout that a stylesheet already
 * reorders, this is what lets the DOM carry the same order the viewer sees -
 * the `order` property moves boxes, never the focus or reading sequence.
 */
const useMediaQuery = (query: string): boolean => {
  const [isMatch, setIsMatch] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setIsMatch(event.matches);

    setIsMatch(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return isMatch;
};

export default useMediaQuery;
