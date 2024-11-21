import React from 'react';

export interface TooManyPinnedWidgetsProps {
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  pinnedWidgetsNumber: number;
}
