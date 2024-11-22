import React from 'react';

export interface TooManypinnedAppsProps {
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  pinnedAppsNumber: number;
}
