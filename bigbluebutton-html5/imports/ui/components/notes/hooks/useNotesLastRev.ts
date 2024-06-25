import { useCallback } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';

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
