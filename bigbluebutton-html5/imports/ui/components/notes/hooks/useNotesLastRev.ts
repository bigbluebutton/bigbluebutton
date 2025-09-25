import { useCallback } from 'react';
import { makeVar } from '@apollo/client';

import { useReactiveVar } from '@apollo/client/react';

const notesLastRev = makeVar(0);

const useNotesLastRev = () => {
  const lastRev = useReactiveVar(notesLastRev);
  const setNotesLastRev = useCallback((rev: number) => notesLastRev(rev), []);

  return {
    lastRev,
    setNotesLastRev,
  };
};

export default useNotesLastRev;
