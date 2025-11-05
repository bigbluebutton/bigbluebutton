import { useCallback } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';

const notesLastReadTimestamp = makeVar(0);

const useNotesLastRead = () => {
  const lastReadTimestamp = useReactiveVar(notesLastReadTimestamp);

  const markNotesAsRead = useCallback(() => {
    notesLastReadTimestamp(Date.now());
  }, []);

  return {
    lastReadTimestamp,
    markNotesAsRead,
  };
};

export default useNotesLastRead;
