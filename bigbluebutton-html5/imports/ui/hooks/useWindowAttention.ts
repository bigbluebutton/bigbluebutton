import { useEffect, useState } from 'react';

const hasAttention = () => document.visibilityState === 'visible' && document.hasFocus();

const useWindowAttention = (): boolean => {
  const [attention, setAttention] = useState(hasAttention);

  useEffect(() => {
    const update = () => setAttention(hasAttention());

    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    window.addEventListener('blur', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
      window.removeEventListener('blur', update);
    };
  }, []);

  return attention;
};

export default useWindowAttention;
